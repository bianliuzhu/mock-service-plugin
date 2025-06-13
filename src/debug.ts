import { startServer } from "./server.js";
import path from "path";
import { getDirname } from "./util.js";

// 启动开发服务器
startServer({
  path: path.join(getDirname(import.meta.url), "../mocks"), // 使用 path.join 构建正确的相对路径
  port: 3000, // 开发服务器端口
});
