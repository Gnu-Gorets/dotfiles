import os
import subprocess

from libqtile import widget

from .constants import ACCENT, BAR_BG, BAR_FG, LIGHT
from .utils import (
    battery_status,
    bluetooth_status,
    brightness_level,
    cpu_load_percent,
    cpu_temp,
    keyboard_layout,
    mem_usage,
    tor_status,
    uparch_status,
    volume_status,
)

bar_widgets = [
    widget.GenPollText(
        func=cpu_load_percent,
        update_interval=2,
        foreground=ACCENT,
    ),
    widget.GenPollText(
        func=mem_usage,
        update_interval=2,
        initial_text=" --%",
        foreground=ACCENT,
    ),
    widget.GenPollText(
        func=cpu_temp,
        update_interval=5,
        foreground=ACCENT,
    ),
    widget.GenPollText(
        func=uparch_status,
        update_interval=300,
        initial_text="NoUp",
        foreground=ACCENT,
        name="uparch",
        mouse_callbacks={
            "Button1": lambda: subprocess.Popen(
                [
                    "alacritty",
                    "-T",
                    "UpArch",
                    "-e",
                    os.path.expanduser("~/.bin/pacui.sh"),
                ]
            )
        },
    ),
    widget.WindowName(format="{name}", max_chars=60),
    widget.GroupBox(
        active=LIGHT,
        inactive=BAR_FG,
        highlight_method="line",
        block_highlight_text_color=ACCENT,
        borderwidth=0,
        rounded=False,
        this_current_screen_border=ACCENT,
        this_screen_border=ACCENT,
    ),
    widget.Spacer(),
    widget.GenPollText(
        func=tor_status,
        update_interval=6,
        foreground=ACCENT,
        name="tor",
        mouse_callbacks={
            "Button1": lambda: subprocess.Popen(["systemctl", "restart", "tor"]),
            "Button3": lambda: subprocess.Popen(["systemctl", "stop", "tor"]),
        },
    ),
    widget.GenPollText(
        func=bluetooth_status,
        update_interval=2,
        foreground=ACCENT,
        name="bluetooth",
        mouse_callbacks={
            "Button1": lambda: subprocess.Popen(
                [os.path.expanduser("~/.config/qtile/rofi-bluetooth.sh")]
            )
        },
    ),
    widget.GenPollText(
        func=volume_status,
        update_interval=0.5,
        foreground=ACCENT,
        name="volume",
    ),
    widget.GenPollText(
        func=brightness_level,
        update_interval=1.5,
        initial_text="--%",
        foreground=ACCENT,
        name="brightness",
    ),
    widget.GenPollText(
        func=battery_status,
        update_interval=0.5,
        foreground=BAR_FG,
        markup=True,
    ),
    widget.Clock(
        format="  %a %d.%m.%Y   %H:%M",
        foreground=BAR_FG,
    ),
    widget.GenPollText(
        func=keyboard_layout,
        update_interval=0.5,
        foreground=BAR_FG,
        name="kbdlayout",
    ),
    widget.TextBox(
        text="",
        foreground=ACCENT,
        mouse_callbacks={
            "Button1": lambda: subprocess.Popen(
                [os.path.expanduser("~/.config/qtile/power.sh")]
            )
        },
    ),
]

bar_settings = {
    "size": 24,
    "background": BAR_BG,
    "opacity": 0.95,
    "font": "BAR_FONT",
    "fontsize": 14,
}
