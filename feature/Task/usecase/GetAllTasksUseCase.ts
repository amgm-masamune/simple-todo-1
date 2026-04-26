import { ITaskRepository } from "../domain/TaskRepository.ts";

export class GetAllTasksUseCase {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async execute() {
    return await this.#taskRepository.getAllTasks();
  }
}

