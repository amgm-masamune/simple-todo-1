import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle, PostgresJsDatabase, PostgresJsTransaction } from "drizzle-orm/postgres-js";
import { SystemClock } from "@common/Clock.ts";
import { UUIDv4Generator } from "@common/IdGenerator.ts";
import { PgDrizzleTaskRepository } from "@feature/Task/repository/PgDrizzleTaskRepository.ts";
import { Dependencies, DependencyOptions } from "@deps/CompositionRoot.ts";
import * as schema from "../db/schema.ts";
import { ITransactionManager } from "@common/TransactionManager.ts";
import { ExtractTablesWithRelations } from "drizzle-orm/relations";
import { createUseCases } from "@deps/UseCases.ts";

export type PgDatabase = PostgresJsDatabase<typeof schema>;
type TSchema = ExtractTablesWithRelations<typeof schema>;
export type PgTransaction = PostgresJsTransaction<typeof schema, TSchema>;

export class PgDrizzleTransactionManager implements ITransactionManager<PgTransaction> {
  readonly #db: PgDatabase;

  constructor(db: PgDatabase) {
    this.#db = db;
  }
  
  run<T>(fn: (tx: PgTransaction) => Promise<T>) {
    return this.#db.transaction(fn);
  }
}


export type PgDrizzleDependencyOptions = DependencyOptions & {
  /** テストなどで一時的に使うスキーマ名 */
  readonly tempSchemaName?: string;
};

export async function createPgDrizzleDependencies(options: PgDrizzleDependencyOptions = {}) {
  const {
    tempSchemaName,
    idGenerator = new UUIDv4Generator(),
    clock = new SystemClock()
  } = options;

  // # データベースの用意
  const db = drizzle(getDbUrl(), { schema });
  if (tempSchemaName) {
    await db.$client`CREATE SCHEMA IF NOT EXISTS ${db.$client(tempSchemaName)}`;
  }
  await migrate(db, { 
    migrationsFolder: "./drizzle",
    migrationsSchema: tempSchemaName ?? "drizzle"
  });

  const transactionManager = new PgDrizzleTransactionManager(db);

  // # リポジトリ作成
  const taskRepository = new PgDrizzleTaskRepository(db);

  // # ユースケース作成
  const useCases = createUseCases({ transactionManager, taskRepository, idGenerator, clock });

  return {
    transactionManager,
    taskRepository,
    ...useCases,

    async [Symbol.asyncDispose]() {
      // ## テスト後にスキーマを削除
      if (tempSchemaName) {
        await db.$client`DROP SCHEMA IF EXISTS ${db.$client(tempSchemaName)} CASCADE`;
      }
      await db.$client.end();
    }

  } satisfies Dependencies<"pg-drizzle">;
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