// 简单的语言选择工具，根据当前语言返回对应文案。
export function textByLang(lang, en, zh) {
  return lang === "zh" ? zh : en;
}
