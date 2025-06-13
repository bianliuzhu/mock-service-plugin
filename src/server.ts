import express, { Express } from "express";
import watch from "watch";
import chalk from "chalk";
import { cleanCache } from "./util";
import { createRoutes } from "./routes";

const ROUTE_PATH = "./routes";
let routesHandle = createRoutes;

interface ServerOptions {
  path: string;
  port?: number;
}

export function startServer({ path, port = 3000 }: ServerOptions): void {
  const mockPort = port;
  const app: Express = express();

  app.use("/", routesHandle(path));

  watch.watchTree(path, () => {
    cleanCache(require.resolve(ROUTE_PATH));
    try {
      routesHandle = createRoutes;
      console.info("模块更新成功");
    } catch (error) {
      // console.error('这个错误无需关注 %s', error)
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
