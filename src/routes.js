const fs = require("fs");
const nodePath = require("path");
const chalk = require("chalk");
const responseTemplate = fs.readFileSync(
  nodePath.join(__dirname, "doc.html"),
  "utf8"
);

const { parseMocksFile } = require("./parse-mocks-file");
const ResponseHandlerFactory = require("./response/handler-factory");
const { matchRoute } = require("./util");

function mock(path) {
  return async function (req, res, next) {
    const mockRoutes = parseMocksFile(path);

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
            nodePath.extname(matchedRoute.file)
          );

        // 获取对应的响应处理器
        const handler = ResponseHandlerFactory.getHandler(contentType);

        // 处理响应
        await handler.handle(req, res, matchedRoute);

        mock.debug &&
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

mock.debug = true;

module.exports = {
  mock,
};
