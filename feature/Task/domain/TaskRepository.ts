import { Task } from "./Task.ts";

export interface ITaskRepository {
  loadById(id: string): Promise<Task>;

  getAllTasks(): Promise<Task[]>;

  /**
   * やるべき（完了していない・キャンセルではない）タスク一覧を取得する
   */
  searchActiveTasks(): Promise<Task[]>;

  save(task: Task): Promise<Task>;

  delete(id: string): Promise<void>;
}
