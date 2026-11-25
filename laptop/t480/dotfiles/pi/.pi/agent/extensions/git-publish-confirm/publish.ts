import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ReviewResult } from "./gui.ts";
import { parseMessage, parseWorktreePaths, pushAndCreatePullRequest, type Exec } from "./utils.ts";

type Proposal = { action: "commit" | "pr"; title: string; description: string };
type Review = (title: string, text: string, signal?: AbortSignal) => Promise<ReviewResult>;
type ConfirmStage = (paths: string[], signal?: AbortSignal) => Promise<boolean>;

function result(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], details: undefined, ...(isError ? { isError } : {}) };
}

export async function reviewAndPublish(input: Proposal, cwd: string, signal: AbortSignal | undefined, exec: Exec, review: Review, confirmStage?: ConfirmStage) {
  const kind = input.action === "commit" ? "commit" : "GitHub pull request";
  if (signal?.aborted) return result(`${kind} cancelled.`);
  const guardedExec: Exec = (command, args, options) => {
    signal?.throwIfAborted();
    return exec(command, args, { ...options, signal });
  };
  if (input.action === "commit") {
    let staged;
    try {
      staged = await guardedExec("git", ["diff", "--cached", "--quiet"], { cwd });
    } catch (error) {
      return result(`Could not check staged changes. Nothing was committed. ${(error as Error).message}`, true);
    }
    if (staged.code === 0) {
      let status;
      try {
        status = await guardedExec("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], { cwd });
      } catch (error) {
        return result(`Could not check working-tree changes. Nothing was staged. ${(error as Error).message}`, true);
      }
      if (status.code !== 0) {
        const output = [status.stdout, status.stderr].filter(Boolean).join("\n").trim();
        return result(`Could not check working-tree changes. Nothing was staged.${output ? ` ${output}` : ""}`, true);
      }

      let paths: string[];
      try {
        paths = parseWorktreePaths(status.stdout);
      } catch (error) {
        return result(`Cannot safely stage changes. Nothing was staged. ${(error as Error).message}`, true);
      }
      if (paths.length === 0) return result("No changes to commit.", true);
      if (!confirmStage) return result("Cannot stage changes without interactive confirmation. Nothing was staged.", true);

      let confirmed: boolean;
      try {
        confirmed = await confirmStage(paths, signal);
      } catch (error) {
        return result(`Could not confirm staging. Nothing was staged. ${(error as Error).message}`, true);
      }
      if (signal?.aborted || !confirmed) return result("Commit cancelled.");

      try {
        const added = await guardedExec("git", ["--literal-pathspecs", "add", "--all", "--", ...paths], { cwd });
        if (added.code !== 0) {
          const output = [added.stdout, added.stderr].filter(Boolean).join("\n").trim();
          return result(`Could not stage all confirmed paths. Check git status; some paths may be staged.${output ? ` ${output}` : ""}`, true);
        }
        staged = await guardedExec("git", ["diff", "--cached", "--quiet"], { cwd });
      } catch (error) {
        return result(`Staging was interrupted. Check git status; some paths may be staged. ${(error as Error).message}`, true);
      }
      if (staged.code === 0) return result("No changes were staged. Nothing was committed.", true);
      if (staged.code !== 1) {
        const output = [staged.stdout, staged.stderr].filter(Boolean).join("\n").trim();
        return result(`Could not verify staged changes. Nothing was committed.${output ? ` ${output}` : ""}`, true);
      }
    } else if (staged.code !== 1) {
      const output = [staged.stdout, staged.stderr].filter(Boolean).join("\n").trim();
      return result(`Could not check staged changes. Nothing was committed.${output ? ` ${output}` : ""}`, true);
    }

    let checked;
    try {
      checked = await guardedExec("git", ["diff", "--cached", "--check"], { cwd });
    } catch (error) {
      return result(`Could not validate staged changes. Nothing was committed. ${(error as Error).message}`, true);
    }
    if (checked.code !== 0) {
      const output = [checked.stdout, checked.stderr].filter(Boolean).join("\n").trim();
      return result(`Staged changes failed git diff --cached --check. Nothing was committed.${output ? `\n${output}` : ""}`, true);
    }
  }

  const initial = `${input.title.trim()}${input.description.trim() ? `\n\n${input.description.trim()}` : ""}`;
  let answer: ReviewResult;
  try {
    answer = await review(`${input.action === "commit" ? "Commit message" : "Pull request"}: ${input.title.trim()}`, initial, signal);
  } catch (error) {
    return result(`Review failed. Nothing was published. ${(error as Error).message}`, true);
  }
  if (signal?.aborted || answer.status === "cancelled") return result(`${kind} cancelled.`);
  const message = parseMessage(answer.text);
  if (!message) return result("Title cannot be empty. Nothing was published.", true);

  try {
    if (input.action === "pr") {
      const published = await pushAndCreatePullRequest(guardedExec, cwd, message.title, message.description);
      return result(published.output || (published.code === 0 ? "Pull request created." : `${published.command} failed.`), published.code !== 0);
    }
    const dir = await mkdtemp(join(tmpdir(), "pi-git-commit-"));
    try {
      const messageFile = join(dir, "message");
      await writeFile(messageFile, `${message.title}${message.description ? `\n\n${message.description}` : ""}\n`, { mode: 0o600 });
      const published = await guardedExec("git", ["commit", "--file", messageFile], { cwd });
      return result([published.stdout, published.stderr].filter(Boolean).join("\n").trim()
        || (published.code === 0 ? "Commit created." : `git commit failed with exit code ${published.code}.`), published.code !== 0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  } catch (error) {
    return result(`Publish interrupted: ${(error as Error).message}. Already started git/gh operations may have taken effect; check repository state.`, true);
  }
}
