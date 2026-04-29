import { CreateTaskUseCase } from "@feature/Task/usecase/CreateTaskUseCase.ts";
import { IdGenerator, UUIDv4Generator } from "@common/IdGenerator.ts";
import { FindTaskByIdUseCase } from "@feature/Task/usecase/FindTaskByIdUseCase.ts";
import { UpdateTaskUseCase } from "@feature/Task/usecase/UpdateTaskUseCase.ts";
import { DeleteTaskUseCase } from "@feature/Task/usecase/DeleteTaskUseCase.ts";
import { Clock, SystemClock } from "@common/Clock.ts";
import { InMemoryTaskRepository } from "@feature/Task/repository/InMemoryTaskRepository.ts";
import { GetAllTasksUseCase } from "@feature/Task/usecase/GetAllTasksUseCase.ts";
import { SearchTasksByStatusUseCase } from "@feature/Task/usecase/SearchTasksByStatusUseCase.ts";
import { PgDrizzleTaskRepository } from "@feature/Task/repository/PgDrizzleTaskRepository.ts";
import { InMemoryTransactionManager } from "@common/TransactionManager.ts";
import { createPgDrizzleDependencies } from "@deps/PgDrizzle.ts";

export type Environment = "in-memory" | "pg-drizzle";

export type Dependencies<E extends Environment> = {
  readonly taskRepository: 
    E extends "in-memory" ? InMemoryTaskRepository 
      : E extends "pg-drizzle" ? PgDrizzleTaskRepository : never;
  readonly createTaskUseCase: CreateTaskUseCase;
  readonly getAllTasksUseCase: GetAllTasksUseCase;
  readonly findTaskByIdUseCase: FindTaskByIdUseCase;
  readonly searchTasksByStatusUseCase: SearchTasksByStatusUseCase;
  readonly updateTaskUseCase: UpdateTaskUseCase;
  readonly deleteTaskUseCase: DeleteTaskUseCase;
};

type DependencyOptions = {
  readonly idGenerator?: IdGenerator;
  readonly clock?: Clock;
};

export function createDependencies(environment: "in-memory", options?: DependencyOptions): Promise<Dependencies<"in-memory">>;
export function createDependencies(environment: "pg-drizzle", options?: DependencyOptions): Promise<Dependencies<"pg-drizzle">>;
export function createDependencies(environment: Environment, options: DependencyOptions = {}): Promise<Dependencies<Environment>> {
  const {
    idGenerator = new UUIDv4Generator(),
    clock = new SystemClock()
  } = options

  switch (environment) {
    case "in-memory":
      return createInMemoryDependencies(idGenerator, clock);
    case "pg-drizzle":
      return createPgDrizzleDependencies(idGenerator, clock);
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

function createInMemoryDependencies(idGenerator: IdGenerator, clock: Clock) {
  const taskRepository = new InMemoryTaskRepository();
  const txManager = new InMemoryTransactionManager();

  const createTaskUseCase = new CreateTaskUseCase(taskRepository, idGenerator, clock);
  const findTaskByIdUseCase = new FindTaskByIdUseCase(taskRepository);
  const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);
  const searchTasksByStatusUseCase = new SearchTasksByStatusUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, txManager, clock);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

  return Promise.resolve({ 
    taskRepository,
    createTaskUseCase,
    getAllTasksUseCase,
    findTaskByIdUseCase,
    searchTasksByStatusUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
  } satisfies Dependencies<"in-memory">);
}

