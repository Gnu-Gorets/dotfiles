from libqtile.config import Group, Key, ScratchPad
from libqtile.lazy import lazy

from .constants import ALT, MOD

GROUP_DEFS = [
    ("term", "stack"),
    ("web", "stack"),
    ("code", "stack"),
    ("file", "columns"),
    ("chat", "columns"),
    ("media", "stack"),
    ("office", "stack"),
    ("xpipe", "columns"),
    ("vm", "columns"),
    ("vault", "columns"),
]

groups = [Group(name, layout=layout_name) for name, layout_name in GROUP_DEFS]


def generate_group_keys():
    group_keys = []
    seen = set()

    for i, group in enumerate(groups, start=1):
        if isinstance(group, ScratchPad):
            continue

        key = str(i % 10)

        for modifiers in ([MOD], [MOD, ALT]):
            spec = (tuple(modifiers), key)
            if spec in seen:
                continue
            seen.add(spec)

            action = (
                lazy.group[group.name].toscreen()
                if modifiers == [MOD]
                else lazy.window.togroup(group.name)
            )

            desc = (
                f"Switch to group {group.name}"
                if modifiers == [MOD]
                else f"Send window to group {group.name}"
            )

            group_keys.append(Key(modifiers, key, action, desc=desc))

    return group_keys
