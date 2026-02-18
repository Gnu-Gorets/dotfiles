#!/usr/bin/env bash
#             __ _       _     _            _              _   _
#  _ __ ___  / _(_)     | |__ | |_   _  ___| |_ ___   ___ | |_| |__
# | '__/ _ \| |_| |_____| '_ \| | | | |/ _ \ __/ _ \ / _ \| __| '_ \
# | | | (_) |  _| |_____| |_) | | |_| |  __/ || (_) | (_) | |_| | | |
# |_|  \___/|_| |_|     |_.__/|_|\__,_|\___|\__\___/ \___/ \__|_| |_|
#

divider="---------"
goback="Back"

bt_query() {
    {
        printf '%s\n' "$*"
        printf 'exit\n'
    } | command bluetoothctl 2>/dev/null | tr -d '\r' | sed -E 's/\x1B\[[0-9;?]*[ -/]*[@-~]//g'
}

bt_exec_quiet() {
    bt_query "$*" >/dev/null
}

info_value() {
    local info_text="$1"
    local key="$2"
    echo "$info_text" | sed -n -E "s/^[[:space:]]*${key}:[[:space:]]*([^[:space:]]+).*/\\1/p" | head -n1
}

device_info() { bt_query info "$1"; }
device_flag() { info_value "$(device_info "$1")" "$2"; }
controller_flag() { info_value "$(bt_query show)" "$1"; }

controller_status() {
    local key="$1"
    local label="$2"
    if [ "$(controller_flag "$key")" = "yes" ]; then
        echo "$label: on"
        return 0
    fi
    echo "$label: off"
    return 1
}

device_line_by_mac() {
    local mac="$1"
    bt_query devices | awk -v mac="$mac" '$1=="Device" && $2==mac{print; exit}'
}

open_device_menu_by_mac() {
    local mac="$1"
    local line
    line=$(device_line_by_mac "$mac")
    if [ -n "$line" ]; then
        device_menu "$line"
    else
        show_menu
    fi
}

wait_for_device_state() {
    local mac="$1"
    local key="$2"
    local expected="$3"
    local timeout="${4:-10}"
    local waited=0
    local current

    while [ "$waited" -lt "$timeout" ]; do
        current=$(device_flag "$mac" "$key")
        if [ "$current" = "$expected" ]; then
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done
    return 1
}

power_on() { [ "$(controller_flag Powered)" = "yes" ]; }
scan_on() { controller_status Discovering "Scan"; }
pairable_on() { controller_status Pairable "Pairable"; }
discoverable_on() { controller_status Discoverable "Discoverable"; }

toggle_power() {
    if power_on; then
        bt_exec_quiet power off
    else
        if rfkill list bluetooth | grep -q 'blocked: yes'; then
            rfkill unblock bluetooth && sleep 3
        fi
        bt_exec_quiet power on
    fi
    show_menu
}

toggle_scan() {
    if scan_on >/dev/null; then
        bt_exec_quiet scan off
    else
        bt_exec_quiet scan on
        sleep 5
    fi
    show_menu
}

toggle_pairable() {
    if pairable_on >/dev/null; then
        bt_exec_quiet pairable off
    else
        bt_exec_quiet pairable on
    fi
    show_menu
}

toggle_discoverable() {
    if discoverable_on >/dev/null; then
        bt_exec_quiet discoverable off
    else
        bt_exec_quiet discoverable on
    fi
    show_menu
}

device_connected() { [ "$(device_flag "$1" Connected)" = "yes" ]; }

toggle_connection() {
    if device_connected "$1"; then
        bt_exec_quiet disconnect "$1"
        wait_for_device_state "$1" Connected no 10 || sleep 1
    else
        bt_exec_quiet connect "$1"
        wait_for_device_state "$1" Connected yes 12 || sleep 1
    fi
    open_device_menu_by_mac "$1"
}

toggle_paired() {
    if [ "$(device_flag "$1" Paired)" = "yes" ]; then
        bt_exec_quiet remove "$1"
    else
        bt_exec_quiet pair "$1"
    fi
    sleep 1
    open_device_menu_by_mac "$1"
}

toggle_trust() {
    if [ "$(device_flag "$1" Trusted)" = "yes" ]; then
        bt_exec_quiet untrust "$1"
    else
        bt_exec_quiet trust "$1"
    fi
    sleep 1
    open_device_menu_by_mac "$1"
}

battery_from_info() {
    local info="$1"
    local value decimal
    value=$(echo "$info" | awk '/Battery Percentage/ {print $3; exit}')
    if [[ $value =~ 0x[0-9A-Fa-f]+ ]]; then
        decimal=$((16#${value:2}))
        echo "$decimal%"
    elif [ -n "$value" ]; then
        echo "$value%"
    else
        echo "N/A"
    fi
}

alias_from_info() { echo "$1" | sed -n -E 's/^[[:space:]]*Alias:[[:space:]]*(.*)$/\1/p' | head -n1; }

paired_devices_cmd() {
    if (( $(echo "$(bluetoothctl --version | awk '{print $2}') < 5.65" | bc -l) )); then echo "paired-devices"; else echo "devices Paired"; fi
}

print_status() {
    local cmd counter=0 mac info alias battery sep
    local -a paired

    if ! power_on; then
        echo ""
        return
    fi

    printf ''
    cmd=$(paired_devices_cmd)
    mapfile -t paired < <(bt_query "$cmd" | grep "^Device " | cut -d ' ' -f 2)

    for mac in "${paired[@]}"; do
        info=$(device_info "$mac")
        [ "$(info_value "$info" Connected)" = "yes" ] || continue
        alias=$(alias_from_info "$info")
        battery=$(battery_from_info "$info")
        if [ "$counter" -gt 0 ]; then
            sep=", "
        else
            sep=" "
        fi
        if [ "$battery" = "N/A" ]; then
            printf "%s%s" "$sep" "$alias"
        else
            printf "%s%s (%s)" "$sep" "$alias" "$battery"
        fi
        counter=$((counter + 1))
    done
    printf '\n'
}

select_device_line() {
    local name="$1"
    local candidate mac
    local -a matches

    mapfile -t matches < <(
        bt_query devices | awk -v chosen="$name" '
            $1=="Device" {
                mac=$2
                $1=""
                $2=""
                sub(/^  */, "", $0)
                if ($0 == chosen) print "Device " mac " " $0
            }
        '
    )

    [ "${#matches[@]}" -gt 0 ] || return 1
    for candidate in "${matches[@]}"; do
        mac=$(echo "$candidate" | cut -d ' ' -f 2)
        [ "$(device_flag "$mac" Connected)" = "yes" ] && { echo "$candidate"; return 0; }
    done
    for candidate in "${matches[@]}"; do
        mac=$(echo "$candidate" | cut -d ' ' -f 2)
        [ "$(device_flag "$mac" Paired)" = "yes" ] && { echo "$candidate"; return 0; }
    done
    echo "${matches[0]}"
}

device_menu() {
    local line="$1"
    local name mac info connected paired trusted options chosen

    mac=$(echo "$line" | cut -d ' ' -f 2)
    name=$(echo "$line" | cut -d ' ' -f 3-)

    info=$(device_info "$mac")
    connected="Connected: $(info_value "$info" Connected)"
    paired="Paired: $(info_value "$info" Paired)"
    trusted="Trusted: $(info_value "$info" Trusted)"
    connected=${connected/%: /: no}
    paired=${paired/%: /: no}
    trusted=${trusted/%: /: no}
    options="$connected\n$paired\n$trusted\n$divider\n$goback\nExit"
    chosen="$(echo -e "$options" | $rofi_command "$name")"

    case "$chosen" in
        "" | "$divider") ;;
        "$connected") toggle_connection "$mac" ;;
        "$paired") toggle_paired "$mac" ;;
        "$trusted") toggle_trust "$mac" ;;
        "$goback") show_menu ;;
    esac
}

show_menu() {
    local power devices scan pairable discoverable options chosen device

    if power_on; then
        power="Power: on"
        devices=$(bt_query devices | grep "^Device " | cut -d ' ' -f 3-)
        scan=$(scan_on)
        pairable=$(pairable_on)
        discoverable=$(discoverable_on)
        options="$devices\n$divider\n$power\n$scan\n$pairable\n$discoverable\nExit"
    else
        power="Power: off"
        options="$power\nExit"
    fi

    chosen="$(echo -e "$options" | $rofi_command "Bluetooth")"
    case "$chosen" in
        "" | "$divider") ;;
        "$power") toggle_power ;;
        "$scan") toggle_scan ;;
        "$discoverable") toggle_discoverable ;;
        "$pairable") toggle_pairable ;;
        *) device=$(select_device_line "$chosen") && device_menu "$device" ;;
    esac
}

rofi_command="rofi -dmenu $* -p"

case "$1" in
    --status) print_status ;;
    *) show_menu ;;
esac
