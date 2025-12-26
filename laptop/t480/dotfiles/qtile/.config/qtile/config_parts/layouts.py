from libqtile import layout
from libqtile.config import Match

from .constants import BORDER_FOCUS, BORDER_NORMAL
BORDER_WIDTH = 0
LAYOUT_MARGIN = 0

COMMON_LAYOUT = {
    "border_focus": BORDER_FOCUS,
    "border_normal": BORDER_NORMAL,
    "border_width": BORDER_WIDTH,
    "margin": LAYOUT_MARGIN,
}

FLOAT_RULES = [
    Match(wm_class="Gpick"),
    Match(wm_class="GParted"),
    Match(wm_class="Nitrogen"),
    Match(wm_class="Lxappearance"),
    Match(wm_class="Pavucontrol"),
    Match(wm_class="Timeshift-gtk"),
    Match(wm_class="Codium"),
    Match(wm_class="qt5ct"),
    Match(wm_class="SimpleScreenRecorder"),
    Match(wm_class="Sxiv"),
    Match(wm_class="mpv"),
]

layouts = [
    layout.Columns(**COMMON_LAYOUT),
    layout.Tile(**COMMON_LAYOUT),
    layout.MonadTall(**COMMON_LAYOUT),
    layout.Max(border_width=BORDER_WIDTH),
    layout.Spiral(),
    layout.Floating(),
    layout.Stack(num_stacks=1, border_width=BORDER_WIDTH),
]

floating_layout = layout.Floating(
    border_focus=BORDER_FOCUS,
    border_normal=BORDER_NORMAL,
    border_width=BORDER_WIDTH,
    float_rules=[
        *layout.Floating.default_float_rules,
        *FLOAT_RULES,
    ],
)
