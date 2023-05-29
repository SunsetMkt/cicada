/* eslint-disable @typescript-eslint/no-explicit-any */
import generateRandomString from './generate_random_string';
import sleep from './sleep';
import timeout from './timeout';

interface Task {
  id: string;
  task: () => Promise<any>;
  resolve: (...params: any[]) => void;
  reject: (...params: any[]) => void;
}

class AsyncQueue {
  taskminRequestDuration: number;

  taskTimeout: number;

  taskInterval: number;

  abortErrorGenerator?: () => Error;

  timeoutErrorGenerator?: (ms: number) => Error;

  running: boolean;

  taskQueue: Task[];

  constructor({
    taskminRequestDuration = 0,
    taskTimeout = 0,
    taskInterval = 0,
    abortErrorGenerator,
    timeoutErrorGenerator,
  }: {
    taskminRequestDuration?: number;
    taskTimeout?: number;
    taskInterval?: number;
    abortErrorGenerator?: () => Error;
    timeoutErrorGenerator?: (ms: number) => Error;
  }) {
    this.taskminRequestDuration = taskminRequestDuration;
    this.taskTimeout = taskTimeout;
    this.taskInterval = taskInterval;
    this.abortErrorGenerator = abortErrorGenerator;
    this.timeoutErrorGenerator = timeoutErrorGenerator;

    this.running = false;
    this.taskQueue = [];
  }

  run<Result>(task: () => Promise<Result>) {
    const id = generateRandomString();

    let abort: () => void;
    let finished = false;
    const promise = new Promise<Result>((resolve, reject) => {
      abort = () => {
        if (finished) {
          throw new Error(`The task is finished and can not be aborted.`);
        }
        this.taskQueue = this.taskQueue.filter((t) => t.id !== id);
        return reject(
          this.abortErrorGenerator
            ? this.abortErrorGenerator()
            : new Error('Task aborted.'),
        );
      };

      this.taskQueue.push({
        id,
        task,
        resolve,
        reject,
      });

      return this.nextTask<Result>();
    }).finally(() => {
      finished = true;
    });
    // @ts-expect-error
    return { promise, finished: () => finished, abort };
  }

  async nextTask<Result>() {
    if (this.running || !this.taskQueue.length) {
      return;
    }

    this.running = true;

    const [{ task, resolve, reject }] = this.taskQueue.splice(0, 1);
    try {
      const [a] = await Promise.race([
        Promise.all([task(), sleep(this.taskminRequestDuration)]),
        timeout(this.taskTimeout, this.timeoutErrorGenerator),
      ]);
      resolve(a as Result);
    } catch (error) {
      reject(error);
    }
    this.running = false;

    setTimeout(this.nextTask.bind(this), this.taskInterval);
  }
}

export default AsyncQueue;
