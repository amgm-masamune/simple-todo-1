import z from "zod";

export const VALIDATION_FAILED = "ValidationFailed";
export const NOT_FOUND = "NotFound";
export const UNEXPECTED_ERROR = "UnexpectedError";

export const errorResponseCodes = [
  VALIDATION_FAILED,
  NOT_FOUND,
  UNEXPECTED_ERROR
] as const;

export const errorCodeSchema = z.union(errorResponseCodes.map(c => z.literal(c)));

export const errorResponseBodyErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string()
});

export type ErrorResponseBodySchema = z.infer<typeof errorResponseBodyErrorSchema>;
