import { Clock } from "@common/Clock.ts";
import { TaskStatus, UNSPECIFIED } from "../domain/Task.ts";
import { ITaskRepository, ITaskTransactionManager } from "../domain/TaskRepository.ts";

/** アトミックな更新 */
type UpdateTaskUseCaseInput = {
  readonly id: string;
  readonly title?: string;
  readonly status?: TaskStatus;
  readonly due?: Date | UNSPECIFIED;
  readonly startedAt?: Date | UNSPECIFIED;
  readonly completedAt?: Date | UNSPECIFIED;
  readonly cancelledAt?: Date | UNSPECIFIED;
};

export class UpdateTaskUseCase<Tx = unknown> {
  readonly #taskRepository: ITaskRepository<Tx>;
  readonly #taskTxManager: ITaskTransactionManager<Tx>;
  readonly #clock: Clock;

  constructor(taskRepository: ITaskRepository<Tx>, taskTxManager: ITaskTransactionManager<Tx>, clock: Clock) {
    this.#taskRepository = taskRepository;
    this.#taskTxManager = taskTxManager;
    this.#clock = clock;
  }

  execute(input: UpdateTaskUseCaseInput) {
    return this.#taskTxManager.run(async tx => {
      // トランザクション内で実行

      const task = await this.#taskRepository.findById(input.id, tx);
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
      
      await this.#taskRepository.update(updated, tx);

      return updated;
    });
  }
}
