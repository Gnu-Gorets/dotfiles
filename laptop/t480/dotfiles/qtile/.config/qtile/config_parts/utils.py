import re
import os
import subprocess

import psutil
from libqtile import qtile
from libqtile.lazy import lazy

from .constants import ACCENT, BRIGHTNESS_DEVICE

FLOAT_CENTER_RULES = {
    "mpv": (500, 280),
    "Nitrogen": (1000, 560),
}

pinned_windows = set()
_last_volume_before_mute = None
_float_states = {}

def run_cmd(cmd):
    try:
        return subprocess.check_output(
            cmd,
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
    except Exception:
        return None


def forget_window_state(wid):
    pinned_windows.discard(wid)
    _float_states.pop(wid, None)


def cpu_load_percent():
    return f"  {int(psutil.cpu_percent())}%"


def mem_usage():
    return f"  {psutil.virtual_memory().percent:.0f}%"


def uparch_status():
    output = run_cmd([os.path.expanduser("~/.config/qtile/uparch.sh")])
    return output if output is not None else "!"


def tor_status():
    output = run_cmd([os.path.expanduser("~/.config/qtile/status.sh"), "tor"])
    if not output:
        return "tor: error"
    return re.sub(r"%\{.*?\}", "", output).strip()


def bluetooth_status():
    output = run_cmd(
        [
            os.path.expanduser("~/.config/qtile/rofi-bluetooth.sh"),
            "--status",
        ]
    )
    if not output:
        return "bluetooth: error"
    return re.sub(r"%\{.*?\}", "", output).strip()


def volume_status():
    output = run_cmd(["pactl", "get-sink-volume", "@DEFAULT_SINK@"])
    if not output:
        return " ?%"
    match = re.search(r"(\d+)%", output)
    if not match:
        return " ?%"
    volume = int(match.group(1))
    if volume == 0:
        icon = " "
    elif volume < 50:
        icon = " "
    else:
        icon = " "
    return f"{icon} {volume}%"


def volume_up_capped(_qtile, step=5, max_percent=150):
    try:
        output = subprocess.check_output(
            ["pactl", "get-sink-volume", "@DEFAULT_SINK@"],
            stderr=subprocess.DEVNULL,
            text=True,
        )
        match = re.search(r"(\d+)%", output)
        if not match:
            return
        volume = int(match.group(1))
        new_volume = min(volume + step, max_percent)
        subprocess.check_call(
            ["pactl", "set-sink-volume", "@DEFAULT_SINK@", f"{new_volume}%"],
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        pass


def toggle_mute_restore_volume(_qtile):
    global _last_volume_before_mute
    try:
        mute_output = subprocess.check_output(
            ["pactl", "get-sink-mute", "@DEFAULT_SINK@"],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        is_muted = "yes" in mute_output.lower()

        if is_muted:
            subprocess.check_call(
                ["pactl", "set-sink-mute", "@DEFAULT_SINK@", "0"],
                stderr=subprocess.DEVNULL,
            )
            if _last_volume_before_mute is not None:
                subprocess.check_call(
                    [
                        "pactl",
                        "set-sink-volume",
                        "@DEFAULT_SINK@",
                        f"{_last_volume_before_mute}%",
                    ],
                    stderr=subprocess.DEVNULL,
                )
        else:
            output = subprocess.check_output(
                ["pactl", "get-sink-volume", "@DEFAULT_SINK@"],
                stderr=subprocess.DEVNULL,
                text=True,
            )
            match = re.search(r"(\d+)%", output)
            if match:
                _last_volume_before_mute = int(match.group(1))
            subprocess.check_call(
                ["pactl", "set-sink-volume", "@DEFAULT_SINK@", "0%"],
                stderr=subprocess.DEVNULL,
            )
            subprocess.check_call(
                ["pactl", "set-sink-mute", "@DEFAULT_SINK@", "1"],
                stderr=subprocess.DEVNULL,
            )
    except Exception:
        pass


def _brightness_sysfs(device):
    base = "/sys/class/backlight"
    if device:
        path = os.path.join(base, device)
        if os.path.isdir(path):
            return path
    try:
        entries = [
            d for d in os.listdir(base) if os.path.isdir(os.path.join(base, d))
        ]
    except Exception:
        return None
    return os.path.join(base, entries[0]) if entries else None


def brightness_level():
    try:
        cmd = ["brightnessctl", "-m"]
        if BRIGHTNESS_DEVICE:
            cmd = ["brightnessctl", "-d", BRIGHTNESS_DEVICE, "-m"]
        output = subprocess.check_output(
            cmd,
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        line = output.splitlines()[0]
        parts = line.split(",")
        if len(parts) >= 5:
            percent = parts[4].strip()
            if percent.endswith("%"):
                return f" {percent}"
        if len(parts) >= 4:
            current = int(parts[2])
            max_value = int(parts[3])
            if max_value > 0:
                percent = round(current / max_value * 100)
                return f" {percent}%"
    except Exception:
        pass

    try:
        sysfs_path = _brightness_sysfs(BRIGHTNESS_DEVICE)
        if not sysfs_path:
            return " ?"
        with open(os.path.join(sysfs_path, "brightness")) as f:
            current = int(f.read().strip())
        with open(os.path.join(sysfs_path, "max_brightness")) as f:
            max_value = int(f.read().strip())
        if max_value > 0:
            percent = round(current / max_value * 100)
            return f" {percent}%"
    except Exception:
        return " ?"
    return " ?"


def battery_status():
    try:
        with open("/sys/class/power_supply/BAT0/capacity") as f:
            percent = f.read().strip()
        with open("/sys/class/power_supply/BAT0/status") as f:
            status = f.read().strip()

        if status == "Charging":
            return f'<span color="{ACCENT}">󰁹</span> {percent}%'
        else:
            return f"󰁹 {percent}%"
    except Exception:
        return "󰁹 ?%"


def keyboard_layout():
    output = run_cmd(["xkb-switch"])
    return f"  {output}" if output else "  ?"


def safe_kill(qtile):
    if qtile.current_window is not None:
        qtile.current_window.kill()


def pin_floating_to_current_group(qtile):
    win = qtile.current_window
    if not win or not win.floating:
        return

    wid = win.window.wid
    current_group = qtile.current_group

    if wid in pinned_windows:
        pinned_windows.remove(wid)
    else:
        win.togroup(current_group.name, switch_group=False)
        pinned_windows.add(wid)


def center_float_window(client, width, height):
    screen = client.qtile.current_screen
    x = int((screen.width - width) / 2)
    y = int((screen.height - height) / 2)
    client.set_position_floating(x, y)
    client.set_size_floating(width, height)


def reset_and_center(client, width, height):
    client.set_size_floating(width, height)
    center_float_window(client, width, height)


def center_float_window_if_match(client):
    wm_class = client.window.get_wm_class()
    if not wm_class:
        return

    for cls, (w, h) in FLOAT_CENTER_RULES.items():
        if cls in wm_class:
            client.floating = True
            qtile.call_later(0.01, lambda c=client, w=w, h=h: reset_and_center(c, w, h))
            break


def custom_toggle_floating(qtile):
    win = qtile.current_window
    if not win:
        return

    wid = None
    if getattr(win, "window", None) is not None:
        wid = win.window.wid

    if win.floating:
        try:
            if wid is not None:
                _float_states[wid] = (win.get_position(), win.get_size())
        except Exception:
            pass
        win.toggle_floating()
        return

    win.toggle_floating()
    if not win.floating:
        return

    restored = False
    if wid is not None and wid in _float_states:
        (x, y), (w, h) = _float_states[wid]
        try:
            win.set_position_floating(x, y)
            win.set_size_floating(w, h)
            restored = True
        except Exception:
            pass

    if not restored:
        center_float_window_if_match(win)


@lazy.function
def drag_floating_only(qtile, x, y):
    win = qtile.current_window
    if win and win.floating:
        win.set_position_floating(x, y)


@lazy.function
def drag_start_if_floating(qtile):
    win = qtile.current_window
    if win and win.floating:
        return win.get_position()
    return (0, 0)
