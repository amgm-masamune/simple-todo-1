export class ValidationError extends Error {
  override readonly name = "ValidationError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
