import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";
import { Task, TaskStatus } from "../domain/Task.ts";
import { ITaskRepository } from "../domain/TaskRepository.ts";
import { IdAlreadyExistsError } from "@common/Error/IdAlreadyExistsError/IdAlreadyExistsError.ts";

export class InMemoryTaskRepository implements ITaskRepository {
  readonly #dataset = new Map<string, Task>();

  loadById(id: string): Promise<Task> {
    const data = this.#dataset.get(id);

    if (data == null) {
      throw new NotFoundError(`Task id=${id} が見つかりません`);
    }

    return Promise.resolve(data);
  }

  getAllTasks(): Promise<Task[]> {
    const data = this.#dataset.values().toArray();

    return Promise.resolve(data);
  }

  searchTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const tasks = this.#dataset.values()
      .filter(task => task.status === status)
      .toArray();

    return Promise.resolve(tasks);
  }

  create(task: Task): Promise<void> {
    if (this.#dataset.has(task.id))
      throw new IdAlreadyExistsError(`ID ${task.id} は既に存在しています`);
    
    this.#dataset.set(task.id, task);

    return Promise.resolve();
  }

  update(task: Task): Promise<void> {
    if (this.#dataset.has(task.id) === false)
      throw new NotFoundError(`ID ${task.id} が見つかりません`);
    
    this.#dataset.set(task.id, task);

    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    if (this.#dataset.get(id) == null) {
      throw new NotFoundError(`Task id=${id} が見つかりません`);
    }
    this.#dataset.delete(id);

    return Promise.resolve();
  }

}