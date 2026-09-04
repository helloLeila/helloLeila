export const SOURCE_CONFIG_PATH = "/__events/source-config";

export function normalizeSourceName(value) {
  const name = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!name) throw new Error("source name is required");
  return name;
}

export function buildSourceSearchQuery(name) {
  return `"${normalizeSourceName(name)}" 微信公众号 活动`;
}

export function filterSourceNames(sources, query) {
  const needle = String(query ?? "").trim().toLowerCase();
  if (!needle) return sources;
  return sources.filter((source) => String(source?.name ?? "").toLowerCase().includes(needle));
}

export function sourceStatusLabel(source) {
  if (source?.status === "ok") return "已接入";
  if (source?.status === "failed") return "读取失败";
  if (source?.discoveryStatus === "confirmed") return "已确认";
  if (source?.discoveryStatus === "unavailable" || source?.status === "unavailable") return "暂不可用";
  return "待确认";
}

export async function readProjectSourceConfig() {
  const response = await fetch(SOURCE_CONFIG_PATH, { cache: "no-store" });
  if (!response.ok) throw new Error("local source config API unavailable");
  return response.json();
}

export async function writeProjectSourceConfig(sources) {
  const response = await fetch(SOURCE_CONFIG_PATH, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources }),
  });
  if (!response.ok) throw new Error("project source config could not be saved");
  return response.json();
}
