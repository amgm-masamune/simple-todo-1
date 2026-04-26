import { ITaskRepository } from "../domain/TaskRepository.ts";

type GetAllTasksUseCaseInput = void;

export class GetAllTasksUseCase {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async execute(_input: GetAllTasksUseCaseInput) {
    return await this.#taskRepository.getAllTasks();
  }
}

