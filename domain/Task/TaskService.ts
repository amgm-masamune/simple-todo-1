import { Task } from "./Task.ts";
import { ITaskRepository } from "./TaskRepository.ts";

export class TaskService {
  readonly #taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.#taskRepository = taskRepository;
  }

  async createUnstarted({ title, due }: { title: string; due: Date | null; }) {
    return await this.#create((id, createdAt) =>
      new Task.Unstarted({ id, title, due, createdAt })
    );
  }

  async createInProgress({ title, due, startedAt }: { title: string; due: Date | null; startedAt: Date | null; }) {
    return await this.#create((id, createdAt) =>
      new Task.InProgress({ id, title, due, startedAt, createdAt })
    );
  }

  async createCompleted({ title, due, startedAt, completedAt }: { title: string; due: Date | null; startedAt: Date | null; completedAt: Date | null; }) {
    return await this.#create((id, createdAt) =>
      new Task.Completed({ id, title, due, startedAt, completedAt, createdAt })
    );
  }

  async createCancelled({ title, due, startedAt, completedAt, cancelledAt }: { title: string; due: Date | null; startedAt: Date | null; completedAt: Date | null; cancelledAt: Date | null; }) {
    return await this.#create((id, createdAt) =>
      new Task.Cancelled({ id, title, due, startedAt, completedAt, cancelledAt, createdAt })
    );
  }

  async #create<T extends Task>(creator: (id: string, createdAt: Date) => T) {
    const id = crypto.randomUUID();

    const createdAt = new Date(Date.now())
    const task = creator(id, createdAt);

    await this.#taskRepository.save(task);

    return task;
  }

  async findById(id: string) {
    return await this.#taskRepository.loadById(id);
  }

  async searchNotCompleted() {
    return await this.#taskRepository.searchNotStarted();
  }

  async update(task: Task) {
    return await this.#taskRepository.save(task);
  }

  async delete(id: string) {
    await this.#taskRepository.delete(id);
  }
}