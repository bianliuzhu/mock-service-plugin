const BaseResponseHandler = require("./base-handler");
const Mock = require("mockjs");

class TextResponseHandler extends BaseResponseHandler {
  async handle(req, res, route) {
    try {
      const contentType = this.getContentType(route);
      this.setHeaders(res, contentType);

      // 如果模板是字符串，直接使用
      if (typeof route.responseTemplate === "string") {
        return res.send(route.responseTemplate);
      }

      // 如果是对象，使用 mockjs 处理
      const mockData = Mock.mock(route.responseTemplate);
      res.send(mockData);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  getContentType(route) {
    const extension = route.file
      ? route.file.split(".").pop().toLowerCase()
      : "";
    const contentTypeMap = {
      txt: "text/plain",
      html: "text/html",
      md: "text/markdown",
      css: "text/css",
      js: "application/javascript",
    };
    return contentTypeMap[extension] || "text/plain";
  }
}

module.exports = TextResponseHandler;
