import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";

import json from "@rollup/plugin-json";

import { defineConfig } from "rollup";

export default defineConfig({
  /** 打包入口文件 */
  input: "./src/index.ts",
  /** 输出配置 */
  output: {
    /** 输出目录 */
    dir: "./lib",
    /** 输出文件为 CommonJS格式 */
    format: "cjs",
    preserveModules: true,
    exports: "named",
    sourcemap: true,
  },
  plugins: [
    json(),
    /** 配置插件 - 将json转换为ES6模块 */
    typescript({
      module: "esnext",
      exclude: ["./node_modules/**"],
    }),
    nodeResolve({
      extensions: [".js", ".ts", ".json"],
      modulesOnly: true,
      preferBuiltins: false,
    }),
    commonjs({ extensions: [".js", ".ts", ".json"] }),
    copy({
      targets: [
        { src: "index.html", dest: "lib/" },
        { src: "mocks", dest: "lib/" },
      ],
      hook: "writeBundle", // 在写入捆绑包后执行
    }),
  ],
  /** 排除打包的模块 */
  external: ["csv-stringify", "glob", "watch", "xml2js"],
});
