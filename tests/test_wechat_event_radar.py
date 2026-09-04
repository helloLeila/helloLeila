import importlib.util
import json
from pathlib import Path
import unittest
from types import SimpleNamespace
from urllib.error import URLError
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "wechat_event_radar.py"
FETCH_SCRIPT_PATH = ROOT / "scripts" / "fetch_wechat_events.py"


def load_module():
    spec = importlib.util.spec_from_file_location("wechat_event_radar", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_fetch_module():
    spec = importlib.util.spec_from_file_location("fetch_wechat_events", FETCH_SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class WechatEventRadarTests(unittest.TestCase):
    def setUp(self):
        self.module = load_module()

    def test_public_url_validation_rejects_private_and_non_http_urls(self):
        self.assertTrue(self.module.is_public_http_url("https://example.org/a"))
        self.assertFalse(self.module.is_public_http_url("javascript:alert(1)"))
        self.assertFalse(self.module.is_public_http_url("http://127.0.0.1/a"))
        self.assertFalse(self.module.is_public_http_url("http://192.168.1.2/a"))

    def test_wechat_article_url_requires_exact_public_article_shape(self):
        self.assertTrue(self.module.is_wechat_article_url("https://mp.weixin.qq.com/s/example-event"))
        self.assertFalse(self.module.is_wechat_article_url("https://mp.weixin.qq.com/"))
        self.assertFalse(self.module.is_wechat_article_url("https://mp.weixin.qq.com/profile"))
        self.assertFalse(self.module.is_wechat_article_url("https://example.org/s/example-event"))

    def test_rss_and_atom_entries_are_normalized(self):
        rss = (ROOT / "tests/fixtures/wechat-events/feed-rss.xml").read_text(encoding="utf-8")
        atom = (ROOT / "tests/fixtures/wechat-events/feed-atom.xml").read_text(encoding="utf-8")
        rss_items = self.module.parse_feed(rss, "source-rss", "示例技术社区")
        atom_items = self.module.parse_feed(atom, "source-atom", "示例教育机构")

        self.assertEqual(rss_items[0]["title"], "AI Agent 技术沙龙开放报名")
        self.assertEqual(rss_items[0]["sourceId"], "source-rss")
        self.assertEqual(atom_items[0]["title"], "公开课：生成式 AI 入门")
        self.assertEqual(atom_items[0]["url"], "https://example.org/atom-event")

    def test_screen_article_accepts_events_and_rejects_generic_news(self):
        self.assertTrue(self.module.screen_article({"title": "AI Agent 技术沙龙开放报名", "excerpt": "8月29日 深圳"}))
        self.assertFalse(self.module.screen_article({"title": "本周产品新闻回顾", "excerpt": "行业新闻汇总"}))

    def test_merge_events_keeps_future_events_and_expires_old_events(self):
        previous = json.loads((ROOT / "tests/fixtures/wechat-events/previous-events.json").read_text(encoding="utf-8"))
        incoming = [{
            "id": "new-event",
            "title": "新的活动",
            "startTime": "2026-08-30T14:00:00+08:00",
            "status": "published",
            "sourceArticleUrl": "https://example.org/new-event",
        }]

        merged = self.module.merge_events(previous["events"], incoming, "2026-08-20T07:00:00+08:00")
        by_id = {item["id"]: item for item in merged}
        self.assertEqual(by_id["old-event"]["status"], "published")
        self.assertEqual(by_id["expired-event"]["status"], "expired")
        self.assertEqual(by_id["new-event"]["status"], "published")

    def test_validate_output_rejects_missing_events_shape(self):
        with self.assertRaises(ValueError):
            self.module.validate_output({"schemaVersion": 1})

    def test_ai_request_uses_strict_json_schema_and_article_only_input(self):
        request = self.module.build_ai_request(
            {
                "title": "AI Agent 技术沙龙开放报名",
                "url": "https://example.org/article",
                "excerpt": "8月29日深圳南山报名",
            },
            model="test-model",
        )

        self.assertEqual(request["model"], "test-model")
        self.assertEqual(request["text"]["format"]["type"], "json_schema")
        self.assertTrue(request["text"]["format"]["strict"])
        self.assertEqual(request["text"]["format"]["name"], "wechat_event")
        self.assertIn("AI Agent 技术沙龙开放报名", json.dumps(request, ensure_ascii=False))
        self.assertNotIn("OPENAI_API_KEY", json.dumps(request))

    def test_parse_ai_response_rejects_refusal_and_accepts_output_text(self):
        event = {"isEvent": True, "confidence": 0.9, "title": "AI 沙龙", "startTime": "2026-08-29T14:00:00+08:00"}
        response = {"output_text": json.dumps(event, ensure_ascii=False)}
        self.assertEqual(self.module.parse_ai_response(response), event)
        with self.assertRaises(ValueError):
            self.module.parse_ai_response({"error": {"message": "refused"}})

    def test_source_catalog_preserves_all_user_named_sources(self):
        fetcher = load_fetch_module()
        config = fetcher.load_config(ROOT / "data/wechat-event-sources.json")
        names = {item["name"] for item in config["sources"]}

        self.assertEqual(len(config["sources"]), 37)
        self.assertIn("User Group", names)
        self.assertIn("深圳理工大学", names)
        self.assertIn("腾讯云", names)
        user_group = next(item for item in config["sources"] if item["name"] == "User Group")
        self.assertEqual(user_group["confirmedArticleUrls"], ["https://mp.weixin.qq.com/s/vyR8JJ3a8UHih6wPtt25vA"])

    def test_empty_catalog_payload_is_honest_without_ai_or_feed_urls(self):
        fetcher = load_fetch_module()
        config = {"sources": [{"id": "named-only", "name": "仅有名称", "feedUrl": "", "enabled": False}], "manualArticleUrls": []}
        payload = fetcher.build_payload(config, now="2026-08-20T07:00:00+08:00", previous={}, verified_events=[])

        self.assertEqual(payload["status"], "empty")
        self.assertEqual(payload["sourceStats"]["cataloged"], 1)
        self.assertEqual(payload["events"], [])

    def test_public_source_records_do_not_expose_raw_fetch_errors(self):
        fetcher = load_fetch_module()
        record = fetcher._source_record(
            {"id": "source", "name": "来源"},
            "2026-08-20T07:00:00+08:00",
            "failed",
            error="private stack trace and local path",
        )
        self.assertEqual(record["error"], "source unavailable")

    def test_verified_public_events_are_loaded_when_feeds_are_empty(self):
        fetcher = load_fetch_module()
        events = fetcher.load_verified_events(ROOT / "data/verified-public-events.json")
        self.assertEqual(events, [])

    def test_name_discovery_builds_search_url_and_scores_wechat_candidates(self):
        fetcher = load_fetch_module()
        search_url = fetcher.build_discovery_url("深圳理工大学")
        self.assertIn("format=rss", search_url)
        self.assertIn("%E6%B7%B1%E5%9C%B3%E7%90%86%E5%B7%A5%E5%A4%A7%E5%AD%A6", search_url)

        xml = (ROOT / "tests/fixtures/wechat-events/bing-discovery.xml").read_text(encoding="utf-8")
        candidates = fetcher.parse_discovery_results(xml, "sz-tech", "深圳理工大学")
        self.assertEqual(candidates[0]["url"], "https://mp.weixin.qq.com/s/shenzhen-tech-event")
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["discoveryStatus"], "needs-confirmation")

    def test_html_discovery_extracts_only_direct_wechat_articles(self):
        fetcher = load_fetch_module()
        html = '<a href="https://www.baidu.com/link?url=x">普通网页</a> https://mp.weixin.qq.com/s/real-event'
        candidates = fetcher.parse_html_discovery_results(html, "source", "示例公众号")
        self.assertEqual([item["url"] for item in candidates], ["https://mp.weixin.qq.com/s/real-event"])

    def test_discovery_falls_back_after_malformed_rss(self):
        fetcher = load_fetch_module()
        responses = iter([
            "<html>rate limited</html>",
            '<a href="https://mp.weixin.qq.com/s/real-event">公众号活动</a>',
        ])
        with patch.object(fetcher, "fetch_text", side_effect=lambda _url: next(responses)):
            candidates, status = fetcher.discover_source_candidates({"id": "source", "name": "示例公众号", "discoveryStatus": "pending"})
        self.assertEqual(status, "needs-confirmation")
        self.assertEqual(candidates[0]["url"], "https://mp.weixin.qq.com/s/real-event")

    def test_fetch_text_falls_back_to_curl_when_python_tls_fails(self):
        fetcher = load_fetch_module()
        completed = SimpleNamespace(stdout=b"<rss><channel /></rss>", stderr=b"")
        fake_shutil = SimpleNamespace(which=lambda name: "/usr/bin/curl")
        def fake_run(*args, **kwargs):
            fake_subprocess.last_args = args
            fake_subprocess.last_kwargs = kwargs
            return completed
        fake_subprocess = SimpleNamespace(run=fake_run, last_args=None, last_kwargs=None)
        with patch.object(fetcher, "urlopen", side_effect=URLError("CERTIFICATE_VERIFY_FAILED")), \
             patch.object(fetcher, "shutil", fake_shutil, create=True), \
             patch.object(fetcher, "subprocess", fake_subprocess, create=True):
            self.assertEqual(fetcher.fetch_text("https://www.bing.com/search?format=rss&q=test"), "<rss><channel /></rss>")
        self.assertEqual(fake_subprocess.last_args[0][0], "/usr/bin/curl")
        self.assertIn("--fail", fake_subprocess.last_args[0])

    def test_successful_name_discovery_does_not_crash_or_publish_unconfirmed_event(self):
        fetcher = load_fetch_module()
        config = {"sources": [{"id": "source", "name": "深圳理工大学", "feedUrl": "", "enabled": False}], "manualArticleUrls": []}
        candidate = {
            "sourceId": "source",
            "sourceName": "深圳理工大学",
            "title": "深圳理工大学 AI 活动报名",
            "url": "https://mp.weixin.qq.com/s/candidate",
            "excerpt": "8月29日活动报名",
            "publishedAt": "",
            "contentHash": "candidate-hash",
            "score": 9,
            "discoveryStatus": "needs-confirmation",
        }

        with patch.object(fetcher, "discover_source_candidates", return_value=([candidate], "needs-confirmation")):
            payload = fetcher.build_payload(config, now="2026-08-20T07:00:00+08:00", previous={}, verified_events=[])

        self.assertEqual(payload["sourceStats"]["discoveryHits"], 1)
        self.assertEqual(payload["sources"][0]["discoveryCandidates"][0]["score"], 9)
        self.assertEqual(len(payload["events"]), 1)
        self.assertEqual(payload["events"][0]["status"], "needs-review")


if __name__ == "__main__":
    unittest.main()
