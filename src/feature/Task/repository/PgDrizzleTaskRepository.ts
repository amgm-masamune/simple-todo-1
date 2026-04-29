import { ITaskRepository } from "@feature/Task/domain/TaskRepository.ts";
import { isUnspecified, Task, TaskStatus } from "../domain/Task.ts";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { PostgresError } from "postgres";
import * as schema from "../../../db/schema.ts";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";
import { IdAlreadyExistsError } from "@common/Error/IdAlreadyExistsError/IdAlreadyExistsError.ts";
import { eq } from "drizzle-orm";

type PgTaskDB = PostgresJsDatabase<typeof schema>;
type PgTaskTx = PgTaskDB;

export class PgDrizzleTaskRepository implements ITaskRepository<PgTaskTx> {
  readonly #db: PgTaskDB;

  constructor(db: PgTaskDB) {
    this.#db = db;
  }
  
  async findById(id: string, tx?: PgTaskTx): Promise<Task> {
    const executor = tx ?? this.#db;
    const record = await executor.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, id)
    });

    return taskRecordToEntityOrThrow(record, id);
  }

  async getAllTasks(tx?: PgTaskTx): Promise<Task[]> {
    const executor = tx ?? this.#db;
    const records = await executor.query.tasks.findMany();

    return records.map(taskRecordToEntity);
  }

  async searchTasksByStatus(status: TaskStatus, tx?: PgTaskTx): Promise<Task[]> {
    const executor = tx ?? this.#db;
    const records = await executor.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.status, status)
    });

    return records.map(taskRecordToEntity);
  }

  async create(task: Task, tx?: PgTaskTx): Promise<void> {
    const executor = tx ?? this.#db;
    try {
      await executor.insert(schema.tasks)
        .values(taskEntityToRecord(task));
    } catch (e) {
      if (e instanceof PostgresError && e.code === "23505")
        throw new IdAlreadyExistsError(`同じID ${task.id} のタスクが存在します`, { cause: e });
      else
        throw e;
    }
  }

  async update(task: Task, tx?: PgTaskTx): Promise<void> {
    const executor = tx ?? this.#db;
    const [result] = await executor
      .update(schema.tasks)
      .set(taskEntityToRecord(task))
      .where(eq(schema.tasks.id, task.id))
      .returning();
    
    if (!result) {
      // 更新対象がいなかった
      throwNotFoundError(task.id);
    }
  }

  async delete(id: string, tx?: PgTaskTx): Promise<void> {
    const executor = tx ?? this.#db;
    const [result] = await executor
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, id))
      .returning();
    
    if (!result) {
      // 更新対象がいなかった
      throwNotFoundError(id);
    }
  }
}

type TaskRecord = typeof schema.tasks.$inferSelect;

function taskRecordToEntityOrThrow(record: TaskRecord | undefined, id: string) {
  if (record == null)
    throwNotFoundError(id);

  return taskRecordToEntity(record);
}

function throwNotFoundError(id: string): never {
  throw new NotFoundError(`Task{id=${id}} が見つかりません`)
}

function taskRecordToEntity(record: TaskRecord) {
  return Task.create({
    ...record,
    due: record.due ?? { type: "unspecified" },
    startedAt: record.due ?? { type: "unspecified" },
    completedAt: record.due ?? { type: "unspecified" },
    cancelledAt: record.due ?? { type: "unspecified" },
  });
}

function taskEntityToRecord(task: Task): TaskRecord { // typeof schema.tasks.$inferInsert では入れるべきプロパティが optional になってしまう
  return {
    ...task,
    due: isUnspecified(task.due) ? null : task.due,
    startedAt: isUnspecified(task.startedAt) ? null : task.startedAt ?? null,
    completedAt: isUnspecified(task.completedAt) ? null : task.completedAt ?? null,
    cancelledAt: isUnspecified(task.cancelledAt) ? null : task.cancelledAt ?? null
  };
}