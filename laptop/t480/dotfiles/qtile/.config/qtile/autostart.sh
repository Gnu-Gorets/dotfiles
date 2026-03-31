#!/bin/sh

run() {
    if ! pgrep -x "$1" >/dev/null; then
        "$@" >/dev/null 2>&1 &
    fi
}

# Cursor and keyboard layout
xsetroot -cursor_name left_ptr &
setxkbmap -layout us,ru -option "grp:alt_shift_toggle,grp_led:scroll" &
xmodmap -e "keycode 164 = NoSymbol" &

# Disable screen blanking and power saving
xset s off -dpms &

# Ensure preferred resolution for the currently connected display.
PRIMARY_OUTPUT="$(xrandr --query | awk '/ connected primary/{print $1; exit}')"
[ -z "$PRIMARY_OUTPUT" ] && PRIMARY_OUTPUT="$(xrandr --query | awk '/ connected/{print $1; exit}')"
if [ -n "$PRIMARY_OUTPUT" ]; then
    xrandr --output "$PRIMARY_OUTPUT" --auto &
fi

# Background and compositor
# Restore wallpaper from the last `feh --bg-*` call.
if [ -x "$HOME/.fehbg" ]; then
    "$HOME/.fehbg" &
fi
picom -b --config "$HOME/.config/picom.conf" &

# Apply Xresources (replaces xsettingsd)
xrdb -merge "$HOME/.Xresources" &

# Daemons and services
run dunst
/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 &
gnome-keyring-daemon --start --components=pkcs11 &

# Tray applets
run nm-applet
run xfce4-power-manager
run udiskie -t
run parcellite
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark' &


# Tint2 tray (ONLY system tray)
if command -v tint2 >/dev/null 2>&1; then
    sleep 2
    tint2 -c "$HOME/.config/tint2/tray.tint2rc" &
fi
