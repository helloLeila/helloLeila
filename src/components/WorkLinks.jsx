// 常用工作入口组件，用于放置官方文档和常用外部链接。
import { siteContent } from "../data/siteContent.js";

// 渲染底部工作入口与回到顶部链接。
export function WorkLinks() {
  return (
    <section className="footer-links">
      <div className="section-head compact">
        <div className="section-kicker">Common Work Entrances / 常用网站入口</div>
      </div>
      <div className="link-grid">
        {siteContent.workLinks.map((link) => (
          <a className="link-pill" href={link.href} key={link.href} target="_blank" rel="noreferrer">
            <em>{link.type}</em>
            <span>{link.label}</span>
          </a>
        ))}
      </div>
      <div className="back-top-row">
        <a className="back-top" href="#top">
          Back to top / 回到顶部
        </a>
      </div>
    </section>
  );
}
