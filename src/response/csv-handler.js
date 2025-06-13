const BaseResponseHandler = require("./base-handler");
const Mock = require("mockjs");
const { stringify } = require("csv-stringify/sync");

class CsvResponseHandler extends BaseResponseHandler {
  async handle(req, res, route) {
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
      this.handleError(res, error);
    }
  }

  getColumns(data) {
    if (!data) return {};
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = key;
      return acc;
    }, {});
  }
}

module.exports = CsvResponseHandler;
