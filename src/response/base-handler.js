const fs = require("fs");
const path = require("path");

class BaseResponseHandler {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * 处理响应
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Object} route - 路由配置
   * @returns {Promise<void>}
   */
  async handle(req, res, route) {
    throw new Error("handle method must be implemented");
  }

  /**
   * 设置响应头
   * @param {Object} res - 响应对象
   * @param {string} contentType - 内容类型
   */
  setHeaders(res, contentType) {
    res.set("Content-Type", contentType);
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,POST,DELETE,PATCH");
  }

  /**
   * 处理文件响应
   * @param {string} filePath - 文件路径
   * @returns {Promise<Buffer>}
   */
  async readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * 处理错误
   * @param {Object} res - 响应对象
   * @param {Error} error - 错误对象
   */
  handleError(res, error) {
    console.error(`[Response Error] ${error.message}`);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}

module.exports = BaseResponseHandler;
