import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Request, Response, NextFunction } from "express";
import { parseMocksFile } from "./parse-mocks-file";
import { ResponseHandlerFactory } from "./response/handler-factory";
import { matchRoute } from "./util";

const responseTemplate = fs.readFileSync(
  path.join(__dirname, "../index.html"),
  "utf8"
);

export function createRoutes(mockPath: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const mockRoutes = parseMocksFile(mockPath);

    if (req.url === "/") {
      return res.send(
        responseTemplate.replace("@menuList", JSON.stringify(mockRoutes))
      );
    }

    // 处理 CORS 预检请求
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,POST,DELETE,PATCH");
      const allowedHeaders = req.headers["access-control-request-headers"];
      if (allowedHeaders) {
        res.set("Access-Control-Allow-Headers", allowedHeaders);
      }
      return res.send("");
    }

    // 查找匹配的路由
    const matchedRoute = matchRoute(mockRoutes, req.method, req.url);

    if (matchedRoute) {
      try {
        // 获取内容类型
        const contentType =
          matchedRoute.contentType ||
          ResponseHandlerFactory.getContentTypeByExtension(
            path.extname(matchedRoute.filepath)
          );

        // 获取对应的响应处理器
        const handler = ResponseHandlerFactory.getHandler(contentType);

        // 处理响应
        await handler.handle(req, res, matchedRoute);

        console.log(chalk.magentaBright("- [Mock Interface] "), req.url);
      } catch (error) {
        console.error(
          chalk.red(`[Mock Error] Failed to mock response for ${req.url}:`),
          error
        );
        res.status(500).json({ error: "Failed to generate mock response" });
      }
    } else {
      next();
    }
  };
}
