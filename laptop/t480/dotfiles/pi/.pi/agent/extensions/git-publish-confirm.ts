import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { openPublishDialog } from "./git-publish-confirm/gui.ts";
import { reviewAndPublish } from "./git-publish-confirm/publish.ts";
import { isProtectedCommand } from "./git-publish-confirm/utils.ts";

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
    description: "Create a Git commit or GitHub pull request after review. If no files are staged, ask before staging working-tree changes and run git diff --cached --check.",
    promptSnippet: "Create a commit or GitHub PR through the user-confirmed review flow",
    promptGuidelines: [
      "Use this tool instead of shell commands for git commit and gh pr create.",
      "Call commit only after user requests one. If no files are staged, git_publish shows changed paths and asks before staging them.",
      "Call pr only after user requests one; never create it as an implicit follow-up.",
    ],
    parameters: params,

    async execute(_toolCallId, input, _signal, _onUpdate, ctx) {
      if (!ctx.hasUI) return errorResult("Commit and PR creation require interactive confirmation.");

      const confirmStage = (paths: string[], signal?: AbortSignal) => ctx.ui.confirm(
        "Stage changes for commit?",
        `No changes are staged. Stage all listed paths?\n\n${paths.map((path) => JSON.stringify(path)).join("\n")}\n\nIf you cancel the message editor, these paths remain staged.`,
        { signal },
      );
      return reviewAndPublish(input, ctx.cwd, _signal, pi.exec.bind(pi), openPublishDialog, confirmStage);
    },
  });

  pi.on("tool_call", (event) => {
    if (event.toolName !== "bash" || !isProtectedCommand(event.input.command)) return;
    return {
      block: true,
      reason: "Direct commit and PR commands are blocked. Use git_publish to review changes and confirm publication.",
    };
  });

  pi.on("user_bash", (event) => {
    if (!isProtectedCommand(event.command)) return;
    return {
      operations: {
        async exec(_command, _cwd, { onData }) {
          onData(Buffer.from("Blocked: use Pi's git_publish tool to review changes and confirm publication.\n"));
          return { exitCode: 1 };
        },
      },
    };
  });
}
