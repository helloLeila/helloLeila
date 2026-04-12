#!/usr/bin/env python3
"""实时面板抓取脚本。

使用公开 API、RSS 与公开新闻页合规抓取深圳七天天气和指定新闻源，
每天 07:00（北京时间）刷新 `public/live-panel.json`。
"""

from __future__ import annotations

import json
import re
from datetime import datetime
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo


SHENZHEN = {
    "city": "Shenzhen",
    "latitude": 22.5431,
    "longitude": 114.0579,
}
TIMEZONE = "Asia/Shanghai"
PANEL_PATH = Path(__file__).resolve().parents[1] / "public" / "live-panel.json"
HEADERS = {
    "User-Agent": "github-profile-home-live-panel/1.0",
    "Accept": "application/json",
}


# 天气代码映射为中英文文案，方便页面直接使用。
WEATHER_CODE_MAP = {
    0: {"en": "Clear", "zh": "晴"},
    1: {"en": "Mainly clear", "zh": "晴间多云"},
    2: {"en": "Partly cloudy", "zh": "多云"},
    3: {"en": "Overcast", "zh": "阴"},
    45: {"en": "Fog", "zh": "雾"},
    48: {"en": "Rime fog", "zh": "雾凇"},
    51: {"en": "Light drizzle", "zh": "毛毛雨"},
    53: {"en": "Drizzle", "zh": "小雨"},
    55: {"en": "Dense drizzle", "zh": "细密小雨"},
    61: {"en": "Light rain", "zh": "小雨"},
    63: {"en": "Rain", "zh": "中雨"},
    65: {"en": "Heavy rain", "zh": "大雨"},
    71: {"en": "Light snow", "zh": "小雪"},
    73: {"en": "Snow", "zh": "中雪"},
    75: {"en": "Heavy snow", "zh": "大雪"},
    80: {"en": "Rain showers", "zh": "阵雨"},
    81: {"en": "Heavy showers", "zh": "强阵雨"},
    82: {"en": "Violent showers", "zh": "暴雨"},
    95: {"en": "Thunderstorm", "zh": "雷暴"},
}


# 作为抓取失败时的安全回退，保证 workflow 不因第三方波动直接失败。
DEFAULT_NEWS = [
    {"title": "36氪最新资讯", "url": "https://36kr.com/feed"},
    {"title": "掘金热榜文章", "url": "https://juejin.cn/hot/articles"},
    {"title": "The Verge latest stories", "url": "https://www.theverge.com/rss/index.xml"},
    {"title": "开源中国资讯", "url": "https://www.oschina.net/news"},
    {"title": "36氪科技快讯", "url": "https://36kr.com/"},
]

DEFAULT_DAILY = [
    {"date": "2026-04-12", "labelEn": "Sun", "labelZh": "周日", "morningTemperature": 23, "eveningTemperature": 28, "swing": 5},
    {"date": "2026-04-13", "labelEn": "Mon", "labelZh": "周一", "morningTemperature": 24, "eveningTemperature": 29, "swing": 5},
    {"date": "2026-04-14", "labelEn": "Tue", "labelZh": "周二", "morningTemperature": 24, "eveningTemperature": 30, "swing": 6},
    {"date": "2026-04-15", "labelEn": "Wed", "labelZh": "周三", "morningTemperature": 25, "eveningTemperature": 31, "swing": 6},
    {"date": "2026-04-16", "labelEn": "Thu", "labelZh": "周四", "morningTemperature": 25, "eveningTemperature": 30, "swing": 5},
    {"date": "2026-04-17", "labelEn": "Fri", "labelZh": "周五", "morningTemperature": 24, "eveningTemperature": 29, "swing": 5},
    {"date": "2026-04-18", "labelEn": "Sat", "labelZh": "周六", "morningTemperature": 23, "eveningTemperature": 28, "swing": 5},
]


# 发起一个 GET 请求并解析 JSON，避免引入额外依赖。
def fetch_json(url: str) -> object:
    request = Request(url, headers=HEADERS)
    with urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


# 发起一个 GET 请求并返回文本内容，用于 RSS 或公开页面抓取。
def fetch_text(url: str) -> str:
    request = Request(url, headers=HEADERS)
    with urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="ignore")


# 读取已有 live panel，给失败场景提供兜底值。
def load_previous_panel() -> dict:
    if not PANEL_PATH.exists():
        return {}

    try:
        return json.loads(PANEL_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


# 按时间窗口聚合温度，避免单个整点取值被四舍五入后看起来早晚相同。
def pick_window_temperature(entries: list[tuple[str, float]], start_hour: int, end_hour: int) -> float:
    window_values = [
        temp
        for time_text, temp in entries
        if start_hour <= int(time_text[11:13]) <= end_hour
    ]

    if not window_values:
        fallback_values = [
            item[1]
            for item in sorted(entries, key=lambda item: abs(int(item[0][11:13]) - start_hour))[:3]
        ]
        window_values = fallback_values or [entries[0][1]]

    return round(sum(window_values) / len(window_values), 1)


# 将 Open-Meteo 小时级温度整理成七天早晚温差数据。
def build_daily_weather(hourly_times: list[str], hourly_temps: list[float]) -> list[dict]:
    grouped: dict[str, list[tuple[str, float]]] = {}
    for time_text, temp in zip(hourly_times, hourly_temps):
        grouped.setdefault(time_text[:10], []).append((time_text, temp))

    daily = []
    weekday_en = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekday_zh = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

    for date_text in sorted(grouped.keys())[:7]:
        entries = grouped[date_text]
        morning = pick_window_temperature(entries, 6, 9)
        evening = pick_window_temperature(entries, 18, 21)
        day_index = datetime.fromisoformat(date_text).weekday()
        daily.append(
            {
                "date": date_text,
                "labelEn": weekday_en[day_index],
                "labelZh": weekday_zh[day_index],
                "morningTemperature": morning,
                "eveningTemperature": evening,
                "swing": round(evening - morning, 1),
            }
        )

    return daily


# 通过 Open-Meteo 获取深圳天气，完全基于公开 API。
def fetch_weather(previous_panel: dict) -> dict:
    params = urlencode(
        {
            "latitude": SHENZHEN["latitude"],
            "longitude": SHENZHEN["longitude"],
            "current": "temperature_2m,relative_humidity_2m,weather_code",
            "hourly": "temperature_2m",
            "timezone": TIMEZONE,
            "forecast_days": 7,
        }
    )
    url = f"https://api.open-meteo.com/v1/forecast?{params}"

    try:
        data = fetch_json(url)
        current = data.get("current", {})
        daily = build_daily_weather(
            data.get("hourly", {}).get("time", []),
            data.get("hourly", {}).get("temperature_2m", []),
        )
        weather_code = current.get("weather_code", 2)
        return {
            "city": SHENZHEN["city"],
            "temperature": round(current.get("temperature_2m", 27)),
            "humidity": round(current.get("relative_humidity_2m", 70)),
            "typhoonEta": {"en": "No active alert", "zh": "暂无台风预警"},
            "condition": WEATHER_CODE_MAP.get(weather_code, WEATHER_CODE_MAP[2]),
            "daily": daily or previous_panel.get("weather", {}).get("daily", DEFAULT_DAILY),
        }
    except (HTTPError, URLError, TimeoutError, ValueError, KeyError):
        previous_weather = previous_panel.get("weather", {})
        return {
            "city": previous_weather.get("city", SHENZHEN["city"]),
            "temperature": previous_weather.get("temperature", 27),
            "humidity": previous_weather.get("humidity", 70),
            "typhoonEta": previous_weather.get("typhoonEta", {"en": "No active alert", "zh": "暂无台风预警"}),
            "condition": previous_weather.get("condition", WEATHER_CODE_MAP[2]),
            "daily": previous_weather.get("daily", DEFAULT_DAILY),
        }


# 清洗抓取出的标题，避免 HTML 残留。
def clean_title(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = unescape(text).strip()
    return re.sub(r"\s+", " ", text)


# 解析 RSS/Atom 内容，提取标题与链接。
def parse_rss_items(feed_text: str, limit: int) -> list[dict]:
    root = ET.fromstring(feed_text)
    items = []

    for item in root.findall(".//item"):
        title = item.findtext("title")
        link = item.findtext("link")
        if title and link:
          items.append({"title": clean_title(title), "url": link.strip()})
        if len(items) >= limit:
            return items

    namespace_link = "{http://www.w3.org/2005/Atom}link"
    namespace_title = "{http://www.w3.org/2005/Atom}title"
    for entry in root.findall(".//{http://www.w3.org/2005/Atom}entry"):
        title = entry.findtext(namespace_title)
        link_node = entry.find(namespace_link)
        link = link_node.attrib.get("href") if link_node is not None else None
        if title and link:
            items.append({"title": clean_title(title), "url": link.strip()})
        if len(items) >= limit:
            break

    return items


# 通过公开 RSS 抓取 36 氪与 The Verge 新闻。
def fetch_rss_news(url: str, limit: int) -> list[dict]:
    try:
        return parse_rss_items(fetch_text(url), limit)
    except (HTTPError, URLError, TimeoutError, ValueError, ET.ParseError):
        return []


# 通过公开页面抓取 Juejin / OSC 的热门或最新文章。
def fetch_html_news(url: str, pattern: str, limit: int, prefix: str = "") -> list[dict]:
    try:
        html = fetch_text(url)
    except (HTTPError, URLError, TimeoutError, ValueError):
        return []

    results = []
    seen = set()

    for href, title in re.findall(pattern, html, flags=re.I | re.S):
        link = href if href.startswith("http") else f"{prefix}{href}"
        normalized = link.strip()
        clean = clean_title(title)
        if not clean or normalized in seen:
            continue

        seen.add(normalized)
        results.append({"title": clean, "url": normalized})
        if len(results) >= limit:
            break

    return results


# 轮询合并多个新闻源，优先保留每个源的头部内容，再补齐剩余位。
def interleave_news_lists(news_lists: list[list[dict]], limit: int) -> list[dict]:
    mixed = []
    seen = set()
    max_length = max((len(items) for items in news_lists), default=0)

    for index in range(max_length):
        for items in news_lists:
            if index >= len(items):
                continue
            item = items[index]
            if item["url"] in seen:
                continue
            mixed.append(item)
            seen.add(item["url"])
            if len(mixed) >= limit:
                return mixed

    return mixed


# 聚合用户指定的新闻源，最终输出 5 条。
def fetch_news(previous_panel: dict, limit: int = 5) -> list[dict]:
    source_lists = [
        fetch_html_news(
            "https://juejin.cn/hot/articles",
            r'href="(/post/[^"]+)".*?>([^<]{4,120})</a>',
            limit=3,
            prefix="https://juejin.cn",
        ),
        fetch_rss_news("https://36kr.com/feed", limit=3),
        fetch_html_news(
            "https://www.oschina.net/news",
            r'href="(https://www\.oschina\.net/news/[^"]+)".*?>([^<]{4,120})</a>',
            limit=3,
        ),
        fetch_rss_news("https://www.theverge.com/rss/index.xml", limit=3),
    ]

    mixed = interleave_news_lists(source_lists, limit)
    if mixed:
        return mixed[:limit]

    previous_news = previous_panel.get("news")
    return previous_news[:limit] if isinstance(previous_news, list) and previous_news else DEFAULT_NEWS[:limit]


# 生成完整面板结构并落盘。
def build_panel() -> dict:
    previous_panel = load_previous_panel()
    now = datetime.now(ZoneInfo(TIMEZONE)).replace(second=0, microsecond=0)
    return {
        "updatedAt": now.isoformat(),
        "weather": fetch_weather(previous_panel),
        "news": fetch_news(previous_panel, limit=5),
    }


# 主入口：写入 public/live-panel.json。
def main() -> None:
    panel = build_panel()
    PANEL_PATH.write_text(json.dumps(panel, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
