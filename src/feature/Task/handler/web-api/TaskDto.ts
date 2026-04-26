import z from "zod";
import { isUnspecified, UNSPECIFIED, Task } from "../../domain/Task.ts";

export const unspecifiedSchema = z.object({ type: z.literal(UNSPECIFIED.type) });

// TODO: 共通化できそう（例：const inputScheme = { due: taskDtoScheme.due.optional() } みたいに）
export const taskDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.union([z.literal("unstarted"), z.literal("in-progress"), z.literal("completed"), z.literal("cancelled")]),
  due: z.union([z.string(), unspecifiedSchema]),
  startedAt: z.union([z.string(), unspecifiedSchema]).optional(),
  completedAt: z.union([z.string(), unspecifiedSchema]).optional(),
  cancelledAt: z.union([z.string(), unspecifiedSchema]).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const taskIdSchema = taskDtoSchema.shape.id;
export const taskStatusSchema = taskDtoSchema.shape.status;

export type TaskDto = z.infer<typeof taskDtoSchema>;

export function taskDtoToEntity(taskDtoUnknown: unknown) {
  // Task.create の引数の型で指定されているところまでは保証する
  const taskDto = taskDtoSchema.parse(taskDtoUnknown);
  const { id, title, status, due, startedAt, completedAt, cancelledAt, createdAt, updatedAt } = taskDto;
    
  return Task.create({ 
    id, title, status,
    due: isUnspecified(due) ? due : new Date(due),
    startedAt: startedAt === undefined || isUnspecified(startedAt) ? startedAt : new Date(startedAt),
    completedAt: completedAt === undefined || isUnspecified(completedAt) ? completedAt : new Date(completedAt),
    cancelledAt: cancelledAt === undefined || isUnspecified(cancelledAt) ? cancelledAt : new Date(cancelledAt),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt)
  });
}

export function taskEntityToDto(task: Task): TaskDto {
  const { id, title, status, due, startedAt, completedAt, cancelledAt, createdAt, updatedAt } = task;
  return {
    id, title, status,
    due: dateToISOStringOrNS(due),
    startedAt: dateToISOStringOrNSOrUndefined(startedAt),
    completedAt: dateToISOStringOrNSOrUndefined(completedAt),
    cancelledAt: dateToISOStringOrNSOrUndefined(cancelledAt),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

function dateToISOStringOrNS(date: Date | typeof UNSPECIFIED): string | typeof UNSPECIFIED {
  if (isUnspecified(date))
    return date;
  return date.toISOString();
}

function dateToISOStringOrNSOrUndefined(date: Date | typeof UNSPECIFIED | undefined): string | typeof UNSPECIFIED | undefined {
  if (date === undefined || isUnspecified(date))
    return date;
  return date.toISOString();
}
