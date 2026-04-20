import { ITaskRepository } from "../domain/TaskRepository.ts";

type GetAllTasksUseCaseInput = { };

export class GetAllTasksUseCase {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async execute({ }: GetAllTasksUseCaseInput = {}) {
    return await this.#taskRepository.getAllTasks();
  }
}

