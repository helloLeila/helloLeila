// 证明性内容组件，用于集中展示解决过的问题和智能体相关经验。
import { useState } from "react";
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
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  return (
    <section className="proof-deck" id="section-breakdown">
      <header className="proof-deck-header">
        <div className="proof-deck-kicker">SELECTED WORK / 代表项目</div>
        <div className="proof-deck-context">
          <span>Problems Solved / 解决过的问题</span>
          <span>Selected delivery evidence / 真实交付线索</span>
        </div>
      </header>

      <div className="proof-deck-headline">
        <h2>
          {textByLang(
            lang,
            "The problems I actually solved matter more than the technical vocabulary.",
            "我实际解决过的问题，比技术名词更重要。"
          )}
        </h2>
        <p>
          {textByLang(
            lang,
            "The four projects below cover enterprise portals, agent interaction, zero-to-one foundations, and multi-system integration. I am keeping the original evidence here instead of replacing the work with abstract slogans.",
            "下面四个项目分别对应企业门户、智能体交互、从零搭建和多系统接入。这里保留项目原始信息，不用抽象口号替代真实工作。"
          )}
        </p>
      </div>

      <div className="proof-deck-intro">
        <p className="proof-deck-intro-copy">
          {textByLang(
            lang,
            "Four real project threads, one path from business problems to stable delivery.",
            "四段真实项目经历，一条从业务问题走向稳定交付的主线。"
          )}
        </p>
      </div>

      <div className="proof-project-list">
        {siteContent.problemsSolved.map((item, index) => {
          const project = projectDetails[index] || projectDetails[0];
          const isActive = activeProjectIndex === index;

          return (
            <button
              className={`proof-project-row ${isActive ? "is-active" : ""}`}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveProjectIndex(index)}
              key={item.en}
            >
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
            </button>
          );
        })}
      </div>

      <aside className="proof-ai-note">
        <div className="proof-ai-heading">
          <span>AI PRACTICE / 实践</span>
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
