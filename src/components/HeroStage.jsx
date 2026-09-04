// 首屏组件，负责欢迎条、标题区、事实卡与技能卡的整体排布。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { StatsRow } from "./StatsRow.jsx";

// 根据当前语言渲染个人站首屏，并提供语言切换入口。
export function HeroStage({ lang, setLang }) {
  return (
    <section className="hero-stage" id="top">
      <div className="toolbar">
        <div className="toolbar-note">
          <span className="toolbar-note-badge">✦</span>
          <span>{textByLang(lang, siteContent.welcome.en, siteContent.welcome.zh)}</span>
        </div>
        <div className="lang-toggle">
          <button className={lang === "en" ? "lang-button is-active" : "lang-button"} onClick={() => setLang("en")} type="button">
            EN
          </button>
          <button className={lang === "zh" ? "lang-button is-active" : "lang-button"} onClick={() => setLang("zh")} type="button">
            中文
          </button>
        </div>
      </div>

      <div className="hero-top">
        <div className="headline-wrap">
          <div className="eyebrow">{siteContent.hero.eyebrow}</div>
          <p className="hero-name">{textByLang(lang, "Hello, I'm Leila.", "你好，我是 Leila。")}</p>
          <div className="hero-role">{textByLang(lang, "Full-stack engineer · AI practice", "全栈程序员 · AI 实践")}</div>
          <div className="hero-purpose-label">{textByLang(lang, "What I build", "我做什么")}</div>
          <p className="subline hero-focus-summary">{textByLang(lang, siteContent.hero.sublineEn, siteContent.hero.sublineZh)}</p>
          <h1 className="headline">
            <span className="headline-main">
              {textByLang(lang, siteContent.hero.titleEn, siteContent.hero.titleZh)}
            </span>
            <span className="headline-alt">
              {textByLang(lang, siteContent.hero.titleZh, siteContent.hero.titleEn)}
            </span>
          </h1>
        </div>

        <div className="hero-profile-column hero-top-side">
          <div className="top-meta">
            <div className="chip-row">
              {siteContent.hero.topChips.map((chip) => (
                <span className="meta-pill" key={chip}>
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <article className="summary-card">
            <div className="hero-identity-label">{textByLang(lang, "About me", "关于我")}</div>
            <p>{textByLang(lang, siteContent.summary.en, siteContent.summary.zh)}</p>
            <div className="domain-grid">
              {siteContent.domainLinks.map((link) => (
                <a className="domain-chip" href={link.href} key={link.href}>
                  <strong>{link.labelEn}</strong>
                  <span>{link.labelZh}</span>
                </a>
              ))}
            </div>
          </article>
        </div>
      </div>

      <div className="hero-middle">
        <div className="left-column">
          <StatsRow lang={lang} />
        </div>
      </div>

      <div className="hero-thread" aria-label={textByLang(lang, "What I work on", "我主要做什么")}>
        {siteContent.hero.workingLanes.map((lane, index) => (
          <article className={`hero-thread-row is-${index + 1}`} key={lane.titleEn}>
            <strong>{textByLang(lang, lane.titleEn, lane.titleZh)}</strong>
            <div className="hero-thread-copy">
              <span className="hero-thread-lead">{textByLang(lang, lane.leadEn, lane.leadZh)}</span>
              <small>{textByLang(lang, lane.detailEn, lane.detailZh)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
