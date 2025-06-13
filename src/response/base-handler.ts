import fs from "fs";
import { Request, Response } from "express";
import { MockRoute } from "../types.js";

interface HandlerOptions {
  [key: string]: any;
}

export abstract class BaseResponseHandler {
  protected options: HandlerOptions;

  constructor(options: HandlerOptions = {}) {
    this.options = options;
  }

  /**
   * 处理响应
   * @param {Request} req - 请求对象
   * @param {Response} res - 响应对象
   * @param {MockRoute} route - 路由配置
   * @returns {Promise<void>}
   */
  abstract handle(req: Request, res: Response, route: MockRoute): Promise<void>;

  /**
   * 设置响应头
   * @param {Response} res - 响应对象
   * @param {string} contentType - 内容类型
   */
  protected setHeaders(res: Response, contentType: string): void {
    res.set("Content-Type", contentType);
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,POST,DELETE,PATCH");
  }

  /**
   * 处理文件响应
   * @param {string} filePath - 文件路径
   * @returns {Promise<Buffer>}
   */
  protected async readFile(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * 处理错误
   * @param {Response} res - 响应对象
   * @param {Error} error - 错误对象
   */
  protected handleError(res: Response, error: Error): void {
    console.error(`[Response Error] ${error.message}`);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
