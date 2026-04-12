// 首屏事实卡组件，用于展示交付规模与结果信号。
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";

// 按当前语言渲染四张事实卡。
export function StatsRow({ lang }) {
  return (
    <div className="stats-row">
      {siteContent.stats.map((item) => (
        <article className="stat-card" key={item.en}>
          <strong>{item.value ?? textByLang(lang, item.valueEn, item.valueZh)}</strong>
          <p>{textByLang(lang, item.en, item.zh)}</p>
        </article>
      ))}
    </div>
  );
}
