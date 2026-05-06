import { Task, TaskStatus } from "./Task.ts";

export interface ITaskRepository<Tx = unknown> {
  findById(id: string, tx?: Tx): Promise<Task>;

  getAll(tx?: Tx): Promise<Task[]>;

  searchByStatus(status: TaskStatus, tx?: Tx): Promise<Task[]>;

  create(task: Task, tx?: Tx): Promise<void>;
  
  update(task: Task, tx?: Tx): Promise<void>;

  delete(id: string, tx?: Tx): Promise<void>;
}
