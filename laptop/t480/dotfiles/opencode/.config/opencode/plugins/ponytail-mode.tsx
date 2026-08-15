import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup } from "solid-js"

const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
const modeFile = join(configHome, "opencode", ".ponytail-active")
const defaultFile = join(configHome, "ponytail", "config.json")
const pohuyStateDir = join(configHome, "opencode", "pohuy", "sessions")
const modes = new Set(["off", "lite", "full", "ultra"])
const pohuySkill = join(homedir(), ".agents", "skills", "pohuy", "SKILL.md")

function currentMode() {
  try {
    const mode = readFileSync(modeFile, "utf8").trim().toLowerCase()
    if (modes.has(mode)) return mode
  } catch {}
  try {
    const mode = JSON.parse(readFileSync(defaultFile, "utf8")).defaultMode
    if (modes.has(mode)) return mode
  } catch {}
  return "full"
}

function currentPohuyMode(sessionID: string | undefined, fallback: string) {
  if (sessionID) {
    try {
      const mode = readFileSync(join(pohuyStateDir, encodeURIComponent(sessionID)), "utf8").trim().toLowerCase()
      if (modes.has(mode)) return mode
    } catch {}
  }
  return fallback
}

const tui: TuiPlugin = async (api) => {
  const [mode, setMode] = createSignal(currentMode())
  const pohuyActive = api.state.config.instructions?.some((path) => path === pohuySkill) ?? false
  const timer = setInterval(() => setMode(currentMode()), 500)
  const defaultPohuyMode = pohuyActive ? "ultra" : "off"
  const [pohuyMode, setPohuyMode] = createSignal(defaultPohuyMode)
  const refresh = () => {
    setMode(currentMode())
    const route = api.route.current
    setPohuyMode(currentPohuyMode(route.name === "session" ? route.params.sessionID : undefined, defaultPohuyMode))
  }
  const liveTimer = setInterval(refresh, 250)
  onCleanup(() => clearInterval(timer))
  onCleanup(() => clearInterval(liveTimer))

  api.slots.register({
    order: 60,
    slots: {
      app_bottom() {
        return (
          <text fg={api.theme.current.textMuted}>
            Ponytail: {mode()} · Pohuy: {pohuyMode()}
          </text>
        )
      },
    },
  })
}

export default { id: "ponytail-mode", tui } satisfies TuiPluginModule
