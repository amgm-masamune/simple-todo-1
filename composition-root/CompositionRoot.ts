import { InMemoryTaskRepository } from "../domain/Task/InMemoryTaskRepository.ts";
import { ITaskRepository } from "../domain/Task/TaskRepository.ts";
import { TaskService } from "../domain/Task/TaskService.ts";

type Environment = "in-memory"
type Dependencies = {
  readonly taskRepository: ITaskRepository;
  readonly taskService: TaskService;
};

export function createDependencies(environment: Environment): Dependencies {
  switch (environment) {
    case "in-memory":
      return createInMemoryDependencies();
  }
}

function createInMemoryDependencies() {
  const taskRepository = new InMemoryTaskRepository();

  const taskService = new TaskService(taskRepository);

  return { taskRepository, taskService };
}