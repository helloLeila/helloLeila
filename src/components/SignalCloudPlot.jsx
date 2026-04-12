// 词云渲染组件，直接使用 G2 的 wordCloud 标记绘制技术栈关键词。
import { useEffect, useRef } from "react";
import { Chart } from "@antv/g2";
import { createSignalCloudOptions } from "./signalCloudOptions.js";

// 根据传入的技术栈数据初始化并销毁词云图实例。
export function SignalCloudPlot({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) {
      return undefined;
    }

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 360,
    });

    chart.options(createSignalCloudOptions(data));
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [data]);

  return <div className="signal-cloud-plot" ref={containerRef} aria-label="技术栈词云" />;
}
