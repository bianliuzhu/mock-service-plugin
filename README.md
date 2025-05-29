# mock-service-plugin

一个强大的 Mock 服务插件，支持多种框架和构建工具，提供灵活的接口模拟能力。

## 特性

- 🚀 支持多种构建工具
  - Webpack 4/5
  - Vite
  - Vue CLI
  - Create React App (CRA)
- 🎯 支持多种框架
  - Vue
  - React
- 🔥 强大的功能支持
  - RESTful API 支持
  - 流式响应 (SSE/EventStream)
  - 多种响应格式 (JSON/XML/CSV/Text 等)
  - 动态路由参数
  - 请求方法匹配 (GET/POST/PUT/DELETE 等)
- 💡 简单易用
  - 零配置启动
  - 热更新支持
  - 友好的调试界面

## 快速开始

### 安装

```bash
npm install mock-service-plugin --save-dev

yarn add mock-service-plugin --dev
```

### 基础配置

```javascript
const MockServicePlugin = require("mock-service-plugin");

module.exports = {
  plugins: [
    new MockServicePlugin({
      path: path.join(__dirname, "./mocks"), // mock 数据目录
      port: 3000, // mock 服务端口
    }),
  ],
};
```

## Mock 数据规范

### 基础格式

```javascript
/**
 * @url /api/users
 * @method GET
 * @content-type application/json
 */
{
  "code": 200,
  "data|5-10": [{
    "id": "@id",
    "name": "@cname",
    "email": "@email"
  }],
  "message": "success"
}
```

### 注解说明

- `@url`: 接口路径（必填）
- `@method`: 请求方法（可选，支持 GET/POST/PUT/DELETE 等）
- `@content-type`: 响应类型（可选，默认 application/jsontext/plain、text/html、application/xml、text/csv、text/markdown）

### 请求方法匹配

1. 指定请求方法：

```javascript
/**
 * @url /api/users
 * @method POST
 */
{
  "code": 200,
  "message": "创建成功"
}
```

2. 支持所有请求方法（不指定 @method）：

```javascript
/**
 * @url /api/users
 */
{
  "code": 200,
  "data": {
    "id": "@id",
    "name": "@cname"
  }
}
```

3. RESTful API 示例：

```javascript
// GET 请求
/**
 * @url /api/users/:id
 * @method GET
 */
{
  "id": "@id",
  "name": "@cname"
}

// PUT 请求
/**
 * @url /api/users/:id
 * @method PUT
 */
{
  "code": 200,
  "message": "更新成功"
}

// DELETE 请求
/**
 * @url /api/users/:id
 * @method DELETE
 */
{
  "code": 200,
  "message": "删除成功"
}
```

### 支持的响应类型

| 文件扩展名 | Content-Type           | 说明            |
| ---------- | ---------------------- | --------------- |
| .json      | application/json       | JSON 数据格式   |
| .txt       | text/plain             | 纯文本格式      |
| .html      | text/html              | HTML 文档       |
| .xml       | application/xml        | XML 数据格式    |
| .csv       | text/csv               | CSV 表格数据    |
| .md        | text/markdown          | Markdown 文档   |
| .pdf       | application/pdf        | PDF 文档        |
| .png       | image/png              | PNG 图片        |
| .jpg/.jpeg | image/jpeg             | JPEG 图片       |
| .gif       | image/gif              | GIF 图片        |
| .svg       | image/svg+xml          | SVG 矢量图      |
| .css       | text/css               | CSS 样式表      |
| .js        | application/javascript | JavaScript 代码 |
| .yaml/.yml | application/x-yaml     | YAML 配置文件   |

你可以通过文件扩展名或 `@content-type` 注解来指定响应类型。例如：

```javascript
// 使用文件扩展名
// user.json
{
  "name": "John Doe",
  "email": "john@example.com"
}

// 使用注解
/**
 * @url /api/user
 * @content-type application/json
 */
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Mock 文件示例

#### JSON 格式 (mock.json)

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

#### 文本格式 (mock.txt)

```javascript
/**
 * @url /api/text
 * @method GET
 */
这是一段模拟的文本内容，支持多行文本。
第二行内容。
第三行内容。
```

#### CSS 格式 (mock.css)

```javascript
/**
 * @url /api/styles
 * @method GET
 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
```

#### Markdown 格式 (mock.md)

```javascript
/**
 * @url /api/markdown
 * @method GET
 */
# 标题一
## 标题二
- 列表项 1
- 列表项 2
```

#### YAML 格式 (mock.yaml)

```javascript
/**
 * @url /api/config
 * @method GET
 */
version: 1.0;
settings: debug: true;
timeout: 30;
```

#### CSV 格式 (mock.csv)

```javascript
/**
 * @url /api/data
 * @method GET
 */
id, name, age;
1, 张三, 25;
2, 李四, 30;
3, 王五, 28;
```

#### XML 格式 (mock.xml)

```javascript
/**
 * @url /api/xml
 * @method GET
 */
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user>
    <name>张三</name>
    <age>25</age>
  </user>
</root>
```

#### JavaScript 格式 (mock.js)

```javascript
/**
 * @url /api/script
 * @method GET
 */
function greeting(name) {
  return `Hello, ${name}!`;
}
```

对于图片类型的响应，你可以直接返回图片文件的路径：

```javascript
/**
 * @url /api/avatar
 * @content-type image/png
 */
"/path/to/avatar.png";
```

## 高级特性

### RESTful API 支持

```javascript
/**
 * @url /api/users/:id
 * @method GET
 */
{
  "id": "@id",
  "name": "@cname",
  "email": "@email"
}
```

### 流式响应

```javascript
/**
 * @url /api/stream
 * @content-type text/event-stream
 */
{
  "stream": true,
  "interval": "@integer(100,500)",
  "items|10": [{
    "id": "@increment(1)",
    "data": {
      "content": "@csentence(3,10)"
    }
  }]
}
```

## 框架集成

### Vue 项目

```javascript
// vue.config.js
const MockServicePlugin = require("mock-service-plugin");

module.exports = {
  configureWebpack: {
    plugins: [
      new MockServicePlugin({
        path: path.join(__dirname, "./mocks"),
        port: 9090,
      }),
    ],
  },
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:9090",
        pathRewrite: { "^/api": "" },
      },
    },
  },
};
```

### React 项目 (CRA)

#### 使用 craco

```javascript
// craco.config.js
const MockServicePlugin = require("mock-service-plugin");

module.exports = {
  webpack: {
    plugins: {
      add: [
        new MockServicePlugin({
          path: path.join(__dirname, "./mocks"),
          port: 9090,
        }),
      ],
    },
  },
};
```

#### 使用 customize-cra

```javascript
// config-overrides.js
const { override, addWebpackPlugin } = require("customize-cra");
const MockServicePlugin = require("mock-service-plugin");

module.exports = override(
  addWebpackPlugin(
    new MockServicePlugin({
      path: path.join(__dirname, "./mocks"),
      port: 9090,
    })
  )
);
```

### Vite 项目

```ts
// vite-mock-plugin.ts 文件

import MockServicePlugin from "mock-service-plugin";
import { createServer } from "net";
import { join } from "path";

function isPortTaken(port: number) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", (err: { code: string }) => {
      if (err.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

export default function ViteMockServicePlugin(e: string) {
  return {
    name: "ViteMockServicePlugin",
    buildStart() {
      (async () => {
        const port = 3008;
        const portTaken = await isPortTaken(port);
        if (portTaken) {
          console.log(`Port ${port} is already in use`);
        } else {
          if (e === "mock") {
            const ints = new MockServicePlugin({
              // mock 数据的存放路径
              path: join(__dirname, "./mocks"),
              // 配置mock服务的端口，避免与应用端口冲突
              port: 3008,
            });
            ints.apply();
          }
        }
      })();
    },
  };
}
```

```typescript
// vite.config.ts
import { defineConfig } from "vite";
// 这里引入的 vite-mock-plugin 就是上面的代码片段
import ViteMockServicePlugin from "./vite-mock-plugin";

export default defineConfig({
  plugins: [ViteMockServicePlugin("development")],
});
```

## 示例项目

- [Vue 示例](https://github.com/bianliuzhu/vite-vue-ts)
- [React 示例](https://github.com/bianliuzhu/react-app-ts)

## 注意事项

1. 修改 mock 数据后需要刷新页面
2. 确保 mock 服务端口与应用端口不冲突
3. 建议使用相对路径配置 mock 数据目录

## 贡献指南

欢迎提交 Issue 和 Pull Request

## 许可证

MIT
