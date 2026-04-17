import { ITaskRepository } from "../domain/TaskRepository.ts";

type SearchActiveTasksUseCaseInput = { };

/**
 * やるべき（完了していない・キャンセルではない）タスク一覧を取得する
 */
export class SearchActiveTasksUseCase {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async execute({ }: SearchActiveTasksUseCaseInput = {}) {
    return await this.#taskRepository.searchActiveTasks();
  }
}

