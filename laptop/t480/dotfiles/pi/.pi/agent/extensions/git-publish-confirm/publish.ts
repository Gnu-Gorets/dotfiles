import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ReviewResult } from "./gui.ts";
import { parseMessage, pushAndCreatePullRequest, type Exec } from "./utils.ts";

type Proposal = { action: "commit" | "pr"; title: string; description: string };
type Review = (title: string, text: string, signal?: AbortSignal) => Promise<ReviewResult>;

function result(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], details: undefined, ...(isError ? { isError } : {}) };
}

export async function reviewAndPublish(input: Proposal, cwd: string, signal: AbortSignal | undefined, exec: Exec, review: Review) {
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
    if (staged.code === 0)
      return result("No staged changes to commit. Stage the intended files with git add, then retry. git_publish commits staged files only.", true);
    if (staged.code !== 1) {
      const output = [staged.stdout, staged.stderr].filter(Boolean).join("\n").trim();
      return result(`Could not check staged changes. Nothing was committed.${output ? ` ${output}` : ""}`, true);
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
