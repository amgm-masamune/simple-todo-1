import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Clock } from "@common/Clock.ts";
import { IdGenerator } from "@common/IdGenerator.ts";
import { ITaskTransactionManager } from "@feature/Task/domain/TaskRepository.ts";
import { PgDrizzleTaskRepository } from "@feature/Task/repository/PgDrizzleTaskRepository.ts";
import { CreateTaskUseCase } from "@feature/Task/usecase/CreateTaskUseCase.ts";
import { DeleteTaskUseCase } from "@feature/Task/usecase/DeleteTaskUseCase.ts";
import { FindTaskByIdUseCase } from "@feature/Task/usecase/FindTaskByIdUseCase.ts";
import { GetAllTasksUseCase } from "@feature/Task/usecase/GetAllTasksUseCase.ts";
import { SearchTasksByStatusUseCase } from "@feature/Task/usecase/SearchTasksByStatusUseCase.ts";
import { UpdateTaskUseCase } from "@feature/Task/usecase/UpdateTaskUseCase.ts";
import { Dependencies } from "@deps/CompositionRoot.ts";
import * as schema from "../db/schema.ts";

export type PgDatabase = PostgresJsDatabase<typeof schema>;
export type PgTransaction = PgDatabase;

export async function createPgDrizzleDependencies(idGenerator: IdGenerator, clock: Clock) {
  // # データベースの用意
  const db_url = Deno.env.get("DB_APP_URL");
  if (db_url == null)
    throw new Error("環境変数 DB_APP_URL が指定されていません");

  const db = drizzle(db_url, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });

  const txManager = new PgDrizzleTransactionManager(db);

  // # リポジトリ作成
  const taskRepository = new PgDrizzleTaskRepository(db);

  // # ユースケース作成
  const createTaskUseCase = new CreateTaskUseCase(taskRepository, idGenerator, clock);
  const findTaskByIdUseCase = new FindTaskByIdUseCase(taskRepository);
  const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);
  const searchTasksByStatusUseCase = new SearchTasksByStatusUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, txManager, clock);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

  return { 
    taskRepository,
    createTaskUseCase,
    getAllTasksUseCase,
    findTaskByIdUseCase,
    searchTasksByStatusUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
  } satisfies Dependencies<"pg-drizzle">;
}

export class PgDrizzleTransactionManager implements ITaskTransactionManager<PgTransaction> {
  readonly #db: PgDatabase;

  constructor(db: PgDatabase) {
    this.#db = db;
  }
  
  run<T>(fn: (tx: PgTransaction) => Promise<T>) {
    return this.#db.transaction(fn);
  }
}