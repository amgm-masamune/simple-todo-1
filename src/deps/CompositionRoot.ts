import { IdGenerator, UUIDv4Generator } from "@common/IdGenerator.ts";
import { Clock, SystemClock } from "@common/Clock.ts";
import { InMemoryTaskRepository } from "@feature/Task/repository/InMemoryTaskRepository.ts";
import { PgDrizzleTaskRepository } from "@feature/Task/repository/PgDrizzleTaskRepository.ts";
import { InMemoryTransactionManager, ITransactionManager } from "@common/TransactionManager.ts";
import { createPgDrizzleDependencies, PgDrizzleDependencyOptions, PgDrizzleTransactionManager } from "@deps/PgDrizzle.ts";
import { ITaskRepository } from "@feature/Task/domain/TaskRepository.ts";
import { createUseCases, UseCases } from "@deps/UseCases.ts";

export type Environment = "in-memory" | "pg-drizzle";

export type Dependencies<E extends Environment = Environment> = {
  readonly transactionManager:
    E extends "in-memory" ? InMemoryTransactionManager 
      : E extends "pg-drizzle" ? PgDrizzleTransactionManager : ITransactionManager;
  readonly taskRepository: 
    E extends "in-memory" ? InMemoryTaskRepository 
      : E extends "pg-drizzle" ? PgDrizzleTaskRepository : ITaskRepository;
} & UseCases & AsyncDisposable;

export type DependencyOptions = {
  readonly idGenerator?: IdGenerator;
  readonly clock?: Clock;
};

export function createDependencies(environment: "in-memory", options?: DependencyOptions): Promise<Dependencies<"in-memory">>;
export function createDependencies(environment: "pg-drizzle", options?: PgDrizzleDependencyOptions): Promise<Dependencies<"pg-drizzle">>;
export function createDependencies(environment: Environment, options: DependencyOptions | PgDrizzleDependencyOptions = {}): Promise<Dependencies<Environment>> {
  switch (environment) {
    case "in-memory":
      return createInMemoryDependencies(options);
    case "pg-drizzle":
      return createPgDrizzleDependencies(options);
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

function createInMemoryDependencies(options: DependencyOptions) {
  const {
    idGenerator = new UUIDv4Generator(),
    clock = new SystemClock()
  } = options;

  const taskRepository = new InMemoryTaskRepository();
  const transactionManager = new InMemoryTransactionManager();

  const useCases = createUseCases({ transactionManager, taskRepository, idGenerator, clock });

  return Promise.resolve({ 
    transactionManager,
    taskRepository,
    ...useCases,

    async [Symbol.asyncDispose]() { }

  } satisfies Dependencies<"in-memory">);
}
