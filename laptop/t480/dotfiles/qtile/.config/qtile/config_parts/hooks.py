import os
import subprocess

from libqtile import hook, qtile
from libqtile.backend.x11.window import Window

from .utils import center_float_window_if_match, forget_window_state, pinned_windows


# --- Application grouping rules

APP_RULES = {
    "Alacritty": ("term", False),
    "Chromium": ("term", False),
    "librewolf": ("web", False),
    "VSCodium": ("code", False),
    "Cursor": ("code", False),
    "Spacefm": ("file", False),
    "Peazip": ("file", False),
    "TelegramDesktop": ("chat", False),
    "vesktop": ("chat", False),
    "Slack": ("chat", False),
    "Viewnior": ("media", True),
    "XpdfReader": ("media", True),
    "FreeTube": ("media", False),
    "qBittorrent": ("media", False),
    "Postman": ("office", False),
    "libreoffice": ("office", False),
    "soffice": ("office", False),
    "Wps": ("office", False),
    "Et": ("office", False),
    "Wpp": ("office", False),
    "Wpspdf": ("office", False),
    "Exodus": ("office", False),
    "XPipe": ("xpipe", False),
    "VirtualBox Manager": ("vm", False),
    "Bitwarden": ("vault", False),
    "KeePassXC": ("vault", False),
}

OFFICE_CLASSES = {
    wm_class for wm_class, (group, _) in APP_RULES.items() if group == "office"
}

# --- Autostart script


@hook.subscribe.startup_once
def autostart():
    subprocess.Popen([os.path.expanduser("~/.config/qtile/autostart.sh")])


@hook.subscribe.client_new
def assign_app_group(client):
    wm_classes = client.window.get_wm_class() or []
    if not wm_classes:
        return

    for wm_class in wm_classes:
        rule = APP_RULES.get(wm_class)
        if rule:
            group_name, follow = rule

            if not client.group or client.group.name != group_name:
                client.togroup(group_name)

            if follow:
                qtile.call_later(0.1, lambda: qtile.groups_map[group_name].toscreen())

            break

    wm_class_set = set(wm_classes)
    if wm_class_set & OFFICE_CLASSES:
        client.floating = False
    elif client.group and client.group.name == "office":
        client.floating = True

    # Delay universal floating correction until group is assigned
    qtile.call_later(
        0.05,
        lambda: (
            client.floating
            and client.group
            and not any(
                rule.compare(client)
                for rule in client.group.floating_layout.float_rules
            )
            and setattr(client, "floating", False)
        ),
    )


# --- Floating windows follow group


@hook.subscribe.setgroup
def float_windows_follow_group():
    current_group = qtile.current_screen.group

    for win in qtile.windows_map.values():
        if (
            isinstance(win, Window)
            and win.floating
            and not win.minimized
            and win.window.wid not in pinned_windows
        ):
            win.togroup(current_group.name)


# --- Cleanup per-window state


@hook.subscribe.client_killed
def cleanup_window_state(client):
    wid = None
    if getattr(client, "window", None) is not None:
        wid = client.window.wid
    elif getattr(client, "wid", None) is not None:
        wid = client.wid

    if wid is not None:
        forget_window_state(wid)


# --- Center floatable windows on creation


@hook.subscribe.client_new
def float_specific_clients(client):
    center_float_window_if_match(client)
