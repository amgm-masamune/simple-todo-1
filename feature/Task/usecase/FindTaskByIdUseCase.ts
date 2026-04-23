import { ITaskRepository } from "../domain/TaskRepository.ts";

type FindTaskByIdUseCaseInput = {
  readonly id: string;
};

export class FindTaskByIdUseCase {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async execute({ id }: FindTaskByIdUseCaseInput) {
    return await this.#taskRepository.loadById(id);
  }
}
