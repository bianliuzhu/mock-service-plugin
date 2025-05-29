/*
 * @Description:
 * @Author: Gleason
 * @Date: 2021-04-11 14:26:23
 * @LastEditors: Gleason
 * @LastEditTime: 2022-03-20 00:09:45
 */
const fs = require("fs");
const path = require("path");

const { walk } = require("./util");

// 修改正则表达式以支持 @method 注解
const RE =
  /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+([^\n]+)(?:[^@]*?@method\s+([^\n]+))?(?:[^@]*?@content-type\s+([^\n]+))?[^@]*?\*\//im;

// 默认的 content-type 映射
const DEFAULT_CONTENT_TYPES = {
  ".json": "application/json",
  ".txt": "text/plain",
  ".html": "text/html",
  ".xml": "application/xml",
  ".csv": "text/csv",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".js": "application/javascript",
  ".md": "text/markdown",
  ".yaml": "application/x-yaml",
  ".yml": "application/x-yaml",
};

function parseAPIs(dir) {
  const routes = {}; // routes list

  const files = walk(dir);

  (files || []).forEach((filepath) => {
    const content = String(fs.readFileSync(filepath, "utf8")).trim() || "{}";
    const ext = path.extname(filepath);

    let url = filepath;
    let describe = "no description";
    let contentType = DEFAULT_CONTENT_TYPES[ext] || "application/json";
    let method = null; // 新增 method 变量

    const m = content.match(RE);

    if (m) {
      url = m[2].trim();
      describe =
        m[1].replace(/(^[\s*]+|[\s*]+$)/g, "") ||
        m[2].replace(/(^[\s*]+|[\s*]+$)/g, "");
      if (m[3]) {
        method = m[3].trim().toUpperCase(); // 解析 method
      }
      if (m[4]) {
        contentType = m[4].trim();
      }
    }

    if (url[0] !== "/") {
      url = "/" + url;
    }

    let pathname = url;
    if (pathname.indexOf("?") > -1) {
      pathname = pathname.split("?")[0];
    }

    // 使用 method 和 pathname 组合作为路由的 key
    const routeKey = method ? `${method}:${pathname}` : pathname;

    if (routes[routeKey]) {
      console.warn(
        "[Mock Warn]: [" +
          filepath +
          ": " +
          routeKey +
          "] 已经存在，并已被新数据覆盖."
      );
    }

    routes[routeKey] = {
      url: url,
      filepath: filepath,
      describe: describe,
      contentType: contentType,
      method: method, // 存储 method
    };

    if (/\.json$/.test(filepath)) {
      routes[routeKey].content = content;
    }
  });

  return routes;
}

module.exports = parseAPIs;
