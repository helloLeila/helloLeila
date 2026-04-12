// 词云模块，使用 AntV 词云表达当前项目中的技术词汇密度。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { SignalCloudPlot } from "./SignalCloudPlot.jsx";

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

  return (
    <section className="word-cloud-card" id="section-signal-cloud">
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
      <div className="cloud-wrap">
        <div className="cloud-grid" aria-hidden="true" />
        <div className="cloud-stage">
          <SignalCloudPlot data={siteContent.signalCloud} />
        </div>
      </div>
    </section>
  );
}
