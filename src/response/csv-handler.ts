import Mock from "mockjs";
import { stringify } from "csv-stringify/sync";
import { Request, Response } from "express";
import { BaseResponseHandler } from "./base-handler.js";
import { MockRoute } from "../types.js";

export class CsvResponseHandler extends BaseResponseHandler {
  async handle(req: Request, res: Response, route: MockRoute): Promise<void> {
    try {
      this.setHeaders(res, "text/csv");

      // 如果模板是字符串，尝试解析为对象
      const responseTemplate =
        typeof route.responseTemplate === "string"
          ? JSON.parse(route.responseTemplate)
          : route.responseTemplate;

      // 使用 mockjs 处理数据
      const mockData = Mock.mock(responseTemplate);

      // 确保数据是数组格式
      const dataArray = Array.isArray(mockData) ? mockData : [mockData];

      // 转换为 CSV
      const csv = stringify(dataArray, {
        header: true,
        columns: this.getColumns(dataArray[0]),
      });

      res.send(csv);
    } catch (error) {
      this.handleError(
        res,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private getColumns(data: Record<string, any>): Record<string, string> {
    if (!data) return {};
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = key;
      return acc;
    }, {} as Record<string, string>);
  }
}
