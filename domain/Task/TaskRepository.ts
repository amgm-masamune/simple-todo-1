import { Task } from "./Task.ts";

export interface ITaskRepository {
  loadById(id: string): Promise<Task>;

  searchNotStarted(): Promise<Task[]>;

  save(task: Task): Promise<Task>;

  delete(id: string): Promise<void>;
}
