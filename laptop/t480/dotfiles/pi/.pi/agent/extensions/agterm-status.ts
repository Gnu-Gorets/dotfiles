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
      await Promise.all([
        pi.exec(wrapper, [state, ...args], { timeout: 1_000 }),
        pi.exec("agtermctl", ["notify", message, "--title", `Pi: ${state}`, "--target", session, ...(socket ? ["--socket", socket] : [])], { timeout: 1_000 }),
      ]);
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
