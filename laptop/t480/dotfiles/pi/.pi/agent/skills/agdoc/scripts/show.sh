#!/usr/bin/env bash
set -euo pipefail
root="${AGDOC_DIR:-$HOME/.cache/agdoc}"
file="${1:-$root/latest.html}"
sid="${2:-${AGTERM_SESSION_ID:-}}"
socket="${3:-${AGTERM_SOCKET:-}}"
[[ -s "$file" ]] || { printf 'HTML file is missing or empty: %s\n' "$file" >&2; exit 2; }
file="$(realpath "$file")"
grep -qiE '<!doctype html|<html([[:space:]>])' "$file" || { printf 'Not an HTML document: %s\n' "$file" >&2; exit 2; }

# Preserve legacy single-file output before replacing it with the latest symlink.
latest="$root/latest.html"
mkdir -p "$root"
if [[ -f "$latest" && ! -L "$latest" ]]; then
  archive="$root/reports"
  mkdir -p "$archive"
  backup="$(mktemp --suffix=.html "$archive/previous-latest-XXXXXX")"
  cp -p "$latest" "$backup"
  [[ "$file" != "$latest" ]] || file="$backup"
fi
link="$root/.latest.html.$$"
ln -s "$file" "$link"
mv -f -- "$link" "$latest"

if [[ -z "$sid" ]]; then
  xdg-open "$file" >/dev/null 2>&1 &
  exit 0
fi

socket_args=()
[[ -n "$socket" ]] && socket_args=(--socket "$socket")
ctl="${AGTERMCTL:-agtermctl}"
tree() {
  local args=(tree --json "${socket_args[@]}")
  [[ -n "${AGTERM_WINDOW_ID:-}" ]] && args+=(--window "$AGTERM_WINDOW_ID")
  "$ctl" "${args[@]}"
}
node="$(tree | jq -c --arg id "$sid" '[.. | objects | select(.id? == $id)][0] // {}')"
[[ "$node" != '{}' ]] || { printf 'agterm session not found: %s\n' "$sid" >&2; exit 1; }
pane=""
if [[ "$(jq -r '.split == true and any(.surfaces[]?; .kind == "right" and .visible == true)' <<<"$node")" == true ]]; then
  pane=right
fi
pane_args=()
[[ -z "$pane" ]] || pane_args=(--pane "$pane")
shown="$(jq -r --arg pane "$pane" '[.htmlOverlays // [] | .[] | select((.pane // "") == $pane)][0].file // ""' <<<"$node")"
url="$(jq -r --arg pane "$pane" '[.htmlOverlays // [] | .[] | select((.pane // "") == $pane)][0].url // ""' <<<"$node")"
program="$(jq -r --arg pane "$pane" 'if .overlay == true and ([.htmlOverlays // [] | .[] | select((.pane // "") == $pane)] | length) == 0 then "yes" else "" end' <<<"$node")"
[[ -z "$program" ]] || { echo 'A program overlay is running in the target pane; close it before showing HTML.' >&2; exit 1; }

if [[ "$shown" == "$file" ]]; then
  "$ctl" session overlay reload "${socket_args[@]}" --target "$sid" "${pane_args[@]}"
else
  if [[ -n "$shown" || -n "$url" ]]; then
    "$ctl" session overlay close "${socket_args[@]}" --target "$sid" "${pane_args[@]}"
  fi
  open_args=(session overlay open --html "$file" "${socket_args[@]}" --target "$sid" --follow)
  if [[ -n "$pane" ]]; then
    open_args+=(--pane "$pane")
  else
    open_args+=(--size-percent 95)
  fi
  "$ctl" "${open_args[@]}"
fi
