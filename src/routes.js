const fs = require("fs");
const path = require("path");
const Mock = require("mockjs");
const chalk = require("chalk");
const Random = Mock.Random;
const template = fs.readFileSync(path.join(__dirname, "doc.html"), "utf8");

const { cleanCache, isJavacriptFile } = require("./util");

const parseAPIs = require("./mock");

function handleSSEResponse(route, req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendEvent = (item) => {
    let message = "";
    if (item.id) message += `id: ${item.id}\n`;
    if (item.event) message += `event: ${item.event}\n`;
    if (item.data) {
      const dataStr =
        typeof item.data === "string" ? item.data : JSON.stringify(item.data);
      message += `data: ${dataStr}\n`;
    }
    if (item.retry) message += `retry: ${item.retry}\n`;
    res.write(message + "\n");
  };

  try {
    const mockData = new Function("return (" + route.content + ")")();

    if (mockData && mockData.stream === true) {
      const data = Mock.mock(mockData);
      const interval = data.interval || 1000;

      if (Array.isArray(data.items)) {
        let index = 0;
        const sendNext = () => {
          if (index < data.items.length) {
            sendEvent(data.items[index]);
            index++;
            setTimeout(sendNext, interval);
          } else {
            res.end();
          }
        };
        sendNext();
      } else {
        sendEvent({ data });
        res.end();
      }
    } else {
      sendEvent({ data: Mock.mock(mockData) });
      res.end();
    }
  } catch (e) {
    console.error("[SSE Error]:", e);
    res.write(`data: ${JSON.stringify({ error: "Mock data error" })}\n\n`);
    res.end();
  }

  req.on("close", () => {
    console.log("Client closed SSE connection");
  });
}

function handleStaticResponse(route, res) {
  const contentType = route.contentType || "application/json";

  // 直接返回原始内容的情况
  if (
    contentType.includes("text/plain") ||
    contentType.includes("text/html") ||
    contentType.includes("text/css") ||
    contentType.includes("text/markdown") ||
    contentType.includes("application/javascript")
  ) {
    return res.send(route.content);
  }

  try {
    // 尝试解析为 JavaScript 对象
    const mockData = new Function("return (" + route.content + ")")();
    const mockedData = Mock.mock(mockData);

    // 根据内容类型返回不同格式
    if (contentType.includes("application/json")) {
      return res.json(mockedData);
    } else if (contentType.includes("application/xml")) {
      return res.type("xml").send(mockedData);
    } else if (contentType.includes("text/csv")) {
      return res.type("csv").send(mockedData);
    } else if (contentType.includes("application/x-yaml")) {
      return res.type("yaml").send(mockedData);
    } else {
      // 默认返回 JSON
      return res.json(mockedData);
    }
  } catch (e) {
    // 解析失败时直接返回原始内容
    return res.send(route.content);
  }
}
function mock(path) {
  return function (req, res, next) {
    if (req.url === "/") {
      const apis = parseAPIs(path);
      const menuList = Object.keys(apis).map((url) => ({
        title: url,
        url: url,
        file: apis[url].filepath || "内联数据",
      }));

      return res.send(template.replace("@menuList", JSON.stringify(menuList)));
    }

    const apis = parseAPIs(path);

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,POST,DELETE,PATCH");

    const allowedHeaders = req.headers["access-control-request-headers"];

    if (allowedHeaders) {
      res.set("Access-Control-Allow-Headers", allowedHeaders);
    }

    if (req.method === "OPTIONS") {
      return res.send("");
    }

    const url = req.url.split("?")[0];
    const urlSegments = url.split("/").filter(Boolean);
    const method = req.method.toUpperCase();

    // 获取查询参数
    const queryParams = new URLSearchParams(req.url.split("?")[1] || "");
    const queryKeys = Array.from(queryParams.keys());

    let matchedRoute = null;
    let routeParams = {};

    // 优化路由匹配算法：优先匹配静态路由，再匹配参数路由
    const apiPaths = Object.keys(apis);

    // 先尝试匹配静态路由
    for (const apiPath of apiPaths) {
      const [routeMethod, path] = apiPath.includes(":")
        ? apiPath.split(":", 2)
        : [null, apiPath];

      if (routeMethod && routeMethod !== method) continue;

      // 检查路径是否匹配
      if (path === url) {
        // 检查查询参数
        const routeQueryParams = path.split("?")[1];
        if (routeQueryParams) {
          const routeQueryKeys = routeQueryParams
            .split("&")
            .map((param) => param.split("=")[0]);
          // 检查是否所有路由定义的查询参数都在请求中存在
          const hasAllQueryParams = routeQueryKeys.every((key) =>
            queryKeys.includes(key)
          );
          if (!hasAllQueryParams) continue;
        }
        matchedRoute = apis[apiPath];
        break;
      }
    }

    // 如果没有匹配到静态路由，尝试匹配参数路由
    if (!matchedRoute) {
      for (const apiPath of apiPaths) {
        const [routeMethod, path] = apiPath.includes(":")
          ? apiPath.split(":", 2)
          : [null, apiPath];

        if (routeMethod && routeMethod !== method) continue;

        const apiSegments = path.split("/").filter(Boolean);
        if (urlSegments.length !== apiSegments.length) continue;

        let isMatch = true;
        const params = {};

        for (let i = 0; i < apiSegments.length; i++) {
          const apiSegment = apiSegments[i];
          const urlSegment = urlSegments[i];

          if (apiSegment.startsWith(":")) {
            params[apiSegment.slice(1)] = urlSegment;
          } else if (apiSegment !== urlSegment) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          // 检查查询参数
          const routeQueryParams = path.split("?")[1];
          if (routeQueryParams) {
            const routeQueryKeys = routeQueryParams
              .split("&")
              .map((param) => param.split("=")[0]);
            // 检查是否所有路由定义的查询参数都在请求中存在
            const hasAllQueryParams = routeQueryKeys.every((key) =>
              queryKeys.includes(key)
            );
            if (!hasAllQueryParams) continue;
          }
          matchedRoute = apis[apiPath];
          routeParams = params;
          break;
        }
      }
    }

    const route = matchedRoute || {};

    req.params = routeParams;

    if (!route.filepath) {
      return next();
    }

    mock.debug && console.log(chalk.magentaBright("- [Mock Interface] "), url);

    // 处理非 JavaScript 文件
    if (!isJavacriptFile(route.filepath)) {
      try {
        // 设置响应的 content-type
        res.set("Content-Type", route.contentType || "application/json");

        const contentType = route.contentType || "application/json";

        // 处理 SSE 流式响应
        if (contentType === "text/event-stream") {
          return handleSSEResponse(route, req, res);
        }

        // 处理其他内容类型
        return handleStaticResponse(route, res);
      } catch (e) {
        console.warn("[Mock Warn]:", e);
        return next();
      }
    }

    // 处理 JavaScript 文件
    if (route.filepath) {
      try {
        cleanCache(require.resolve(route.filepath));
        let data = require(route.filepath);

        if (typeof data === "function") {
          data = data(req, Mock, Random);
        }

        return res.json(Mock.mock(data));
      } catch (e) {
        console.error("[Mock Error]:", e);
        return next();
      }
    }

    next();
  };
}

mock.debug = true;

module.exports = {
  mock,
};
