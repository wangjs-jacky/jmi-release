# `jmi-release`

灵感来源于 `@mx-design/release` 的自动化发布脚本。

![](https://img.shields.io/badge/label-MIT-blue) ![](https://badgen.net/badge/jacky/v1.0.0/:color?icon=github)



## 如何安装

```shell
# or pnpm i --global jmi-release
$ npm install -g jmi-release 
```



## 如何使用

```shell
jmi-release
```

![](https://vblog-img.oss-cn-shanghai.aliyuncs.com/jacky-blog-vuepress/202312190337067.gif)



## 功能特性

- 文件识别功能，当存在 `.eslintrc` 配置文件时，才会触发内置操作。

- 更友好的 `git` 操作行为。如 `git add .` 存在确认提交行为。

- 内置 `AsyncSeriesHooks` 异步处理钩子用于封装失败回调。

  当终端存在 `ctrl + c` ，内置中间件会对所有操作进行撤回处理。如 `package.json` 的修改，删除 `git tag` 打标签性，删除未 `push` 的 `commitID` 等行为。

- 易于扩展。

  该工程是基于 `compose` 函数 + 模拟 `tapable` 的 `AsyncSeriesHooks` 失败异步处理机制，可以应对绝大部分的脚手架终端交互行为。目前我的另一个项目 `create-jmi` 也是基于这套机制进行搭建和扩展的，后续也会将此套模板改造后放入 `create-jmi` 工程中。



## LICENSE

MIT

