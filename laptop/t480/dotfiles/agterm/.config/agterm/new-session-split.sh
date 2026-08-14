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
# Keep OpenCode as the left pane's command on every future agterm restart.
"$ctl" session restore opencode --pane left --target "$id" --window "$window" --socket "$socket"
# Start OpenCode, wait for the shell to hand over the pane, then redraw its old screen noise.
printf 'opencode\n' | "$ctl" session type --stdin --select --pane left --target "$id" --window "$window" --socket "$socket"
sleep 3
printf '\014' | "$ctl" session type --stdin --select --pane left --target "$id" --window "$window" --socket "$socket"
"$ctl" session select --target "$id" --window "$window" --socket "$socket"
