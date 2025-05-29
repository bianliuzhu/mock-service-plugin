const fs = require("fs");
const path = require("path");
const Mock = require("mockjs");
const chalk = require("chalk");
const Random = Mock.Random;
const template = fs.readFileSync(path.join(__dirname, "doc.html"), "utf8");

const { cleanCache, isJavacriptFile } = require("./util");

const parseAPIs = require("./mock");

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

    let matchedRoute = null;
    let routeParams = {};

    // 将路由按具体路由和参数路由分类并排序
    const sortedApiPaths = Object.keys(apis).sort((a, b) => {
      const aSegments = a.split("/").filter(Boolean);
      const bSegments = b.split("/").filter(Boolean);

      // 计算包含参数的段数
      const aParamCount = aSegments.filter((seg) => seg.startsWith(":")).length;
      const bParamCount = bSegments.filter((seg) => seg.startsWith(":")).length;

      // 参数更少的路由优先级更高
      return aParamCount - bParamCount;
    });

    // 使用排序后的路由进行匹配
    for (const apiPath of sortedApiPaths) {
      // 检查是否包含方法前缀
      const [routeMethod, path] = apiPath.includes(":")
        ? apiPath.split(":", 2)
        : [null, apiPath];

      // 如果路由指定了方法，但请求方法不匹配，则跳过
      if (routeMethod && routeMethod !== method) {
        continue;
      }

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
        matchedRoute = apis[apiPath];
        routeParams = params;
        break;
      }
    }

    const route = matchedRoute || {};
    req.params = routeParams;

    mock.debug && console.log(chalk.magentaBright("- [Mock Interface] "), url);

    if (!isJavacriptFile(route.filepath)) {
      try {
        let mockData = new Function("return (" + route.content + ")")();

        const isSSE = req.headers.accept === "text/event-stream";
        if (isSSE) {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });

          const sendSSE = (item) => {
            let message = "";

            if (item.id) {
              message += `id: ${item.id}\n`;
            }

            if (item.event) {
              message += `event: ${item.event}\n`;
            }

            if (item.data) {
              const dataStr =
                typeof item.data === "string"
                  ? item.data
                  : JSON.stringify(item.data);
              message += `data: ${dataStr}\n`;
            }

            if (item.retry) {
              message += `retry: ${item.retry}\n`;
            }

            message += "\n";
            res.write(message);
          };

          if (mockData.stream === true) {
            const data = Mock.mock(mockData);
            const interval = data.interval || 1000;

            if (Array.isArray(data.items)) {
              data.items.forEach((item, index) => {
                setTimeout(() => {
                  sendSSE(item);
                }, index * interval);
              });
            }
          } else {
            sendSSE({ data: Mock.mock(mockData) });
          }

          req.on("close", () => {
            console.log("Client closed connection");
          });
          return;
        } else {
          // 设置响应的 content-type
          res.set("Content-Type", route.contentType || "application/json");

          // 根据 content-type 返回不同格式的数据
          if (route.contentType?.includes("application/json")) {
            return res.json(Mock.mock(mockData));
          } else if (route.contentType?.includes("text/plain")) {
            // 对于纯文本，直接返回原始内容
            if (typeof mockData === "string") {
              return res.send(mockData);
            }
            // 如果是对象，尝试转换为字符串
            return res.send(JSON.stringify(mockData, null, 2));
          } else if (route.contentType?.includes("text/html")) {
            return res.send(Mock.mock(mockData));
          } else if (route.contentType?.includes("application/xml")) {
            return res.type("xml").send(Mock.mock(mockData));
          } else if (route.contentType?.includes("text/csv")) {
            return res.type("csv").send(Mock.mock(mockData));
          } else {
            // 默认返回 JSON
            return res.json(Mock.mock(mockData));
          }
        }
      } catch (e) {
        console.warn("[Mock Warn]:", e);
        return next();
      }
    }

    if (route.filepath) {
      cleanCache(require.resolve(route.filepath));
      let data = require(route.filepath);
      if (typeof data === "function") {
        data = data(req, Mock, Random);
      }
      return res.json(Mock.mock(data));
    }

    next();
  };
}

mock.debug = true;

module.exports = {
  mock,
};
