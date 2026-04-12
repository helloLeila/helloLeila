// 里程碑趋势图组件，使用 G2 绘制年度增长轨迹。
import { useEffect, useRef } from "react";
import { Chart } from "@antv/g2";

// 根据年度得分数据渲染和台阶贴合的趋势线。
export function MilestoneTrend({ data, maxScore = 160 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) {
      return undefined;
    }

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: maxScore,
    });

    chart.options({
      type: "view",
      data,
      // padding: [top, right, bottom, left]
      // bottom=0 让 y=0 贴底，与台阶底部对齐
      padding: [0, 0, 0, 0],
      scale: {
        x: { domain: [0, data.length - 1], range: [0.083, 0.917] },
        y: { domain: [0, maxScore], nice: false },
      },
      axis: false,
      legend: false,
      children: [
        {
          type: "line",
          encode: { x: "index", y: "score" },
          style: {
            stroke: "#5d83ff",
            lineWidth: 2,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          },
        },
        {
          type: "point",
          encode: { x: "index", y: "score" },
          style: {
            fill: "#ffffff",
            stroke: "#5d83ff",
            lineWidth: 2,
            r: 4,
          },
        },
      ],
      interaction: false,
    });

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [data, maxScore]);

  return <div className="milestone-trend" ref={containerRef} aria-hidden="true" />;
}
