const BaseResponseHandler = require("./base-handler");
const Mock = require("mockjs");
const xml2js = require("xml2js");

class XmlResponseHandler extends BaseResponseHandler {
  constructor(options = {}) {
    super(options);
    this.builder = new xml2js.Builder();
  }

  async handle(req, res, route) {
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
      this.handleError(res, error);
    }
  }
}

module.exports = XmlResponseHandler;
