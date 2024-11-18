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

    let matchedRoute = null;
    let routeParams = {};

    for (const apiPath in apis) {
      const apiSegments = apiPath.split("/").filter(Boolean);

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
            // 使用 Mock.js 生成数据
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
          return res.json(Mock.mock(mockData));
        }
      } catch (e) {
        console.warn("[Mock Warn]:", e);
        return next();
      }
    }

    // 处理 JavaScript 文件
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
