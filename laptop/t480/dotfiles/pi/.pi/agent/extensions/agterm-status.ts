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

  async function report(state: string, message: string, ...args: string[]): Promise<void> {
    const session = process.env.AGTERM_SESSION_ID;
    if (!session) return;
    const socket = process.env.AGTERM_SOCKET;
    try {
      const socketArgs = socket ? ["--socket", socket] : [];
      const [, treeResult] = await Promise.all([
        pi.exec(wrapper, [state, ...args], { timeout: 1_000 }),
        pi.exec("agtermctl", ["tree", "--json", ...socketArgs], { timeout: 1_000 }).catch(() => ({ stdout: "" })),
      ]);
      let workspaces: Array<{ id: string; name: string; sessions: Array<{ id: string; name: string }> }> | undefined;
      try {
        workspaces = JSON.parse(treeResult.stdout || "{}").result?.tree?.workspaces;
      } catch {}
      const workspace = workspaces?.find((item) => item.id === process.env.AGTERM_WORKSPACE_ID);
      const sessionName = workspace?.sessions.find((item) => item.id === session)?.name ?? session;
      const title = `${workspace?.name ?? process.env.AGTERM_WORKSPACE_ID ?? "Workspace"} / ${sessionName}`;
      await pi.exec("agtermctl", ["notify", message, "--title", title, "--target", session, ...socketArgs], { timeout: 1_000 });
    } catch {
      // Status reporting is advisory and must never interrupt Pi's agent loop.
    }
  }

  pi.on("agent_start", async () => report("active", "Agent started", "--blink"));
  pi.on("ui_prompt_start", async () => report("blocked", "Waiting for your input"));
  pi.on("ui_prompt_end", async () => report("active", "Input received", "--blink"));

  // `agent_settled` waits for automatic retries, compaction retries, and queued continuations.
  pi.on("agent_settled", async () => report("completed", "Agent completed", "--auto-reset"));
}
