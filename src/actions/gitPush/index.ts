import chalk = require("chalk");
import { exitPrompt } from "../../utils/exitPrompt";
import { confirm, isCancel, spinner } from '@clack/prompts';
import { failCallbacks } from "../../core/failCallbacks";

/**
 * 检查 git status 的状态
 */
const logGitStatus = async () => {
  const { $ } = await import('execa');

  try {
    const { stdout } = await $({
      env: { ...process.env, FORCE_COLOR: '1' }
    })`git status`;
    console.log(chalk.yellow("\n === 请仔细检查 git status 提交结果==== \n\n"), stdout);
  } catch (err) {
    console.log(chalk.red(err));
  }
}


/**
 * 交互提示用户二次确认是否需要上传这些文件
 */
const confirmGitStatus = async () => {
  const confirmGitFiles = await confirm({
    message: `请确认是否提交以上代码`,
    initialValue: true
  });

  if (isCancel(confirmGitFiles)) {
    await exitPrompt();
  }

  return confirmGitFiles;
}


/**
 * 确认上传，则使用 git add . 添加文件
 * 失败：则使用 git reset 从暂存区撤回
 */
const gitAdd = async () => {
  const { $ } = await import('execa');

  try {
    await $`git add .`;
  } catch (err) {
    console.log(chalk.red(err));
    await exitPrompt();
  }

  return async () => {
    try {
      await $`git reset`;
    } catch (error) {
      console.log(error);
    }
  }
}

const gitCommit = async () => {
  const { $ } = await import('execa');

  /* 获取当前的 commit ID 号 */
  const { stdout } = await $`git log -1 --pretty=format:"%H"`;

  /* 将 '8dc5075312a5afda1a5f894ea818a1' 删除前后的 quota 引号 */
  const curCommintId = stdout.trim().slice(1, -1);

  try {
    // execa 中如何使用 quota : https://github.com/sindresorhus/execa/issues/556
    await $({
      cwd: process.cwd(),
    })`git commit -m ${"chore: 由 jmi-release 自动生成"}`;

  } catch (err) {
    console.log(chalk.red(err));
    await exitPrompt();
  }

  return async () => {
    try {
      await $`git reset --soft ${curCommintId}`
    } catch (error) {
      console.log(error);
    }
  }
}

export const gitPush = async () => {
  const s = spinner();
  const { $ } = await import('execa');

  s.start('准备推送代码至git仓库');

  const { stdout: curBranchName } = await $`git symbolic-ref --short HEAD`;

  /* 本地分支是否在远端分支存在 */
  const { stdout: remoteBranchs } = await $`git branch -r`;

  const regRex = new RegExp(curBranchName);

  const isExistCurBranch = regRex.test(remoteBranchs);

  const gitPushArgs = isExistCurBranch ? [] : ["--set-upstream", "origin", curBranchName];

  try {
    console.log(chalk.green(`git push ${gitPushArgs.join(" ")}`));
    await $`git push ${gitPushArgs}`
  } catch (error) {
    console.log(error);
    s.stop('git仓库推送失败');
    await exitPrompt();
  }

  s.stop('git仓库推送完毕');
}


export const middleware_gitPush = async (next) => {
  /* step1: 打印 git status */
  await logGitStatus()

  /* step2: 明确需要上传的 git 文件*/
  const confirmGitFiles = await confirmGitStatus();

  if (!confirmGitFiles) {
    await exitPrompt();
  }

  /* step3: 执行 git add . */
  const resetGitAdd = await gitAdd();
  failCallbacks.tapPromise(resetGitAdd);

  /* step4: 自动生成 commit message 并提交 */
  const resetGitCommit = await gitCommit();
  failCallbacks.tapPromise(resetGitCommit);

  await gitPush()

  next();
}