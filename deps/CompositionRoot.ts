import { CreateTaskUseCase } from "../feature/Task/usecase/CreateTaskUseCase.ts";
import { IdGenerator, UUIDv4Generator } from "../common/IdGenerator.ts";
import { FindTaskByIdUseCase } from "../feature/Task/usecase/FindTaskByIdUseCase.ts";
import { SearchActiveTasksUseCase } from "../feature/Task/usecase/SearchActiveTasksUseCase.ts";
import { UpdateTaskUseCase } from "../feature/Task/usecase/UpdateTaskUseCase.ts";
import { DeleteTaskUseCase } from "../feature/Task/usecase/DeleteTaskUseCase.ts";
import { Clock, SystemClock } from "../common/Clock.ts";
import { ITaskRepository } from "../feature/Task/domain/TaskRepository.ts";
import { InMemoryTaskRepository } from "../feature/Task/repository/InMemoryTaskRepository.ts";
import { GetAllTasksUseCase } from "../feature/Task/usecase/GetAllTasksUseCase.ts";
import { SearchTasksByStatusUseCase } from "../feature/Task/usecase/SearchTasksByStatusUseCase.ts";

export type Environment = "in-memory";

export type Dependencies = {
  readonly taskRepository: ITaskRepository;
  readonly createTaskUseCase: CreateTaskUseCase;
  readonly getAllTasksUseCase: GetAllTasksUseCase;
  readonly findTaskByIdUseCase: FindTaskByIdUseCase;
  readonly searchTasksByStatusUseCase: SearchTasksByStatusUseCase;
  readonly searchActiveTasksUseCase: SearchActiveTasksUseCase;
  readonly updateTaskUseCase: UpdateTaskUseCase;
  readonly deleteTaskUseCase: DeleteTaskUseCase;
};

type DependencyOptions = {
  readonly idGenerator?: IdGenerator;
  readonly clock?: Clock;
};

export function createDependencies(environment: Environment, options: DependencyOptions = {}): Dependencies {
  const {
    idGenerator = new UUIDv4Generator(),
    clock = new SystemClock()
  } = options

  switch (environment) {
    case "in-memory":
      return createInMemoryDependencies(idGenerator, clock);
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

function createInMemoryDependencies(idGenerator: IdGenerator, clock: Clock): Dependencies {
  const taskRepository = new InMemoryTaskRepository();

  const createTaskUseCase = new CreateTaskUseCase(taskRepository, idGenerator, clock);
  const findTaskByIdUseCase = new FindTaskByIdUseCase(taskRepository);
  const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);
  const searchTasksByStatusUseCase = new SearchTasksByStatusUseCase(taskRepository);
  const searchActiveTasksUseCase = new SearchActiveTasksUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, clock);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
  

  return { 
    taskRepository,
    createTaskUseCase,
    getAllTasksUseCase,
    findTaskByIdUseCase,
    searchTasksByStatusUseCase,
    searchActiveTasksUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
  };
}