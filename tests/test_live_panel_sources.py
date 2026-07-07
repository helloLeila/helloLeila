import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "fetch_live_panel.py"
FIXTURE_PATH = ROOT / "tests" / "fixtures" / "ai-daily-latest.json"


def load_module():
    spec = importlib.util.spec_from_file_location("fetch_live_panel", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class LivePanelSourceTests(unittest.TestCase):
    def setUp(self):
        self.module = load_module()

    def test_codex_daily_json_normalizes_first_five_items(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        items = self.module.normalize_codex_daily_news(payload, limit=5)

        self.assertEqual(len(items), 5)
        self.assertEqual(items[0]["title"], "字节 Seed 开源 EdgeBench 基准测试")
        self.assertEqual(items[0]["source"], "Codex Daily")
        self.assertEqual(items[0]["summaryZh"], "字节 Seed 发布面向真实环境学习的长程智能体评测集。")
        self.assertEqual(items[0]["summaryEn"], "ByteDance Seed released EdgeBench for long-horizon agent evaluation.")
        self.assertEqual(items[0]["whyItMattersZh"], "它能帮助判断智能体是否具备持续执行复杂任务的工程能力。")
        self.assertEqual(items[0]["tags"], ["AI", "Agent", "Benchmark"])
        self.assertNotIn("Extra item should not appear on the homepage", [item["title"] for item in items])
        for item in items:
            self.assertNotIn("example.com", item["url"])

    def test_codex_daily_json_rejects_incomplete_payloads(self):
        payload = {
            "news": [
                {
                    "title": "Only one item",
                    "url": "https://www.oschina.net/news/471539",
                    "source": "Codex Daily",
                    "summaryZh": "只有一条。",
                    "summaryEn": "Only one item.",
                    "whyItMattersZh": "不足五条不能成为主链路。",
                    "tags": ["AI"]
                }
            ]
        }

        self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])

    def test_codex_daily_json_rejects_entries_without_http_urls(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        payload["news"][0]["url"] = "javascript:alert(1)"

        self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])


if __name__ == "__main__":
    unittest.main()
