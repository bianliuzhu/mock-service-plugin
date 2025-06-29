import express, { Express } from "express";
import watch from "watch";
import chalk from "chalk";
import { createRoutes } from "./routes.js";

interface ServerOptions {
  mockDir: string;
  port?: number;
}

export function startServer({ mockDir, port = 3000 }: ServerOptions): void {
  const mockPort = port;
  const app: Express = express();

  app.use("/", createRoutes(mockDir));

  watch.watchTree(mockDir, () => {
    try {
      // 重新创建路由处理器
      app.use("/", createRoutes(mockDir));
      console.info("模块更新成功");
    } catch (error) {
      console.error("模块更新失败:", error);
    }
  });

  const server = app.listen(mockPort, () => {
    const address = server.address();
    if (address && typeof address !== "string") {
      const host = address.address;
      const port = address.port;

      console.log(
        "\n",
        "------------------------------------",
        "\n",
        chalk.green(`[mock server]: http://localhost:${port}`),
        "\n",
        "------------------------------------",
        "\n"
      );
    }
  });
}
