const chalk = require("chalk");
import { failCallbacks } from "../../core/failCallbacks";
import { exitPrompt } from "../../utils/exitPrompt";

/**
 * 打tag提交至git
 */
const addTag = async (nextVersion: string) => {
  const { $ } = await import('execa');

  try {
    await $`git tag v${nextVersion}`;
  } catch (err) {
    console.log(chalk.red(err));
    console.log();
    await exitPrompt();
  }

  return async () => {
    try {
      await $`git tag -d v${nextVersion}`;
    } catch (error) {
      console.log("error", error);
    }
  }
}

export const middleware_addTag = async (next, ctxRef) => {
  let nextVersion = ctxRef.current.nextVersion;

  if (!nextVersion) {
    console.log(chalk.red("缺少版本号，使用 1.0.0 作为初始版本号"));
    nextVersion = "1.0.0";
  }

  const deleteGitTag = await addTag(nextVersion);

  failCallbacks.tapPromise(deleteGitTag);

  next();
}
