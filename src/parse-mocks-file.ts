import fs from "fs";
import path from "path";
import { walk } from "./util.js";
import { CONTENT_TYPES } from "./constant.js";
import { MockRoute } from "./types.js";

// 优化正则表达式，支持灵活注解位置
const RE =
  /^\s*\/\*[*\s]*?([^*\r\n]+)[\s\S]*?@url\s+([^\s]+)(?:[\s\S]*?@method\s+([^\s]+))?(?:[\s\S]*?@content-type\s+([^\s]+))?[\s\S]*?\*\//im;

/**
 * 解析 mock 文件目录，提取路由信息
 * @param {string} dir - mock 文件目录路径
 * @returns {MockRoute[]} 路由配置数组
 */
export function parseMocksFile(dir: string): MockRoute[] {
  const routes: MockRoute[] = [];
  const Detection = new Set<string>();

  const files = walk(dir);

  (files || []).forEach((filepath) => {
    let content = fs.readFileSync(filepath, "utf8").trim() || "{}";
    const fileExt = path.extname(filepath).toLowerCase();
    const fileName = path.basename(filepath, path.extname(filepath));

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
    const [routePath, query] = restfulTemplateUrl.split("?");

    // 创建路由键（方法 + 路径）
    const routeKey = `${method}:${routePath}`;

    if (Detection.has(routeKey)) {
      console.warn(
        `[Mock Warn]: [${filepath}: ${routeKey}] already exists and will be overwritten`
      );
    } else {
      Detection.add(routeKey);

      const params: MockRoute = {
        filepath,
        fileName,
        fileExt,
        routeKey,
        method,
        path: routePath,
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
