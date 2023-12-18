import { valid, inc } from "semver";
import { isCancel, select } from '@clack/prompts';
import { writeFileSync } from "fs";
import { getProjectPath } from "../../utils/getProjectPath";
import { failCallbacks } from "../../core/failCallbacks";
import { exitPrompt } from "../../utils/exitPrompt";

/**
 * 使用 semver 根据当前 package.json 版本号计算出待发布版本号的列表
 */
const getNextVersion = (currentVersion: string) => {
  const isValidVersion = valid(currentVersion);
  if (!isValidVersion) {
    console.log("当前 package.json 的 version 不符合 semver 规范");
    return;
  }
  return {
    major: inc(currentVersion, "major"),
    minor: inc(currentVersion, "minor"),
    patch: inc(currentVersion, "patch"),
    premajor: inc(currentVersion, "premajor"),
    preminor: inc(currentVersion, "preminor"),
    prepatch: inc(currentVersion, "prepatch"),
    prerelease: inc(currentVersion, "prerelease"),
  };
};

/**
 * 交互式选择下一个版本号
 * @return {*}  {Promise<string>}
 */
export const selectNextVersion = async (currentVersion): Promise<string> => {
  const nextVersions = getNextVersion(currentVersion);
  const nextVersion = await select({
    message: `请选择版即将发布的版本号1 ${currentVersion}`,
    options: Object.keys(nextVersions).map((level) => ({
      label: `${level} → ${nextVersions[level]}`,
      value: nextVersions[level as keyof typeof nextVersion],
    })),
  });

  if (isCancel(nextVersion)) {
    await exitPrompt();
  }

  return nextVersion as string;
};


/**
 * 更新版本号
 * @param nextVersion 新版本号
 */
export async function updatePackageJson(ctxRef, newPackageJson) {
  const { originPackageJson } = ctxRef.current;
  const { merge } = await import('lodash-es');

  const mergeJson = merge({}, originPackageJson, newPackageJson)

  ctxRef.current = {
    ...ctxRef.current,
    originPackageJson: mergeJson,
  }

  writeFileSync(
    getProjectPath('package.json'),
    JSON.stringify(mergeJson, null, 2),
  );

  return async () => {
    writeFileSync(
      getProjectPath('package.json'),
      JSON.stringify(originPackageJson, null, 2),
    );
  }
}

/* 使用 semver 获取下一个版本信息 */
export const middleware_selectNextVersion = async (next, ctxRef) => {
  const originVersion = ctxRef.current?.originVersion;
  const nextVersion = await selectNextVersion(originVersion);
  ctxRef.current = {
    ...ctxRef.current,
    nextVersion,
  };

  const backVersionFn = await updatePackageJson(ctxRef, {
    version: nextVersion
  })

  /* 注册失败回调 */
  failCallbacks.tapPromise(backVersionFn);

  next();
};
