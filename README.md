# mock-service-plugin

[English](README.md) | [中文](README-zh.md)

A powerful Mock service plugin that supports multiple frameworks and build tools, providing flexible interface simulation capabilities.

## Features

- 🚀 Support for multiple build tools
  - Webpack 4/5
  - Vite
  - Vue CLI
  - Create React App (CRA)
- 🎯 Support for multiple frameworks
  - Vue
  - React
- 🔥 Powerful feature support
  - RESTful API support
  - Streaming responses (SSE/EventStream)
  - Multiple response formats (JSON/XML/CSV/Text etc.)
  - Dynamic route parameters
  - Request method matching (GET/POST/PUT/DELETE etc.)
- 💡 Easy to use
  - Zero configuration startup
  - Hot reload support
  - Friendly debugging interface

## Quick Start

### Installation

```bash
npm install mock-service-plugin --save-dev

yarn add mock-service-plugin --dev
```

### Basic Configuration

```javascript
const MockServicePlugin = require("mock-service-plugin");

module.exports = {
  plugins: [
    new MockServicePlugin({
      mockDir: path.join(__dirname, "./mocks"), // mock data directory
      port: 3000, // mock service port
    }),
  ],
};
```

## Mock Data Specification

### Basic Format

```javascript
/**
 * @url /api/users
 * @method GET
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

### Header Annotation Description

```javascript
/**
 * @url /api/users
 * @method GET
 */
```

- `@url`: Interface path (required)
- `@method`: Request method (optional, supports GET/POST/PUT/DELETE etc., case-insensitive)

### Request Method Matching

1. Specify request method:

```javascript
/**
 * @url /api/users
 * @method POST
 */
{
  "code": 200,
  "message": "Created successfully"
}
```

2. Support all request methods (without @method):

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

3. RESTful API example:

```javascript
// POST request
/**
 * @url /api/users
 * @method POST
 */
{
  "code": 200,
  "message": "Created successfully"
}

// GET request
/**
 * @url /api/users/:id
 * @method GET
 */
{
  "id": "@id",
  "name": "@cname"
}

// PUT request
/**
 * @url /api/users/:id
 * @method PUT
 */
{
  "code": 200,
  "message": "Updated successfully"
}

// DELETE request
/**
 * @url /api/users/:id
 * @method DELETE
 */
{
  "code": 200,
  "message": "Deleted successfully"
}
```

### Supported Response Types

| Mock file extension | Content-Type           | Description       |
| ------------------- | ---------------------- | ----------------- |
| .json               | application/json       | JSON data format  |
| .txt                | text/plain             | Plain text format |
| .html               | text/html              | HTML document     |
| .xml                | application/xml        | XML data format   |
| .csv                | text/csv               | CSV table data    |
| .md                 | text/markdown          | Markdown document |
| .pdf                | application/pdf        | PDF document      |
| .png                | image/png              | PNG image         |
| .jpg/.jpeg          | image/jpeg             | JPEG image        |
| .gif                | image/gif              | GIF image         |
| .svg                | image/svg+xml          | SVG vector image  |
| .css                | text/css               | CSS stylesheet    |
| .js                 | application/javascript | JavaScript code   |
| .yaml/.yml          | application/x-yaml     | YAML config file  |
| .sse                | text/event-stream      | SSE event stream  |

### Mock File Examples

#### JSON Format (mock.json)

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

#### Text Format (mock.txt)

```javascript
/**
 * @url /api/text
 * @method GET
 */
This is a mock text content, supporting multiple lines.
Second line content.
Third line content.
```

#### CSS Format (mock.css)

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

#### Markdown Format (mock.md)

```javascript
/**
 * @url /api/markdown
 * @method GET
 */
# Heading 1
## Heading 2
- List item 1
- List item 2
```

#### YAML Format (mock.yaml)

```javascript
/**
 * @url /api/config
 * @method GET
 */
version: 1.0;
settings: debug: true;
timeout: 30;
```

#### CSV Format (mock.csv)

```javascript
/**
 * @url /api/data
 * @method GET
 */
(id, name, age);
(1, John, 25);
(2, Jane, 30);
(3, Bob, 28);
```

#### XML Format (mock.xml)

```javascript
/**
 * @url /api/xml
 * @method GET
 */
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user>
    <name>John</name>
    <age>25</age>
  </user>
</root>
```

#### JavaScript Format (mock.js)

```javascript
/**
 * @url /api/script
 * @method GET
 */
function greeting(name) {
  return `Hello, ${name}!`;
}
```

For image type responses, you can directly return the image file path:

```javascript
/**
 * @url /api/avatar
 * @content-type image/png
 */
"/path/to/avatar.png";
```

## Advanced Features

### RESTful API Support

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

### Streaming Response

File extension: mock.sse

```javascript
/**
 * @url /api/stream
 */
{
  "interval": "@integer(100,500)",
  "items|10": [{
    "id": "@increment(1)",
    "data": {
      "content": "@csentence(3,10)"
    }
  }]
}
```

## Framework Integration

### Vue Project

```javascript
// vue.config.js
const MockServicePlugin = require("mock-service-plugin");

module.exports = {
  configureWebpack: {
    plugins: [
      new MockServicePlugin({
        mockDir: path.join(__dirname, "./mocks"),
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

### React Project (CRA)

#### Using craco

```javascript
// craco.config.js
const MockServicePlugin = require("mock-service-plugin");

module.exports = {
  webpack: {
    plugins: {
      add: [
        new MockServicePlugin({
          mockDir: path.join(__dirname, "./mocks"),
          port: 9090,
        }),
      ],
    },
  },
};
```

#### Using customize-cra

```javascript
// config-overrides.js
const { override, addWebpackPlugin } = require("customize-cra");
const MockServicePlugin = require("mock-service-plugin");

module.exports = override(
  addWebpackPlugin(
    new MockServicePlugin({
      mockDir: path.join(__dirname, "./mocks"),
      port: 9090,
    })
  )
);
```

### Vite Project

```ts
// vite-mock-plugin.ts file

import { startServer } from "mock-service-plugin";
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
            const ints = startServer({
              // Path for mock data
              mockDir: join(__dirname, "./mocks"),
              // Configure mock service port to avoid conflicts with application port
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
// The vite-mock-plugin imported here is the code snippet above
import ViteMockServicePlugin from "./vite-mock-plugin";

export default defineConfig({
  plugins: [ViteMockServicePlugin("development")],
});
```

## Example Projects

- [Vue Example](https://github.com/bianliuzhu/vite-vue-ts)
- [React Example](https://github.com/bianliuzhu/react-app-ts)

## Notes

1. Page refresh required after modifying mock data
2. Ensure mock service port doesn't conflict with application port
3. Recommended to use relative paths for mock data directory configuration

## Contributing

Issues and Pull Requests are welcome

## License

MIT
