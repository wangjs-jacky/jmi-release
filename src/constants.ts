import { join } from "path";

/* 应用根路径 */
export const PROJECT_ROOT = join(__dirname, "..");

export const SRC_DIR = join(PROJECT_ROOT, 'src');

export const PACKAGE_ROOT = join(PROJECT_ROOT, "package.json")

/* eslintrc.js 文件*/
export const ESLINT_PATH = join(PROJECT_ROOT, "./.eslintrc.js");

/* changelog 文件 */
export const CHANGELOG_NAME = 'CHANGELOG.md';