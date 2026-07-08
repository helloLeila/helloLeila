// 实时面板数据 Hook，负责读取天气与技术快讯，并在失败时回退到本地数据。
import { useEffect, useMemo, useState } from "react";
import { siteContent } from "../data/siteContent.js";

// 生成当前部署环境下的实时面板地址，兼容本地预览和 Pages 部署。
function getPanelUrl() {
  const baseUrl = import.meta?.env?.BASE_URL || "/";
  return `${baseUrl.replace(/\/?$/, "/")}live-panel.json`;
}

// 为回退数据生成七天早晚温度结构，保证天气卡片始终可渲染。
function buildFallbackDailyForecast() {
  const weekdayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayZh = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const seed = [
    [24, 29],
    [23, 28],
    [24, 30],
    [25, 31],
    [25, 30],
    [24, 29],
    [23, 28],
  ];

  return seed.map(([morningTemperature, eveningTemperature], index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      date: date.toISOString().slice(0, 10),
      labelEn: weekdayEn[date.getDay()],
      labelZh: weekdayZh[date.getDay()],
      morningTemperature,
      eveningTemperature,
      swing: eveningTemperature - morningTemperature,
    };
  });
}

function normalizeNewsItem(item, lang) {
  const title = item?.title || (lang === "zh" ? "每日快讯" : "Daily brief");
  const summary = lang === "zh" ? item?.summaryZh : item?.summaryEn;

  return {
    title,
    url: item?.url || "#",
    source: item?.source || "",
    summary: summary || item?.summaryZh || item?.summaryEn || "",
    whyItMatters: item?.whyItMattersZh || "",
    tags: Array.isArray(item?.tags) ? item.tags.slice(0, 4) : [],
  };
}

// 根据语言返回天气与新闻数据，供实时面板模块直接消费。
export function useWeatherNews(lang) {
  const [weather, setWeather] = useState(null);
  const [codexNews, setCodexNews] = useState([]);
  const [news, setNews] = useState(() =>
    siteContent.newsFallback.slice(0, 5).map((item) => normalizeNewsItem(item, lang)),
  );
  const panelUrl = getPanelUrl();

  useEffect(() => {
    let cancelled = false;

    // 拉取每日刷新的实时面板数据，并在失败时回退到默认内容。
    async function loadPanel() {
      try {
        const response = await fetch(panelUrl, { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;

        setWeather({
          city: data.weather?.city || siteContent.weather.city,
          temperature: data.weather?.temperature ?? "--",
          humidity: data.weather?.humidity ?? "--",
          condition: data.weather?.condition?.[lang] || (lang === "zh" ? "实时" : "Live"),
          typhoonEta: data.weather?.typhoonEta || { en: "No active alert", zh: "暂无台风预警" },
          daily: data.weather?.daily || buildFallbackDailyForecast(),
          updatedAt: data.updatedAt || "",
        });
        const nextCodexNews = Array.isArray(data.codexNews) ? data.codexNews : [];
        const nextNews = Array.isArray(data.news) && data.news.length ? data.news : siteContent.newsFallback;
        setCodexNews(nextCodexNews.slice(0, 5).map((item) => normalizeNewsItem(item, lang)));
        setNews(nextNews.slice(0, 5).map((item) => normalizeNewsItem(item, lang)));
      } catch {
        if (!cancelled) {
          setWeather({
            city: siteContent.weather.city,
            temperature: 26,
            humidity: 71,
            condition: lang === "zh" ? "网络回退" : "Fallback",
            typhoonEta: { en: "No active alert", zh: "暂无台风预警" },
            daily: buildFallbackDailyForecast(),
            updatedAt: new Date().toISOString(),
          });
          setCodexNews([]);
          setNews(siteContent.newsFallback.slice(0, 5).map((item) => normalizeNewsItem(item, lang)));
        }
      }
    }

    loadPanel();

    return () => {
      cancelled = true;
    };
  }, [lang, panelUrl]);

  return useMemo(() => ({ weather, news, codexNews }), [weather, news, codexNews]);
}
