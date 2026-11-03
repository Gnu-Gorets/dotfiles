import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import patch

HELPER = Path(__file__).resolve().parents[1] / "git-publish-confirm" / "gui.py"
spec = importlib.util.spec_from_file_location("publish_gui", HELPER)
gui = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gui)


class ProtocolTests(unittest.TestCase):
    def test_request_validation(self):
        self.assertEqual(gui.read_request(io.StringIO('{"title":"t","text":"✓"}'))["text"], "✓")
        for value in ("null", "[]", '{}', '{"title":"t","text":1}'):
            with self.assertRaises(ValueError):
                gui.read_request(io.StringIO(value))

    def test_display_failure_never_submits(self):
        import os
        env = {**os.environ, "DISPLAY": "", "WAYLAND_DISPLAY": "", "GDK_BACKEND": "x11"}
        process = subprocess.run(
            [sys.executable, "-B", str(HELPER)], input='{"title":"t","text":"body"}',
            text=True, capture_output=True, env=env, timeout=10,
        )
        self.assertNotEqual(process.returncode, 0)
        self.assertEqual(process.stdout, "")


class OffscreenTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import gi
        gi.require_version("Gtk", "3.0")
        gi.require_version("Gdk", "3.0")
        from gi.repository import Gdk, GLib, Gtk
        if not Gtk.init_check([])[0]:
            raise unittest.SkipTest("GTK display unavailable")
        cls.Gdk, cls.GLib, cls.Gtk = Gdk, GLib, Gtk

    def exercise(self, action, text="fix: title\n\nBody ✓"):
        errors = []
        callback_errors = []

        def check():
            window = self.Gtk.Window.list_toplevels()[0]
            try:
                self.assertEqual(window.get_default_size(), (750, 270))
                self.assertEqual(window.editor.get_bottom_margin(), 16)
                self.assertEqual(window.buffer.get_line_count(), text.count("\n") + 1)
                self.assertGreaterEqual(window.editor.get_border_window_size(self.Gtk.TextWindowType.LEFT), 55)
                action(window)
            except BaseException as error:
                errors.append(error)
                window.cancel()
            return False

        def timeout():
            errors.append(AssertionError("GUI test timed out"))
            for window in self.Gtk.Window.list_toplevels():
                window.cancel()
            return False

        timer = self.GLib.timeout_add(3000, timeout)
        self.GLib.timeout_add(100, check)
        with patch.object(self.Gtk, "Window", self.Gtk.OffscreenWindow), patch.object(
            sys, "excepthook", lambda *args: callback_errors.append(args)
        ):
            answer = gui.run({"title": "Commit message: isolated test", "text": text})
        self.GLib.source_remove(timer)
        if errors:
            raise errors[0]
        self.assertEqual(callback_errors, [])
        return answer

    def test_plain_enter_does_not_submit_and_escape_cancels(self):
        def action(window):
            self.assertFalse(window.key_pressed(None, SimpleNamespace(keyval=self.Gdk.KEY_Return, state=0)))
            self.assertIsNone(window.result)
            window.key_pressed(None, SimpleNamespace(keyval=self.Gdk.KEY_Escape, state=0))
        self.assertEqual(self.exercise(action), {"status": "cancelled"})

    def test_ctrl_enter_submits_edited_text_once(self):
        def action(window):
            window.buffer.set_text("feat: edited\n\nNew body ✓")
            window.key_pressed(None, SimpleNamespace(keyval=self.Gdk.KEY_Return, state=self.Gdk.ModifierType.CONTROL_MASK))
            window.cancel()
        self.assertEqual(self.exercise(action), {"status": "submitted", "text": "feat: edited\n\nNew body ✓"})

    def test_window_close_cancels(self):
        self.assertEqual(self.exercise(lambda window: window.destroy()), {"status": "cancelled"})

    def test_long_wrapped_document_renders_without_callback_errors(self):
        text = "\n".join(f"Line {index}: " + "long wrapped text " * 20 for index in range(300))
        self.assertEqual(self.exercise(lambda window: window.cancel(), text), {"status": "cancelled"})

    def test_empty_submit_stays_open(self):
        def action(window):
            window.finish(True)
            self.assertIsNone(window.result)
            window.cancel()
        self.assertEqual(self.exercise(action, ""), {"status": "cancelled"})


if __name__ == "__main__":
    unittest.main()
