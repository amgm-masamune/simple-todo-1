import { Clock } from "@common/Clock.ts";
import { IdGenerator } from "@common/IdGenerator.ts";
import { ITransactionManager } from "@common/TransactionManager.ts";
import { ITaskRepository } from "@feature/Task/domain/TaskRepository.ts";
import { CreateTaskUseCase } from "@feature/Task/usecase/CreateTaskUseCase.ts";
import { DeleteTaskUseCase } from "@feature/Task/usecase/DeleteTaskUseCase.ts";
import { FindTaskByIdUseCase } from "@feature/Task/usecase/FindTaskByIdUseCase.ts";
import { GetAllTasksUseCase } from "@feature/Task/usecase/GetAllTasksUseCase.ts";
import { SearchTasksByStatusUseCase } from "@feature/Task/usecase/SearchTasksByStatusUseCase.ts";
import { UpdateTaskUseCase } from "@feature/Task/usecase/UpdateTaskUseCase.ts";

type UseCaseDependencies = {
  readonly transactionManager: ITransactionManager;
  readonly taskRepository: ITaskRepository;
  readonly idGenerator: IdGenerator;
  readonly clock: Clock;
};

export type UseCases = {
  readonly createTaskUseCase: CreateTaskUseCase;
  readonly getAllTasksUseCase: GetAllTasksUseCase;
  readonly findTaskByIdUseCase: FindTaskByIdUseCase;
  readonly searchTasksByStatusUseCase: SearchTasksByStatusUseCase;
  readonly updateTaskUseCase: UpdateTaskUseCase;
  readonly deleteTaskUseCase: DeleteTaskUseCase;
};

export function createUseCases(deps: UseCaseDependencies): UseCases {
  const { transactionManager, taskRepository, idGenerator, clock } = deps;

  const createTaskUseCase = new CreateTaskUseCase(taskRepository, idGenerator, clock);
  const findTaskByIdUseCase = new FindTaskByIdUseCase(taskRepository);
  const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);
  const searchTasksByStatusUseCase = new SearchTasksByStatusUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, transactionManager, clock);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

  return {
    createTaskUseCase,
    getAllTasksUseCase,
    findTaskByIdUseCase,
    searchTasksByStatusUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
  };
}