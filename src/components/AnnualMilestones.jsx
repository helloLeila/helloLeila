// 年度里程碑组件，负责组合趋势图、摘要芯片和台阶式时间轴。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { MilestoneTrend } from "./MilestoneTrend.jsx";

// 台阶高度：指数式递增，视觉节奏感更强
const heights = [92, 104, 130, 160, 194, 232];
const stepTone = ["origin", "ramp", "ramp", "system", "system", "current"];

// 按语言渲染年度里程碑的摘要信息、趋势图和时间台阶。
export function AnnualMilestones({ lang }) {
  // 折线得分直接映射台阶高度，确保折点锚在台阶顶部
  const trendMax = heights[heights.length - 1];
  const trendData = siteContent.roadmap.steps.map((step, index) => ({
    index,
    year: step.year,
    score: heights[index],
  }));

  return (
    <section className="roadmap-card" id="section-roadmap">
      <div className="section-head compact">
        <div className="section-kicker">{textByLang(lang, "Growth Route", "成长路线")}</div>
        <h2>{textByLang(lang, siteContent.roadmap.titleEn, siteContent.roadmap.titleZh)}</h2>
        <p>{textByLang(lang, siteContent.roadmap.descriptionEn, siteContent.roadmap.descriptionZh)}</p>
      </div>

      <div className="roadmap-focus-row">
        {siteContent.roadmap.focus.map((item) => (
          <div className="roadmap-focus-chip" key={item.labelEn}>
            <span>{textByLang(lang, item.labelEn, item.labelZh)}</span>
            <strong>{textByLang(lang, item.valueEn, item.valueZh)}</strong>
          </div>
        ))}
      </div>

      <div className="roadmap-surface">
        <div className="roadmap-grid-lines" aria-hidden="true" />
        <div className="roadmap-stage">
          <MilestoneTrend data={trendData} maxScore={trendMax} />
          <div className="roadmap-track">
            {siteContent.roadmap.steps.map((step, index) => (
              <div
                className={`road-step is-${stepTone[index]}`}
                key={step.year}
                style={{ "--step-height": `${heights[index]}px` }}
              >
                <em>0{index + 1}</em>
                <strong>{step.year}</strong>
                <span>{textByLang(lang, step.en, step.zh)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
