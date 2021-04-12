const fs = require("fs");
const path = require("path");
const Mock = require("mockjs");
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

    const route = apis[url] || {};

    mock.debug && console.log("Mock Interface: " + url);
    if (url === "/") {
      const host = req.protocol + "://" + req.headers.host + req.baseUrl;
      const list = Object.keys(apis)
        .sort()
        .map((pathname) => {
          if (isJavacriptFile(pathname)) {
            apis[pathname].data = require(pathname);
          } else {
            try {
              apis[pathname].data = new Function(
                "return (" + apis[pathname].content + ")"
              )();
            } catch (e) {
              delete apis[pathname];
              console.warn("[Mock Warn1]:", e);
            }
          }
          const route = apis[pathname];
          return {
            title: route.describe,
            url: host + route.url,
            file: route.filepath,
          };
        });

      return res.end(template.replace("@menuList", JSON.stringify(list)));
    }

    let data = route.data;

    if (isJavacriptFile(route.filepath)) {
      cleanCache(require.resolve(route.filepath));
      data = require(route.filepath);
    } else {
      try {
        data = new Function("return (" + route.content + ")")();
      } catch (e) {
        delete apis[pathname];
        console.warn("[Mock Warn2]:", e);
      }
    }

    if (data) {
      if (typeof data === "function") {
        data = data(req, Mock, Random);
      }
      res.json(Mock.mock(data));
    } else {
      next();
    }
  };
}

mock.debug = true;

module.exports = {
  mock,
};
