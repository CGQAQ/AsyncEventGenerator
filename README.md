# Converts events to async iterable iterators(aka. async generators)

将 `Eventlistener` 形式的 events 转换成 `AsyncGenerator`

Take `Eventlistener` form events, and transform into `AsyncGenerator` which can
be then consume by `for await of`

```ts
// 将
// take
foo.on((event) => console.log(event));

// 变成
// and transform into
for await (const event of foo) {
  console.log(event);
}
```

## 示例

```console
deno run mod.ts

tick 1
tick 2
received tick: 1
tick 3
received tick: 2
tick 4
received tick: 3
received tick: 4
```
