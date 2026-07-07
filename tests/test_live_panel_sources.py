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
        self.assertEqual(
            [item["url"] for item in items],
            [
                "https://www.oschina.net/news/471539",
                "https://www.oschina.net/news/471531",
                "https://my.oschina.net/u/3874284/blog/19715962",
                "https://www.oschina.net/news/471519/codeforge-26-4-0-released",
                "https://www.oschina.net/news/471516",
            ],
        )
        self.assertEqual(items[0]["title"], "字节 Seed 开源 EdgeBench 基准测试")
        self.assertEqual(items[0]["source"], "Codex Daily")
        self.assertEqual(items[0]["summaryZh"], "字节 Seed 发布面向真实环境学习的长程智能体评测集。")
        self.assertEqual(items[0]["summaryEn"], "ByteDance Seed released EdgeBench for long-horizon agent evaluation.")
        self.assertEqual(items[0]["whyItMattersZh"], "它能帮助判断智能体是否具备持续执行复杂任务的工程能力。")
        self.assertEqual(items[0]["tags"], ["AI", "Agent", "Benchmark"])
        self.assertNotIn("HarmonyOS7开发者声音-问卷调查", [item["title"] for item in items])
        for item in items:
            self.assertNotIn("example.com", item["url"])
            for field in ["title", "url", "source", "summaryZh", "summaryEn", "whyItMattersZh"]:
                self.assertIn(field, item)
                self.assertIsInstance(item[field], str)
                self.assertTrue(item[field].strip())
            self.assertIn("tags", item)
            self.assertIsInstance(item["tags"], list)
            self.assertTrue(item["tags"])
            for tag in item["tags"]:
                self.assertIsInstance(tag, str)
                self.assertTrue(tag.strip())

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

    def test_codex_daily_json_rejects_required_fields_that_clean_to_blank_or_are_not_strings(self):
        invalid_values = [
            "   ",
            "<span></span>",
            True,
            {},
        ]

        for value in invalid_values:
            with self.subTest(value=value):
                payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
                payload["news"][0]["summaryZh"] = value

                self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])

    def test_codex_daily_json_rejects_local_or_private_http_urls(self):
        blocked_urls = [
            "http://127.0.0.1/story",
            "http://localhost/story",
            "http://192.168.1.20/story",
            "http:///missing-host",
            "http://100.64.0.1/x",
            "http://2130706433/x",
            "http://0177.0.0.1/x",
        ]

        for url in blocked_urls:
            with self.subTest(url=url):
                payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
                payload["news"][0]["url"] = url

                self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])

    def test_codex_daily_json_rejects_malformed_or_deceptive_public_urls(self):
        blocked_urls = [
            "https://example.com:bad/x",
            "https://www.oschina.net@evil.com/x",
            "https://www.oschina.net/news/471539\nhttps://evil.com",
            "https://www.oschina.net/news/471539 bad",
        ]

        for url in blocked_urls:
            with self.subTest(url=url):
                payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
                payload["news"][0]["url"] = url

                self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])

    def test_codex_daily_json_ignores_invalid_items_after_limit(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        payload["news"][5]["url"] = "javascript:late"

        items = self.module.normalize_codex_daily_news(payload, limit=5)

        self.assertEqual(len(items), 5)
        self.assertEqual(items[0]["url"], "https://www.oschina.net/news/471539")
        self.assertEqual(items[-1]["url"], "https://www.oschina.net/news/471516")

    def test_codex_daily_json_rejects_invalid_items_within_limit(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        payload["news"][4]["url"] = "javascript:early"

        self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])


if __name__ == "__main__":
    unittest.main()
