import { Context, Hono } from "hono";
import { Dependencies } from "../../../../deps/CompositionRoot.ts";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { taskDtoScheme, taskEntityToDto } from "./TaskDto.ts";

/*
Handler では、unknown な型をコンパイルエラーにならずに引数に渡せるよう、最低限の型チェック等を行う。
結果、isString 等のメソッドの実装になったため、であれば型チェックライブラリを導入する。
*/

const taskIdSchema = z.string();

const createTaskInputSchema = z.object({
  title: z.string(),
  status: z.union([z.literal("unstarted"), z.literal("in-progress"), z.literal("completed"), z.literal("cancelled")]),
  due: z.string().nullable(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional()
});

const updateTaskInputSchema = z.object({
  title: z.string().optional(),
  status: z.union([z.literal("unstarted"), z.literal("in-progress"), z.literal("completed"), z.literal("cancelled")]).optional(),
  due: z.string().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional()
});

export function createHandlers(app: Hono, deps: Dependencies) {
  app.post("/task", zValidator("json", createTaskInputSchema, async (result, c) => {
    if (!result.success) {
      console.log(result, await c.req.json());
      return c.json({ message: "Validation Failed", errors: result.error }, 400);
    }
  }), async c => {
    const { title, status, due, startedAt, completedAt, cancelledAt } = c.req.valid("json");
    
    try {
      const task = await deps.createTaskUseCase.execute({
        title,
        status,
        due: due == null ? due : new Date(due),
        startedAt: startedAt == null ? startedAt : new Date(startedAt),
        completedAt: completedAt == null ? completedAt : new Date(completedAt),
        cancelledAt: cancelledAt == null ? cancelledAt : new Date(cancelledAt)
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
      console.log(result, await c.req.json());
      return c.json({ message: "Validation Failed", errors: result.error }, 400);
    }
  }), async c => {
    const id = taskIdSchema.parse(c.req.param("id"));
    const { title, status, due, startedAt, completedAt, cancelledAt } = c.req.valid("json");
    
    try {
      const task = await deps.updateTaskUseCase.execute({
        id, title, status,
        due: due == null ? due : new Date(due),
        startedAt: startedAt == null ? startedAt : new Date(startedAt),
        completedAt: completedAt == null ? completedAt : new Date(completedAt),
        cancelledAt: cancelledAt == null ? cancelledAt : new Date(cancelledAt)
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
      const status = taskDtoScheme.shape.status.parse(c.req.param("status"));
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
