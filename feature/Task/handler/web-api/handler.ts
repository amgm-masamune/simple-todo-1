import { Context, Hono } from "hono";
import { Dependencies } from "../../../../deps/CompositionRoot.ts";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { taskDtoSchema, taskEntityToDto } from "./TaskDto.ts";
import { isUnspecified } from "../../domain/Task.ts";

/*
Handler では、unknown な型をコンパイルエラーにならずに引数に渡せるよう、最低限の型チェック等を行う。
結果、isString 等のメソッドの実装になったため、であれば型チェックライブラリを導入する。
*/

const taskIdSchema = taskDtoSchema.shape.id;
const taskStatusSchema = taskDtoSchema.shape.status;

const createTaskInputSchema = z.object({
  title: taskDtoSchema.shape.title,
  status: taskDtoSchema.shape.status,
  due: taskDtoSchema.shape.due,
  startedAt: taskDtoSchema.shape.startedAt,
  completedAt: taskDtoSchema.shape.completedAt,
  cancelledAt: taskDtoSchema.shape.cancelledAt
});

const updateTaskInputSchema = z.object({
  title: taskDtoSchema.shape.title.optional(),
  status: taskDtoSchema.shape.status.optional(),
  due: taskDtoSchema.shape.due.optional(),
  startedAt: taskDtoSchema.shape.startedAt.optional(),
  completedAt: taskDtoSchema.shape.completedAt.optional(),
  cancelledAt: taskDtoSchema.shape.cancelledAt.optional()
});

export function createHandlers(app: Hono, deps: Dependencies) {
  app.post("/task", zValidator("json", createTaskInputSchema, async (result, c) => {
    if (!result.success) {
      return c.json({ message: "Validation Failed", errors: result.error }, 400);
    }
  }), async c => {
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

      return c.json(taskEntityToDto(task));
    } catch (e) {
      if (typeof e === "object" && e != null && "name" in e && e.name === "ValidationError")
        return c.json(e, 400); 

      const notFoundResponse = createNotFoundResponseOrNull(e, c);
      if (notFoundResponse != null)
        return notFoundResponse;

      else
        throw e;
    }
  });

  app.put("/task/:id", zValidator("json", updateTaskInputSchema, async (result, c) => {
    if (!result.success) {
      return c.json({ message: "Validation Failed", errors: result.error }, 400);
    }
  }), async c => {
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

      return c.json(taskEntityToDto(task));
    } catch (e) {
      if (typeof e === "object" && e != null && "name" in e && e.name === "ValidationError")
        return c.json(e, 400); 

      const notFoundResponse = createNotFoundResponseOrNull(e, c);
      if (notFoundResponse != null)
        return notFoundResponse;

      else
        throw e;
    }
  });

  app.get("/task/:id", async c => {
    const id = taskIdSchema.parse(c.req.param("id"));

    try {
      const task = await deps.findTaskByIdUseCase.execute({ id });

      return c.json(taskEntityToDto(task));
    } catch (e) {
      const notFoundResponse = createNotFoundResponseOrNull(e, c);
      if (notFoundResponse != null)
        return notFoundResponse;

      else
        throw e;
    }
  });

  app.get("/tasks", async c => {
    try {
      const tasks = await deps.getAllTasksUseCase.execute({ });

      return c.json(tasks.map(task => taskEntityToDto(task)));
    } catch (e) {
      const notFoundResponse = createNotFoundResponseOrNull(e, c);
      if (notFoundResponse != null)
        return notFoundResponse;

      else
        throw e;
    }
  });

  app.get("/tasks/status/:status", async c => {
    try {
      const status = taskStatusSchema.parse(c.req.param("status"));
      const tasks = await deps.searchTasksByStatusUseCase.execute({ status });

      return c.json(tasks.map(task => taskEntityToDto(task)));
    } catch (e) {
      const notFoundResponse = createNotFoundResponseOrNull(e, c);
      if (notFoundResponse != null)
        return notFoundResponse;

      else
        throw e;
    }
  });
  
  app.delete("/task/:id", async c => {
    const id = taskIdSchema.parse(c.req.param("id"));

    try {
      await deps.deleteTaskUseCase.execute({ id });

      return c.json(null);
    } catch (e) {
      const notFoundResponse = createNotFoundResponseOrNull(e, c);
      if (notFoundResponse != null)
        return notFoundResponse;

      else
        throw e;
    }
  });
}

function createNotFoundResponseOrNull(e: unknown, c: Context) {
  if (e instanceof Error && e.message.includes("見つかりません"))
    return c.json(e, 404);

  return null;
}
