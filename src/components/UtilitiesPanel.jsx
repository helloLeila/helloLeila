// 实时工具面板组件，负责天气、时区和技术快讯三个信息块。
import { siteContent } from "../data/siteContent.js";
import { getClockEntries } from "../utils/timezones.js";

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

// 按当前语言和实时数据渲染深圳面板与今日快讯。
export function UtilitiesPanel({ lang, weather, news }) {
  const clocks = getClockEntries(lang);
  const updatedAt = formatUpdatedAt(weather?.updatedAt, lang);

  return (
    <section className="utility-grid">
    

      <article className="live-card">
        <div className="section-head compact">
          <div className="section-kicker">Today&apos;s Tech Headlines / 今日技术快讯</div>
          <h2>AI daily brief / AI 每日精选</h2>
        </div>
        <ol className="news-list">
          {news.slice(0, 5).map((item) => (
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
      </article>
    </section>
  );
}
