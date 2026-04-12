// 首屏组件，负责欢迎条、标题区、事实卡与技能卡的整体排布。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { StatsRow } from "./StatsRow.jsx";
import { ProofDeck } from "./ProofDeck.jsx";
import { SkillGroups } from "./SkillGroups.jsx";

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
          <h1 className="headline">
            <span className="headline-main">{siteContent.hero.titleEn}</span>
            <span className="headline-alt">{siteContent.hero.titleZh}</span>
          </h1>
          <p className="subline">{textByLang(lang, siteContent.hero.sublineEn, siteContent.hero.sublineZh)}</p>
        </div>

        <div className="top-meta">
          <div className="chip-row">
            {siteContent.hero.topChips.map((chip) => (
              <span className="meta-pill" key={chip}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-middle">
        <div className="left-column">
          <StatsRow lang={lang} />
          <article className="summary-card">
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

        <ProofDeck lang={lang} />
      </div>

      <SkillGroups lang={lang} />
    </section>
  );
}
