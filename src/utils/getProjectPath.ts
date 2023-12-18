import path = require("path");

// 获取项目文件
export const getProjectPath = (dir = './'): string => {
  return path.join(process.cwd(), dir);
};