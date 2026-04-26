import { TaskStatus } from "../domain/Task.ts";
import { ITaskRepository } from "../domain/TaskRepository.ts";

type SearchTasksByStatusUseCaseInput = {
  readonly status: TaskStatus;
};

/**
 * やるべき（完了していない・キャンセルではない）タスク一覧を取得する
 */
export class SearchTasksByStatusUseCase {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async execute({ status }: SearchTasksByStatusUseCaseInput) {
    return await this.#taskRepository.searchTasksByStatus(status);
  }
}

