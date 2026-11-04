#!/usr/bin/python3
"""Standalone message review. Only explicit Submit emits submitted result."""

import json
import sys


def read_request(stream):
    request = json.load(stream)
    if not isinstance(request, dict) or not all(
        isinstance(request.get(key), str) for key in ("title", "text")
    ):
        raise ValueError("Expected title and text strings")
    return request


def result_for_action(submit, text):
    return {"status": "submitted", "text": text} if submit else {"status": "cancelled"}


def run(request):
    import gi

    gi.require_version("Gtk", "3.0")
    gi.require_version("Gdk", "3.0")
    gi.require_version("PangoCairo", "1.0")
    from gi.repository import Gdk, Gtk, Pango, PangoCairo

    available, _ = Gtk.init_check([])
    if not available:
        raise RuntimeError("GUI display unavailable")

    class ReviewWindow(Gtk.Window):
        def __init__(self):
            super().__init__(title=request["title"])
            self.result = None
            self.set_default_size(750, 270)
            self.set_size_request(420, 240)
            self.set_position(Gtk.WindowPosition.CENTER)
            self.set_type_hint(Gdk.WindowTypeHint.DIALOG)
            self.set_decorated(False)
            self.set_border_width(1)
            self.get_style_context().add_class("publish-review")
            self.connect("delete-event", self.cancel)
            self.connect("key-press-event", self.key_pressed)
            self.connect("destroy", self.destroyed)

            css = Gtk.CssProvider()
            css.load_from_data(b"""
                .publish-review { background: #292929; border: 1px solid #505050; border-radius: 9px; }
                .publish-review .toolbar { background: #3b3b3b; }
                .publish-review label { color: #eeeeee; font-family: monospace; font-size: 11px; }
                .publish-review button { background-image: none; background: #505050; color: #eeeeee;
                    border: 0; border-radius: 3px; box-shadow: none; text-shadow: none;
                    min-height: 20px; min-width: 0; padding: 0 9px; }
                .publish-review button:hover { background: #626262; }
                .publish-review button:focus { outline: 1px solid #dddddd; outline-offset: -2px; }
                .publish-review button.submit { background: #087fca; }
                .publish-review button.submit:hover { background: #1395e7; }
                .publish-review textview, .publish-review textview text { background: #292929; color: #eeeeee;
                    caret-color: #ffffff; font-family: monospace; font-size: 13px; }
                .publish-review textview text selection { background: #315d80; }
                .publish-review scrollbar { background: #292929; }
                .publish-review scrollbar slider { background: #666666; min-width: 6px; border-radius: 3px; }
            """)
            Gtk.StyleContext.add_provider_for_screen(
                self.get_screen(), css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
            )

            layout = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
            self.add(layout)
            toolbar = Gtk.EventBox()
            toolbar.get_style_context().add_class("toolbar")
            toolbar.connect("button-press-event", self.drag)
            row = Gtk.Box(spacing=6)
            row.set_margin_start(10)
            row.set_margin_end(5)
            row.set_margin_top(3)
            row.set_margin_bottom(3)
            toolbar.add(row)
            heading = Gtk.Label(label=request["title"])
            heading.set_ellipsize(Pango.EllipsizeMode.END)
            heading.set_xalign(0)
            row.pack_start(heading, True, True, 0)
            cancel = Gtk.Button(label="Cancel esc")
            cancel.connect("clicked", self.cancel)
            row.pack_start(cancel, False, False, 0)
            submit = Gtk.Button(label="Submit Ctrl+↵")
            submit.get_style_context().add_class("submit")
            submit.connect("clicked", lambda *_: self.finish(True))
            row.pack_start(submit, False, False, 0)
            layout.pack_start(toolbar, False, False, 0)

            scroll = Gtk.ScrolledWindow()
            scroll.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
            self.editor = Gtk.TextView()
            self.editor.set_wrap_mode(Gtk.WrapMode.WORD_CHAR)
            self.editor.set_left_margin(15)
            self.editor.set_right_margin(24)
            self.editor.set_top_margin(25)
            self.editor.set_bottom_margin(16)
            self.editor.set_pixels_above_lines(1)
            self.editor.set_pixels_below_lines(2)
            self.editor.set_border_window_size(Gtk.TextWindowType.LEFT, 55)
            self.editor.connect_after("draw", self.draw_numbers)
            self.buffer = self.editor.get_buffer()
            self.content_tag = self.buffer.create_tag("content", paragraph_background="#333333")
            self.buffer.connect("changed", self.changed)
            self.buffer.set_text(request["text"])
            scroll.add(self.editor)
            layout.pack_start(scroll, True, True, 0)
            scroll.get_vadjustment().connect("value-changed", lambda *_: self.editor.queue_draw())
            self.show_all()
            self.editor.grab_focus()
            self.buffer.place_cursor(self.buffer.get_start_iter())

        def changed(self, *_):
            self.buffer.apply_tag(self.content_tag, self.buffer.get_start_iter(), self.buffer.get_end_iter())
            digits = len(str(self.buffer.get_line_count()))
            self.editor.set_border_window_size(Gtk.TextWindowType.LEFT, max(55, digits * 9 + 24))
            self.editor.queue_draw()

        def draw_numbers(self, view, cr):
            gutter = view.get_window(Gtk.TextWindowType.LEFT)
            if gutter is None or not Gtk.cairo_should_draw_window(cr, gutter):
                return False
            cr.save()
            Gtk.cairo_transform_to_window(cr, view, gutter)
            width, height = gutter.get_width(), gutter.get_height()
            cr.rectangle(0, 0, width, height)
            cr.clip()
            cr.set_source_rgb(0.16, 0.16, 0.16)
            cr.paint()
            cr.set_source_rgb(0.26, 0.26, 0.26)
            cr.rectangle(width - 1, 0, 1, height)
            cr.fill()
            _, top = view.window_to_buffer_coords(Gtk.TextWindowType.LEFT, 0, 0)
            iterator, _ = view.get_line_at_y(top)
            label = view.create_pango_layout("")
            label.set_font_description(Pango.FontDescription("monospace 9"))
            while True:
                line_y, _ = view.get_line_yrange(iterator)
                _, y = view.buffer_to_window_coords(Gtk.TextWindowType.LEFT, 0, line_y)
                if y > height:
                    break
                label.set_text(str(iterator.get_line() + 1), -1)
                label_width, _ = label.get_pixel_size()
                cr.set_source_rgb(0.51, 0.51, 0.51)
                cr.move_to(width - label_width - 19, y + 1)
                PangoCairo.show_layout(cr, label)
                if not iterator.forward_line():
                    break
            cr.restore()
            return False

        def drag(self, _widget, event):
            if event.button == 1:
                self.begin_move_drag(event.button, int(event.x_root), int(event.y_root), event.time)
            return True

        def key_pressed(self, _widget, event):
            if event.keyval == Gdk.KEY_Escape:
                self.finish(False)
                return True
            if event.keyval in (Gdk.KEY_Return, Gdk.KEY_KP_Enter) and event.state & Gdk.ModifierType.CONTROL_MASK:
                self.finish(True)
                return True
            return False

        def cancel(self, *_):
            self.finish(False)
            return True

        def finish(self, submit):
            if self.result is not None:
                return
            text = self.buffer.get_text(self.buffer.get_start_iter(), self.buffer.get_end_iter(), True)
            if submit and not text.strip():
                self.editor.error_bell()
                return
            self.result = result_for_action(submit, text)
            self.destroy()

        def destroyed(self, *_):
            if self.result is None:
                self.result = result_for_action(False, "")
            Gtk.main_quit()

    window = ReviewWindow()
    Gtk.main()
    return window.result


def main():
    try:
        request = read_request(sys.stdin)
        result = run(request)
        print(json.dumps(result, ensure_ascii=False), flush=True)
        return 0
    except Exception as error:
        print(f"Publish editor failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
