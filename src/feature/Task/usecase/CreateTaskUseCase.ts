import { Clock } from "@common/Clock.ts";
import { IdGenerator } from "@common/IdGenerator.ts";
import { UNSPECIFIED, Task, TaskStatus } from "../domain/Task.ts";
import { ITaskRepository } from "../domain/TaskRepository.ts";

export type CreateTaskUseCaseInput = {
  readonly title: string;
  readonly status: TaskStatus;
  readonly due: Date | UNSPECIFIED;
  readonly startedAt?: Date | UNSPECIFIED;
  readonly completedAt?: Date | UNSPECIFIED;
  readonly cancelledAt?: Date | UNSPECIFIED;
};

export class CreateTaskUseCase {
  readonly #taskRepository: ITaskRepository;
  readonly #idGenerator: IdGenerator;
  readonly #clock: Clock;

  constructor(taskRepository: ITaskRepository, idGenerator: IdGenerator, clock: Clock) {
    this.#taskRepository = taskRepository;
    this.#idGenerator = idGenerator;
    this.#clock = clock;
  }

  async execute({ title, status, due, startedAt, completedAt, cancelledAt }: CreateTaskUseCaseInput) {
    const id = await this.#idGenerator.generate();

    const createdAt = this.#clock.now();
    const task = Task.create({ id, title, status, due, startedAt, completedAt, cancelledAt, createdAt, updatedAt: createdAt });

    await this.#taskRepository.save(task);

    return task;
  }
}
