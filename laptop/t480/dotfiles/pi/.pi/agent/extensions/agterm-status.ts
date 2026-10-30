// agterm-pi-status-extension
//
// Pi lifecycle extension installed by agterm's Help ▸ Install Agent Status Hooks… command.
// It uses the installed agterm wrapper for session, pane, socket, and CLI resolution, so it is
// a harmless no-op outside agterm.

import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  const wrapper = join(homedir(), ".config", "agterm", "agent-status", "agterm-agent-status.sh");

  async function report(args: string[]): Promise<void> {
    if (!process.env.AGTERM_SESSION_ID) return;
    try {
      await pi.exec(wrapper, args, { timeout: 1_000 });
    } catch {
      // Status reporting is advisory and must never interrupt Pi's agent loop.
    }
  }

  let targetNames: Promise<{ workspace: string; session: string }> | undefined;

  async function getTargetNames(): Promise<{ workspace: string; session: string }> {
    const target = process.env.AGTERM_SESSION_ID!;
    targetNames ??= (async () => {
      const args = ["tree", "--json"];
      if (process.env.AGTERM_SOCKET) args.push("--socket", process.env.AGTERM_SOCKET);
      const result = await pi.exec("agtermctl", args, { timeout: 1_000 });
      const tree = JSON.parse(result.stdout).result.tree;
      for (const workspace of tree.workspaces ?? []) {
        const session = workspace.sessions?.find((item: { id: string }) => item.id === target);
        if (session) return { workspace: workspace.name, session: session.name };
      }
      throw new Error("Current agterm session not found");
    })();
    return targetNames;
  }

  async function notify(status: string): Promise<void> {
    const target = process.env.AGTERM_SESSION_ID;
    if (!target) return;

    try {
      const { workspace, session } = await getTargetNames();
      const args = ["notify", status, "--title", `Pi: ${workspace} / ${session}`, "--target", target];
      if (process.env.AGTERM_SOCKET) args.push("--socket", process.env.AGTERM_SOCKET);
      await pi.exec("agtermctl", args, { timeout: 1_000 });
    } catch {
      targetNames = undefined;
      // Notifications are advisory and must never interrupt Pi's agent loop.
    }
  }

  pi.on("agent_start", async () => {
    await Promise.all([report(["active", "--blink"]), notify("ебашит")]);
  });

  pi.on("ui_prompt_start", async () => {
    await Promise.all([report(["blocked", "--blink"]), notify("ждёт ввода")]);
  });

  pi.on("ui_prompt_end", async (_event, ctx) => {
    await report(ctx.isIdle() ? ["completed", "--auto-reset"] : ["active", "--blink"]);
  });

  // `agent_settled` waits for automatic retries, compaction retries, and queued continuations.
  pi.on("agent_settled", async () => {
    await Promise.all([report(["completed", "--auto-reset"]), notify("готово, заебись")]);
  });
}
