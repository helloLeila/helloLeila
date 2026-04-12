// React 应用入口，负责把页面挂载到根节点。
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/app.css";

// 使用严格模式挂载整个应用，便于在开发阶段尽早暴露问题。
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
