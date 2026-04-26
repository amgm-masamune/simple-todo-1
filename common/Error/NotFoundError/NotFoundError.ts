export class NotFoundError extends Error {
  override readonly name = "NotFoundError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
