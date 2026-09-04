// 词云模块：用能力轨道解释技术词汇如何回到真实项目和交付。
import { useState } from "react";
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { SignalCloudPlot } from "./SignalCloudPlot.jsx";
import { SkillGroups } from "./SkillGroups.jsx";
import { signalCloudGroupByKey, signalCloudGroupByWord, signalCloudGroups } from "./signalCloudData.js";

// 根据当前词云数据动态生成摘要标签，避免数量和配置脱节。
function getCloudTags(count) {
  return {
    en: [`${count} stack terms`, "React · Java · JavaScript", "AntV · G2 · L7"],
    zh: [`${count} 个技术关键词`, "React · Java · JavaScript", "AntV · G2 · L7"],
  };
}

// 按当前语言渲染能力词云和顶部摘要标签。
export function SignalCloud({ lang }) {
  const cloudTags = getCloudTags(siteContent.signalCloud.length);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeWord, setActiveWord] = useState(null);
  const selectedGroup = activeGroup ? signalCloudGroupByKey[activeGroup] : null;
  const reset = () => {
    setActiveGroup(null);
    setActiveWord(null);
  };
  const focusGroup = (key, word = null) => {
    setActiveGroup(key);
    setActiveWord(word);
  };

  return (
    <section className="word-cloud-card" id="section-signal-cloud" onMouseLeave={reset}>
      <div className="signal-cloud-layout">
        <div className="signal-cloud-main">
          <div className="section-head compact">
            <div className="section-kicker">{textByLang(lang, "Signal Cloud", "能力词云")}</div>
            <h2>{textByLang(lang, "Technical vocabulary", "技术表达")}</h2>
            <p>
              {textByLang(
                lang,
                "A dynamic word cloud visualizing the technical terms and tools that frequently appear in my projects, reflecting the current focus and trends in my work.",
                "一个动态词云，展示了在我的项目中频繁出现的技术术语和工具，反映了我工作中的当前重点和趋势。"
              )}
            </p>
          </div>
          <div className="cloud-meta-row" aria-label={textByLang(lang, "Cloud highlights", "词云摘要")}>
            {cloudTags[lang].map((tag) => (
              <span className="cloud-meta-pill" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="signal-layer-track" aria-label={textByLang(lang, "Ability layers", "能力方向")}>
            {signalCloudGroups.map((group) => (
              <div
                className={`signal-layer${activeGroup === group.key ? " is-active" : ""}`}
                key={group.key}
                onMouseEnter={() => focusGroup(group.key)}
                style={{ "--layer-color": group.color }}
              >
                <strong>{textByLang(lang, group.titleEn, group.titleZh)}</strong>
                <span>{textByLang(lang, group.descriptionEn, group.descriptionZh)}</span>
              </div>
            ))}
          </div>
          <div className="cloud-wrap">
            <div className="cloud-grid" aria-hidden="true" />
            <div className="cloud-stage">
              <SignalCloudPlot
                data={siteContent.signalCloud}
                activeGroup={activeGroup}
                activeWord={activeWord}
                groupByWord={signalCloudGroupByWord}
                onWordEnter={focusGroup}
              />
            </div>
          </div>
        </div>

        <aside className="signal-cloud-index" aria-label={textByLang(lang, "Skill index", "能力分类索引")}>
          <div className="signal-index-note signal-index-current">
            <span>{selectedGroup ? textByLang(lang, selectedGroup.titleEn, selectedGroup.titleZh) : textByLang(lang, "Current layer", "当前方向")}</span>
            <strong>
              {selectedGroup
                ? textByLang(lang, selectedGroup.descriptionEn, selectedGroup.descriptionZh)
                : textByLang(lang, "Technology, projects, and delivery meet here.", "技术、项目和交付在这里相遇。")}
            </strong>
            {selectedGroup ? <p>{textByLang(lang, selectedGroup.detailZh, selectedGroup.detailZh)}</p> : null}
            {selectedGroup ? <div className="signal-project-note"><span>{textByLang(lang, "Connected work", "关联项目")}</span><b>{selectedGroup.projectsZh}</b></div> : null}
            {activeWord ? <em className="signal-word-note">{activeWord}</em> : null}
          </div>
          <SkillGroups lang={lang} variant="index" />
        </aside>
      </div>
    </section>
  );
}
