import json
import re
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
        config = server.public_api_config()
        self.assertTrue(config["userKeyRequired"])
        self.assertEqual(config["model"], "gpt-image-2")
        self.assertTrue(config["localStateWritable"])
        self.assertNotIn("apiKey", json.dumps(config))

    def test_required_files_exist(self):
        for relative in ("app/index.html", "app/styles.css", "app/core.js", "app/export.js", "app/app-v2.js", "worker.js", "server.py", "start.ps1", "tests/test_export.mjs", "dist/DesignFlow Studio.exe"):
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
        js = (ROOT / "app/app-v2.js").read_text(encoding="utf-8")
        for action in (
            "open-product-picker",
            "generate-batch",
            "drawer-generate",
            "use-template",
            "export-assets",
            "authorize-provider",
            "shutdown-app",
        ):
            self.assertIn(action, js)

    def test_public_navigation_separates_products_design_and_templates(self):
        html = (ROOT / "app/index.html").read_text(encoding="utf-8")
        js = (ROOT / "app/app-v2.js").read_text(encoding="utf-8")
        for route in (
            'data-route="studio"',
            'data-route="products"',
            'data-route="templates"',
            'data-route="assets"',
            'data-route="exports"',
            'data-route="connections"',
        ):
            self.assertIn(route, html)
        self.assertIn("Recipe", (ROOT / "README.md").read_text(encoding="utf-8"))
        self.assertIn("儿童帐篷", js)
        self.assertNotIn("全球获客", html)
        self.assertNotIn("WhatsApp", html + js)

    def test_batch_workspace_and_generated_assets_are_present(self):
        js = (ROOT / "app/app-v2.js").read_text(encoding="utf-8")
        css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
        for marker in ("batch-layout", "selected-products", "prompt-group-list", "result-scroll", "quality-rubric"):
            self.assertIn(marker, js + css)
        for relative in (
            "assets/studio/tent-hero.png",
            "assets/studio/tent-variant-a.png",
            "assets/studio/tent-variant-b.png",
        ):
            self.assertTrue((ROOT / relative).is_file(), relative)
        self.assertIn("state.credits -=", js)
        self.assertIn("refundResultCredit", js)

    def test_responsive_and_reduced_motion_rules(self):
        css = (ROOT / "app/styles.css").read_text(encoding="utf-8")
        self.assertIn("@media (max-width: 640px)", css)
        self.assertIn("prefers-reduced-motion: reduce", css)
        self.assertIn("min-height: 44px", css)

    def test_model_keys_are_session_only_and_worker_is_stateless(self):
        worker = (ROOT / "worker.js").read_text(encoding="utf-8")
        client = (ROOT / "app/app-v2.js").read_text(encoding="utf-8")
        self.assertIn("X-Qwen-Api-Key", worker)
        self.assertIn("X-OpenAI-Api-Key", worker)
        self.assertIn("/compatible-mode/v1/models", worker)
        self.assertIn("/images/edits", worker)
        self.assertNotIn("env.QWEN_API_KEY", worker)
        self.assertNotIn("env.OPENAI_API_KEY", worker)
        self.assertNotIn("Cf-Access-Jwt-Assertion", worker)
        self.assertIn("sessionStorage", client)
        self.assertIn("A-Za-z0-9._-", worker)
        self.assertIn("A-Za-z0-9._-", client)
        self.assertIn("支持 sk- 开头的完整密钥", client)
        self.assertNotIn("localStorage.setItem(QWEN_KEY_STORAGE", client)
        self.assertIn("qwen-image-3.0-pro", worker)
        self.assertIn("gpt-image-2.5-sunburst", worker)
        self.assertIn("/api/qwen/generate", client)
        self.assertIn("/api/openai/generate", client)
        self.assertIn("referenceImageForModel", client)
        self.assertIn("FileReader", client)
        self.assertNotIn("new URL(product.image, location.origin).href", client)
        self.assertIn("Failed to download image URL", worker)
        self.assertIn("output?.choices", worker)
        self.assertIn("choice.message.content", worker)
        self.assertIn("QWEN_TASK_TIMEOUT_MS", client)
        self.assertIn("checkExistingResult", client)
        self.assertIn("resumePendingBatch", client)
        self.assertIn("task.taskStatus === 'SUCCEEDED'", client)
        self.assertIn('data-action="preview-result"', client)
        self.assertIn('data-action="preview-asset"', client)
        self.assertIn("renderImagePreview", client)
        self.assertIn("closeImagePreview", client)
        self.assertIsNone(re.search(r"sk-[A-Za-z0-9]{20,}", worker + client))

    def test_prompt_rules_are_product_specific_and_photo_real(self):
        client = (ROOT / "app/app-v2.js").read_text(encoding="utf-8") + (ROOT / "app/core.js").read_text(encoding="utf-8")
        self.assertIn("name: '当地背景'", client)
        self.assertIn("悉尼歌剧院轮廓、海港大桥", client)
        self.assertIn("name: '产品配色'", client)
        self.assertIn("只改变产品织物颜色", client)
        self.assertIn("promptDetails", client)
        self.assertIn("generationMode: 'quality'", client)
        self.assertIn("不是插画、3D 渲染、平面示意图", client)
        self.assertIn("真实全画幅商业摄影", client)

    def test_templates_exports_and_worker_hardening_are_real(self):
        client = (ROOT / "app/app-v2.js").read_text(encoding="utf-8")
        core = (ROOT / "app/core.js").read_text(encoding="utf-8")
        exporter = (ROOT / "app/export.js").read_text(encoding="utf-8")
        worker = (ROOT / "worker.js").read_text(encoding="utf-8")
        source = (ROOT / "server.py").read_text(encoding="utf-8")
        self.assertIn("applyTemplate", core)
        self.assertIn("variantDirection", core)
        self.assertIn("manifest.json", exporter)
        self.assertIn("application/zip", exporter)
        self.assertIn("UPSTREAM_TIMEOUTS", worker)
        self.assertIn("X-Request-Id", worker)
        self.assertIn("api_error", worker)
        self.assertIn("_proxy_model_request", source)
        self.assertIn("DESIGNFLOW_REMOTE_API_BASE", source)

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
