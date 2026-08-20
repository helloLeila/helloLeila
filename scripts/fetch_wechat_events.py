#!/usr/bin/env python3
"""Refresh the public static JSON for the WeChat event radar."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# Make direct `python scripts/fetch_wechat_events.py` and unittest loading share the same import path.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from wechat_event_radar import (
    TIMEZONE,
    build_ai_request,
    is_public_http_url,
    merge_events,
    normalize_event,
    normalize_url,
    parse_ai_response,
    parse_feed,
    screen_article,
    validate_output,
)


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "data" / "wechat-event-sources.json"
OUTPUT_PATH = ROOT / "public" / "wechat-events.json"
DEPLOYED_DATA_URL = "https://helloleila.github.io/helloLeila/wechat-events.json"
USER_AGENT = "helloLeila-event-radar/1.0 (+public-feed; no-login-state)"
REQUEST_TIMEOUT = 20
REQUEST_DELAY_SECONDS = 2
MAX_ARTICLES_PER_SOURCE = 10


def load_config(path: Path = CONFIG_PATH) -> dict:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or not isinstance(payload.get("sources"), list):
        raise ValueError("source config requires a sources array")

    sources = []
    for index, raw in enumerate(payload["sources"]):
        if not isinstance(raw, dict) or not str(raw.get("name", "")).strip():
            raise ValueError(f"source {index + 1} requires a name")
        source = dict(raw)
        source["id"] = str(source.get("id") or f"source-{index + 1}").strip()
        source["name"] = str(source["name"]).strip()
        source["category"] = str(source.get("category") or "other").strip()
        source["feedUrl"] = normalize_url(source.get("feedUrl"))
        source["enabled"] = bool(source.get("enabled"))
        confirmed_urls = source.get("confirmedArticleUrls")
        source["confirmedArticleUrls"] = [
            normalize_url(url)
            for url in confirmed_urls
            if normalize_url(url)
        ] if isinstance(confirmed_urls, list) else []
        source["discoveryStatus"] = str(
            source.get("discoveryStatus") or ("configured" if source["feedUrl"] else "pending")
        )
        sources.append(source)

    manual_urls = payload.get("manualArticleUrls")
    return {
        "sources": sources,
        "manualArticleUrls": [normalize_url(url) for url in manual_urls if normalize_url(url)]
        if isinstance(manual_urls, list) else [],
    }


def fetch_text(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/rss+xml, application/atom+xml, text/xml, text/html;q=0.9, */*;q=0.1",
        },
    )
    with urlopen(request, timeout=REQUEST_TIMEOUT) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_json(url: str) -> dict | None:
    try:
        payload = json.loads(fetch_text(url))
    except (OSError, ValueError, HTTPError, URLError):
        return None
    return payload if isinstance(payload, dict) else None


def load_previous(path: Path = OUTPUT_PATH) -> dict:
    local = None
    if path.exists():
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(payload, dict):
                local = payload
        except (OSError, ValueError):
            local = None
    if local and local.get("events"):
        return local
    deployed = fetch_json(DEPLOYED_DATA_URL)
    return deployed or local or {}


def _strip_html(value: str) -> str:
    value = re.sub(r"<script[\s\S]*?</script>", " ", value, flags=re.IGNORECASE)
    value = re.sub(r"<style[\s\S]*?</style>", " ", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", unescape(value)).strip()


def parse_public_article(html: str, url: str, source_id: str, source_name: str) -> dict:
    title_match = re.search(r"<title[^>]*>([\s\S]*?)</title>", html, flags=re.IGNORECASE)
    description_match = re.search(
        r'<meta[^>]+(?:name|property)=["\'](?:description|og:description)["\'][^>]+content=["\']([\s\S]*?)["\']',
        html,
        flags=re.IGNORECASE,
    )
    title = _strip_html(title_match.group(1)) if title_match else url
    excerpt = _strip_html(description_match.group(1)) if description_match else _strip_html(html)[:500]
    return {
        "sourceId": source_id,
        "sourceName": source_name,
        "title": title[:240],
        "url": normalize_url(url),
        "publishedAt": "",
        "excerpt": excerpt[:500],
        "contentHash": "",
    }


def _candidate_event(article: dict, now: str) -> dict:
    return normalize_event(
        {
            "title": article["title"],
            "summary": article.get("excerpt", ""),
            "sourceAccount": article.get("sourceName", ""),
            "sourceArticleUrl": article["url"],
            "status": "needs-review",
            "confidence": 0,
            "discoveredAt": now,
            "verifiedAt": now,
            "articleHash": article.get("contentHash", ""),
        },
        now=now,
    )


def extract_ai_event(article: dict, api_key: str, model: str, now: str) -> dict | None:
    if not api_key or not model:
        return _candidate_event(article, now)

    body = json.dumps(build_ai_request(article, model), ensure_ascii=False).encode("utf-8")
    request = Request(
        "https://api.openai.com/v1/responses",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
        },
    )
    last_error = None
    for attempt in range(3):
        try:
            with urlopen(request, timeout=REQUEST_TIMEOUT) as response:
                payload = json.loads(response.read().decode("utf-8"))
            result = parse_ai_response(payload)
            if not result.get("isEvent"):
                return None
            result.update(
                {
                    "sourceAccount": article.get("sourceName", ""),
                    "sourceArticleUrl": article["url"],
                    "discoveredAt": now,
                    "verifiedAt": now,
                    "articleHash": article.get("contentHash", ""),
                    "status": "published"
                    if float(result.get("confidence", 0) or 0) >= 0.75 and result.get("startTime")
                    else "needs-review",
                }
            )
            return normalize_event(result, now=now)
        except (OSError, ValueError, HTTPError, URLError) as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(2 ** attempt)
    return _candidate_event(article, now) if last_error else None


def _source_record(source: dict, now: str, status: str, count: int = 0, error: str = "") -> dict:
    return {
        "id": source["id"],
        "name": source["name"],
        "status": status,
        "checkedAt": now,
        "newArticleCount": count,
        # Keep implementation details out of the public JSON; workflow logs retain the raw exception.
        "error": "source unavailable" if error else "",
    }


def build_payload(
    config: dict,
    now: str | None = None,
    previous: dict | None = None,
    api_key: str | None = None,
    model: str | None = None,
) -> dict:
    now = now or datetime.now(TIMEZONE).isoformat(timespec="seconds")
    previous = previous or {}
    events: list[dict] = []
    source_records = []
    succeeded = failed = active = 0
    last_request_at = 0.0

    for source in config.get("sources", []):
        feed_url = source.get("feedUrl", "")
        manual_urls = source.get("confirmedArticleUrls", [])
        if not source.get("enabled") and not manual_urls:
            source_records.append(_source_record(source, now, source.get("discoveryStatus", "pending")))
            continue
        active += 1
        articles: list[dict] = []
        errors = []
        try:
            if feed_url:
                wait_for = REQUEST_DELAY_SECONDS - (time.monotonic() - last_request_at)
                if last_request_at and wait_for > 0:
                    time.sleep(wait_for)
                feed_xml = fetch_text(feed_url)
                last_request_at = time.monotonic()
                articles.extend(parse_feed(feed_xml, source["id"], source["name"], MAX_ARTICLES_PER_SOURCE))
            for article_url in manual_urls[:MAX_ARTICLES_PER_SOURCE]:
                wait_for = REQUEST_DELAY_SECONDS - (time.monotonic() - last_request_at)
                if last_request_at and wait_for > 0:
                    time.sleep(wait_for)
                article_html = fetch_text(article_url)
                last_request_at = time.monotonic()
                articles.append(parse_public_article(article_html, article_url, source["id"], source["name"]))
        except (OSError, ValueError, HTTPError, URLError) as exc:
            errors.append(str(exc))

        if articles:
            succeeded += 1
        elif errors:
            failed += 1
        for article in articles:
            if not screen_article(article):
                continue
            try:
                event = extract_ai_event(article, api_key or "", model or "", now)
            except (OSError, ValueError, HTTPError, URLError):
                event = _candidate_event(article, now)
            if event:
                events.append(event)
        source_records.append(
            _source_record(source, now, "ok" if articles and not errors else "partial" if articles else "failed" if errors else "pending", len(articles), "; ".join(errors))
        )

    merged = merge_events(previous.get("events", []) if isinstance(previous, dict) else [], events, now)
    visible_events = [event for event in merged if event.get("status") in {"published", "needs-review", "expired", "cancelled"}]
    if failed and previous.get("events") and not events:
        status = "stale"
    elif not visible_events:
        status = "empty"
    elif failed:
        status = "partial"
    else:
        status = "ok"
    payload = {
        "schemaVersion": 1,
        "updatedAt": now,
        "status": status,
        "sourceStats": {
            "cataloged": len(config.get("sources", [])),
            "configured": active,
            "succeeded": succeeded,
            "failed": failed,
        },
        "sources": source_records,
        "events": visible_events,
    }
    return validate_output(payload)


def write_payload(payload: dict, path: Path = OUTPUT_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=CONFIG_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    args = parser.parse_args()
    try:
        config = load_config(args.config)
        previous = load_previous(args.output)
        payload = build_payload(
            config,
            previous=previous,
            api_key=os.environ.get("OPENAI_API_KEY", ""),
            model=os.environ.get("OPENAI_MODEL", ""),
        )
        write_payload(payload, args.output)
        print(json.dumps({"status": payload["status"], "events": len(payload["events"]), "sources": payload["sourceStats"]}, ensure_ascii=False))
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"wechat event refresh failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
