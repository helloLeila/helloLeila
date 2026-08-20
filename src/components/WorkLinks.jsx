// 常用工作入口组件，用于放置官方文档和常用外部链接。
import { siteContent } from "../data/siteContent.js";

// 渲染底部工作入口与回到顶部链接。
export function WorkLinks() {
  const eventsUrl = `${import.meta.env.BASE_URL || "/"}events/`;

  return (
    <section className="footer-links">
      <div className="section-head compact">
        <div className="section-kicker">Common Work Entrances / 常用网站入口</div>
        <a className="events-page-link" href={eventsUrl}>
          Activity radar / 活动雷达 ↗
        </a>
      </div>
      <div className="link-marquee" aria-label="Common work entrances / 常用网站入口">
        <div className="link-track">
          {[false, true].map((isDuplicate) => (
            <div
              className="link-sequence"
              aria-hidden={isDuplicate}
              key={isDuplicate ? "duplicate" : "primary"}
            >
              {siteContent.workLinks.map((link) => (
                <a
                  className="link-pill"
                  href={link.href}
                  key={link.href}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={isDuplicate ? -1 : undefined}
                >
                  <em>{link.type}</em>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="back-top-row">
        <a className="back-top" href="#top">
          Back to top / 回到顶部
        </a>
      </div>
    </section>
  );
}
