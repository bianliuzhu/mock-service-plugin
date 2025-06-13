import Mock from "mockjs";
import path from "path";
import fs from "fs/promises";
import { Request, Response } from "express";
import { BaseResponseHandler } from "./base-handler.js";
import { MockRoute } from "../types.js";

export class ImageResponseHandler extends BaseResponseHandler {
  async handle(req: Request, res: Response, route: MockRoute): Promise<void> {
    try {
      const contentType = this.getContentType(route);
      this.setHeaders(res, contentType);

      // 如果模板是字符串，假设它是图片路径
      if (typeof route.responseTemplate === "string") {
        const imagePath = route.responseTemplate;
        const imageBuffer = await this.readFile(imagePath);
        res.send(imageBuffer);
        return;
      }

      // 如果是对象，尝试获取图片路径
      const mockData = Mock.mock(route.responseTemplate);
      if (typeof mockData === "string") {
        const imagePath = mockData;
        const imageBuffer = await this.readFile(imagePath);
        res.send(imageBuffer);
        return;
      }

      throw new Error("Invalid image responseTemplate format");
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
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
    };
    return contentTypeMap[extension] || "image/png";
  }
}
