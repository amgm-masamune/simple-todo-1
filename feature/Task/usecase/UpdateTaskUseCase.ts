import { Clock } from "../../../common/Clock.ts";
import { TaskStatus, UNSPECIFIED } from "../domain/Task.ts";
import { ITaskRepository } from "../domain/TaskRepository.ts";

type UpdateTaskUseCaseInput = {
  readonly id: string;
  readonly title?: string;
  readonly status?: TaskStatus;
  readonly due?: Date | UNSPECIFIED;
  readonly startedAt?: Date | UNSPECIFIED;
  readonly completedAt?: Date | UNSPECIFIED;
  readonly cancelledAt?: Date | UNSPECIFIED;
};

export class UpdateTaskUseCase {
  readonly #taskRepository: ITaskRepository;
  readonly #clock: Clock;

  constructor(taskRepository: ITaskRepository, clock: Clock) {
    this.#taskRepository = taskRepository;
    this.#clock = clock;
  }

  async execute(input: UpdateTaskUseCaseInput) {
    const task = await this.#taskRepository.loadById(input.id);
    const now = this.#clock.now();
    
    let updated = task;
    if (input.title !== undefined)
      updated = updated.withTitle(input.title, now);

    if (input.due !== undefined)
      updated = updated.withDue(input.due, now);

    if (input.status !== undefined)
      updated = updated.changeStatus(input.status, input, now);

    if (input.startedAt !== undefined)
      updated = updated.withStartedAt(input.startedAt, now);

    if (input.completedAt !== undefined)
      updated = updated.withCompletedAt(input.completedAt, now);
    
    if (input.cancelledAt !== undefined)
      updated = updated.withCancelledAt(input.cancelledAt, now);

    if (updated === task)
      return task;
    
    return await this.#taskRepository.save(updated);
  }
}
