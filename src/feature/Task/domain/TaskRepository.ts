import { Task, TaskStatus } from "./Task.ts";

export interface ITaskRepository<Tx = unknown> {
  findById(id: string, tx?: Tx): Promise<Task>;

  getAllTasks(tx?: Tx): Promise<Task[]>;

  searchTasksByStatus(status: TaskStatus, tx?: Tx): Promise<Task[]>;

  create(task: Task, tx?: Tx): Promise<void>;
  
  update(task: Task, tx?: Tx): Promise<void>;

  delete(id: string, tx?: Tx): Promise<void>;
}

export interface ITaskTransactionManager<Tx = unknown> {
  run<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}