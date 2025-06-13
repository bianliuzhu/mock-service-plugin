import Mock from "mockjs";
import xml2js from "xml2js";
import { Request, Response } from "express";
import { BaseResponseHandler } from "./base-handler";
import { MockRoute } from "../types";

export class XmlResponseHandler extends BaseResponseHandler {
  private builder: xml2js.Builder;

  constructor(options = {}) {
    super(options);
    this.builder = new xml2js.Builder();
  }

  async handle(req: Request, res: Response, route: MockRoute): Promise<void> {
    try {
      this.setHeaders(res, "application/xml");

      // 如果模板是字符串，尝试解析为对象
      const responseTemplate =
        typeof route.responseTemplate === "string"
          ? JSON.parse(route.responseTemplate)
          : route.responseTemplate;

      // 使用 mockjs 处理数据
      const mockData = Mock.mock(responseTemplate);

      // 转换为 XML
      const xml = this.builder.buildObject(mockData);
      res.send(xml);
    } catch (error) {
      this.handleError(
        res,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
