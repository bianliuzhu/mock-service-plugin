const fs = require("fs");
const nodePath = require("path");

const { walk } = require("./util");
const { CONTENT_TYPES } = require("./constant");

// 优化正则表达式，支持灵活注解位置
const RE =
  /^\s*\/\*[*\s]*?([^*\r\n]+)[\s\S]*?@url\s+([^\s]+)(?:[\s\S]*?@method\s+([^\s]+))?(?:[\s\S]*?@content-type\s+([^\s]+))?[\s\S]*?\*\//im;

// 扩展默认内容类型映射

/**
 * 解析 mock 文件目录，提取路由信息
 * @param {string} dir - mock 文件目录路径
 * @returns {MockRoute[]} 路由配置数组
 */
function parseMocksFile(dir) {
  const routes = [];
  const Detection = new Set();

  const files = walk(dir);

  (files || []).forEach((filepath) => {
    let content = fs.readFileSync(filepath, "utf8").trim() || "{}";
    const fileExt = nodePath.extname(filepath).toLowerCase();
    const fileName = nodePath.basename(filepath, nodePath.extname(filepath));

    let restfulTemplateUrl = filepath;
    let describe = "No description";
    let contentType = CONTENT_TYPES[fileExt] || "application/json";
    let method = "GET";

    // 尝试匹配注解
    const match = content.match(RE);
    if (match) {
      describe = match[1].trim();
      restfulTemplateUrl = match[2].trim();

      if (match[3]) {
        method = match[3].trim().toUpperCase() || "GET";
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

    // 规范化 restfulTemplateUrl
    if (!restfulTemplateUrl.startsWith("/")) {
      restfulTemplateUrl = "/" + restfulTemplateUrl;
    }

    // 提取路径及查询参数
    const [path, query] = restfulTemplateUrl.split("?");

    // 创建路由键（方法 + 路径）
    const routeKey = `${method}:${path}`;

    if (Detection.has(routeKey)) {
      console.warn(
        `[Mock Warn]: [${filepath}: ${routeKey}] already exists and will be overwritten`
      );
    } else {
      Detection.add(routeKey);

      const params = {
        filepath,
        fileName,
        fileExt,
        routeKey,
        method,
        path,
        query,
        restfulTemplateUrl,
        describe,
        contentType,
        responseTemplate: content,
      };

      routes.push(params);
    }
  });

  return routes;
}

module.exports = { parseMocksFile };
