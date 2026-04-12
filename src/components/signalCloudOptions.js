// 词云配置工厂，统一生成 G2 词云图所需的布局和样式选项。

const signalCloudPalette = ["#24437c", "#3d6fff", "#1aa694", "#ff9a62", "#5d73a5"];

// 根据词云数据生成 G2 配置，确保技术栈关键词能够稳定且密集地排布。
export function createSignalCloudOptions(data) {
  return {
    type: "view",
    padding: 0,
    axis: false,
    legend: false,
    tooltip: false,
    children: [
      {
        type: "wordCloud",
        data,
        encode: {
          text: "word",
          value: "value",
        },
        tooltip: false,
        layout: {
          spiral: "rectangular",
          rotate: 0,
          fontSize: [7, 32],
          padding: 2,
        },
        style: {
          fontFamily: "Space Grotesk, JetBrains Mono, Noto Sans SC, sans-serif",
          fontWeight: (datum) => (datum.value >= 88 ? 700 : datum.value >= 60 ? 600 : 500),
          fill: (_, index) => signalCloudPalette[index % signalCloudPalette.length],
        },
      },
    ],
    interaction: false,
  };
}
