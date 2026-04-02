#!/usr/bin/env bash
# Author: Nick Clyde (clydedroid)
#
# A script that generates a rofi menu that uses bluetoothctl to
# connect to bluetooth devices and display status info.
#
# Inspired by networkmanager-dmenu (https://github.com/firecat53/networkmanager-dmenu)
# Thanks to x70b1 (https://github.com/polybar/polybar-scripts/tree/master/polybar-scripts/system-bluetooth-bluetoothctl)
#
# Depends on:
#   Arch repositories: rofi, bluez-utils (contains bluetoothctl)

divider="---------"
goback="Back"

# Wrapper with timeout to prevent hanging on slow daemon responses
_btq() { timeout 5 bluetoothctl "$@"; }

# Checks if bluetooth controller is powered on
power_on() {
    _btq show | grep -q "Powered: yes"
}

# Toggles power state
toggle_power() {
    if power_on; then
        bluetoothctl power off
    else
        if rfkill list bluetooth | grep -q 'blocked: yes'; then
            rfkill unblock bluetooth && sleep 3
        fi
        bluetoothctl power on
    fi
    show_menu
}

# Checks if controller is scanning for new devices
scan_on() {
    if _btq show | grep -q "Discovering: yes"; then
        echo "Scan: on"
    else
        echo "Scan: off"
        return 1
    fi
}

# Toggles scanning state
toggle_scan() {
    if scan_on > /dev/null; then
        kill $(pgrep -f "bluetoothctl scan on")
        bluetoothctl scan off
    else
        bluetoothctl scan on &
        echo "Scanning..."
        sleep 5
    fi
    show_menu
}

# Checks if controller is able to pair to devices
pairable_on() {
    if _btq show | grep -q "Pairable: yes"; then
        echo "Pairable: on"
    else
        echo "Pairable: off"
        return 1
    fi
}

# Toggles pairable state
toggle_pairable() {
    if pairable_on > /dev/null; then
        bluetoothctl pairable off
    else
        bluetoothctl pairable on
    fi
    show_menu
}

# Checks if controller is discoverable by other devices
discoverable_on() {
    if _btq show | grep -q "Discoverable: yes"; then
        echo "Discoverable: on"
    else
        echo "Discoverable: off"
        return 1
    fi
}

# Toggles discoverable state
toggle_discoverable() {
    if discoverable_on > /dev/null; then
        bluetoothctl discoverable off
    else
        bluetoothctl discoverable on
    fi
    show_menu
}

# Checks if a device is connected
device_connected() {
    _btq info "$1" | grep -q "Connected: yes"
}

# Toggles device connection
toggle_connection() {
    if device_connected "$1"; then
        bluetoothctl disconnect "$1"
    else
        bluetoothctl connect "$1"
    fi
    device_menu "$device"
}

# Checks if a device is paired
device_paired() {
    if _btq info "$1" | grep -q "Paired: yes"; then
        echo "Paired: yes"
    else
        echo "Paired: no"
        return 1
    fi
}

# Toggles device paired state
toggle_paired() {
    if device_paired "$1" > /dev/null; then
        bluetoothctl remove "$1"
    else
        bluetoothctl pair "$1"
    fi
    device_menu "$device"
}

# Checks if a device is trusted
device_trusted() {
    if _btq info "$1" | grep -q "Trusted: yes"; then
        echo "Trusted: yes"
    else
        echo "Trusted: no"
        return 1
    fi
}

# Toggles device connection
toggle_trust() {
    if device_trusted "$1" > /dev/null; then
        bluetoothctl untrust "$1"
    else
        bluetoothctl trust "$1"
    fi
    device_menu "$device"
}

# Prints a short string with the current bluetooth status
# Useful for status bars like polybar, etc.
print_status() {
    if ! _btq show | grep -q "Powered: yes"; then
        printf '\xef\x8a\x94\n'
        return
    fi

    printf '\xef\x8a\x93'

    local paired_devices_cmd="devices Paired"
    if (( $(echo "$(_btq --version | awk '{print $2}') < 5.65" | bc -l) )); then
        paired_devices_cmd="paired-devices"
    fi

    local counter=0
    while IFS= read -r device; do
        [ -z "$device" ] && continue
        local info alias battery
        info=$(_btq info "$device")
        echo "$info" | grep -q "Connected: yes" || continue

        alias=$(echo "$info" | grep "Alias" | cut -d ' ' -f 2-)

        local raw_battery
        raw_battery=$(echo "$info" | grep "Battery Percentage" | awk '{print $3}')
        if [[ $raw_battery =~ 0x[0-9A-Fa-f]+ ]]; then
            battery="$((16#${raw_battery:2}))%"
        elif [ -n "$raw_battery" ]; then
            battery="${raw_battery}%"
        else
            battery="N/A"
        fi

        if [ "$battery" != "N/A" ]; then
            [ $counter -gt 0 ] && printf ", %s (%s)" "$alias" "$battery" || printf " %s (%s)" "$alias" "$battery"
        else
            [ $counter -gt 0 ] && printf ", %s" "$alias" || printf " %s" "$alias"
        fi
        ((counter++))
    done < <(_btq $paired_devices_cmd | grep Device | cut -d ' ' -f 2)

    printf "\n"
}

# A submenu for a specific device that allows connecting, pairing, and trusting
device_menu() {
    local device=$1
    local device_name mac info connected paired trusted
    device_name=$(echo "$device" | cut -d ' ' -f 3-)
    mac=$(echo "$device" | cut -d ' ' -f 2)

    # Fetch device info once for all state checks
    info=$(_btq info "$mac")
    connected=$(echo "$info" | grep -q "Connected: yes" && echo "Connected: yes" || echo "Connected: no")
    paired=$(echo "$info" | grep -q "Paired: yes" && echo "Paired: yes" || echo "Paired: no")
    trusted=$(echo "$info" | grep -q "Trusted: yes" && echo "Trusted: yes" || echo "Trusted: no")

    local options="$connected\n$paired\n$trusted\n$divider\n$goback\nExit"
    local chosen
    chosen="$(echo -e "$options" | $rofi_command "$device_name")"

    case "$chosen" in
        "" | "$divider") ;;
        "$connected") toggle_connection "$mac" ;;
        "$paired")    toggle_paired "$mac" ;;
        "$trusted")   toggle_trust "$mac" ;;
        "$goback")    show_menu ;;
    esac
}

# Opens a rofi menu with current bluetooth status and options to connect
show_menu() {
    local bt_show power options
    # Fetch controller state once for all checks
    bt_show=$(_btq show)

    if echo "$bt_show" | grep -q "Powered: yes"; then
        power="Power: on"
        local devices scan pairable discoverable
        devices=$(bluetoothctl devices | grep Device | cut -d ' ' -f 3-)
        scan=$(echo "$bt_show" | grep -q "Discovering: yes" && echo "Scan: on" || echo "Scan: off")
        pairable=$(echo "$bt_show" | grep -q "Pairable: yes" && echo "Pairable: on" || echo "Pairable: off")
        discoverable=$(echo "$bt_show" | grep -q "Discoverable: yes" && echo "Discoverable: on" || echo "Discoverable: off")
        options="$devices\n$divider\n$power\n$scan\n$pairable\n$discoverable\nExit"
    else
        power="Power: off"
        options="$power\nExit"
    fi

    local chosen
    chosen="$(echo -e "$options" | $rofi_command "Bluetooth")"

    case "$chosen" in
        "" | "$divider") ;;
        "$power")       toggle_power ;;
        "$scan")        toggle_scan ;;
        "$discoverable") toggle_discoverable ;;
        "$pairable")    toggle_pairable ;;
        *)
            local device
            device=$(bluetoothctl devices | grep "$chosen")
            if [[ $device ]]; then device_menu "$device"; fi
            ;;
    esac
}

# Rofi command to pipe into, can add any options here
rofi_command="rofi -dmenu $* -p"

case "$1" in
    --status) print_status ;;
    *) show_menu ;;
esac
