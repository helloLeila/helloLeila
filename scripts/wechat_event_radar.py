#!/usr/bin/env python3
"""Deterministic helpers for the public WeChat event radar pipeline."""

from __future__ import annotations

import hashlib
import ipaddress
import json
import re
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from urllib.parse import urlsplit, urlunsplit
from xml.etree import ElementTree as ET


TIMEZONE = timezone(timedelta(hours=8))
WECHAT_ARTICLE_HOST = "mp.weixin.qq.com"
MAX_TITLE_LENGTH = 240
MAX_SUMMARY_LENGTH = 500
MAX_TAGS = 8
EVENT_KEYWORDS = (
    "报名", "活动", "会议", "峰会", "论坛", "沙龙", "讲座", "公开课", "培训",
    "直播", "展会", "路演", "招募", "参会", "门票", "签到", "日程", "meetup",
    "workshop", "summit", "conference", "seminar", "webinar", "hackathon",
)
NEGATIVE_KEYWORDS = ("招聘", "职位", "简历", "广告位", "产品新闻回顾")
AI_EVENT_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "isEvent": {"type": "boolean"},
        "confidence": {"type": "number"},
        "title": {"type": ["string", "null"]},
        "organizer": {"type": ["string", "null"]},
        "eventType": {"type": ["string", "null"]},
        "startTime": {"type": ["string", "null"]},
        "endTime": {"type": ["string", "null"]},
        "timezone": {"type": ["string", "null"]},
        "city": {"type": ["string", "null"]},
        "location": {"type": ["string", "null"]},
        "isOnline": {"type": "boolean"},
        "registrationUrl": {"type": ["string", "null"]},
        "registrationDeadline": {"type": ["string", "null"]},
        "priceText": {"type": ["string", "null"]},
        "summary": {"type": ["string", "null"]},
        "tags": {"type": "array", "items": {"type": "string"}},
    },
    "required": [
        "isEvent", "confidence", "title", "organizer", "eventType", "startTime", "endTime",
        "timezone", "city", "location", "isOnline", "registrationUrl", "registrationDeadline",
        "priceText", "summary", "tags",
    ],
}


def clean_text(value: object) -> str:
    if value is None:
        return ""
    text = unescape(re.sub(r"<[^>]+>", " ", str(value)))
    return re.sub(r"\s+", " ", text).strip()


def is_public_http_url(value: object) -> bool:
    if not isinstance(value, str) or not value.strip():
        return False
    try:
        parsed = urlsplit(value.strip())
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            return False
        if parsed.username or parsed.password:
            return False
        hostname = parsed.hostname.rstrip(".").lower()
        if hostname in {"localhost", "localhost.localdomain"} or hostname.endswith(".local"):
            return False
        try:
            address = ipaddress.ip_address(hostname)
        except ValueError:
            address = None
        if address is not None:
            return not (
                address.is_private
                or address.is_loopback
                or address.is_link_local
                or address.is_multicast
                or address.is_reserved
                or address.is_unspecified
            )
        return "." in hostname and not any(char.isspace() for char in hostname)
    except ValueError:
        return False


def normalize_url(value: object) -> str:
    if not is_public_http_url(value):
        return ""
    parsed = urlsplit(str(value).strip())
    return urlunsplit((parsed.scheme.lower(), parsed.netloc.lower(), parsed.path or "/", parsed.query, ""))


def is_wechat_article_url(value: object) -> bool:
    """Return True only for a public WeChat article URL, never a search or profile page."""
    normalized = normalize_url(value)
    if not normalized:
        return False
    parsed = urlsplit(normalized)
    return parsed.hostname == WECHAT_ARTICLE_HOST and bool(re.fullmatch(r"/s/[^/?#]+", parsed.path))


def _child_text(element: ET.Element, names: tuple[str, ...]) -> str:
    for child in list(element):
        name = child.tag.rsplit("}", 1)[-1].lower()
        if name in names:
            return clean_text("".join(child.itertext()))
    return ""


def _entry_url(element: ET.Element) -> str:
    for child in list(element):
        name = child.tag.rsplit("}", 1)[-1].lower()
        if name == "link":
            href = child.attrib.get("href", "")
            candidate = href or clean_text("".join(child.itertext()))
            if candidate:
                return normalize_url(candidate)
    return ""


def _parse_datetime(value: str) -> str:
    if not value:
        return ""
    try:
        parsed = parsedate_to_datetime(value)
    except (TypeError, ValueError, OverflowError):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return ""
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=TIMEZONE)
    return parsed.astimezone(TIMEZONE).isoformat(timespec="seconds")


def parse_feed(xml_text: str, source_id: str, source_name: str, limit: int = 10) -> list[dict]:
    """Parse RSS 2.0 or Atom into the shared article candidate shape."""
    root = ET.fromstring(xml_text)
    root_name = root.tag.rsplit("}", 1)[-1].lower()
    if root_name == "rss":
        entries = [node for node in root.iter() if node.tag.rsplit("}", 1)[-1].lower() == "item"]
    elif root_name == "feed":
        entries = [node for node in root if node.tag.rsplit("}", 1)[-1].lower() == "entry"]
    else:
        raise ValueError("unsupported feed root")

    items = []
    for entry in entries[:limit]:
        title = _child_text(entry, ("title",))
        url = _entry_url(entry)
        excerpt = _child_text(entry, ("description", "summary", "content", "encoded"))
        published = _child_text(entry, ("pubdate", "published", "updated", "date"))
        if not title or not url:
            continue
        digest = hashlib.sha256(f"{title}\n{url}\n{excerpt}".encode("utf-8")).hexdigest()
        items.append(
            {
                "sourceId": source_id,
                "sourceName": source_name,
                "title": title,
                "url": url,
                "publishedAt": _parse_datetime(published),
                "excerpt": excerpt[:MAX_SUMMARY_LENGTH],
                "contentHash": digest,
            }
        )
    return items


def screen_article(article: dict) -> bool:
    haystack = f"{article.get('title', '')} {article.get('excerpt', '')}".lower()
    if any(keyword.lower() in haystack for keyword in NEGATIVE_KEYWORDS):
        return False
    return any(keyword.lower() in haystack for keyword in EVENT_KEYWORDS)


def build_ai_request(article: dict, model: str) -> dict:
    """Build a strict Responses API request without credentials or hidden context."""
    article_payload = {
        "title": clean_text(article.get("title")),
        "url": normalize_url(article.get("url")),
        "publishedAt": clean_text(article.get("publishedAt")),
        "excerpt": clean_text(article.get("excerpt"))[:MAX_SUMMARY_LENGTH],
    }
    return {
        "model": model,
        "input": [
            {
                "role": "system",
                "content": [{
                    "type": "input_text",
                    "text": (
                        "判断这篇公开文章是否是可参加的活动，并严格输出 JSON。"
                        "只能使用文章提供的信息，无法确认的字段必须为 null；不得编造时间、地点或链接。"
                    ),
                }],
            },
            {
                "role": "user",
                "content": [{
                    "type": "input_text",
                    "text": json.dumps(article_payload, ensure_ascii=False),
                }],
            },
        ],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "wechat_event",
                "strict": True,
                "schema": AI_EVENT_SCHEMA,
            }
        },
    }


def parse_ai_response(payload: dict) -> dict:
    if not isinstance(payload, dict) or payload.get("error"):
        raise ValueError("AI response contains an error or refusal")
    raw = payload.get("output_text")
    if not isinstance(raw, str) or not raw.strip():
        chunks = []
        for item in payload.get("output", []) if isinstance(payload.get("output"), list) else []:
            for content in item.get("content", []) if isinstance(item, dict) else []:
                if isinstance(content, dict) and isinstance(content.get("text"), str):
                    chunks.append(content["text"])
        raw = "".join(chunks)
    if not raw:
        raise ValueError("AI response has no output text")
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("AI response is not valid JSON") from exc
    if not isinstance(value, dict) or not isinstance(value.get("isEvent"), bool):
        raise ValueError("AI response has invalid event shape")
    return value


def _safe_datetime(value: object) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.replace(tzinfo=parsed.tzinfo or TIMEZONE).astimezone(TIMEZONE)


def _event_id(event: dict) -> str:
    stable = "|".join(
        str(event.get(key) or "")
        for key in ("sourceArticleUrl", "title", "startTime", "city")
    )
    return hashlib.sha1(stable.encode("utf-8")).hexdigest()[:16]


def normalize_event(event: dict, now: str | None = None) -> dict:
    if not isinstance(event, dict):
        raise ValueError("event must be an object")
    title = clean_text(event.get("title"))[:MAX_TITLE_LENGTH]
    article_url = normalize_url(event.get("sourceArticleUrl") or event.get("url"))
    start_time = event.get("startTime") if isinstance(event.get("startTime"), str) else None
    start = _safe_datetime(start_time)
    if not title or not article_url:
        raise ValueError("event requires title and public sourceArticleUrl")
    if start_time and start is None:
        raise ValueError("event startTime must be ISO-8601")

    tags = event.get("tags") if isinstance(event.get("tags"), list) else []
    normalized = {
        "id": str(event.get("id") or _event_id(event)),
        "title": title,
        "organizer": clean_text(event.get("organizer")),
        "eventType": clean_text(event.get("eventType")),
        "startTime": start.isoformat(timespec="seconds") if start else None,
        "endTime": event.get("endTime") if _safe_datetime(event.get("endTime")) else None,
        "timezone": clean_text(event.get("timezone")) or "Asia/Shanghai",
        "city": clean_text(event.get("city")),
        "location": clean_text(event.get("location")),
        "isOnline": bool(event.get("isOnline")),
        "registrationUrl": normalize_url(event.get("registrationUrl")) or None,
        "registrationDeadline": event.get("registrationDeadline") if _safe_datetime(event.get("registrationDeadline")) else None,
        "priceText": clean_text(event.get("priceText")),
        "summary": clean_text(event.get("summary"))[:MAX_SUMMARY_LENGTH],
        "sourceAccount": clean_text(event.get("sourceAccount")),
        "sourceArticleUrl": article_url,
        "sourceKind": clean_text(event.get("sourceKind")) or "wechat-public",
        "tags": [clean_text(tag) for tag in tags if clean_text(tag)][:MAX_TAGS],
        "status": clean_text(event.get("status")) or "needs-review",
        "confidence": float(event.get("confidence", 0) or 0),
        "discoveredAt": event.get("discoveredAt") or now,
        "verifiedAt": event.get("verifiedAt") or now,
        "articleHash": clean_text(event.get("articleHash")),
    }
    if normalized["status"] not in {"published", "needs-review", "expired", "cancelled"}:
        normalized["status"] = "needs-review"
    if not normalized["articleHash"]:
        normalized["articleHash"] = hashlib.sha256(article_url.encode("utf-8")).hexdigest()
    return normalized


def merge_events(previous: list[dict], incoming: list[dict], now: str) -> list[dict]:
    merged: dict[str, dict] = {}
    for raw in [*previous, *incoming]:
        try:
            event = normalize_event(raw, now=now)
        except (TypeError, ValueError):
            continue
        key = event["id"] or event["sourceArticleUrl"]
        existing = merged.get(key)
        if existing is None or event.get("verifiedAt", "") >= existing.get("verifiedAt", ""):
            merged[key] = {**existing, **event} if existing else event

    now_dt = _safe_datetime(now) or datetime.now(TIMEZONE)
    for event in merged.values():
        start = _safe_datetime(event.get("startTime"))
        end = _safe_datetime(event.get("endTime"))
        if event.get("status") == "published" and start and start < now_dt - timedelta(hours=24):
            if not end or end < now_dt:
                event["status"] = "expired"

    return sorted(
        merged.values(),
        key=lambda item: (_safe_datetime(item.get("startTime")) or datetime.max.replace(tzinfo=TIMEZONE), item.get("title", "")),
    )


def validate_output(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("output must be an object")
    if payload.get("schemaVersion") != 1:
        raise ValueError("unsupported schemaVersion")
    if not isinstance(payload.get("events"), list) or not isinstance(payload.get("sources"), list):
        raise ValueError("output requires events and sources arrays")
    for event in payload["events"]:
        normalize_event(event)
    if not isinstance(payload.get("sourceStats"), dict):
        raise ValueError("output requires sourceStats")
    return payload
