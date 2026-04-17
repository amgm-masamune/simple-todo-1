export interface IdGenerator {
  generate(): Promise<string>;
}


export class UUIDv4Generator implements IdGenerator {
  generate(): Promise<string> {
    return Promise.resolve(crypto.randomUUID());
  }
}