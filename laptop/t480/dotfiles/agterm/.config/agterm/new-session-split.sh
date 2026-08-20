#!/bin/sh
set -eu

mode=${1:-current}
ctl="$(dirname "$(dirname "$AGTERM_GHOSTTY_RESOURCES")")/bin/agtermctl"
socket=${AGT_SOCKET:?AGT_SOCKET is unavailable}
window=${AGT_WINDOW_ID:?AGT_WINDOW_ID is unavailable}
cwd=${AGT_SESSION_PWD:-$HOME}

case "$mode" in
    current)
        workspace_args=
        ;;
    workspace)
        name=$(basename "$cwd")
        workspace_id=$("$ctl" workspace new "$name" --window "$window" --socket "$socket")
        workspace_args="--workspace $workspace_id"
        ;;
    *)
        echo "unknown mode: $mode" >&2
        exit 2
        ;;
esac

select_args=--no-select
[ -n "${AGT_SESSION_ID:-}" ] || select_args=
id=$("$ctl" session new $workspace_args --window "$window" --cwd "$cwd" --name terminal $select_args --socket "$socket")
"$ctl" session split on --target "$id" --window "$window" --socket "$socket"
# Keep Codex as the left pane's command on every future agterm restart.
"$ctl" session restore codex --pane left --target "$id" --window "$window" --socket "$socket"
# Start Codex; zsh compacts the startup screen once the idle prompt is stable.
printf 'codex\n' | "$ctl" session type --stdin --select --pane left --target "$id" --window "$window" --socket "$socket"
"$ctl" session select --target "$id" --window "$window" --socket "$socket"
