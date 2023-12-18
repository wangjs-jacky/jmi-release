import { cancel, outro } from "@clack/prompts";
import { failCallbacks } from "../core/failCallbacks";
const chalk = require("chalk");

/* 触发错误 */
export const exitPrompt = async () => {
  cancel('操作取消，触发回退事件');
  await failCallbacks.promise();
  outro(chalk.red('Exit jmi-release'));
  process.exit(1);
};