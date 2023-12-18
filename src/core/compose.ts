/* 提供中间件机制，实现事件串行执行 */

interface ComposeOptsType {
  /** @name 环境变量*/
  ctx?: any;
  /** @name 错误处理函数*/
  cachError?: (err: Error) => Promise<void>;
}

/* 内置错误处理机制 */
const basicCatchError = async (err: Error) => {
  console.log("err", err);
};


export const compose = (middleware: any[], opts: ComposeOptsType = {}) => {
  const { ctx = {}, cachError = basicCatchError } = opts;

  /* 使用 ref 的方式，防止开发过程修改 环境变量的引用地址  */
  const ctxRef = { current: ctx };

  function dispatch(index) {
    if (index === middleware.length) return;
    const curMiddleware = middleware[index];

    // 构造延时执行函数
    const next = (addOptions) => {
      ctxRef.current = { ...ctxRef.current, ...addOptions };
      dispatch(index + 1);
    };

    return Promise
      .resolve(curMiddleware(next, ctxRef))
      .catch(cachError);
  }
  dispatch(0);
}