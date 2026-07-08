// 实时工具面板组件，负责展示每日新闻情报流。

// 格式化每日抓取时间，给面板显示最近一次刷新时刻。
function formatUpdatedAt(updatedAt, lang) {
  if (!updatedAt) {
    return lang === "zh" ? "等待刷新" : "Pending";
  }

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function NewsList({ items, lang }) {
  return (
    <ol className="news-list">
      {items.slice(0, 5).map((item) => (
        <li key={item.url}>
          <div className="news-row-head">
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.title}
            </a>
            {item.source ? <span>{item.source}</span> : null}
          </div>
          {item.summary ? <p>{item.summary}</p> : null}
          {item.whyItMatters ? <small>{item.whyItMatters}</small> : null}
          {item.tags?.length ? (
            <div className="news-tags" aria-label={lang === "zh" ? "新闻标签" : "News tags"}>
              {item.tags.map((tag) => (
                <span key={`${item.url}-${tag}`}>{tag}</span>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function NewsPane({ title, marker, items, lang, variant }) {
  return (
    <section className={`news-pane ${variant}-news-pane`}>
      <div className="news-pane-head">
        <h3>{title}</h3>
        <span>{marker}</span>
      </div>
      <NewsList items={items} lang={lang} />
    </section>
  );
}

// 按当前语言和实时数据渲染 Codex 日报与公开来源今日快讯。
export function UtilitiesPanel({ lang, weather, news = [], codexNews = [] }) {
  const updatedAt = formatUpdatedAt(weather?.updatedAt, lang);
  const hasCodexNews = codexNews?.length > 0;

  return (
    <section className="utility-grid">
      <article className="live-card live-news-card" id="live-news">
        <div className="section-head compact live-news-head">
          <div className="section-kicker">Today&apos;s Tech Headlines / 今日技术快讯</div>
          <span className="live-news-updated">{updatedAt}</span>
          <h2>AI daily brief / AI 每日精选</h2>
        </div>
        <div className={`news-brief-grid${hasCodexNews ? " has-codex" : ""}`}>
          {hasCodexNews ? (
            <NewsPane
              title="Codex global brief / Codex 国外精选"
              marker="Codex"
              items={codexNews}
              lang={lang}
              variant="codex"
            />
          ) : null}
          <NewsPane
            title="Current public feed / 当前五条"
            marker="Live"
            items={news}
            lang={lang}
            variant="public"
          />
        </div>
      </article>
    </section>
  );
}
