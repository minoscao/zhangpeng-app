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


class TentFlowTests(unittest.TestCase):
    def test_required_files_exist(self):
        for relative in ("app/index.html", "app/styles.css", "app/app.js", "server.py", "start.ps1", "dist/TentFlow Studio.exe"):
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

    def test_product_flow_actions_are_present(self):
        js = (ROOT / "app/app.js").read_text(encoding="utf-8")
        for action in (
            "generate-concepts",
            "approve-concept",
            "generate-schemes",
            "send-whatsapp",
            "export-website",
            "export-ppt",
            "print-manual",
            "shutdown-app",
        ):
            self.assertIn(action, js)

    def test_children_tent_taxonomy_is_present(self):
        js = (ROOT / "app/app.js").read_text(encoding="utf-8")
        for category in (
            "Teepee 三角帐",
            "房屋 / 游戏屋帐篷",
            "主题弹开帐篷",
            "隧道 / 球池组合",
            "床帐 / 顶篷",
            "室内外露营帐",
            "婴幼儿防晒帐",
            "睡衣派对 A 字帐",
        ):
            self.assertIn(category, js)
        self.assertIn("原创通用图形", js)

    def test_visual_choices_scene_upload_and_credits_are_present(self):
        html = (ROOT / "app/index.html").read_text(encoding="utf-8")
        js = (ROOT / "app/app.js").read_text(encoding="utf-8")
        css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
        self.assertIn('id="points-balance"', html)
        for marker in ("visual-choice-grid", "scene-upload", "customSceneImage", "lastGeneration", "state.credits -= cost"):
            self.assertIn(marker, js + css)
        self.assertIn("本地场景融合", js)
        self.assertIn("将扣除", js)

    def test_responsive_and_reduced_motion_rules(self):
        css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
        self.assertIn("@media (max-width: 720px)", css)
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
