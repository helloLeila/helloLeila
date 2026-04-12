// 里程碑趋势图组件，使用 G2 绘制年度增长轨迹。
import { useEffect, useRef } from "react";
import { Chart } from "@antv/g2";

// 根据年度得分数据渲染台阶上方的趋势线。
export function MilestoneTrend({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) {
      return undefined;
    }

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 164,
    });

    chart.options({
      type: "view",
      data,
      padding: [12, 10, 12, 10],
      scale: {
        x: { range: [0, 1] },
        y: { domain: [0, 100], nice: true },
      },
      axis: false,
      legend: false,
      children: [
        {
          type: "area",
          encode: { x: "year", y: "score" },
          style: {
            fill: "#8fb0ff",
            fillOpacity: 0.12,
          },
        },
        {
          type: "line",
          encode: { x: "year", y: "score" },
          style: {
            stroke: "#3d6fff",
            lineWidth: 2.6,
            opacity: 0.84,
          },
        },
        {
          type: "point",
          encode: { x: "year", y: "score" },
          style: {
            fill: "#ffffff",
            stroke: "#3d6fff",
            lineWidth: 2,
            r: 4.8,
          },
        },
      ],
      interaction: false,
    });

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [data]);

  return <div className="milestone-trend" ref={containerRef} aria-hidden="true" />;
}
