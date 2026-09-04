// 常用工作入口组件，用于放置官方文档和常用外部链接。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";

// 渲染底部工作入口与回到顶部链接。
export function WorkLinks({ lang = "zh" }) {
  const eventsUrl = `${import.meta.env.BASE_URL || "/"}events/`;

  return (
    <section className="footer-links">
      <div className="footer-callout">
        <div className="footer-callout-head">
          <div className="section-kicker">Common Work Entrances / 常用网站入口</div>
          <a className="events-page-link" href={eventsUrl}>
            Activity radar / 活动雷达 ↗
          </a>
        </div>
        <h2>
          {textByLang(
            lang,
            "Tools and sites I keep using, and keep learning from.",
            "我反复使用，也持续学习的工具与网站"
          )}
        </h2>
        <p>
          {textByLang(
            lang,
            "These common entrances stay as the final continuous movement on the page: a rhythm and a memory point, without taking over the reading thread.",
            "常用网站保留为整页最后一段连续运动。它有节奏和记忆点，但不会抢走正文的阅读主线。"
          )}
        </p>
      </div>
      <div className="footer-marquee-band">
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
      </div>

      <div className="footer-signature">
        <div>
          <span>/ Leila / Full-stack engineer / Shenzhen</span>
          <strong>{textByLang(lang, "Stay focused. Stay curious.", "保持专注，保持好奇。")}</strong>
        </div>
        <a className="back-top" href="#top">
          Back to top / 回到顶部
        </a>
      </div>
    </section>
  );
}
