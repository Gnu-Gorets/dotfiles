#!/usr/bin/env bash

SESSION="work"
USER_HOME=$(eval echo ~"$USER")
LAYOUT_PATH="$USER_HOME/.config/zellij/layouts/work_layout.kdl"
ZELLIJ_TMP_DIR="/tmp/zellij-$(id -u)"

if [ -d "$ZELLIJ_TMP_DIR" ] && zellij list-sessions | grep -q "$SESSION"; then
  zellij attach "$SESSION"
else
  zellij kill-all-sessions --yes
  zellij delete-all-sessions --yes
  zellij --session "$SESSION" --new-session-with-layout "$LAYOUT_PATH"
fi
