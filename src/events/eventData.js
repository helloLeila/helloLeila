const DEFAULT_BASE_URL = "/";

export function getEventsUrl(baseUrl = DEFAULT_BASE_URL) {
  return `${String(baseUrl).replace(/\/?$/, "/")}wechat-events.json`;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeEventsPayload(payload) {
  const items = Array.isArray(payload?.events) ? payload.events : [];
  return items
    .filter((event) => event && event.status === "published" && event.title && event.sourceArticleUrl)
    .map((event) => ({
      ...event,
      city: event.city || "",
      location: event.location || "",
      summary: event.summary || "暂无摘要。",
      tags: Array.isArray(event.tags) ? event.tags.filter(Boolean).slice(0, 8) : [],
      isOnline: Boolean(event.isOnline),
    }))
    .sort((a, b) => {
      const aTime = parseDate(a.startTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = parseDate(b.startTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime || a.title.localeCompare(b.title, "zh-CN");
    });
}

export function filterEvents(events, filters = {}, now = new Date()) {
  const query = String(filters.query || "").trim().toLowerCase();
  const city = String(filters.city || "");
  const mode = String(filters.mode || "all");
  const tag = String(filters.tag || "");
  const status = String(filters.status || "all");
  const nowTime = now.getTime();
  const weekTime = nowTime + 7 * 24 * 60 * 60 * 1000;

  return events.filter((event) => {
    const searchable = [event.title, event.summary, event.organizer, event.location, event.sourceAccount, ...(event.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (city && event.city !== city) return false;
    if (mode === "online" && !event.isOnline) return false;
    if (mode === "offline" && event.isOnline) return false;
    if (tag && !(event.tags || []).includes(tag)) return false;
    const startTime = parseDate(event.startTime)?.getTime();
    if (status === "week" && (startTime == null || startTime < nowTime || startTime > weekTime)) return false;
    if (status === "upcoming" && (startTime == null || startTime < nowTime)) return false;
    return true;
  });
}

export function eventOptions(events) {
  return {
    cities: [...new Set(events.map((event) => event.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN")),
    tags: [...new Set(events.flatMap((event) => event.tags || []))].sort((a, b) => a.localeCompare(b, "zh-CN")),
  };
}

export function eventSummary(events, now = new Date()) {
  const nowTime = now.getTime();
  const weekTime = nowTime + 7 * 24 * 60 * 60 * 1000;
  return {
    total: events.length,
    upcoming: events.filter((event) => {
      const time = parseDate(event.startTime)?.getTime();
      return time != null && time >= nowTime;
    }).length,
    withinWeek: events.filter((event) => {
      const time = parseDate(event.startTime)?.getTime();
      return time != null && time >= nowTime && time <= weekTime;
    }).length,
    online: events.filter((event) => event.isOnline).length,
  };
}

export function formatEventDate(value, locale = "zh-CN") {
  const date = parseDate(value);
  if (!date) return "时间待确认";
  return new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(date);
}
