// 技能分组组件，用于展示前端、后端、工程和研究方向的能力标签。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";

// 按分组渲染技能标签，并为每个标签提供独立外链。
export function SkillGroups({ lang }) {
  const ids = {
    frontend: "skills-frontend",
    backend: "skills-backend",
    engineering: "skills-engineering",
    "ai-research": "skills-ai-research",
  };

  return (
    <div className="hero-bottom">
      {siteContent.skillGroups.map((group) => (
        <section className="skill-group" id={ids[group.key]} key={group.key}>
          <h3 style={group.highlightIndent ? { paddingLeft: `${group.highlightIndent}px` } : undefined}>
            {group.titleEn} / {group.titleZh}
          </h3>
          <div className="tag-row">
            {group.tags.map((tag) => (
              <a className="tag-link" href={tag.href} key={`${group.key}-${tag.labelEn}`} target="_blank" rel="noreferrer">
                {textByLang(lang, tag.labelEn, tag.labelZh || tag.labelEn)}
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
