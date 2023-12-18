import fse from "fs-extra";
import { join } from "path";

/**
 * 获取当前package.json的版本号
 */
export const getOriginPackageJson = ({ cwd }) => {
  const packageJsonPath = join(cwd, "package.json");
  const pkgJson = fse.readJsonSync(packageJsonPath, { throws: false });
  return pkgJson;
};


export interface IGitInfo {
  username: string;
  email: string;
}

export const getGitInfo = async (): Promise<IGitInfo> => {
  const { $ } = await import('execa');
  try {
    const [{ stdout: username }, { stdout: email }] = await Promise.all([
      await $`git config --global user.name`,
      await $`git config --global user.email`,
    ]);

    return {
      username,
      email,
    }

  } catch (e) {
    return {
      username: '',
      email: '',
    };
  }
};

/* 
  作用：往环境变量中注入 package.json 信息
  后续中间件，可通过 context.originPackageJson 及 context.originVersion 获取
*/
export const middleware_pkgInfo = async (next, ctxRef) => {
  const { cwd = process.cwd() } = ctxRef.current;

  /* package.json info */
  const originPackageJson = getOriginPackageJson({ cwd });

  /* git info */
  const { username, email } = await getGitInfo();

  ctxRef.current = {
    ...ctxRef.current,
    originVersion: originPackageJson?.version,
    originPackageJson: originPackageJson,
    gitInfo: { username, email },
    cwd
  };

  next();
}