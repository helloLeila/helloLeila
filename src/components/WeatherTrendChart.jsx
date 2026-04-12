// 天气趋势图组件，使用 G2 绘制七天早晚温度变化。
import { useEffect, useRef } from "react";
import { Chart } from "@antv/g2";

// 折线图里的温度标签统一格式化，避免小数位展示忽长忽短。
function formatTemperature(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

// 根据传入的七天天气数据渲染一个双折线温度图。
export function WeatherTrendChart({ data, lang = "zh" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) {
      return undefined;
    }

    const periodLabels =
      lang === "zh"
        ? { morning: "早间", evening: "晚间" }
        : { morning: "Morning", evening: "Evening" };

    const chartData = data.flatMap((item) => {
      const dayNumber = item.date ? item.date.slice(-2) : "--";
      const weekdayLabel = lang === "zh" ? item.labelZh : item.labelEn;
      return [
        {
          day: `${dayNumber}\n${weekdayLabel}`,
          period: periodLabels.morning,
          temperature: item.morningTemperature,
          text: `${formatTemperature(item.morningTemperature)}°`,
        },
        {
          day: `${dayNumber}\n${weekdayLabel}`,
          period: periodLabels.evening,
          temperature: item.eveningTemperature,
          text: `${formatTemperature(item.eveningTemperature)}°`,
        },
      ];
    });
    const minTemperature = Math.min(...chartData.map((item) => item.temperature));
    const maxTemperature = Math.max(...chartData.map((item) => item.temperature));

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 194,
    });

    chart.options({
      type: "view",
      data: chartData,
      padding: [18, 16, 34, 30],
      scale: {
        x: { range: [0.02, 0.98] },
        y: { domain: [minTemperature - 2, maxTemperature + 2], nice: false },
        color: {
          domain: [periodLabels.morning, periodLabels.evening],
          range: ["#18bfae", "#3d6fff"],
        },
      },
      axis: {
        x: {
          tick: false,
          title: false,
          labelFill: "#5e7398",
          labelFontSize: 10,
          labelLineHeight: 14,
          grid: false,
        },
        y: {
          title: false,
          labelFill: "#5e7398",
          labelFontSize: 11,
          gridStroke: "rgba(67, 110, 206, 0.12)",
        },
      },
      children: [
        {
          type: "line",
          encode: { x: "day", y: "temperature", color: "period" },
          style: {
            lineWidth: 2.8,
            opacity: 0.94,
          },
        },
        {
          type: "point",
          encode: { x: "day", y: "temperature", color: "period", shape: "period" },
          style: {
            fill: "#ffffff",
            lineWidth: 1.8,
            r: 4.2,
          },
        },
        {
          type: "text",
          encode: { x: "day", y: "temperature", text: "text", color: "period" },
          style: {
            fontSize: 10,
            fontWeight: 600,
            dy: (datum) => (datum.period === periodLabels.morning ? -14 : 16),
          },
        },
      ],
      interaction: {
        tooltip: {
          render: (event, { title, items }) => {
            const rows = (items || [])
              .map(
                (item) =>
                  `<div style="display:flex;justify-content:space-between;gap:18px;">
                    <span>${item.name}</span>
                    <strong>${formatTemperature(Number(item.value))}°C</strong>
                  </div>`
              )
              .join("");
            return `<div style="padding:8px 10px;font-size:12px;color:#18315f;min-width:116px;">
              <div style="margin-bottom:6px;font-weight:700;">${title}</div>
              ${rows}
            </div>`;
          },
        },
      },
      legend: {
        color: {
          position: "top-left",
          itemLabelFill: "#5e7398",
          itemLabelFontSize: 11,
          rowPadding: 2,
          itemMarkerFillOpacity: 0.92,
        },
      },
    });

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [data, lang]);

  return <div className="g2-mini-chart" ref={containerRef} />;
}
