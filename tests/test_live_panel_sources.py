import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "fetch_live_panel.py"
FIXTURE_PATH = ROOT / "tests" / "fixtures" / "ai-daily-latest.json"
DEFAULT_AI_DAILY_PATH = ROOT / "ai-daily" / "latest.json"


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
                "https://github.blog/changelog/2026-07-07-github-copilot-app-available-to-all/",
                "https://www.axios.com/2026/07/07/report-ai-safety-pledges",
                "https://www.wsj.com/tech/ai/killer-robots-must-be-banned-u-n-secretary-general-says-00603020",
                "https://www.businessinsider.com/vercel-ceo-guillermo-rauch-ai-lab-partner-outdated-2026-7",
                "https://www.businessinsider.com/openai-hiring-expert-investment-banking-job-pay-experience-2026-7",
            ],
        )
        self.assertEqual(items[0]["title"], "GitHub Copilot app 面向所有套餐开放")
        self.assertEqual(items[0]["source"], "GitHub Blog")
        self.assertEqual(items[0]["summaryZh"], "GitHub 将 Copilot app 推向所有套餐，并新增按用户设置 cost center 预算的能力。")
        self.assertEqual(items[0]["summaryEn"], "GitHub opened the Copilot app to all plans and added per-user cost-center budgets.")
        self.assertEqual(items[0]["whyItMattersZh"], "AI 编程工具正从个人效率工具进入企业级治理和成本控制阶段。")
        self.assertEqual(items[0]["tags"], ["AI Coding", "GitHub", "Enterprise"])
        self.assertNotIn("OpenAI 招聘投行专家", [item["title"] for item in items[0:4]])
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

    def test_repository_default_codex_daily_json_is_valid(self):
        payload = json.loads(DEFAULT_AI_DAILY_PATH.read_text(encoding="utf-8"))
        items = self.module.normalize_codex_daily_news(payload, limit=5)

        self.assertEqual(len(items), 5)
        self.assertEqual(items[0]["source"], "GitHub Blog")
        self.assertTrue(any(item["source"] == "Axios" for item in items))
        self.assertTrue(any(item["source"] == "Business Insider" for item in items))
        self.assertTrue(all(item["summaryZh"] for item in items))
        self.assertTrue(all(item["whyItMattersZh"] for item in items))

    def test_build_news_returns_codex_and_public_streams(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        public_news = [
            {"title": "公开新闻一", "url": "https://www.oschina.net/news/471539"},
            {"title": "公开新闻二", "url": "https://www.oschina.net/news/471531"},
            {"title": "公开新闻三", "url": "https://my.oschina.net/u/3874284/blog/19715962"},
            {"title": "公开新闻四", "url": "https://www.oschina.net/news/471519/codeforge-26-4-0-released"},
            {"title": "公开新闻五", "url": "https://www.oschina.net/news/471516"},
        ]
        self.module.load_codex_daily_payload = lambda: payload
        self.module.fetch_fallback_news = lambda previous_panel, limit=5: public_news[:limit]

        ai_status, codex_news, current_news = self.module.build_news({}, limit=5)

        self.assertEqual(ai_status, "codex")
        self.assertEqual(len(codex_news), 5)
        self.assertEqual([item["url"] for item in current_news], [item["url"] for item in public_news])

    def test_fetch_weather_marks_open_meteo_data_as_live_source(self):
        captured_urls = []

        def fake_fetch_json(url):
            captured_urls.append(url)
            return {
                "current": {
                    "time": "2026-07-08T11:00",
                    "temperature_2m": 28.4,
                    "relative_humidity_2m": 85,
                    "weather_code": 95,
                },
                "hourly": {
                    "time": [
                        "2026-07-08T06:00",
                        "2026-07-08T18:00",
                        "2026-07-09T06:00",
                        "2026-07-09T18:00",
                    ],
                    "temperature_2m": [26.0, 29.0, 26.5, 30.5],
                },
            }

        self.module.fetch_json = fake_fetch_json

        weather = self.module.fetch_weather({})

        self.assertEqual(weather["source"], "Open-Meteo")
        self.assertIn("api.open-meteo.com/v1/forecast", weather["sourceUrl"])
        self.assertEqual(weather["sourceUrl"], captured_urls[0])
        self.assertEqual(weather["observedAt"], "2026-07-08T11:00")
        self.assertFalse(weather["isFallback"])
        self.assertEqual(weather["condition"]["zh"], "雷暴")
        self.assertEqual(weather["temperature"], 28)
        self.assertEqual(weather["humidity"], 85)

    def test_fetch_weather_marks_previous_data_when_api_falls_back(self):
        previous_panel = {
            "updatedAt": "2026-07-08T07:00:00+08:00",
            "weather": {
                "city": "Shenzhen",
                "temperature": 27,
                "humidity": 70,
                "source": "Open-Meteo",
                "sourceUrl": "https://api.open-meteo.com/v1/forecast?old=1",
                "observedAt": "2026-07-08T06:45",
                "condition": {"en": "Partly cloudy", "zh": "多云"},
                "typhoonEta": {"en": "No active alert", "zh": "暂无台风预警"},
                "daily": self.module.DEFAULT_DAILY,
            },
        }
        self.module.fetch_json = lambda url: (_ for _ in ()).throw(self.module.URLError("offline"))

        weather = self.module.fetch_weather(previous_panel)

        self.assertEqual(weather["source"], "Open-Meteo")
        self.assertEqual(weather["sourceUrl"], "https://api.open-meteo.com/v1/forecast?old=1")
        self.assertEqual(weather["observedAt"], "2026-07-08T06:45")
        self.assertTrue(weather["isFallback"])
        self.assertEqual(weather["temperature"], 27)
        self.assertEqual(weather["humidity"], 70)

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
        self.assertEqual(items[0]["url"], "https://github.blog/changelog/2026-07-07-github-copilot-app-available-to-all/")
        self.assertEqual(items[-1]["url"], "https://www.businessinsider.com/openai-hiring-expert-investment-banking-job-pay-experience-2026-7")

    def test_codex_daily_json_rejects_invalid_items_within_limit(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        payload["news"][4]["url"] = "javascript:early"

        self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])


if __name__ == "__main__":
    unittest.main()
