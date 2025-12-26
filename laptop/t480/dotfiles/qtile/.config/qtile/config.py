from libqtile import bar
from libqtile.config import Screen

from config_parts.keys import keys, mouse
from config_parts.groups import groups, generate_group_keys
from config_parts.layouts import layouts, floating_layout
from config_parts.widgets import bar_widgets, bar_settings

import config_parts.hooks

GROUP_KEYS = generate_group_keys()
keys += GROUP_KEYS

screens = [
    Screen(
        top=bar.Bar(
            bar_widgets,
            **bar_settings,
        )
    )
]

dgroups_key_binder = None
dgroups_app_rules = []
follow_mouse_focus = True
bring_front_click = False
cursor_warp = False
auto_fullscreen = True
focus_on_window_activation = "smart"
reconfigure_screens = True
auto_minimize = True
wmname = "LG3D"
