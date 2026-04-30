export class IdAlreadyExistsError extends Error {
  override readonly name = "IdAlreadyExistsError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
