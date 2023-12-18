import { compose } from "./core/compose";

/* == middleswares 数组 == */
import {
  middleware_pkgInfo,
  middleware_eslint, 
  middleware_selectNextVersion,
  middleware_changelog,
  middleware_gitPush,
  middleware_addTag
} from "./actions";

const chalk = require("chalk");
import { intro } from "@clack/prompts";

const middleware = [
  middleware_pkgInfo,
  middleware_eslint,
  middleware_selectNextVersion,
  middleware_changelog,
  middleware_addTag,
  middleware_gitPush
];

export const main = (ctx) => {
  try {
    intro(chalk.bgHex('#19BDD2')(' jmi-release '));
    compose(middleware, ctx);
  } catch (error) {
  }
}
