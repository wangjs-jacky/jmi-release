import { cac } from "cac";
import { main } from ".";
import { PACKAGE_ROOT } from "./constants";

export function run() {
  const version = require(PACKAGE_ROOT).version;
  const cli = cac("jmi-release").version(version).help();
  cli
    .command("","")
    .allowUnknownOptions()
    .action((templateName: string, options: any = {}) => {
      const ctx = {
        templateName,
        commandArgs: options
      }
      main({ ctx });
    })

  cli.parse();
}