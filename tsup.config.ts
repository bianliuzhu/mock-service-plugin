import { defineConfig } from "tsup";
import fs from "fs/promises";

export default defineConfig(({ minify = false, sourcemap = false }) => {
  console.log("---------------------->", minify, sourcemap);
  return {
    entry: ["src/**/*.ts"], // 主入口文件
    format: ["esm"], // 只输出 ESM 格式
    dts: true, // 生成类型声明
    clean: true, // 构建前清空 lib
    target: "es2020", // 目标语法版本
    outDir: "lib", // 输出目录
    platform: "node", // 指定 Node 环境
    splitting: false, // 禁用代码分割
    treeshake: true, // 启用摇树优化
    minify, // 开发时不压缩
    sourcemap: !sourcemap, // 生成 sourcemap

    // 外部依赖（不打包）
    external: [
      "express",
      "mockjs",
      "chalk",
      "csv-stringify",
      "glob",
      "watch",
      "xml2js",
      "path",
      "fs",
      "http",
      "stream",
      "url",
    ],

    // 构建后复制静态文件
    // async onSuccess() {
    //   await Promise.all([
    //     fs.copyFile("index.html", "lib/index.html"),
    //     fs.cp('mocks', 'lib/mocks', { recursive: true })
    //   ]);
    //   console.log("✅ 静态文件复制完成");
    // },
  };
});
