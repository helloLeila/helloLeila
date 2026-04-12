// 年度里程碑组件，负责组合趋势图、摘要芯片和台阶式时间轴。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { MilestoneTrend } from "./MilestoneTrend.jsx";

const heights = [52, 70, 90, 112, 136, 160];
const scores = [18, 32, 48, 66, 84, 98];
const stepTone = ["origin", "ramp", "ramp", "system", "system", "current"];

// 按语言渲染年度里程碑的摘要信息、趋势图和时间台阶。
export function AnnualMilestones({ lang }) {
  const trendData = siteContent.roadmap.steps.map((step, index) => ({
    year: step.year,
    score: scores[index],
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
        <MilestoneTrend data={trendData} />
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
    </section>
  );
}
