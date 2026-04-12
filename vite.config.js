// Vite 配置文件，根据运行命令切换本地开发和 GitHub Pages 的基路径。
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 返回当前环境对应的构建配置。
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/helloLeila/" : "/",
}));
