import { existsSync, readFileSync, writeFileSync } from 'fs';
import { CHANGELOG_NAME } from '../../constants';
import { getProjectPath } from '../../utils/getProjectPath';
import { confirm, isCancel } from '@clack/prompts';
import { exitPrompt } from '../../utils/exitPrompt';
import { failCallbacks } from '../../core/failCallbacks';
const chalk = require('chalk');

/* 目的：会退时需要使用 */
const getOldChangeLog = () => {
  const changeLogPath = getProjectPath(CHANGELOG_NAME);
  /* 原项目是否存在 CHANGELOG.md 文件 */
  let content = null;
  if (existsSync(changeLogPath)) {
    content = readFileSync(changeLogPath, 'utf-8');
  }

  return content;
}

const hasInitialCommit = async () => {
  const { $ } = await import('execa');
  try {
    await $`git log`;
  } catch (error) {
    console.log(chalk.red(`当前仓库无 git 提交记录,需提交第一个 commit 后方可进行后续发包操作`));
    await exitPrompt();
    return true;
  }

  return false
}


/**
 * 生成 CHANGELOG.md 文件
 */
export async function generateChangelog({ cwd }) {
  const { $ } = await import('execa');

  const oldChangelogContent = getOldChangeLog();

  /* 是否存在 git raw commit */
  await hasInitialCommit()

  const isGenerateChangeLog = await confirm({
    message: `是否需要生成 ${CHANGELOG_NAME} 文件`,
    initialValue: true
  });

  if (isCancel(isGenerateChangeLog)) {
    await exitPrompt();
  }

  if (!isGenerateChangeLog) return;

  try {
    await $({ cwd: cwd })`npx conventional-changelog-cli -p angular -i ${CHANGELOG_NAME} -s`;
  } catch (err) {
    console.log(`${CHANGELOG_NAME} 文件生成失败`, err)
  }

  /* 注册失败回调事件 */
  return async () => {
    if (!oldChangelogContent) {
      if (existsSync(getProjectPath(CHANGELOG_NAME))) {
        await $({ cwd: cwd })`rm -rf ${getProjectPath(CHANGELOG_NAME)}`;
      }
    } else {
      writeFileSync(getProjectPath(CHANGELOG_NAME), oldChangelogContent);
    }
  };
}

export const middleware_changelog = async (next, ctxRef) => {
  const cwd = ctxRef.current?.cwd || process.cwd();

  const backChangeLogFn = await generateChangelog({ cwd });

  /* 注册失败回调 */
  failCallbacks.tapPromise(backChangeLogFn);

  next();
};