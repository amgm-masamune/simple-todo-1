export interface Clock {
  now(): Promise<Date> | Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date(Date.now());
  }
}