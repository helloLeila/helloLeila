// 证明性内容组件，用于集中展示解决过的问题和智能体相关经验。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";

// 渲染两张证明卡片，突出真实问题与能力沉淀。
export function ProofDeck({ lang }) {
  return (
    <div className="proof-deck">
      <article className="proof-card" id="section-breakdown">
        <h3>Problems Solved / 解决过的问题</h3>
        <ul>
          {siteContent.problemsSolved.map((item) => (
            <li key={item.en}>{textByLang(lang, item.en, item.zh)}</li>
          ))}
        </ul>
      </article>

      <article className="proof-card">
        <h3>AI Agent Knowledge / AI Agent 知识技能</h3>
        <ul>
          {siteContent.aiKnowledge.map((item) => (
            <li key={item.en}>{textByLang(lang, item.en, item.zh)}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
