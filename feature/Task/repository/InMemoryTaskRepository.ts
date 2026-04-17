import { Task } from "../domain/Task.ts";
import { ITaskRepository } from "../domain/TaskRepository.ts";

export class InMemoryTaskRepository implements ITaskRepository {
  readonly #dataset = new Map<string, Task>();

  loadById(id: string): Promise<Task> {
    const data = this.#dataset.get(id);

    if (data == null) {
      throw new Error(`Task id=${id} が見つかりません`);
    }

    return Promise.resolve(data);
  }
  searchActiveTasks(): Promise<Task[]> {
    const tasks = this.#dataset.values()
      .filter(task => task.status === "unstarted" || task.status === "in-progress")
      .toArray();

    return Promise.resolve(tasks);
  }
  save(task: Task): Promise<Task> {
    this.#dataset.set(task.id, task);

    return Promise.resolve(task);
  }
  delete(id: string): Promise<void> {
    this.#dataset.delete(id);

    return Promise.resolve();
  }

}