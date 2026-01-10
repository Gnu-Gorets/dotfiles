from libqtile.config import Drag, Key
from libqtile.lazy import lazy

from .constants import ALT, BRIGHTNESS_DEVICE, MOD, TERMINAL
from .utils import (
    custom_toggle_floating,
    drag_floating_only,
    drag_start_if_floating,
    pin_floating_to_current_group,
    safe_kill,
    toggle_minimize_single,
    toggle_mute_restore_volume,
    volume_up_capped,
)

KEYCODES = {
    "a": 38,
    "b": 56,
    "c": 54,
    "d": 40,
    "e": 26,
    "f": 41,
    "g": 42,
    "h": 43,
    "i": 31,
    "j": 44,
    "k": 45,
    "l": 46,
    "m": 58,
    "n": 57,
    "o": 32,
    "p": 33,
    "q": 24,
    "r": 27,
    "s": 39,
    "t": 28,
    "u": 30,
    "v": 55,
    "w": 25,
    "x": 53,
    "y": 29,
    "z": 52,
}


def kc(letter):
    return KEYCODES[letter]


def make_key(mods, key, action, desc):
    return Key(mods, key, action, desc=desc)


def app_key(letter, command, desc):
    return Key([ALT], kc(letter), lazy.spawn(command), desc=desc)


APP_LAUNCHERS = [
    ("d", "rofi -show drun", "Launch rofi"),
    ("l", "librewolf", "Launch Librewolf"),
    ("e", "vscodium", "Launch VSCodium"),
    ("f", "spacefm", "Launch SpaceFM"),
    ("m", "forkgram", "Launch Telegram"),
    ("v", "vesktop", "Launch Vesktop"),
    ("s", "slack", "Launch Slack"),
    ("y", "freetube", "Launch FreeTube"),
    ("x", "xpipe open", "Launch xpipe open"),
    ("p", "keepassxc", "Launch KeePassXC"),
    ("b", "bitwarden-desktop", "Launch Bitwarden"),
]

LAYOUT_KEYS = [
    ([MOD], "minus", lazy.function(toggle_minimize_single), "Minimize/restore window"),
    (
        [MOD],
        kc("g"),
        lazy.function(pin_floating_to_current_group),
        "Toggle pin floating window to current group",
    ),
    ([ALT], "space", lazy.function(custom_toggle_floating), "Toggle floating"),
    ([MOD], kc("z"), lazy.function(safe_kill), "Close focused window"),
    ([MOD], kc("h"), lazy.layout.left(), "Move focus left"),
    ([MOD], kc("j"), lazy.layout.down(), "Move focus down"),
    ([MOD], kc("k"), lazy.layout.up(), "Move focus up"),
    ([MOD], kc("l"), lazy.layout.right(), "Move focus right"),
]

TOOL_KEYS = [
    ([MOD], "Return", lazy.spawn(f"{TERMINAL} -e tmrun.sh"), "Open terminal with tmrun.sh"),
    ([ALT, MOD], kc("z"), lazy.spawn('zsh -i -c "zellij-clean"'), "Run zellij-clean"),
]

keys = [make_key(*item) for item in (LAYOUT_KEYS + TOOL_KEYS)]

keys += [app_key(letter, command, desc) for letter, command, desc in APP_LAUNCHERS]

SYSTEM_KEYS = [
    ([MOD, ALT], "Delete", lazy.spawn("sh -c ~/.config/qtile/power.sh"), "Open power menu"),
    (
        [MOD, ALT],
        kc("r"),
        lazy.spawn("qtile cmd-obj -o cmd -f reload_config"),
        "Reload qtile config",
    ),
    (
        [],
        "Print",
        lazy.spawn('flameshot full -c -p "$(xdg-user-dir PICTURES)"'),
        "Screenshot full screen",
    ),
    ([MOD], "Print", lazy.spawn("flameshot gui"), "Screenshot GUI"),
    (
        [MOD, ALT],
        "Print",
        lazy.spawn('flameshot full -c -d 5000 -p "$(xdg-user-dir PICTURES)"'),
        "Delayed screenshot",
    ),
    ([], "XF86AudioRaiseVolume", lazy.function(volume_up_capped), "Volume up"),
    (
        [],
        "XF86AudioLowerVolume",
        lazy.spawn("pactl set-sink-volume @DEFAULT_SINK@ -5%"),
        "Volume down",
    ),
    ([], "XF86AudioMute", lazy.function(toggle_mute_restore_volume), "Toggle mute"),
    (
        [],
        "XF86MonBrightnessUp",
        lazy.spawn(f"brightnessctl -d {BRIGHTNESS_DEVICE} set 10%+"),
        "Increase brightness",
    ),
    (
        [],
        "XF86MonBrightnessDown",
        lazy.spawn(f"brightnessctl -d {BRIGHTNESS_DEVICE} set 10%-"),
        "Decrease brightness",
    ),
]

keys += [make_key(*item) for item in SYSTEM_KEYS]

mouse = [
    Drag(
        [MOD],
        "Button1",
        drag_floating_only,
        start=drag_start_if_floating,
    ),
]
