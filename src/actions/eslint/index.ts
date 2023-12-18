import { SRC_DIR } from "../../constants";
import { cancel, confirm, isCancel } from '@clack/prompts';
import { existsSync } from "fs";
import { getProjectPath } from "../../utils/getProjectPath";
import { exitPrompt } from "../../utils/exitPrompt";

const chalk = require("chalk");

const eslint = async (srcPath, eslintConfigPath, shouldEslintFix) => {
  const { $ } = await import('execa');
  try {
    await $({
      env: { ...process.env, FORCE_COLOR: '1' }
    })`eslint ${srcPath} --ext .ts,.tsx,.js,.jsx ${shouldEslintFix && "--fix"} --config ${eslintConfigPath}`;
  } catch (error) {
    /* 输出 eslint 校验错误 */
    console.log(chalk.yellow(error.stderr));
    console.log(error.stdout);
  }
}

export const middleware_eslint = async (next, ctxRef) => {
  const {
    srcPath = SRC_DIR,
    eslintConfigPath = getProjectPath(".eslintrc.js")
  } = ctxRef.current;

  if (!existsSync(eslintConfigPath)) {
    console.log(chalk.red(`
当前工程不存在 .eslintrc.js, 跳过 eslint 格式校验
    `));

    next();
    return;
  }

  let shouldEslintFix = ctxRef.current.commandArgs?.eslint;

  if (!shouldEslintFix) {
    shouldEslintFix = await confirm({
      message: "是否校验后自动修复？",
      initialValue: true
    });
    if (isCancel(shouldEslintFix)) {
      await exitPrompt();
    }
  }

  await eslint(srcPath, eslintConfigPath, shouldEslintFix);

  next();
};

