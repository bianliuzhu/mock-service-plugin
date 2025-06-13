import fs from "fs";
import nodePath from "path";
import { fileURLToPath } from "url";
import { MockRoute } from "./types.js";

export function getDirname(importMetaUrl: string): string {
  return nodePath.dirname(fileURLToPath(importMetaUrl));
}

export function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + "/" + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

export function isJavacriptFile(file: string): boolean {
  return /\.js$/.test(file);
}

/**
 * 匹配请求路径到路由表中的路由
 * @param {Array<MockRoute>} routes 路由表数组
 * @param {string} method HTTP方法
 * @param {string} urlpath 请求路径
 * @returns {MockRoute|null} 匹配到的路由对象和参数，不匹配则返回null
 */
export function matchRoute(
  routes: MockRoute[],
  method: string,
  urlpath: string
): MockRoute | null {
  // 移除查询参数
  const pathWithoutQuery = urlpath.split("?")[0];

  console.log(pathWithoutQuery);

  // 先尝试精确匹配
  const exactMatch = routes.find(
    (r) => r.method === method && r.restfulTemplateUrl === urlpath
  );

  if (exactMatch) return exactMatch;

  // 分割请求路径
  const pathParts = pathWithoutQuery.split("/").filter((part) => part !== "");

  // 检查每个路由的动态匹配
  for (const route of routes) {
    // 方法不匹配则跳过
    if (route.method !== method) continue;

    const routeParts = route.path.split("/").filter((part) => part !== "");

    // 长度不匹配则跳过
    if (routeParts.length !== pathParts.length) continue;

    let isMatch = true;
    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];

      if (routePart.startsWith(":")) {
        // 动态参数部分
        const paramName = routePart.slice(1);
        params[paramName] = pathPart;
      } else if (routePart !== pathPart) {
        // 静态部分不匹配
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return route;
    }
  }

  // 没有匹配的路由
  return null;
}
