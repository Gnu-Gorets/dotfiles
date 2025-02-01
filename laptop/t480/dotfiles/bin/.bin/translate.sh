#!/bin/sh
text=$(xclip -o --selection-primary)
translated=$(trans -b :ru "$text")
zenity --info --text="$translated" --title='Перевод' --width=350
