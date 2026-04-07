const themeData = [];

if (typeof module !== "undefined") {
  module.exports = { themeData };
}

if (typeof window !== "undefined") {
  window.themeData = themeData;
}
