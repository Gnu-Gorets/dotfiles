import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { isProtectedCommand, parseAgtermAskResult, parseMessage, pushAndCreatePullRequest } from "./git-publish-confirm/utils.ts";

const params = Type.Object({
  action: Type.Union([Type.Literal("commit"), Type.Literal("pr")]),
  title: Type.String({ description: "Proposed commit or pull request title" }),
  description: Type.String({ description: "Proposed commit body or pull request description" }),
});

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: message }], details: undefined, isError: true };
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "git_publish",
    label: "Git publish",
    description: "Create a staged git commit or GitHub pull request after user reviews and confirms title and description.",
    promptSnippet: "Create a commit or GitHub PR through the user-confirmed review flow",
    promptGuidelines: [
      "Use this tool instead of shell commands for git commit and gh pr create.",
      "Call commit only after user requests one; it commits staged changes only.",
      "Call pr only after user requests one; never create it as an implicit follow-up.",
    ],
    parameters: params,

    async execute(_toolCallId, input, _signal, _onUpdate, ctx) {
      if (!ctx.hasUI) return errorResult("Commit and PR creation require interactive confirmation.");

      const kind = input.action === "commit" ? "commit" : "GitHub pull request";
      const title = input.title.trim();
      const dialogTitle = `${input.action === "commit" ? "Commit message" : "Pull request"}: ${title}`;
      const initial = `${title}${input.description.trim() ? `\n\n${input.description.trim()}` : ""}`;
      let edited: string | undefined;

      try {
        const result = await pi.exec(
          "agtermctl",
          [
            "ask", dialogTitle, "--style", "gui", "--input", "multiline", "--value", initial,
            "--button", "submit=Submit", "--button", "cancel=Cancel", "--cancel", "cancel", "--default", "submit",
          ],
          { cwd: ctx.cwd },
        );
        const answer = parseAgtermAskResult(result.stdout, result.code);
        if (answer.status === "cancelled") {
          return { content: [{ type: "text", text: `${kind} cancelled.` }], details: undefined };
        }
        if (answer.status === "invalid") return errorResult("Agterm returned an invalid publish dialog response.");
        if (answer.status === "submitted") edited = answer.text;
      } catch {
        // Use Pi's editor when agtermctl is not available in this session.
      }

      if (edited === undefined) edited = await ctx.ui.editor(dialogTitle, initial);
      if (edited === undefined) return { content: [{ type: "text", text: `${kind} cancelled.` }], details: undefined };

      const message = parseMessage(edited);
      if (!message) return errorResult("Title cannot be empty. Nothing was published.");

      if (input.action === "pr") {
        const result = await pushAndCreatePullRequest(pi.exec.bind(pi), ctx.cwd, message.title, message.description);
        if (result.code !== 0) return errorResult(result.output || `${result.command} failed with exit code ${result.code}.`);
        return { content: [{ type: "text", text: result.output || "Pull request created." }], details: undefined };
      }

      const dir = await mkdtemp(join(tmpdir(), "pi-git-commit-"));
      const messageFile = join(dir, "message");
      try {
        await writeFile(messageFile, `${message.title}${message.description ? `\n\n${message.description}` : ""}\n`, { mode: 0o600 });
        const result = await pi.exec("git", ["commit", "--file", messageFile], { cwd: ctx.cwd });
        const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
        if (result.code !== 0) return errorResult(output || `git commit failed with exit code ${result.code}.`);
        return { content: [{ type: "text", text: output || "Commit created." }], details: undefined };
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
  });

  pi.on("tool_call", (event) => {
    if (event.toolName !== "bash" || !isProtectedCommand(event.input.command)) return;
    return {
      block: true,
      reason: "Direct commit and PR commands are blocked. Use git_publish to review and confirm title and description.",
    };
  });

  pi.on("user_bash", (event) => {
    if (!isProtectedCommand(event.command)) return;
    return {
      operations: {
        async exec(_command, _cwd, { onData }) {
          onData(Buffer.from("Blocked: use Pi's git_publish tool to review and confirm this action.\n"));
          return { exitCode: 1 };
        },
      },
    };
  });
}
