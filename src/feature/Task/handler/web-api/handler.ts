import { Hono } from "hono";
import { Dependencies } from "@deps/CompositionRoot.ts";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { taskDtoSchema, taskEntityToDto, taskIdSchema, taskStatusSchema } from "./TaskDto.ts";
import { isUnspecified } from "../../domain/Task.ts";
import { singleTaskResponseBodySchema, multiTasksResponseBodySchema, noValueResponseBodySchema, responseInputValidationResultIfError, responseSuccess, handleError } from "./helper.ts";

/*
Handler では、unknown な型をコンパイルエラーにならずに引数に渡せるよう、最低限の型チェック等を行う。
結果、isString 等のメソッドの実装になったため、であれば型チェックライブラリを導入する。
*/

/*
レスポンスのスキーマチェックはhandler内では行わず、テストで担保する。
*/
const createTaskInputSchema = z.object({
  title: taskDtoSchema.shape.title,
  status: taskDtoSchema.shape.status,
  due: taskDtoSchema.shape.due,
  startedAt: taskDtoSchema.shape.startedAt,
  completedAt: taskDtoSchema.shape.completedAt,
  cancelledAt: taskDtoSchema.shape.cancelledAt
});
export type CreateTaskRequestBody = z.infer<typeof createTaskInputSchema>;

const updateTaskInputSchema = z.object({
  title: taskDtoSchema.shape.title.optional(),
  status: taskDtoSchema.shape.status.optional(),
  due: taskDtoSchema.shape.due.optional(),
  startedAt: taskDtoSchema.shape.startedAt.optional(),
  completedAt: taskDtoSchema.shape.completedAt.optional(),
  cancelledAt: taskDtoSchema.shape.cancelledAt.optional()
});
export type UpdateTaskRequestBody = z.infer<typeof updateTaskInputSchema>;


export const createTaskResponseBodySchema = singleTaskResponseBodySchema;

export const updateTaskResponseBodySchema = singleTaskResponseBodySchema;

export const findTaskByIdResponseBodySchema = singleTaskResponseBodySchema;

export const getAllTasksResponseBodySchema = multiTasksResponseBodySchema;

export const searchTasksByStatusResponseBodySchema = multiTasksResponseBodySchema;

export const deleteTaskResponseBodySchema = noValueResponseBodySchema;


export function createHandlers(app: Hono, deps: Dependencies) {
  app.post("/task", zValidator("json", createTaskInputSchema, responseInputValidationResultIfError), async c => {
    const { title, status, due, startedAt, completedAt, cancelledAt } = c.req.valid("json");
    
    try {
      const task = await deps.createTaskUseCase.execute({
        title,
        status,
        due: isUnspecified(due) ? due : new Date(due),
        startedAt: startedAt === undefined || isUnspecified(startedAt) ? startedAt : new Date(startedAt),
        completedAt: completedAt === undefined || isUnspecified(completedAt) ? completedAt : new Date(completedAt),
        cancelledAt: cancelledAt === undefined || isUnspecified(cancelledAt) ? cancelledAt : new Date(cancelledAt)
      });

      return responseSuccess<typeof createTaskResponseBodySchema>(c, taskEntityToDto(task));
    } catch (e) {
      return handleError(c, e);
    }
  });

  app.put("/task/:id", zValidator("json", updateTaskInputSchema, responseInputValidationResultIfError), async c => {
    const id = taskIdSchema.parse(c.req.param("id"));
    const { title, status, due, startedAt, completedAt, cancelledAt } = c.req.valid("json");
    
    try {
      const task = await deps.updateTaskUseCase.execute({
        id, title, status,
        due: due === undefined || isUnspecified(due) ? due : new Date(due),
        startedAt: startedAt === undefined || isUnspecified(startedAt) ? startedAt : new Date(startedAt),
        completedAt: completedAt === undefined || isUnspecified(completedAt) ? completedAt : new Date(completedAt),
        cancelledAt: cancelledAt === undefined || isUnspecified(cancelledAt) ? cancelledAt : new Date(cancelledAt)
      });

      return responseSuccess<typeof updateTaskResponseBodySchema>(c, taskEntityToDto(task));
    } catch (e) {
      return handleError(c, e);
    }
  });

  app.get("/task/:id", async c => {
    const id = taskIdSchema.parse(c.req.param("id"));

    try {
      const task = await deps.findTaskByIdUseCase.execute({ id });

      return responseSuccess<typeof findTaskByIdResponseBodySchema>(c, taskEntityToDto(task));
    } catch (e) {
      return handleError(c, e);
    }
  });

  app.get("/tasks", async c => {
    try {
      const tasks = await deps.getAllTasksUseCase.execute();

      return responseSuccess<typeof getAllTasksResponseBodySchema>(c, tasks.map(task => taskEntityToDto(task)));
    } catch (e) {
      return handleError(c, e);
    }
  });

  app.get("/tasks/status/:status", async c => {
    try {
      const status = taskStatusSchema.parse(c.req.param("status"));
      const tasks = await deps.searchTasksByStatusUseCase.execute({ status });

      return responseSuccess<typeof searchTasksByStatusResponseBodySchema>(c, tasks.map(task => taskEntityToDto(task)));
    } catch (e) {
      return handleError(c, e);
    }
  });
  
  app.delete("/task/:id", async c => {
    const id = taskIdSchema.parse(c.req.param("id"));

    try {
      await deps.deleteTaskUseCase.execute({ id });

      return responseSuccess<typeof deleteTaskResponseBodySchema>(c, undefined);
    } catch (e) {
      return handleError(c, e);
    }
  });
}

