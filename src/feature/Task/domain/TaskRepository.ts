import { Task, TaskStatus } from "./Task.ts";

export interface ITaskRepository {
  findById(id: string): Promise<Task>;

  getAllTasks(): Promise<Task[]>;

  searchTasksByStatus(status: TaskStatus): Promise<Task[]>;

  create(task: Task): Promise<void>;
  
  update(task: Task): Promise<void>;

  delete(id: string): Promise<void>;
}
