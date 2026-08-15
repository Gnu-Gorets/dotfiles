#!/bin/sh
set -eu

ctl="$(dirname "$(dirname "$AGTERM_GHOSTTY_RESOURCES")")/bin/agtermctl"
socket=${AGT_SOCKET:-${AGTERM_STATE_DIR:-$HOME/.local/share/agterm}/agterm.sock}
target=$("$ctl" tree --socket "$socket" --json | jq -r '[.result.tree.workspaces[]?.sessions[]? | select(.active == true) | .id][0] // empty')
temporary=

if [ -z "$target" ]; then
    target=$("$ctl" session new --cwd "$HOME" --name hotkeys --no-select \
        --window "${AGT_WINDOW_ID:-active}" --socket "$socket")
    temporary=1
fi

cheat_sheet=${AGTERM_CHEAT_SHEET:-$HOME/.config/cheat/cheatsheets/personal/agterm}
command="env -u LD_LIBRARY_PATH /usr/bin/bat --paging=always --pager=builtin --style=plain --language=markdown \"$cheat_sheet\""

if [ -n "$temporary" ]; then
    trap '"$ctl" session close --target "$target" --socket "$socket" >/dev/null 2>&1 || true' EXIT
    "$ctl" session overlay open "$command" --target "$target" --size-percent 90 --follow --block --socket "$socket"
else
    exec "$ctl" session overlay open "$command" --target "$target" --size-percent 90 --follow --socket "$socket"
fi
