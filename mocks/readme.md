/\*\*

- @url /api/project/readme
- @method GET
  \*/

# Mock Service Plugin

## 项目简介

这是一个用于快速创建 Mock 服务的插件，支持多种数据格式和响应类型。

## 主要特性

- 支持多种数据格式（JSON、XML、CSV、Markdown 等）
- 支持动态数据生成
- 支持文件响应
- 支持流式响应（SSE）

## 使用示例

### JSON 格式

```javascript
/**
 * @url /api/users
 * @method GET
 */
{
  "code": 200,
  "data": {
    "name": "@cname",
    "age": "@integer(18, 60)"
  }
}
```

### XML 格式

```xml
/**
 * @url /api/product
 * @method GET
 */
<product>
  <name>@ctitle</name>
  <price>@float(10, 100)</price>
</product>
```

## 安装使用

```bash
npm install mock-service-plugin
```

## 许可证

MIT
