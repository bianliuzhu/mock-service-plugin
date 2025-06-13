import { startServer } from "./src/server.js";
import path from "path";
import { getDirname } from "./src/util.js";
import { fileURLToPath } from "url";

// 启动开发服务器
startServer({
  path: path.join(getDirname(import.meta.url), "../routes-data"), // 使用 path.join 构建正确的相对路径
  port: 3720, // 开发服务器端口
});
