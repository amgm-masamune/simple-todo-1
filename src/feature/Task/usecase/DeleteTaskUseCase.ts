import { ITaskRepository } from "../domain/TaskRepository.ts";

type DeleteTaskUseCaseInput = {
  readonly id: string;
};

export class DeleteTaskUseCase {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async execute({ id }: DeleteTaskUseCaseInput) {
    return await this.#taskRepository.delete(id);
  }
}
