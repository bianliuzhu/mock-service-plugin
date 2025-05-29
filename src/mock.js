const fs = require("fs");
const path = require("path");

const { walk } = require("./util");

// 优化正则表达式，支持灵活注解位置
const RE =
  /^\s*\/\*[*\s]*?([^*\r\n]+)[\s\S]*?@url\s+([^\s]+)(?:[\s\S]*?@method\s+([^\s]+))?(?:[\s\S]*?@content-type\s+([^\s]+))?[\s\S]*?\*\//im;

// 扩展默认内容类型映射
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
  ".sse": "text/event-stream", // SSE 流式响应
};

function parseAPIs(dir) {
  const routes = {};

  const files = walk(dir);

  (files || []).forEach((filepath) => {
    let content = fs.readFileSync(filepath, "utf8").trim() || "{}";
    const ext = path.extname(filepath).toLowerCase();

    let url = filepath;
    let describe = "No description";
    let contentType = DEFAULT_CONTENT_TYPES[ext] || "application/json";
    let method = null;

    // 尝试匹配注解
    const match = content.match(RE);
    if (match) {
      describe = match[1].trim();
      url = match[2].trim();

      if (match[3]) {
        method = match[3].trim().toUpperCase();
      }

      if (match[4]) {
        contentType = match[4].trim();
      }

      // 提取注释后的实际内容
      const contentEndIndex = content.indexOf("*/") + 2;
      if (contentEndIndex > 2) {
        content = content.substring(contentEndIndex).trim();
      }
    }

    // 规范化 URL
    if (!url.startsWith("/")) {
      url = "/" + url;
    }

    // 移除 URL 中的查询参数
    const pathname = url.split("?")[0];

    // 创建路由键（方法 + 路径）
    const routeKey = method ? `${method}:${pathname}` : pathname;

    // 检查路由是否已存在
    if (routes[routeKey]) {
      console.warn(
        `[Mock Warn]: [${filepath}: ${routeKey}] already exists and will be overwritten`
      );
    }

    // 创建路由对象
    routes[routeKey] = {
      url: pathname,
      filepath,
      describe,
      contentType,
      method,
    };

    // 非 JavaScript 文件直接存储内容
    if (!/\.js$/.test(filepath)) {
      routes[routeKey].content = content;
    }
  });

  return routes;
}

module.exports = parseAPIs;
