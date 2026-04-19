import z from "zod";
import { Task } from "../../domain/Task.ts";

// TODO: 共通化できそう（例：const inputScheme = { due: taskDtoScheme.due.optional() } みたいに）
export const taskDtoScheme = z.object({
  id: z.string(),
  title: z.string(),
  status: z.union([z.literal("unstarted"), z.literal("in-progress"), z.literal("completed"), z.literal("cancelled")]),
  due: z.string().nullable(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type TaskDto = z.infer<typeof taskDtoScheme>;

export function taskDtoToEntity(taskDtoUnknown: unknown) {
  // Task.create の引数の型で指定されているところまでは保証する
  const taskDto = taskDtoScheme.parse(taskDtoUnknown);
  const { id, title, status, due, startedAt, completedAt, cancelledAt, createdAt, updatedAt } = taskDto;
    
  return Task.create({ 
    id, title, status,
    due: due == null ? due : new Date(due),
    startedAt: startedAt == null ? startedAt : new Date(startedAt),
    completedAt: completedAt == null ? completedAt : new Date(completedAt),
    cancelledAt: cancelledAt == null ? cancelledAt : new Date(cancelledAt),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt)
  });
}

export function taskEntityToDto(task: Task): TaskDto {
  const { id, title, status, due, startedAt, completedAt, cancelledAt, createdAt, updatedAt } = task;
  return {
    id, title, status,
    due: dateToISOStringOrNull(due),
    startedAt: dateToISOStringOrNullOrUndefined(startedAt),
    completedAt: dateToISOStringOrNullOrUndefined(completedAt),
    cancelledAt: dateToISOStringOrNullOrUndefined(cancelledAt),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

function dateToISOStringOrNull(date: Date | null): string | null {
  if (date === null)
    return date;
  return date.toISOString();
}

function dateToISOStringOrNullOrUndefined(date: Date | null | undefined): string | undefined | null {
  if (date === null || date === undefined)
    return date;
  return date.toISOString();
}
