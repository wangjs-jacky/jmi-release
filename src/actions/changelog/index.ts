import { existsSync, readFileSync, writeFileSync } from 'fs';
import { CHANGELOG_NAME } from '../../constants';
import { getProjectPath } from '../../utils/getProjectPath';
import { confirm, isCancel } from '@clack/prompts';
import { exitPrompt } from '../../utils/exitPrompt';
import { failCallbacks } from '../../core/failCallbacks';

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




/**
 * 生成 CHANGELOG.md 文件
 */
export async function generateChangelog({ cwd }) {
  const { $ } = await import('execa');

  const oldChangelogContent = getOldChangeLog();

  const isGenerateChangeLog = await confirm({
    message: `是否需要生成 ${CHANGELOG_NAME} 文件`,
    initialValue: true
  });

  if (isCancel(isGenerateChangeLog)) {
    await exitPrompt();
  }

  if (!isGenerateChangeLog) return;

  try {
    await $({ cwd: cwd })`conventional-changelog -p angular -i ${CHANGELOG_NAME} -s`;
  } catch (err) {
    console.error(`初始化 eslint 失败`);
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