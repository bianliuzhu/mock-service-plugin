# mock-service-plugin

[English](README.md) | [中文](README-zh.md)

一个强大的本地 Mock 服务插件，支持 Webpack、Vite 等主流构建工具，让你在后端接口还没开发好的时候，也能正常开发和调试前端页面。

## 目录

- [什么是 Mock？](#什么是-mock)
- [特性](#特性)
- [安装](#安装)
- [五分钟快速上手](#五分钟快速上手)
- [Mock 文件编写规范](#mock-文件编写规范)
- [MockJS 常用语法速查](#mockjs-常用语法速查)
- [支持的文件格式](#支持的文件格式)
- [各格式完整示例](#各格式完整示例)
- [高级特性](#高级特性)
- [框架集成](#框架集成)
- [调试界面](#调试界面)
- [常见问题](#常见问题)
- [示例项目](#示例项目)

---

## 什么是 Mock？

在实际开发中，前端和后端往往同时开发。后端接口还没写好时，前端就没有数据可用，开发会被卡住。

**Mock（模拟）** 就是在本地启动一个假的后端服务，按照约定好的接口格式返回假数据，让前端可以正常开发，不依赖真实后端。

`mock-service-plugin` 做的事情就是：**读取你写的 mock 数据文件，自动启动一个本地 HTTP 服务，前端请求打过来时按规则返回对应数据。**

---

## 特性

- 🚀 支持多种构建工具：Webpack 4/5、Vite、Vue CLI、Create React App
- 🎯 支持 Vue、React 等主流框架
- 🔥 功能丰富
  - RESTful API 支持（GET / POST / PUT / DELETE 等）
  - 动态路由参数（如 `/api/users/:id`）
  - 流式响应（SSE / EventStream，可模拟 AI 打字效果）
  - 多种响应格式（JSON / XML / CSV / 图片 / 纯文本等）
- 💡 极简配置，热更新，自带调试界面

---

## 安装

```bash
# npm
npm install mock-service-plugin --save-dev

# yarn
yarn add mock-service-plugin --dev

# pnpm
pnpm add mock-service-plugin --save-dev
```

---

## 五分钟快速上手

下面以 **Vite + Vue** 项目为例，带你从零跑通第一个 Mock 接口。

### 第一步：安装插件

```bash
npm install mock-service-plugin --save-dev
```

### 第二步：创建 mock 数据目录和文件

在项目根目录创建 `mocks` 文件夹，新建文件 `mocks/user.json`：

```
项目根目录/
├── mocks/
│   └── user.json   ← 新建这个文件
├── src/
├── vite.config.ts
└── package.json
```

`mocks/user.json` 内容如下：

```json
/**
 * @url /api/user/info
 * @method GET
 */
{
  "code": 200,
  "data": {
    "id": "@id",
    "name": "@cname",
    "email": "@email",
    "avatar": "@image('100x100')"
  },
  "message": "success"
}
```

> 文件开头的 `/** ... */` 注释是路由配置，告诉插件这个文件对应哪个接口地址和请求方法。  
> `@cname`、`@email` 等是 MockJS 的随机数据语法，每次请求都会生成不同的随机数据。完整语法分类见 [MockJS 常用语法速查](#mockjs-常用语法速查)。

### 第三步：在 Vite 中启动 Mock 服务

在项目根目录新建 `vite-mock-plugin.ts`：

```typescript
// vite-mock-plugin.ts
import { startServer } from "mock-service-plugin";
import { createServer } from "net";
import { join } from "path";

// 检查端口是否已被占用
function isPortTaken(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", (err: { code: string }) => {
      resolve(err.code === "EADDRINUSE");
    });
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Vite 插件：在 mock 模式下启动 Mock 服务
export default function ViteMockServicePlugin(mode: string) {
  return {
    name: "ViteMockServicePlugin",
    buildStart() {
      (async () => {
        const port = 3008;
        if (await isPortTaken(port)) {
          console.log(`[Mock] 端口 ${port} 已被占用，跳过启动`);
          return;
        }
        if (mode === "mock") {
          startServer({
            mockDir: join(__dirname, "./mocks"), // mock 文件夹路径
            port,                                // mock 服务端口
          });
        }
      })();
    },
  };
}
```

修改 `vite.config.ts`：

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ViteMockServicePlugin from "./vite-mock-plugin";

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    ViteMockServicePlugin(mode), // 传入当前模式
  ],
  server: {
    proxy: {
      // 将 /api 请求代理到 mock 服务
      "/api": {
        target: "http://localhost:3008",
        changeOrigin: true,
      },
    },
  },
}));
```

在 `package.json` 中添加 mock 启动命令：

```json
{
  "scripts": {
    "dev": "vite --mode dev",
    "mock": "vite --mode mock"
  }
}
```

### 第四步：启动并测试

```bash
npm run mock
```

启动后，在浏览器访问 `http://localhost:3008/api/user/info`，你会看到随机生成的用户数据：

```json
{
  "code": 200,
  "data": {
    "id": "660000198812040277",
    "name": "韩磊",
    "email": "c.wjjdmpyy@wfomlb.net",
    "avatar": "http://dummyimage.com/100x100"
  },
  "message": "success"
}
```

**恭喜！你已经成功跑通了第一个 Mock 接口。** 🎉

---

## Mock 文件编写规范

### 文件结构

每个 mock 文件由两部分组成：

```
文件 = 顶部注释（路由配置） + 响应内容
```

```json
/**
 * @url /api/users        ← 必填：接口路径
 * @method GET            ← 可选：请求方法，默认 GET
 */
{
  "code": 200,
  "data": []
}
```

### 顶部注解说明

| 注解 | 是否必填 | 说明 | 示例 |
|------|----------|------|------|
| `@url` | ✅ 必填 | 接口路径，支持动态参数 | `@url /api/users/:id` |
| `@method` | 可选 | HTTP 请求方法，默认 `GET` | `@method POST` |
| `@content-type` | 可选 | 覆盖默认的 Content-Type 建议使用**文件扩展名**参考[支持的文件格式](#支持的文件格式)。 | `@content-type image/png` |

### 动态路由参数

用 `:参数名` 表示路径中的动态部分：

```json
/**
 * @url /api/users/:id
 * @method GET
 */
{
  "id": "@id",
  "name": "@cname"
}
```

访问 `/api/users/123` 或 `/api/users/456` 都会匹配到这个文件。

### 一个目录管理多个接口

建议按业务模块分文件存放：

```
mocks/
├── user.json        → /api/user/...
├── product.json     → /api/product/...
├── orders.csv       → /api/orders
├── banner.xml       → /api/banner
└── stream.sse       → /api/stream（流式响应）
```

插件会**递归扫描**整个 `mocks` 目录，自动注册所有文件中的路由。

---

## MockJS 常用语法速查

> MockJS 是一个数据模拟库，可以用模板语法生成随机数据。插件内置了 MockJS，JSON 格式的 mock 文件中可以直接使用。

### 随机值占位符
> 可查看[完整语法分类](完整语法分类)

| 语法 | 说明 | 示例输出 |
|------|------|---------|
| `@id` | 随机身份证号 | `"420000199206230937"` |
| `@guid` | 随机 GUID | `"662C63B4-FD43-66F4-3328"` |
| `@cname` | 随机中文姓名 | `"王芳"` |
| `@name` | 随机英文姓名 | `"Charles Lopez"` |
| `@email` | 随机邮箱 | `"x.fwtue@pbgty.com"` |
| `@url` | 随机 URL | `"http://ljwih.io/lxqf"` |
| `@ip` | 随机 IP 地址 | `"52.249.14.3"` |
| `@integer(min, max)` | 指定范围的随机整数 | `@integer(1, 100)` → `42` |
| `@float(min, max, dMin, dMax)` | 随机浮点数 | `@float(1, 100, 2, 2)` → `36.14` |
| `@boolean` | 随机布尔值 | `true` 或 `false` |
| `@date` | 随机日期 | `"2021-07-30"` |
| `@datetime` | 随机日期时间 | `"2021-07-30 10:42:01"` |
| `@now` | 当前时间 | `"2026-03-27 14:22:00"` |
| `@csentence(min, max)` | 随机中文句子 | `"学中用称化置速。"` |
| `@ctitle(min, max)` | 随机中文标题 | `"商品名称示例"` |
| `@cparagraph` | 随机中文段落 | 一段随机中文 |
| `@image('宽x高')` | 随机占位图片 URL | `@image('200x100')` |
| `@pick(['a','b','c'])` | 从数组中随机取一个 | `"b"` |
| `@increment(1)` | 自增数字（从1开始） | `1`, `2`, `3`... |
| `@string('lower', 8)` | 随机字符串 | `"abcdefgh"` |

### 生成数组（批量数据）

在字段名后加 `|数量` 可生成数组：

```json
{
  "list|5": [{ "id": "@id", "name": "@cname" }]
}
```

生成 5 条数据的列表。用 `|min-max` 可随机数量：

```json
{
  "list|5-10": [{ "id": "@id", "name": "@cname" }]
}
```

### 完整语法分类

使用时在方法名前加 `@` 前缀，例如 `@name`、`@integer(1, 100)`。

| 分类 | 可用方法 |
|------|----------|
| 基础（Basic） | `boolean`, `natural`, `integer`, `float`, `character`, `string`, `range`, `date`, `time`, `datetime`, `now` |
| 图片（Image） | `image`, `dataImage` |
| 颜色（Color） | `color` |
| 文本（Text） | `paragraph`, `sentence`, `word`, `title`, `cparagraph`, `csentence`, `cword`, `ctitle` |
| 姓名（Name） | `first`, `last`, `name`, `cfirst`, `clast`, `cname` |
| 网络（Web） | `url`, `domain`, `email`, `ip`, `tld` |
| 地址（Address） | `area`, `region` |
| 工具（Helper） | `capitalize`, `upper`, `lower`, `pick`, `shuffle` |
| 其他（Misc） | `guid`, `id` |

> 带 `c` 前缀的方法（如 `cname`、`csentence`）生成中文内容，不带前缀的生成英文内容。

### 完整示例

```json
/**
 * @url /api/users
 * @method GET
 */
{
  "code": 200,
  "data": {
    "total": 100,
    "list|10": [{
      "id": "@id",
      "name": "@cname",
      "age": "@integer(18, 60)",
      "email": "@email",
      "status": "@pick(['active', 'inactive', 'banned'])",
      "createdAt": "@datetime"
    }]
  },
  "message": "success"
}
```

---

## 支持的文件格式

插件根据**文件扩展名**自动识别响应类型：

| 文件扩展名 | Content-Type | 说明 |
|-----------|--------------|------|
| `.json` | `application/json` | JSON 数据，支持 MockJS 模板语法 |
| `.sse` | `text/event-stream` | SSE 流式响应，支持 MockJS |
| `.txt` | `text/plain` | 纯文本 |
| `.html` | `text/html` | HTML 文档 |
| `.xml` | `application/xml` | XML 数据 |
| `.csv` | `text/csv` | CSV 表格数据 |
| `.md` | `text/markdown` | Markdown 文档 |
| `.css` | `text/css` | CSS 样式表 |
| `.js` | `application/javascript` | JavaScript 代码 |
| `.yaml` / `.yml` | `application/x-yaml` | YAML 配置 |
| `.png` | `image/png` | PNG 图片 |
| `.jpg` / `.jpeg` | `image/jpeg` | JPEG 图片 |
| `.gif` | `image/gif` | GIF 图片 |
| `.svg` | `image/svg+xml` | SVG 矢量图 |
| `.pdf` | `application/pdf` | PDF 文档 |

> **注意**：MockJS 模板语法（`@cname` 等）目前只在 `.json` 和 `.sse` 格式中生效，其他格式返回文件的原始内容。

---

## 各格式完整示例

### JSON 格式（最常用）

文件名：`user.json`

```json
/**
 * @url /api/user/list
 * @method GET
 */
{
  "code": 200,
  "data": {
    "total": 100,
    "list|10": [{
      "id": "@id",
      "name": "@cname",
      "age": "@integer(18, 60)",
      "email": "@email",
      "createdAt": "@datetime"
    }]
  },
  "message": "success"
}
```

### 纯文本格式

文件名：`notice.txt`

```
/**
 * @url /api/notice
 * @method GET
 */
系统将于今晚 22:00 进行维护升级，预计持续 2 小时。
请提前保存您的工作！
```

### XML 格式

文件名：`product.xml`

```xml
/**
 * @url /api/product/detail
 * @method GET
 */
<?xml version="1.0" encoding="UTF-8"?>
<product>
  <id>1001</id>
  <name>示例商品</name>
  <price>99.00</price>
  <stock>200</stock>
</product>
```

### CSV 格式

文件名：`orders.csv`

```
/**
 * @url /api/orders/export
 * @method GET
 */
订单号,客户名,商品,数量,金额,状态
ORD001,张三,iPhone 15,1,7999.00,已完成
ORD002,李四,MacBook Pro,1,14999.00,已发货
ORD003,王五,AirPods,2,1598.00,待付款
```

### 图片格式

文件名：`avatar.json`（注意：用 JSON 文件存放图片路径）

```json
/**
 * @url /api/avatar/:id
 * @method GET
 * @content-type image/png
 */
"/absolute/path/to/your/avatar.png"
```

> 图片响应使用 `@content-type` 注解声明类型，文件内容为图片文件的绝对路径字符串。

---

## 高级特性

### RESTful API — 同一路径，不同方法

针对同一个路径，可以在不同文件（或同一文件）中定义不同请求方法的响应：

```json
// POST /api/users → user-create.json
/**
 * @url /api/users
 * @method POST
 */
{
  "code": 200,
  "message": "创建成功",
  "data": { "id": "@id" }
}
```

```json
// GET /api/users/:id → user-detail.json
/**
 * @url /api/users/:id
 * @method GET
 */
{
  "code": 200,
  "data": {
    "id": "@id",
    "name": "@cname",
    "email": "@email"
  }
}
```

```json
// PUT /api/users/:id → user-update.json
/**
 * @url /api/users/:id
 * @method PUT
 */
{ "code": 200, "message": "更新成功" }
```

```json
// DELETE /api/users/:id → user-delete.json
/**
 * @url /api/users/:id
 * @method DELETE
 */
{ "code": 200, "message": "删除成功" }
```

### 流式响应（SSE）— 模拟 AI 打字效果

文件扩展名为 `.sse`，插件会逐条推送 `items` 数组中的每一项，模拟流式输出。

文件名：`chat.sse`

```json
/**
 * @url /api/chat/stream
 * @method POST
 */
{
  "interval": 100,
  "items|15": [{
    "id": "@increment(1)",
    "data": {
      "content": "@csentence(2, 5)"
    }
  }]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `interval` | number | 每条消息之间的间隔（毫秒）。支持 MockJS 表达式，如 `"@integer(100, 500)"` |
| `items` | array | 要推送的消息列表，也支持 `|数量` 语法生成批量数据 |
| `items[].id` | string/number | SSE 消息的 `id` 字段（可选） |
| `items[].event` | string | SSE 消息的 `event` 字段（可选） |
| `items[].data` | any | SSE 消息的 `data` 字段，会被序列化为 JSON 字符串 |
| `items[].retry` | number | 重连时间（可选） |

前端接收示例（JavaScript）：

```javascript
const evtSource = new EventSource("/api/chat/stream");
evtSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.content); // 逐字输出
};
evtSource.onerror = () => evtSource.close();
```

---

## 框架集成

### Vite 项目（推荐）

参考 [五分钟快速上手](#五分钟快速上手) 中的完整示例。

核心思路：通过 `--mode mock` 参数区分开发模式，只在 mock 模式下启动 Mock 服务。

### Webpack 项目 / Vue CLI 项目

```javascript
// webpack.config.js 或 vue.config.js
const path = require("path");
const { MockServicePlugin } = require("mock-service-plugin");

module.exports = {
  // Webpack 配置...
  plugins: [
    new MockServicePlugin({
      path: path.join(__dirname, "./mocks"), // mock 文件夹路径（注意参数名是 path）
      port: 3008,                            // mock 服务端口
    }),
  ],
};
```

在 Vue CLI 项目（`vue.config.js`）中，同时配置代理：

```javascript
// vue.config.js
const path = require("path");
const { MockServicePlugin } = require("mock-service-plugin");

module.exports = {
  configureWebpack: {
    plugins: [
      new MockServicePlugin({
        path: path.join(__dirname, "./mocks"),
        port: 3008,
      }),
    ],
  },
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3008",
        changeOrigin: true,
      },
    },
  },
};
```

### React 项目（CRA）

#### 使用 craco

```javascript
// craco.config.js
const path = require("path");
const { MockServicePlugin } = require("mock-service-plugin");

module.exports = {
  webpack: {
    plugins: {
      add: [
        new MockServicePlugin({
          path: path.join(__dirname, "./mocks"),
          port: 3008,
        }),
      ],
    },
  },
};
```

#### 使用 customize-cra

```javascript
// config-overrides.js
const path = require("path");
const { override, addWebpackPlugin } = require("customize-cra");
const { MockServicePlugin } = require("mock-service-plugin");

module.exports = override(
  addWebpackPlugin(
    new MockServicePlugin({
      path: path.join(__dirname, "./mocks"),
      port: 3008,
    })
  )
);
```

---

## 调试界面

Mock 服务启动后，直接在浏览器中访问 Mock 服务根地址（如 `http://localhost:3008`），可以看到内置的调试界面，展示当前所有已注册的 Mock 接口列表，方便你快速查看和调试。

---

## 常见问题

**Q: 修改了 mock 文件，接口没有变化？**

插件支持热更新，文件修改后无需重启服务。但浏览器可能缓存了旧数据，尝试**强制刷新页面**（`Ctrl+Shift+R` / `Cmd+Shift+R`）。

---

**Q: 启动时报错 `Port 3008 is already in use`？**

Mock 服务端口被占用。修改 `port` 配置换一个端口，同时记得同步修改代理配置中的 `target`。

```typescript
startServer({ mockDir: "./mocks", port: 3009 }); // 换个端口
```

---

**Q: 请求没有命中 mock，返回了 404？**

检查以下几点：
1. mock 文件中的 `@url` 路径是否和前端请求路径完全一致（注意大小写和斜杠）
2. `@method` 是否和请求方法一致（默认是 `GET`）
3. 代理配置是否正确，前端请求是否真的转发到了 Mock 服务

---

**Q: 同一 `@url` + `@method` 组合定义了多次？**

插件会输出警告 `[Mock Warn]: ... already exists and will be overwritten`，后面定义的会覆盖前面的。确保每个接口只定义一次。

---

**Q: MockJS 的 `@cname`、`@email` 等语法不生效？**

目前 MockJS 模板语法只在 **`.json`** 和 **`.sse`** 格式的文件中生效，其他格式（`.txt`、`.xml` 等）返回文件的原始内容。

---

**Q: 如何在代码中判断当前是否是 mock 模式？**

通常通过环境变量区分。在 Vite 项目中，可以使用 `.env.mock` 文件：

```bash
# .env.mock
VITE_API_BASE_URL=http://localhost:3008
```

```javascript
// 代码中
const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
```

---

## 示例项目

- [Vue 示例](https://github.com/bianliuzhu/vite-vue-ts)
- [React 示例](https://github.com/bianliuzhu/react-app-ts)

---

## 贡献指南

欢迎提交 [Issue](https://github.com/bianliuzhu/mock-service-plugin/issues) 和 Pull Request。

## 许可证

[MIT](LICENSE)
