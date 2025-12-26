#! /bin/bash

# cat ~/.config/sxhkd/sxhkdrc | awk '/^[a-z]/ && last {print $0,"\t",last} {last=""} /^#/{last=$0}' | column -t -s $'\t' | fzf

awk '/^[a-z]/ && last {print $0,"\t",last} {last=""} /^#/{last=$0}' ~/.config/sxhkd/sxhkdrc | column -t -s $'\t' | rofi -dmenu -i -p "Help Keys: " -markup-rows -no-show-icons -width 700 -lines 15 -yoffset 30 -font "ClearSansMedium 11"
