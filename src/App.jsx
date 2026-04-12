// 页面总装配组件，负责串联首屏、图表区、地图区和实时面板。
import { useEffect, useState } from "react";
import { HeroStage } from "./components/HeroStage.jsx";
import { WorkflowCanvas } from "./components/WorkflowCanvas.jsx";
import { SignalCloud } from "./components/SignalCloud.jsx";
import { AnnualMilestones } from "./components/AnnualMilestones.jsx";
import { CoverageField } from "./components/CoverageField.jsx";
import { UtilitiesPanel } from "./components/UtilitiesPanel.jsx";
import { WorkLinks } from "./components/WorkLinks.jsx";
import { useWeatherNews } from "./hooks/useWeatherNews.js";

// 根据当前语言和实时数据渲染完整个人网站页面。
export default function App() {
  const [lang, setLang] = useState("zh");
  const { weather, news } = useWeatherNews(lang);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  return (
    <div className="page">
      <div className="page-grid" aria-hidden="true" />
      <div className="page-glow glow-a" aria-hidden="true" />
      <div className="page-glow glow-b" aria-hidden="true" />

      <main className="shell">
        <HeroStage lang={lang} setLang={setLang} />

        <section className="insight-section">
          <div className="insight-grid">
            <WorkflowCanvas lang={lang} />
            <div className="right-rail">
              <SignalCloud lang={lang} />
              <AnnualMilestones lang={lang} />
            </div>
          </div>

          <CoverageField lang={lang} weather={weather} />
          <UtilitiesPanel lang={lang} news={news} weather={weather} />
          <WorkLinks />
        </section>
      </main>
    </div>
  );
}
