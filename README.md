# mock-service-plugin

[English](README.md) | [中文](README-zh.md)

A powerful local Mock service plugin that supports Webpack, Vite, and other mainstream build tools — letting you develop and debug frontend pages even before the backend APIs are ready.

## Table of Contents

- [What is Mocking?](#what-is-mocking)
- [Features](#features)
- [Installation](#installation)
- [5-Minute Quick Start](#5-minute-quick-start)
- [Mock File Specification](#mock-file-specification)
- [MockJS Syntax Reference](#mockjs-syntax-reference)
- [Supported File Formats](#supported-file-formats)
- [Full Format Examples](#full-format-examples)
- [Advanced Features](#advanced-features)
- [Framework Integration](#framework-integration)
- [Debug Interface](#debug-interface)
- [FAQ](#faq)
- [Example Projects](#example-projects)

---

## What is Mocking?

In real-world development, frontend and backend teams often work in parallel. When the backend APIs aren't ready yet, the frontend has no data to work with and development stalls.

**Mocking** means running a fake backend service locally that returns dummy data according to the agreed API contract, so frontend development can proceed independently without relying on a real backend.

What `mock-service-plugin` does is: **read your mock data files, automatically start a local HTTP server, and return the corresponding data when frontend requests come in.**

---

## Features

- 🚀 Supports multiple build tools: Webpack 4/5, Vite, Vue CLI, Create React App
- 🎯 Compatible with Vue, React, and other mainstream frameworks
- 🔥 Feature-rich
  - RESTful API support (GET / POST / PUT / DELETE, etc.)
  - Dynamic route parameters (e.g. `/api/users/:id`)
  - Streaming responses (SSE / EventStream, simulates AI typewriter effect)
  - Multiple response formats (JSON / XML / CSV / Image / Plain text, etc.)
- 💡 Minimal configuration, hot reload, built-in debug interface

---

## Installation

```bash
# npm
npm install mock-service-plugin --save-dev

# yarn
yarn add mock-service-plugin --dev

# pnpm
pnpm add mock-service-plugin --save-dev
```

---

## 5-Minute Quick Start

The following uses a **Vite + Vue** project as an example to walk you through your first Mock API from scratch.

### Step 1: Install the Plugin

```bash
npm install mock-service-plugin --save-dev
```

### Step 2: Create the Mock Directory and File

Create a `mocks` folder in the project root and add a file `mocks/user.json`:

```
project-root/
├── mocks/
│   └── user.json   ← create this file
├── src/
├── vite.config.ts
└── package.json
```

Contents of `mocks/user.json`:

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

> The `/** ... */` comment at the top is the route configuration, telling the plugin which API path and HTTP method this file corresponds to.  
> `@cname`, `@email`, etc. are MockJS random data placeholders — each request generates different random data. See [MockJS Syntax Reference](#mockjs-syntax-reference) for full syntax.

### Step 3: Start the Mock Service in Vite

Create `vite-mock-plugin.ts` in the project root:

```typescript
// vite-mock-plugin.ts
import { startServer } from "mock-service-plugin";
import { createServer } from "net";
import { join } from "path";

// Check if a port is already in use
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

// Vite plugin: start Mock service in mock mode
export default function ViteMockServicePlugin(mode: string) {
  return {
    name: "ViteMockServicePlugin",
    buildStart() {
      (async () => {
        const port = 3008;
        if (await isPortTaken(port)) {
          console.log(`[Mock] Port ${port} is already in use, skipping start`);
          return;
        }
        if (mode === "mock") {
          startServer({
            mockDir: join(__dirname, "./mocks"), // path to mock folder
            port,                                // mock service port
          });
        }
      })();
    },
  };
}
```

Update `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ViteMockServicePlugin from "./vite-mock-plugin";

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    ViteMockServicePlugin(mode), // pass current mode
  ],
  server: {
    proxy: {
      // Proxy /api requests to the mock service
      "/api": {
        target: "http://localhost:3008",
        changeOrigin: true,
      },
    },
  },
}));
```

Add a mock start script to `package.json`:

```json
{
  "scripts": {
    "dev": "vite --mode dev",
    "mock": "vite --mode mock"
  }
}
```

### Step 4: Start and Test

```bash
npm run mock
```

After starting, open `http://localhost:3008/api/user/info` in your browser and you'll see randomly generated user data:

```json
{
  "code": 200,
  "data": {
    "id": "660000198812040277",
    "name": "Han Lei",
    "email": "c.wjjdmpyy@wfomlb.net",
    "avatar": "http://dummyimage.com/100x100"
  },
  "message": "success"
}
```

**Congratulations! You've successfully set up your first Mock API.** 🎉

---

## Mock File Specification

### File Structure

Each mock file consists of two parts:

```
file = top comment (route config) + response body
```

```json
/**
 * @url /api/users        ← required: API path
 * @method GET            ← optional: HTTP method, defaults to GET
 */
{
  "code": 200,
  "data": []
}
```

### Annotation Reference

| Annotation | Required | Description | Example |
|------------|----------|-------------|---------|
| `@url` | ✅ Yes | API path, supports dynamic parameters | `@url /api/users/:id` |
| `@method` | Optional | HTTP method, defaults to `GET` | `@method POST` |
| `@content-type` | Optional | Override the default Content-Type. Preferably use the **file extension** as reference — see [Supported File Formats](#supported-file-formats). | `@content-type image/png` |

### Dynamic Route Parameters

Use `:paramName` to define dynamic path segments:

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

Both `/api/users/123` and `/api/users/456` will match this file.

### Managing Multiple APIs in One Directory

It's recommended to organize files by business module:

```
mocks/
├── user.json        → /api/user/...
├── product.json     → /api/product/...
├── orders.csv       → /api/orders
├── banner.xml       → /api/banner
└── stream.sse       → /api/stream (streaming response)
```

The plugin **recursively scans** the entire `mocks` directory and automatically registers all routes found in every file.

---

## MockJS Syntax Reference

> MockJS is a data mocking library that generates random data using template syntax. The plugin bundles MockJS, so it can be used directly in `.json` mock files.

### Random Value Placeholders
> See [Full Syntax Categories](#full-syntax-categories)

| Syntax | Description | Example Output |
|--------|-------------|----------------|
| `@id` | Random ID number | `"420000199206230937"` |
| `@guid` | Random GUID | `"662C63B4-FD43-66F4-3328"` |
| `@cname` | Random Chinese name | `"Wang Fang"` |
| `@name` | Random English name | `"Charles Lopez"` |
| `@email` | Random email address | `"x.fwtue@pbgty.com"` |
| `@url` | Random URL | `"http://ljwih.io/lxqf"` |
| `@ip` | Random IP address | `"52.249.14.3"` |
| `@integer(min, max)` | Random integer in range | `@integer(1, 100)` → `42` |
| `@float(min, max, dMin, dMax)` | Random float | `@float(1, 100, 2, 2)` → `36.14` |
| `@boolean` | Random boolean | `true` or `false` |
| `@date` | Random date | `"2021-07-30"` |
| `@datetime` | Random datetime | `"2021-07-30 10:42:01"` |
| `@now` | Current time | `"2026-03-27 14:22:00"` |
| `@csentence(min, max)` | Random Chinese sentence | `"学中用称化置速。"` |
| `@ctitle(min, max)` | Random Chinese title | `"Sample Product Name"` |
| `@cparagraph` | Random Chinese paragraph | A paragraph of random Chinese text |
| `@image('WxH')` | Random placeholder image URL | `@image('200x100')` |
| `@pick(['a','b','c'])` | Pick one item randomly from array | `"b"` |
| `@increment(1)` | Auto-incrementing number (starts at 1) | `1`, `2`, `3`... |
| `@string('lower', 8)` | Random string | `"abcdefgh"` |

### Generating Arrays (Bulk Data)

Append `|count` to a field name to generate an array:

```json
{
  "list|5": [{ "id": "@id", "name": "@cname" }]
}
```

Generates a list of 5 items. Use `|min-max` for a random count:

```json
{
  "list|5-10": [{ "id": "@id", "name": "@cname" }]
}
```

### Full Syntax Categories

Prefix method names with `@` when using them, e.g. `@name`, `@integer(1, 100)`.

| Category | Available Methods |
|----------|------------------|
| Basic | `boolean`, `natural`, `integer`, `float`, `character`, `string`, `range`, `date`, `time`, `datetime`, `now` |
| Image | `image`, `dataImage` |
| Color | `color` |
| Text | `paragraph`, `sentence`, `word`, `title`, `cparagraph`, `csentence`, `cword`, `ctitle` |
| Name | `first`, `last`, `name`, `cfirst`, `clast`, `cname` |
| Web | `url`, `domain`, `email`, `ip`, `tld` |
| Address | `area`, `region` |
| Helper | `capitalize`, `upper`, `lower`, `pick`, `shuffle` |
| Misc | `guid`, `id` |

> Methods prefixed with `c` (e.g. `cname`, `csentence`) generate Chinese content; methods without the prefix generate English content.

### Full Example

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

## Supported File Formats

The plugin automatically identifies the response type based on the **file extension**:

| Extension | Content-Type | Description |
|-----------|--------------|-------------|
| `.json` | `application/json` | JSON data, supports MockJS template syntax |
| `.sse` | `text/event-stream` | SSE streaming response, supports MockJS |
| `.txt` | `text/plain` | Plain text |
| `.html` | `text/html` | HTML document |
| `.xml` | `application/xml` | XML data |
| `.csv` | `text/csv` | CSV spreadsheet data |
| `.md` | `text/markdown` | Markdown document |
| `.css` | `text/css` | CSS stylesheet |
| `.js` | `application/javascript` | JavaScript code |
| `.yaml` / `.yml` | `application/x-yaml` | YAML configuration |
| `.png` | `image/png` | PNG image |
| `.jpg` / `.jpeg` | `image/jpeg` | JPEG image |
| `.gif` | `image/gif` | GIF image |
| `.svg` | `image/svg+xml` | SVG vector image |
| `.pdf` | `application/pdf` | PDF document |

> **Note**: MockJS template syntax (e.g. `@cname`) currently only works in **`.json`** and **`.sse`** files. Other formats return the raw file content.

---

## Full Format Examples

### JSON Format (Most Common)

Filename: `user.json`

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

### Plain Text Format

Filename: `notice.txt`

```
/**
 * @url /api/notice
 * @method GET
 */
System maintenance scheduled for tonight at 22:00, expected to last 2 hours.
Please save your work in advance!
```

### XML Format

Filename: `product.xml`

```xml
/**
 * @url /api/product/detail
 * @method GET
 */
<?xml version="1.0" encoding="UTF-8"?>
<product>
  <id>1001</id>
  <name>Sample Product</name>
  <price>99.00</price>
  <stock>200</stock>
</product>
```

### CSV Format

Filename: `orders.csv`

```
/**
 * @url /api/orders/export
 * @method GET
 */
Order ID,Customer,Product,Qty,Amount,Status
ORD001,Alice,iPhone 15,1,7999.00,Completed
ORD002,Bob,MacBook Pro,1,14999.00,Shipped
ORD003,Charlie,AirPods,2,1598.00,Pending Payment
```

### Image Format

Filename: `avatar.json` (note: use a JSON file to hold the image path)

```json
/**
 * @url /api/avatar/:id
 * @method GET
 * @content-type image/png
 */
"/absolute/path/to/your/avatar.png"
```

> For image responses, use the `@content-type` annotation to declare the type. The file content should be the absolute path to the image file as a string.

---

## Advanced Features

### RESTful API — Same Path, Different Methods

For the same path, you can define responses for different HTTP methods in separate files (or the same file):

```json
// POST /api/users → user-create.json
/**
 * @url /api/users
 * @method POST
 */
{
  "code": 200,
  "message": "Created successfully",
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
{ "code": 200, "message": "Updated successfully" }
```

```json
// DELETE /api/users/:id → user-delete.json
/**
 * @url /api/users/:id
 * @method DELETE
 */
{ "code": 200, "message": "Deleted successfully" }
```

### Streaming Response (SSE) — Simulate AI Typewriter Effect

Files with the `.sse` extension make the plugin push each item in the `items` array one by one, simulating streaming output.

Filename: `chat.sse`

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

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `interval` | number | Delay between messages in milliseconds. Supports MockJS expressions, e.g. `"@integer(100, 500)"` |
| `items` | array | List of messages to push. Supports `|count` syntax for bulk generation |
| `items[].id` | string/number | SSE message `id` field (optional) |
| `items[].event` | string | SSE message `event` field (optional) |
| `items[].data` | any | SSE message `data` field, serialized as a JSON string |
| `items[].retry` | number | Reconnection time in ms (optional) |

Frontend example (JavaScript):

```javascript
const evtSource = new EventSource("/api/chat/stream");
evtSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.content); // outputs word by word
};
evtSource.onerror = () => evtSource.close();
```

---

## Framework Integration

### Vite (Recommended)

See the complete example in [5-Minute Quick Start](#5-minute-quick-start).

Core idea: use the `--mode mock` flag to distinguish development modes, and only start the Mock service in mock mode.

### Webpack / Vue CLI

```javascript
// webpack.config.js or vue.config.js
const path = require("path");
const { MockServicePlugin } = require("mock-service-plugin");

module.exports = {
  // Webpack config...
  plugins: [
    new MockServicePlugin({
      path: path.join(__dirname, "./mocks"), // path to mock folder (note: parameter is named 'path')
      port: 3008,                            // mock service port
    }),
  ],
};
```

For Vue CLI (`vue.config.js`), also configure the proxy:

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

### React (CRA)

#### Using craco

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

#### Using customize-cra

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

## Debug Interface

After the Mock service starts, open the Mock service root URL (e.g. `http://localhost:3008`) directly in your browser to see the built-in debug interface. It shows a list of all currently registered Mock APIs, making it easy to inspect and test your routes.

---

## FAQ

**Q: I modified a mock file but the response didn't change?**

The plugin supports hot reload — no service restart needed after file changes. However, your browser may have cached the old response. Try a **hard refresh** (`Ctrl+Shift+R` / `Cmd+Shift+R`).

---

**Q: Getting an error `Port 3008 is already in use` on startup?**

The mock service port is occupied. Change the `port` config to use a different port, and remember to update the `target` in your proxy configuration accordingly.

```typescript
startServer({ mockDir: "./mocks", port: 3009 }); // use a different port
```

---

**Q: Requests aren't matching my mock, returning 404?**

Check the following:
1. Does the `@url` path in the mock file exactly match the frontend request path (watch for case and trailing slashes)?
2. Does `@method` match the request method (default is `GET`)?
3. Is the proxy configured correctly — is the frontend request actually being forwarded to the Mock service?

---

**Q: The same `@url` + `@method` combination is defined more than once?**

The plugin will output a warning: `[Mock Warn]: ... already exists and will be overwritten`. The later definition will overwrite the earlier one. Make sure each API is only defined once.

---

**Q: MockJS placeholders like `@cname` and `@email` aren't working?**

MockJS template syntax currently only works in **`.json`** and **`.sse`** files. Other formats (`.txt`, `.xml`, etc.) return the raw file content.

---

**Q: How do I check whether the app is in mock mode in code?**

Typically you distinguish modes via environment variables. In a Vite project, you can use a `.env.mock` file:

```bash
# .env.mock
VITE_API_BASE_URL=http://localhost:3008
```

```javascript
// in your code
const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
```

---

## Example Projects

- [Vue Example](https://github.com/bianliuzhu/vite-vue-ts)
- [React Example](https://github.com/bianliuzhu/react-app-ts)

---

## Contributing

Issues and Pull Requests are welcome.

## License

[MIT](LICENSE)
