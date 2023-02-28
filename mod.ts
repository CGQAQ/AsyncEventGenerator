import {AsyncEventGenerator} from "./index.ts";

const eventGenerator = new AsyncEventGenerator<number>();
const {nextValue, done} = eventGenerator;

let tick = 0;
const interval = setInterval(() => nextValue(tick++), 1000);
setTimeout(() => {
    clearInterval(interval);
    done();
}
, 5000);

for await (const value of eventGenerator) {
    console.log(value);
}
