# mock-service-webpack

> 快速搭建项目 mock 服务的 webpack 插件，基于 [mockjs](https://github.com/nuysoft/Mock)，适用于任何前端框架如 Vue，React 等

# 作用

通过 webpack 插件的方式，快速搭建项目的 mock 服务，用于前后端分离模式下的并行开发。当无法提供真实服务端时，可以通过本插件构建模拟后台，通过 mockjs 生成模拟随机数据，满足页面交互使用

# 使用

## 安装

```
npm i mock-service-webpack --save-dev
```

## Vue 项目配置方式（Vue2，Vue3 皆可）

1. 在项目根目录下创建

## 通用配置

在工程目录中增加一个 `mocks` 文件夹

```
.
├── app         //工程目录
    ├── dist
    ├── config
    ├── src
    ├── mocks    //mock数据目录
    |   ├── data.js
    |   ├── data.json
        ...
```

在 `webpack.config.js` 中，配置 proxy 和 mockjs-webpck-plugin

```javascript
// 引入插件
const MockPlugin = require("mockplugin");

module.exports = {
	entry: "./index.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "my-first-webpack.bundle.js",
	},
	// 配置插件
	plugins: [
		// 插件的功能是根据配置文件，起一个指定端口的server，将接口请求指向json文件
		new MockPlugin({
			// mock数据的存放路径
			path: path.join(__dirname, "./mock"),
			// 配置mock服务的端口，避免与应用端口冲突
			port: 3000,
		}),
	],
	// 配置代理，这里的代理为webpack自带功能
	devServer: {
		// 应用端口，避免与mock服务端口冲突
		port: 5001,
		proxy: {
			// 配置匹配服务的url规则，以及其代理的服务地址，即mock服务的地址
			"/": "http://localhost:3000/",
		},
	},
};
```

如果想要给 mock 服务指定 URL 前缀，你可以在 webpack 的 proxy 设置进行如下配置：

```javascript
...
module.exports = {
  ...
  // 配置代理，这里的代理为webpack自带功能
  devServer: {
    // 应用端口，避免与mock服务端口冲突
    port: 5001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        pathRewrite: {
          // 设置url的重写, 实际过程如下：
          // http://localhost:5001/api/getData -> http://localhost:3000/getData
          '^/api': ''
        }
      }
    }
  }
};
```

_增加 mock 数据时，在 mock 中新建文件即可，webpack 配置无需更新，**但是需要重新启动应用**_

# 参数

```javascript
new MockPlugin(options);
```

- options.path mock 数据的存放路径
- options.port 代理服务器端口，默认为 3000

# Mock 数据

`Mock 数据` 并非严格的 json 格式数据文件，更像是 js 代码。
当我们只需要返回直接的数据结构，使用如下的 json 格式会显得非常直接，示例`data.json`如下：

```js
/**
 * Json data file
 *
 * @url /json/data
 *
 * Here you can write a detailed description
 * of the parameters of the information.
 *
 * Parameter description and other instructions.
 * uid: user ID
 * name: username
 * email: the email
 * etc.
 */
{
  "code": 0,
  "result|5": [
    {
      "uid|+1": 1,
      "name": "@name",
      "email": "@email"
    }
  ]
}
```

对应的文件内容可以这样理解

- 文件标题： `Json data file`
- 访问路径： `/json/data`
- 描述：

```
Here you can write a detailed description
of the parameters of the information.

Parameter description and other instructions.
 uid: user ID
 name: username
 email: the email
etc.
```

- 数据： 剩下的部分

接下来我们就可以在浏览器中访问<http://[localhost]:[3000]/json/data> 这个地址获取数据。

除此之外，我们可以直接使用 js 文件，当我们需要校验入参时，这会很实用。

```js
/**
 * JS data file
 *
 * @url /js/js-data-file
 *
 * Export data by using the JS file directly.
 */

module.exports = {
	code: function () {
		// simulation error code, 1/10 probability of error code 1.
		return Math.random() < 0.1 ? 1 : 0;
	},
	"list|5-10": [{ title: "@title", link: "@url" }],
};
```

或者是输出一个 `function`

```js
/**
 * JS function file
 *
 * @url /js/js-func-file/user?uid=233
 *
 * GET: Request method and parameter
 *   uid This is the requested userID
 *
 * Here you can write a detailed description
 * of the parameters of the information.
 */
module.exports = function (req) {
	var uid = req.query.uid;

	if (!uid) {
		return {
			code: -1,
			msg: "no uid",
		};
	}

	return {
		code: 0,
		data: {
			uid: +uid,
			name: "@name",
			"age|20-30": 1,
			email: "@email",
			date: "@date",
		},
	};
};
```

_以上 mock 数据的语法均来自 `mockjs`，想获取更多语法可以参阅 mockjs 官网文档和示例_

mock 数据说明文档和功能来源于 [52cik/express-mockjs](https://github.com/52cik/express-mockjs)

## Mock JSON

- [Mock.js 0.1 官方文档](https://github.com/nuysoft/Mock/wiki)
- [Mock 示例](http://mockjs-lite.js.org/docs/examples.html)

#ChangeLog
version 3.0.0 -- 2019.04.07

1. 什么都没有更新! 被 npmjs 的命令 `npm version <update_type>` 悄咪咪升级到 3.0.0 了
   version 2.0.0 -- 2019.04.06
1. 增加数据文件更新热加载，如增加／删除，修改文件内容等。

# 支持

此插件灵感来源于 [MarxJiao/mock-webpack-plugin](.https://github.com/MarxJiao/mock-webpack-plugin) 和 [52cik/express-mockjs](https://github.com/52cik/express-mockjs)。

感谢两位作者 [Marx(MarxJiao)](https://github.com/MarxJiao) 和 [楼教主(52cik)](https://github.com/52cik)。
