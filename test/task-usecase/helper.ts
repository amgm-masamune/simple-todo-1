import { Clock } from "../../common/Clock.ts";

export const fixedClock = (fixedNow: Date) => (
  new FixedClock(fixedNow)
);

class FixedClock implements Clock {
  #now: Date;
  constructor(now: Date) { this.#now = now; }

  setNow(now: Date) { this.#now = now; }
  
  now() { return this.#now; }
}