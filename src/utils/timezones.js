// 时区工具函数，用于把不同时区格式化成统一的时分秒字符串。
export function formatZonedTime(timeZone, locale = "zh-CN", date = new Date()) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

// 根据当前语言生成北京、纽约和欧洲的时区展示数据。
export function getClockEntries(lang, date = new Date()) {
  return [
    {
      key: "beijing",
      label: lang === "zh" ? "北京时间" : "Beijing",
      value: formatZonedTime("Asia/Shanghai", lang === "zh" ? "zh-CN" : "en-US", date),
    },
    {
      key: "new-york",
      label: lang === "zh" ? "纽约时间" : "New York",
      value: formatZonedTime("America/New_York", lang === "zh" ? "zh-CN" : "en-US", date),
    },
    {
      key: "berlin",
      label: lang === "zh" ? "欧洲时间" : "Europe",
      value: formatZonedTime("Europe/Berlin", lang === "zh" ? "zh-CN" : "en-US", date),
    },
  ];
}
