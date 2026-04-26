import { Context } from "hono";
import z from "zod";
import { taskDtoSchema } from "./TaskDto.ts";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { errorResponseBodyErrorSchema, ErrorResponseBodySchema, NOT_FOUND, UNEXPECTED_ERROR, VALIDATION_FAILED } from "./ErrorResponse.ts";
import { ValidationError } from "@common/Error/ValidationError/ValidationError.ts";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";

export const successResponseBodySchema = <T>(valueSchema: T) => 
  z.object({
    success: z.literal(true),
    value: valueSchema
  });

export const errorResponseBodySchema = z.object({
  success: z.literal(false),
  error: errorResponseBodyErrorSchema
})

export const singleTaskResponseBodySchema = z.union([
  successResponseBodySchema(taskDtoSchema),
  errorResponseBodySchema
]);

export const multiTasksResponseBodySchema = z.union([
  successResponseBodySchema(z.array(taskDtoSchema)),
  errorResponseBodySchema
]);

export const noValueResponseBodySchema = z.union([
  z.object({
    success: z.literal(true)
  }), errorResponseBodySchema
]);


type SuccessResponseValue<S extends z.ZodType> =
  Extract<z.infer<S>, { success: true }> extends { value: infer TValue }
    ? TValue
    // deno-lint-ignore ban-types
    : Extract<z.infer<S>, { success: true }> extends { } // `Record<PropertyKey, never>` は不可
      ? undefined
      : never;
    
export function responseSuccess<S extends z.ZodType>(
  c: Context,
  value: SuccessResponseValue<S>
) {
  return c.json({ success: true, value }, 200);
}

export function responseFailed(
  c: Context,
  error: ErrorResponseBodySchema,
  status: ContentfulStatusCode
) {
  return c.json({ success: false, error }, status);
}

export const responseInputValidationResultIfError = (result: { success: boolean }, c: Context) => {
  if (!result.success) {
    return responseFailed(c, {
      code: VALIDATION_FAILED,
      message: "入力の型が不正です"
    }, 400);
  }
};

export function handleError(c: Context, e: unknown) {
  if (e instanceof ValidationError || e instanceof z.ZodError) {
    return responseFailed(c, { code: VALIDATION_FAILED, message: e instanceof Error ? e.message : "不正な型です" }, 400);
  } else if (e instanceof NotFoundError) {
    return responseFailed(c, { code: NOT_FOUND, message: "指定されたタスクが見つかりません" }, 404);
  } else {
    return responseFailed(c, { code: UNEXPECTED_ERROR, message: "予期しないエラーが発生しました" }, 500);
  }
}
