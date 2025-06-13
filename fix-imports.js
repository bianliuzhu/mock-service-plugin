import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

const files = glob.sync("src/**/*.ts");

files.forEach((file) => {
  let content = readFileSync(file, "utf-8");

  // 修复相对路径导入
  content = content.replace(
    /from ['"](\.\.?\/[^'"]*?)(['"])/g,
    (match, path, quote) => {
      if (!path.endsWith(".js")) {
        return `from ${quote}${path}.js${quote}`;
      }
      return match;
    }
  );

  writeFileSync(file, content);
});
