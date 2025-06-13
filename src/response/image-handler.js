const BaseResponseHandler = require("./base-handler");
const path = require("path");
const fs = require("fs").promises;

class ImageResponseHandler extends BaseResponseHandler {
  async handle(req, res, route) {
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
      this.handleError(res, error);
    }
  }

  getContentType(route) {
    const extension = route.file
      ? route.file.split(".").pop().toLowerCase()
      : "";
    const contentTypeMap = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
    };
    return contentTypeMap[extension] || "image/png";
  }
}

module.exports = ImageResponseHandler;
