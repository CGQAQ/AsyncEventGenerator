type PromiseResolve<T = any> = (value: T | PromiseLike<T>) => void;
type PromiseReject = (reason?: any) => void;

type PromiseCallbacks<T = any> = {
  resolve: PromiseResolve<IteratorResult<T, any>>;
  reject: PromiseReject;
};

/**
 * A class that transforms events into an async iterable iterator.
 *
 * @example
 * ```ts
 * const eventGenerator = new AsyncEventGenerator<number>();
 * const { nextValue, done } = eventGenerator;
 * const interval = setInterval(() => nextValue(1), 1000);
 * setTimeout(() => {
 *  clearInterval(interval);
 *  done();
 * }, 5000);
 *
 * for await (const value of eventGenerator) {
 *  console.log(value);
 * }
 * ```
 */
export class AsyncEventGenerator<T> implements AsyncIterableIterator<T> {
  private isDone = false;
  private error?: Error;

  constructor() {
    this.next = this.next.bind(this);

    this.flush = this.flush.bind(this);
    this.nextValue = this.nextValue.bind(this);
    this.done = this.done.bind(this);
    this.flagError = this.flagError.bind(this);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  public async next(
    ...args: [] | [undefined]
  ): Promise<IteratorResult<T, any>> {
    if (this.isDone) {
      return Promise.resolve({ done: true, value: undefined });
    }

    if (this.error) {
      return Promise.reject(this.error);
    }

    const newPromise = new Promise<IteratorResult<T, any>>(
      (resolve, reject) => {
        this.promiseBuffer.push({ resolve, reject });
      },
    );

    return newPromise;
  }
  private __dirty = false;
  private valueBuffer: T[] = new Proxy<T[]>([], {
    get: (target, prop) => {
      if (prop === "push") {
        this.__dirty = true;
      }
      if (prop === "length" && this.__dirty) {
        this.__dirty = false;
        this.flush();
      }
      return Reflect.get(target, prop);
    },
  }); // Proxy to a buffer
  private promiseBuffer: PromiseCallbacks<T>[] = [];

  // core function
  public nextValue(value: T) {
    this.valueBuffer.push(value);
  }

  public flush() {
    while (this.promiseBuffer.length > 0 && this.valueBuffer.length > 0) {
      const { resolve } = this.promiseBuffer.shift()!;
      resolve({ done: false, value: this.valueBuffer.shift()! });
    }
  }

  public done() {
    this.isDone = true;
    this.flush();
  }

  public flagError(err: Error) {
    this.error = err;
    this.promiseBuffer.forEach(({ reject }) => reject(err));
  }
}
