import { useEffect, useMemo, useRef, useState } from "react";
import {
  eventOptions,
  eventSummary,
  filterEvents,
  formatEventDate,
  getEventsUrl,
  normalizeEventsPayload,
} from "./eventData.js";
import SourceConfigDrawer from "./SourceConfigDrawer.jsx";

const BASE_URL = import.meta.env.BASE_URL || "/";
const EMPTY_FILTERS = { query: "", city: "", mode: "all", tag: "", status: "all" };

function Stat({ label, value }) {
  return (
    <div className="event-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EventRow({ event }) {
  return (
    <article className="event-row">
      <div className="event-row-main">
        <div className="event-eyebrow">
          <span>{event.isOnline ? "线上" : event.city || "地点待确认"}</span>
          {event.sourceAccount ? <span>{event.sourceAccount}</span> : null}
          {event.sourceKind === "verified-public-web" ? <span>公开网页核验</span> : null}
        </div>
        <h2>{event.title}</h2>
        <p className="event-meta">
          <span>{formatEventDate(event.startTime)}</span>
          {event.location ? <span>{event.location}</span> : null}
          {event.priceText ? <span>{event.priceText}</span> : null}
        </p>
        <p className="event-summary">{event.summary}</p>
        {event.tags.length ? (
          <div className="event-tags" aria-label="活动标签">
            {event.tags.map((tag) => <span key={`${event.id}-${tag}`}>{tag}</span>)}
          </div>
        ) : null}
      </div>
      <div className="event-row-actions">
        {event.registrationUrl ? (
          <a className="event-action event-action-primary" href={event.registrationUrl} target="_blank" rel="noreferrer">
            立即报名 <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        <a className="event-action" href={event.sourceArticleUrl} target="_blank" rel="noreferrer">
          查看原文 <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default function EventsApp() {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [configOpen, setConfigOpen] = useState(false);
  const configButtonRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(getEventsUrl(BASE_URL), { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("event data unavailable");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, []);

  const events = useMemo(() => normalizeEventsPayload(payload), [payload]);
  // normalizeEventsPayload deliberately excludes needs-review candidates from the public list.
  const options = useMemo(() => eventOptions(events), [events]);
  const visibleEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const summary = useMemo(() => eventSummary(events), [events]);
  const freshness = payload?.updatedAt
    ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Shanghai" }).format(new Date(payload.updatedAt))
    : "等待首次刷新";

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="events-page">
      <header className="events-header">
        <div>
          <a className="events-back" href={BASE_URL}>← 返回个人主页</a>
          <p className="events-kicker">PUBLIC SOURCE RADAR / 公开来源雷达</p>
          <h1>活动雷达</h1>
          <p className="events-intro">从公开文章里挑出值得参加的深圳、香港与线上活动。</p>
        </div>
        <div className="events-header-actions">
          <div className="events-freshness">
            <span className={`status-dot ${payload?.status === "stale" || error ? "is-warning" : ""}`} />
            <span>最近更新 {freshness}</span>
          </div>
          <button
            ref={configButtonRef}
            type="button"
            className="events-config-button"
            aria-haspopup="dialog"
            aria-expanded={configOpen}
            onClick={() => setConfigOpen(true)}
          >
            <span aria-hidden="true">⚙</span> 来源配置
          </button>
        </div>
      </header>

      <section className="events-summary" aria-label="活动概览">
        <Stat label="即将开始" value={summary.upcoming} />
        <Stat label="未来七天" value={summary.withinWeek} />
        <Stat label="线上活动" value={summary.online} />
        <Stat label="当前可见" value={summary.total} />
      </section>

      <section className="events-controls" aria-label="活动筛选">
        <label className="event-search">
          <span>搜索</span>
          <input value={filters.query} onChange={(event) => updateFilter("query", event.target.value)} placeholder="标题、主题或来源" />
        </label>
        <label>
          <span>城市</span>
          <select value={filters.city} onChange={(event) => updateFilter("city", event.target.value)}>
            <option value="">全部城市</option>
            {options.cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>
          <span>形式</span>
          <select value={filters.mode} onChange={(event) => updateFilter("mode", event.target.value)}>
            <option value="all">全部形式</option>
            <option value="offline">线下</option>
            <option value="online">线上</option>
          </select>
        </label>
        <label>
          <span>时间</span>
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="all">全部时间</option>
            <option value="upcoming">即将开始</option>
            <option value="week">未来七天</option>
          </select>
        </label>
        <label>
          <span>标签</span>
          <select value={filters.tag} onChange={(event) => updateFilter("tag", event.target.value)}>
            <option value="">全部标签</option>
            {options.tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </label>
      </section>

      <section className="events-list-section" aria-live="polite">
        <div className="events-list-head">
          <div>
            <p className="events-kicker">CURATED UPCOMING EVENTS</p>
            <h2>{visibleEvents.length} 场活动</h2>
          </div>
          {payload?.status === "partial" || payload?.status === "stale" ? (
            <p className="events-notice">部分来源暂不可用，当前列表沿用最近一次有效结果。</p>
          ) : null}
        </div>
        {error ? <div className="events-state">活动数据暂时无法读取，请稍后刷新。</div> : null}
        {!error && !visibleEvents.length ? (
          <div className="events-state">
            {payload?.status === "empty" ? "来源目录已建立，等待公开订阅地址接入。" : "没有符合当前筛选条件的活动。"}
          </div>
        ) : null}
        <div className="event-list">
          {visibleEvents.map((event) => <EventRow key={event.id} event={event} />)}
        </div>
      </section>
      <SourceConfigDrawer
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        payloadSources={payload?.sources || []}
        returnFocusRef={configButtonRef}
      />
    </main>
  );
}
