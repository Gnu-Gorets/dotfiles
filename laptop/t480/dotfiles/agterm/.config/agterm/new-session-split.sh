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
[ "$mode" = workspace ] && select_args=
[ -n "${AGT_SESSION_ID:-}" ] || select_args=
id=$("$ctl" session new $workspace_args --window "$window" --cwd "$cwd" --command "zsh -lc 'pi; exec zsh'" --name pi $select_args --socket "$socket")
"$ctl" session split on --target "$id" --window "$window" --socket "$socket"
"$ctl" session focus left --target "$id" --window "$window" --socket "$socket"
# Keep a shell in the pane after Pi exits, so the project directory remains usable.
"$ctl" session restore "clear; exec zsh -lc 'pi; exec zsh'" --pane left --target "$id" --window "$window" --socket "$socket"
"$ctl" session select --target "$id" --window "$window" --socket "$socket"
