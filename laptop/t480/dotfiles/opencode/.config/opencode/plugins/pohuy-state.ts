import { mkdir, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { tool, type Plugin } from "@opencode-ai/plugin"

const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
const stateDir = join(configHome, "opencode", "pohuy", "sessions")

const plugin: Plugin = async () => ({
  tool: {
    pohuy_mode: tool({
      description: "Set the Pohuy mode for this OpenCode session. This is the authoritative session state.",
      args: {
        mode: tool.schema.enum(["off", "lite", "full", "ultra"]).describe("The session mode to activate"),
      },
      async execute({ mode }, context) {
        await mkdir(stateDir, { recursive: true })
        await writeFile(join(stateDir, encodeURIComponent(context.sessionID)), mode + "\n")
        return `Pohuy mode confirmed: ${mode}`
      },
    }),
  },
})

export default plugin
