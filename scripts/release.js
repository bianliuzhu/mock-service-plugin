#!/usr/bin/env node

import { execSync } from "child_process";
import chalk from "chalk";

// 执行命令并返回结果
function execCommand(command) {
  try {
    return execSync(command, { stdio: "pipe" }).toString().trim();
  } catch (error) {
    return null;
  }
}

// 检查 npm 登录状态
function checkNpmLogin() {
  console.log(chalk.blue("检查 npm 登录状态..."));
  const whoami = execCommand("npm whoami");
  if (!whoami) {
    console.log(chalk.yellow("未登录 npm，尝试登录..."));
    try {
      execSync("npm login", { stdio: "inherit" });
    } catch (error) {
      console.error(chalk.red("npm 登录失败，请手动运行 npm login"));
      process.exit(1);
    }
  }
  console.log(chalk.green("npm 登录状态正常"));
}

// 检查 Git 状态
function checkGitStatus() {
  console.log(chalk.blue("检查 Git 状态..."));
  const status = execCommand("git status --porcelain");
  if (status) {
    console.log(chalk.yellow("发现未提交的更改，正在提交..."));
    try {
      execSync("git add .", { stdio: "inherit" });
      execSync('git commit -m "chore: prepare for release"', {
        stdio: "inherit",
      });
    } catch (error) {
      console.error(chalk.red("Git 提交失败"));
      process.exit(1);
    }
  }
  console.log(chalk.green("Git 状态正常"));
}

// 检查远程仓库
function checkRemote() {
  console.log(chalk.blue("检查远程仓库..."));
  const remote = execCommand("git remote -v");
  if (!remote) {
    console.error(chalk.red("未配置远程仓库"));
    process.exit(1);
  }
  console.log(chalk.green("远程仓库配置正常"));
}

// 检查当前分支
function checkBranch() {
  console.log(chalk.blue("检查当前分支..."));
  const branch = execCommand("git rev-parse --abbrev-ref HEAD");
  if (branch !== "main" && branch !== "master") {
    console.log(
      chalk.yellow(`当前分支为 ${branch}，建议在 main 或 master 分支发布`)
    );
    const answer = execSync(
      'read -p "是否继续？(y/n) " answer && echo $answer',
      { stdio: "pipe" }
    )
      .toString()
      .trim();
    if (answer.toLowerCase() !== "y") {
      process.exit(0);
    }
  }
  console.log(chalk.green("分支检查通过"));
}

// 构建项目
function build() {
  console.log(chalk.blue("开始构建项目..."));
  try {
    execSync("npm run build:prod", { stdio: "inherit" });
  } catch (error) {
    console.error(chalk.red("构建失败"));
    process.exit(1);
  }
  console.log(chalk.green("构建成功"));
}

// 发布流程
async function release() {
  try {
    // 1. 检查 npm 登录状态
    checkNpmLogin();

    // 2. 检查远程仓库
    checkRemote();

    // 3. 检查分支
    checkBranch();

    // 4. 同步远程代码
    console.log(chalk.blue("同步远程代码..."));
    execSync("git pull origin main", { stdio: "inherit" });

    // 5. 构建项目
    build();

    // 6. 更新版本号
    console.log(chalk.blue("更新版本号..."));
    execSync("npm --no-git-tag-version version patch", { stdio: "inherit" });

    // 7. 提交更改
    console.log(chalk.blue("提交版本更新..."));
    execSync("git add package.json package-lock.json", { stdio: "inherit" });
    const newVersion = execCommand("npm pkg get version").replace(/"/g, "");
    execSync(`git commit -m "chore: release v${newVersion}"`, {
      stdio: "inherit",
    });
    execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, {
      stdio: "inherit",
    });

    // 8. 发布到 npm
    console.log(chalk.blue("发布到 npm..."));
    execSync("npm publish", { stdio: "inherit" });

    // 9. 推送更改和标签
    console.log(chalk.blue("推送更改和标签..."));
    execSync("git push && git push --tags", { stdio: "inherit" });

    console.log(chalk.green("发布成功！"));
  } catch (error) {
    console.error(chalk.red("发布失败：", error.message));
    process.exit(1);
  }
}

// 执行发布
release();
