// 每日实时面板数据脚本，负责抓取天气和技术快讯并写入公开 JSON。
import fs from "node:fs/promises";
import path from "node:path";

const outputPath = path.resolve(process.cwd(), "public/live-panel.json");

const fallbackNews = [
  { title: "React 18 docs and concurrent UI guidance", url: "https://react.dev/" },
  { title: "Vite guide for modern frontend delivery", url: "https://vite.dev/guide/" },
  { title: "AntV examples for visual product surfaces", url: "https://g2.antv.antgroup.com/examples" },
  { title: "OpenAI agents guide and workflow building", url: "https://platform.openai.com/docs/guides/agents" },
  { title: "qiankun micro-frontend patterns", url: "https://qiankun.umijs.org/" }
];

// 把天气代码映射成站点展示所需的中英文天气文案。
function mapWeatherCode(code) {
  const map = {
    0: { en: "Clear", zh: "晴" },
    1: { en: "Mostly clear", zh: "少云" },
    2: { en: "Partly cloudy", zh: "多云" },
    3: { en: "Cloudy", zh: "阴" },
    45: { en: "Fog", zh: "雾" },
    61: { en: "Rain", zh: "小雨" },
    63: { en: "Rain", zh: "中雨" },
    65: { en: "Heavy rain", zh: "大雨" }
  };

  return map[code] ?? { en: "Live", zh: "实时" };
}

// 拉取深圳天气和小时温度数据，供实时面板使用。
async function fetchWeather() {
  const latitude = 22.5431;
  const longitude = 114.0579;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m&timezone=Asia%2FShanghai&forecast_days=1`;

  const response = await fetch(url);
  const data = await response.json();

  const hourly = (data.hourly?.time || []).map((time, index) => ({
    time: time.slice(11, 16),
    temperature: data.hourly.temperature_2m[index]
  }));

  return {
    city: "Shenzhen",
    temperature: data.current?.temperature_2m ?? 26,
    humidity: data.current?.relative_humidity_2m ?? 68,
    condition: mapWeatherCode(data.current?.weather_code),
    hourly: hourly.slice(0, 6)
  };
}

// 拉取 Hacker News 前五条可展示新闻。
async function fetchNews() {
  const ids = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json").then((res) => res.json());
  const items = await Promise.all(
    ids.slice(0, 5).map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((res) => res.json())
    )
  );

  return items
    .filter(Boolean)
    .slice(0, 5)
    .map((item) => ({
      title: item.title,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`
    }));
}

// 组装最终数据载荷并写入 public 目录。
async function main() {
  let weather;
  let news;

  try {
    [weather, news] = await Promise.all([fetchWeather(), fetchNews()]);
  } catch (error) {
    console.warn("Falling back to bundled live panel data:", error instanceof Error ? error.message : error);
    weather = {
      city: "Shenzhen",
      temperature: 27,
      humidity: 70,
      condition: { en: "Partly cloudy", zh: "多云" },
      hourly: [
        { time: "08:00", temperature: 23 },
        { time: "10:00", temperature: 25 },
        { time: "12:00", temperature: 27 },
        { time: "14:00", temperature: 29 },
        { time: "16:00", temperature: 28 },
        { time: "18:00", temperature: 27 }
      ]
    };
    news = fallbackNews;
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    weather,
    news
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`live panel written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
