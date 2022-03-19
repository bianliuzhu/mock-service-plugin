/*
 * @Description:
 * @Author: Gleason
 * @Date: 2022-03-19 15:37:22
 * @LastEditors: Gleason
 * @LastEditTime: 2022-03-19 17:25:44
 */
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "@rollup/plugin-json";
import { uglify } from "rollup-plugin-uglify";

export default {
	input: "src/index.js", // 必须
	output: {
		file: "dist/bundle.js",
		format: "cjs",
	},
	plugins: [resolve(), commonjs(), json(), uglify()],
};
