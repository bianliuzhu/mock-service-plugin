import Mock from "mockjs";
import { Request, Response } from "express";
import { BaseResponseHandler } from "./base-handler";
import { MockRoute } from "../types";

export class JsonResponseHandler extends BaseResponseHandler {
  async handle(req: Request, res: Response, route: MockRoute): Promise<void> {
    try {
      this.setHeaders(res, "application/json");

      // 如果模板是字符串，尝试解析为 JSON
      const responseTemplate =
        typeof route.responseTemplate === "string"
          ? JSON.parse(route.responseTemplate)
          : route.responseTemplate;

      // 使用 mockjs 渲染模板
      const mockData = Mock.mock(responseTemplate);
      res.json(mockData);
    } catch (error) {
      this.handleError(
        res,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
