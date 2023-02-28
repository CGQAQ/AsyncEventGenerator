import { AsyncEventGenerator } from "./index.ts";

const eventGenerator = new AsyncEventGenerator<number>();
const { nextValue, done } = eventGenerator;

let tick = 1;
const interval = setInterval(() => {
  console.log("tick", tick);
  nextValue(tick++);
}, 2000);
setTimeout(() => {
  clearInterval(interval);
  done();
}, 7000);

for await (const value of eventGenerator) {
  console.log("received tick:", value);
}
