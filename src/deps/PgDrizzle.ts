import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle, PostgresJsDatabase, PostgresJsTransaction } from "drizzle-orm/postgres-js";
import { Clock } from "@common/Clock.ts";
import { IdGenerator } from "@common/IdGenerator.ts";
import { PgDrizzleTaskRepository } from "@feature/Task/repository/PgDrizzleTaskRepository.ts";
import { CreateTaskUseCase } from "@feature/Task/usecase/CreateTaskUseCase.ts";
import { DeleteTaskUseCase } from "@feature/Task/usecase/DeleteTaskUseCase.ts";
import { FindTaskByIdUseCase } from "@feature/Task/usecase/FindTaskByIdUseCase.ts";
import { GetAllTasksUseCase } from "@feature/Task/usecase/GetAllTasksUseCase.ts";
import { SearchTasksByStatusUseCase } from "@feature/Task/usecase/SearchTasksByStatusUseCase.ts";
import { UpdateTaskUseCase } from "@feature/Task/usecase/UpdateTaskUseCase.ts";
import { Dependencies } from "@deps/CompositionRoot.ts";
import * as schema from "../db/schema.ts";
import { ITransactionManager } from "@common/TransactionManager.ts";
import { ExtractTablesWithRelations } from "drizzle-orm/relations";

export type PgDatabase = PostgresJsDatabase<typeof schema>;
type TSchema = ExtractTablesWithRelations<typeof schema>;
export type PgTransaction = PostgresJsTransaction<typeof schema, TSchema>;

export async function createPgDrizzleDependencies(idGenerator: IdGenerator, clock: Clock) {
  // # データベースの用意
  const db = drizzle(getDbUrl(), { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });

  const transactionManager = new PgDrizzleTransactionManager(db);

  // # リポジトリ作成
  const taskRepository = new PgDrizzleTaskRepository(db);

  // # ユースケース作成
  const createTaskUseCase = new CreateTaskUseCase(taskRepository, idGenerator, clock);
  const findTaskByIdUseCase = new FindTaskByIdUseCase(taskRepository);
  const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);
  const searchTasksByStatusUseCase = new SearchTasksByStatusUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, transactionManager, clock);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

  return {
    transactionManager,
    taskRepository,
    createTaskUseCase,
    getAllTasksUseCase,
    findTaskByIdUseCase,
    searchTasksByStatusUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
    async [Symbol.asyncDispose]() {
      await db.$client.end();
    }
  } satisfies Dependencies<"pg-drizzle">;
}

export class PgDrizzleTransactionManager implements ITransactionManager<PgTransaction> {
  readonly #db: PgDatabase;

  constructor(db: PgDatabase) {
    this.#db = db;
  }
  
  run<T>(fn: (tx: PgTransaction) => Promise<T>) {
    return this.#db.transaction(fn);
  }
}

function getDbUrl() {
  const envNames = ["DB_HOST", "DB_NAME", "DB_PORT", "DB_APP_USER", "DB_APP_PASSWORD"];
  const envEntries = envNames.map(name => 
    [name, Deno.env.get(name)] as const
  );
  
  for (const [name, value] of envEntries) {
    if (value == null)
      throw new Error(`環境変数 ${name} が指定されていません`);
  }

  const env = Object.fromEntries(envEntries);

  return `postgresql://${env.DB_APP_USER}:${env.DB_APP_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
}