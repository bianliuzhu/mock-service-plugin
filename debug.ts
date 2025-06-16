import { startServer } from "./src/server.js";
import path from "path";
import { getDirname } from "./src/util.js";

// 启动开发服务器 按 F5 启动调试
startServer({
  path: path.join(getDirname(import.meta.url), "./mocks"), // 使用项目内的 mocks 目录
  port: 3720, // 开发服务器端口
});
