/**
 * 通过 tapPromise 注册回退事件
 * 通过 promise 串行触发异步事件
 */
export class AsyncSeriesHooks {
  name: string;
  tasks: any[];
  constructor(name) {
    this.tasks = [];
    this.name = name;
  }

  tapPromise(task) {
    this.tasks.unshift(task);
  }

  promise() {
    return new Promise<void>((resolve, reject) => {
      const main = async () => {
        for (let i = 0; i < this.tasks.length; i++) {
          try {
            await this.tasks[i]();
          } catch (error) {
            reject();
            return;
          }
        }
      };
      main().then(() => resolve());
    });
  }

  clear() {
    this.tasks = [];
  }

  show() {
    console.log("tasks", this.tasks);
  }
}

export const failCallbacks = new AsyncSeriesHooks("failcallbacks");
