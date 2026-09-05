// 技能分组组件，用于展示前端、后端、工程和研究方向的能力标签。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { signalCloudGroupByKey } from "./signalCloudData.js";

// 按分组渲染技能标签，并为每个标签提供独立外链。
export function SkillGroups({ lang, variant = "default", activeGroup = null, onGroupEnter }) {
  const ids = {
    frontend: "skills-frontend",
    backend: "skills-backend",
    engineering: "skills-engineering",
    "ai-research": "skills-ai-research",
  };

  return (
    <div className={`hero-bottom ${variant === "index" ? "skill-index" : ""}`} data-skill-layout={variant}>
      {siteContent.skillGroups.map((group) => (
        <section
          className={`skill-group${activeGroup === group.key ? " is-linked" : ""}`}
          id={ids[group.key]}
          key={group.key}
          onMouseEnter={() => onGroupEnter?.(group.key)}
          onFocus={() => onGroupEnter?.(group.key)}
          style={{ "--group-color": signalCloudGroupByKey[group.key]?.color || "var(--accent)" }}
        >
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
