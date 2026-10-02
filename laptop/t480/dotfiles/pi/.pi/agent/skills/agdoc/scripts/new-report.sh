#!/usr/bin/env bash
set -euo pipefail
root="${AGDOC_DIR:-$HOME/.cache/agdoc}"
dir="$root/reports"
slug="${1:-report}"
slug="$(printf '%s' "$slug" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-')"
slug="${slug#-}"
slug="${slug%-}"
[[ -n "$slug" ]] || slug=report
mkdir -p "$dir"
file="$(mktemp --suffix=.html "$dir/${slug}-$(date +%Y%m%dT%H%M%S)-XXXXXX")"
printf '%s\n' "$file"
