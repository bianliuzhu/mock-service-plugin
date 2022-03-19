/*
 * @Description:
 * @Author: Gleason
 * @Date: 2021-04-11 14:26:23
 * @LastEditors: Gleason
 * @LastEditTime: 2022-03-20 00:09:45
 */
const fs = require("fs");

const { walk } = require("./util");

const RE = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+([^\n]+)[\s\S]+?\*\//im;

function parseAPIs(dir) {
	const routes = {}; // routes list

	const files = walk(dir);

	(files || []).forEach((filepath) => {
		const content = String(fs.readFileSync(filepath, "utf8")).trim() || "{}";

		let url = filepath;
		let describe = "no description";

		const m = content.match(RE);

		if (m) {
			url = m[2].trim();
			describe =
				m[1].replace(/(^[\s*]+|[\s*]+$)/g, "") ||
				m[2].replace(/(^[\s*]+|[\s*]+$)/g, "");
		}

		if (url[0] !== "/") {
			// fix url path
			url = "/" + url;
		}

		let pathname = url;
		if (pathname.indexOf("?") > -1) {
			pathname = pathname.split("?")[0];
		}

		if (routes[pathname]) {
			console.warn(
				"[Mock Warn]: [" +
					filepath +
					": " +
					pathname +
					"] 已经存在，并已被新数据覆盖."
			);
		}

		routes[pathname] = {
			url: url,
			filepath: filepath,
			describe: describe,
		};

		if (/\.json$/.test(filepath)) {
			routes[pathname].content = content;
		}
	});

	return routes;
}

module.exports = parseAPIs;
