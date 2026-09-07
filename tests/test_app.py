import json
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path

import server


ROOT = Path(__file__).resolve().parents[1]


class MarkupAudit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.images_without_alt = []
        self.icon_buttons_without_label = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "img" and "alt" not in values:
            self.images_without_alt.append(values.get("src", ""))
        if tag == "button" and "icon-button" in values.get("class", "") and not values.get("aria-label"):
            self.icon_buttons_without_label.append(values.get("id", "unnamed"))


class DesignFlowTests(unittest.TestCase):
    def test_public_api_config_never_exposes_key(self):
        original_google = server.os.environ.pop("GOOGLE_API_KEY", None)
        original_gemini = server.os.environ.get("GEMINI_API_KEY")
        try:
            server.os.environ["GEMINI_API_KEY"] = "test-secret-1234"
            config = server.public_api_config()
            self.assertTrue(config["geminiConfigured"])
            self.assertEqual(config["keyLast4"], "1234")
            self.assertNotIn("test-secret", json.dumps(config))
        finally:
            if original_google is not None:
                server.os.environ["GOOGLE_API_KEY"] = original_google
            if original_gemini is None:
                server.os.environ.pop("GEMINI_API_KEY", None)
            else:
                server.os.environ["GEMINI_API_KEY"] = original_gemini

    def test_required_files_exist(self):
        for relative in ("app/index.html", "app/styles.css", "app/app.js", "server.py", "start.ps1", "dist/DesignFlow Studio.exe"):
            self.assertTrue((ROOT / relative).is_file(), relative)

    def test_static_markup_accessibility_basics(self):
        parser = MarkupAudit()
        parser.feed((ROOT / "app/index.html").read_text(encoding="utf-8"))
        self.assertEqual(len(parser.ids), len(set(parser.ids)), "duplicate HTML ids")
        self.assertEqual(parser.images_without_alt, [])
        self.assertEqual(parser.icon_buttons_without_label, [])

    def test_no_external_runtime_dependencies(self):
        html = (ROOT / "app/index.html").read_text(encoding="utf-8")
        self.assertNotIn("https://", html)
        self.assertNotIn("http://", html)

    def test_public_design_flow_actions_are_present(self):
        js = (ROOT / "app/app.js").read_text(encoding="utf-8")
        for action in (
            "new-design",
            "generate",
            "design-product",
            "use-template",
            "export-current",
            "test-connection",
            "shutdown-app",
        ):
            self.assertIn(action, js)

    def test_public_navigation_separates_products_design_and_templates(self):
        html = (ROOT / "app/index.html").read_text(encoding="utf-8")
        js = (ROOT / "app/app.js").read_text(encoding="utf-8")
        for route in (
            'data-route="studio"',
            'data-route="products"',
            'data-route="templates"',
            'data-route="assets"',
            'data-route="exports"',
            'data-route="connections"',
        ):
            self.assertIn(route, html)
        self.assertIn("DesignProject", (ROOT / "README.md").read_text(encoding="utf-8"))
        self.assertIn("帐篷设计", js)
        self.assertNotIn("全球获客", html)
        self.assertNotIn("WhatsApp", html + js)

    def test_canvas_first_workspace_and_generated_assets_are_present(self):
        js = (ROOT / "app/app.js").read_text(encoding="utf-8")
        css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
        for marker in ("studio-layout", "canvas-stage", "source-panel", "settings-panel", "version-strip"):
            self.assertIn(marker, js + css)
        for relative in (
            "assets/studio/tent-hero.png",
            "assets/studio/tent-variant-a.png",
            "assets/studio/tent-variant-b.png",
        ):
            self.assertTrue((ROOT / relative).is_file(), relative)
        self.assertIn("state.credits -=", js)

    def test_responsive_and_reduced_motion_rules(self):
        css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
        self.assertIn("@media (max-width: 640px)", css)
        self.assertIn("prefers-reduced-motion: reduce", css)
        self.assertIn("min-height: 44px", css)

    def test_state_roundtrip(self):
        original_dir = server.DATA_DIR
        original_file = server.STATE_FILE
        with tempfile.TemporaryDirectory() as temp:
            server.DATA_DIR = Path(temp)
            server.STATE_FILE = server.DATA_DIR / "state.json"
            payload = {"products": [{"id": "test", "name": "测试帐篷"}], "ui": {"route": "studio"}}
            server.write_state(payload)
            self.assertEqual(server.read_state(), payload)
            self.assertEqual(json.loads(server.STATE_FILE.read_text(encoding="utf-8")), payload)
        server.DATA_DIR = original_dir
        server.STATE_FILE = original_file


if __name__ == "__main__":
    unittest.main()
