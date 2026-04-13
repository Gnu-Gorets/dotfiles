#!/usr/bin/env bash

SESSION="work"
LAYOUT_PATH="$HOME/.config/zellij/layouts/work_layout.kdl"
ZELLIJ_TMP_DIR="/tmp/zellij-$(id -u)"

if [ "$1" = "--attach" ]; then
    if [ -d "$ZELLIJ_TMP_DIR" ] && zellij list-sessions | grep -q "$SESSION"; then
        zellij attach "$SESSION"
    else
        zellij kill-all-sessions --yes
        zellij delete-all-sessions --yes
        zellij --session "$SESSION" --new-session-with-layout "$LAYOUT_PATH"
    fi
else
    WID=$(xdotool search --classname "ZellijTerm" 2>/dev/null | head -1)
    if [ -n "$WID" ]; then
        xdotool windowactivate --sync "$WID"
    else
        alacritty --class Alacritty,ZellijTerm -e "$0" --attach &
    fi
fi
