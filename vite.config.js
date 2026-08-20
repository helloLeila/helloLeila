// Vite 配置文件，根据运行命令切换本地开发和 GitHub Pages 的基路径。
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// 返回当前环境对应的构建配置。
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/helloLeila/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, "index.html"),
        events: path.resolve(rootDir, "events/index.html"),
      },
    },
  },
}));
