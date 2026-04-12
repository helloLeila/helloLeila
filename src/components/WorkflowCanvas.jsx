// 工作流画布组件，用于把真实项目中的产品链路浓缩成结构化节点。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";

// 渲染单个工作流节点，统一左右两列节点的展示方式。
function NodeCard({ node, lang, className }) {
  return (
    <div className={`workflow-node ${className}`}>
      <strong>{textByLang(lang, node.titleEn, node.titleZh)}</strong>
      <span>{textByLang(lang, node.subtitleEn, node.subtitleZh)}</span>
    </div>
  );
}

// 渲染企业级工作流设计区，展示项目节点与能力节点之间的关系。
export function WorkflowCanvas({ lang }) {
  const { workflowSection } = siteContent;

  return (
    <section className="graph-card" id="section-workflow">
      <div className="section-head">
        <div className="section-kicker">
          {workflowSection.kickerEn} / {workflowSection.kickerZh}
        </div>
        <h2>
          {workflowSection.titleEn} / {workflowSection.titleZh}
        </h2>
        <p>{textByLang(lang, workflowSection.descriptionEn, workflowSection.descriptionZh)}</p>
      </div>

      <div className="workflow-layout">
        <svg className="workflow-lines" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
          <path d="M210,80 C342,92 402,118 520,118" />
          <path d="M210,80 C334,164 404,178 520,196" />
          <path d="M210,80 C336,252 406,266 520,292" />
          <path d="M210,80 C326,352 406,382 520,398" />
          <path d="M210,190 C338,178 402,156 520,118" />
          <path d="M210,190 C342,214 404,218 520,196" />
          <path d="M210,190 C340,284 404,300 520,292" />
          <path d="M210,190 C336,376 404,390 520,398" />
          <path d="M210,318 C338,282 406,252 520,196" />
          <path d="M210,318 C342,320 404,314 520,292" />
          <path d="M210,318 C340,402 404,410 520,398" />
          <path d="M210,430 C336,388 404,360 520,292" />
          <path d="M210,430 C336,438 404,434 520,398" />
        </svg>

        <div className="workflow-column workflow-column-left">
          {workflowSection.leftNodes.map((node) => (
            <NodeCard className="project-node" key={node.titleEn} lang={lang} node={node} />
          ))}
        </div>

        <div className="workflow-column workflow-column-right">
          {workflowSection.rightNodes.map((node) => (
            <NodeCard className="capability-node" key={node.titleEn} lang={lang} node={node} />
          ))}
        </div>
      </div>
    </section>
  );
}
