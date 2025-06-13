const Mock = require("mockjs");
const BaseResponseHandler = require("./base-handler");

class JsonResponseHandler extends BaseResponseHandler {
  async handle(req, res, route) {
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
      this.handleError(res, error);
    }
  }
}

module.exports = JsonResponseHandler;
