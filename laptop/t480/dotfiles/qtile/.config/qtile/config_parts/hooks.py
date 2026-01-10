import contextlib
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

OFFICE_CLASSES = {wm_class for wm_class, (group, _) in APP_RULES.items() if group == "office"}

TELEGRAM_MEDIA_TITLE = "Media viewer"
TELEGRAM_WM_CLASSES = {"TelegramDesktop", "forkgram"}


def _get_client_title(client):
    window = getattr(client, "window", None)
    if window:
        try:
            name = window.get_name()
            if name:
                return name
        except Exception:
            pass
    return getattr(client, "name", "") or ""


def _is_telegram_client(client):
    window = getattr(client, "window", None)
    if not window:
        return False
    wm_classes = window.get_wm_class() or []
    return any(wm_class in TELEGRAM_WM_CLASSES for wm_class in wm_classes)


def _is_telegram_media_viewer(client):
    name = _get_client_title(client)
    if TELEGRAM_MEDIA_TITLE not in name:
        return False
    return _is_telegram_client(client)


def _float_telegram_media_viewer(client):
    if not client or not _is_telegram_media_viewer(client):
        return
    with contextlib.suppress(Exception):
        client.enable_floating()
    group = getattr(client, "group", None)
    if not group:
        return
    if client in group.tiled_windows:
        group.tiled_windows.remove(client)
        for layout in group.layouts:
            try:
                layout.remove(client)
                if client is group.current_window:
                    layout.blur()
            except Exception:
                pass
    try:
        if client not in group.floating_layout.find_clients(group):
            group.floating_layout.add_client(client)
    except Exception:
        pass
    with contextlib.suppress(Exception):
        group.layout_all()


def _schedule_telegram_media_viewer_float(client):
    if not _is_telegram_client(client):
        return
    qtile.call_later(0.1, lambda c=client: _float_telegram_media_viewer(c))


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
                qtile.call_later(0.1, lambda gn=group_name: qtile.groups_map[gn].toscreen())

            break

    wm_class_set = set(wm_classes)
    if wm_class_set & OFFICE_CLASSES:
        client.floating = False
    elif client.group and client.group.name == "office":
        client.floating = True
    if _is_telegram_media_viewer(client):
        client.floating = True
    _schedule_telegram_media_viewer_float(client)

    # Delay universal floating correction until group is assigned
    qtile.call_later(
        0.05,
        lambda: (
            client.floating
            and client.group
            and not any(
                rule.compare(client) for rule in client.group.floating_layout.float_rules
            )
            and not _is_telegram_media_viewer(client)
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


@hook.subscribe.client_name_updated
def float_telegram_media_viewer(client):
    _float_telegram_media_viewer(client)
