// 证明性内容组件，用于集中展示解决过的问题和智能体相关经验。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";

// 这些副标题和技术路径只负责给已有项目文案提供阅读入口，不替换原始说明。
const projectDetails = [
  {
    titleEn: "Tongtong Agent",
    titleZh: "通通智能体",
    subtitleEn: "Agent-facing interface",
    subtitleZh: "智能体界面",
    trail: ["sceneCode", "dynamic forms", "state continuity"],
  },
  {
    titleEn: "Process Governance",
    titleZh: "流程治理业务",
    subtitleEn: "Portal + content workflow",
    subtitleZh: "流程门户与内容工作流",
    trail: ["rich-text forms", "permission guards", "micro-frontends"],
  },
  {
    titleEn: "Decision Service",
    titleZh: "决策管理服务集",
    subtitleEn: "0→1 service foundation",
    subtitleZh: "从 0 到 1 服务底座",
    trail: ["dynamic routing", "request interception", "release setup"],
  },
  {
    titleEn: "MDOP Platform",
    titleZh: "mdop 管理运营中台业务",
    subtitleEn: "One entry for many subsystems",
    subtitleZh: "多子系统统一入口",
    trail: ["qiankun", "activeRule", "permission binding"],
  },
];

// 用不等高的项目行呈现原始证据，同时把 AI 经验放在较轻的后续旁注中。
export function ProofDeck({ lang }) {
  return (
    <section className="proof-deck" id="section-breakdown">
      <header className="proof-deck-header">
        <h2>Problems Solved / 解决过的问题</h2>
        <span>Selected delivery evidence / 真实交付线索</span>
      </header>

      <div className="proof-project-list">
        {siteContent.problemsSolved.map((item, index) => {
          const project = projectDetails[index] || projectDetails[0];

          return (
            <article className="proof-project-row" key={item.en}>
              <div className="proof-project-label">
                <span className="proof-project-index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{textByLang(lang, project.titleEn, project.titleZh)}</h3>
                <p>{textByLang(lang, project.subtitleEn, project.subtitleZh)}</p>
              </div>

              <div className="proof-project-copy">
                <p>{textByLang(lang, item.en, item.zh)}</p>
                <div className="proof-project-trail" aria-label="Technical path / 技术路径">
                  {project.trail.map((step) => (
                    <span key={step}>{step}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="proof-ai-note">
        <div className="proof-ai-heading">
          <span>AI / 04</span>
          <h3>AI Agent Knowledge / AI Agent 知识技能</h3>
        </div>
        <ul>
          {siteContent.aiKnowledge.map((item) => (
            <li key={item.en}>{textByLang(lang, item.en, item.zh)}</li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
