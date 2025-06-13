const Mock = require("mockjs");
const Random = Mock.Random;

function handleStaticResponse(route, res) {
  const contentType = route.contentType || "application/json";

  // 直接返回原始内容的情况
  if (
    contentType.includes("text/plain") ||
    contentType.includes("text/html") ||
    contentType.includes("text/css") ||
    contentType.includes("text/markdown") ||
    contentType.includes("application/javascript")
  ) {
    return res.send(route.content);
  }

  try {
    // 尝试解析为 JavaScript 对象
    const mockData = new Function("return (" + route.content + ")")();
    const mockedData = Mock.mock(mockData);

    // 根据内容类型返回不同格式
    if (contentType.includes("application/json")) {
      return res.json(mockedData);
    } else if (contentType.includes("application/xml")) {
      return res.type("xml").send(mockedData);
    } else if (contentType.includes("text/csv")) {
      return res.type("csv").send(mockedData);
    } else if (contentType.includes("application/x-yaml")) {
      return res.type("yaml").send(mockedData);
    } else {
      // 默认返回 JSON
      return res.json(mockedData);
    }
  } catch (e) {
    // 解析失败时直接返回原始内容
    return res.send(route.content);
  }
}
module.exports = handleStaticResponse;
