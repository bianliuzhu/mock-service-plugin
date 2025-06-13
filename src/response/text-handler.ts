import Mock from "mockjs";
import { Request, Response } from "express";
import { BaseResponseHandler } from "./base-handler";
import { MockRoute } from "../types";

export class TextResponseHandler extends BaseResponseHandler {
  async handle(req: Request, res: Response, route: MockRoute): Promise<void> {
    try {
      const contentType = this.getContentType(route);
      this.setHeaders(res, contentType);

      // 如果模板是字符串，直接使用
      if (typeof route.responseTemplate === "string") {
        res.send(route.responseTemplate);
        return;
      }

      // 如果是对象，使用 mockjs 处理
      const mockData = Mock.mock(route.responseTemplate);
      res.send(mockData);
      return;
    } catch (error) {
      this.handleError(
        res,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private getContentType(route: MockRoute): string {
    const extension = route.filepath
      ? route.filepath.split(".").pop()?.toLowerCase() || ""
      : "";
    const contentTypeMap: Record<string, string> = {
      txt: "text/plain",
      html: "text/html",
      md: "text/markdown",
      css: "text/css",
      js: "application/javascript",
    };
    return contentTypeMap[extension] || "text/plain";
  }
}
