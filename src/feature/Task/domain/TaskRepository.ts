import { Task, TaskStatus } from "./Task.ts";

export interface ITaskRepository {
  loadById(id: string): Promise<Task>;

  getAllTasks(): Promise<Task[]>;

  searchTasksByStatus(status: TaskStatus): Promise<Task[]>;

  save(task: Task): Promise<Task>;

  delete(id: string): Promise<void>;
}
