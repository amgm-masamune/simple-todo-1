import { Clock } from "@common/Clock.ts";
import { IdGenerator } from "@common/IdGenerator.ts";
import { UNSPECIFIED, Task, TaskStatus } from "../domain/Task.ts";
import { ITaskRepository } from "../domain/TaskRepository.ts";
import { IdAlreadyExistsError } from "@common/Error/IdAlreadyExistsError/IdAlreadyExistsError.ts";

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

  async execute({ title, status, due, startedAt, completedAt, cancelledAt }: CreateTaskUseCaseInput): Promise<Task> {
    const MAX_EXEC_COUNT = 10;  // 何かしらのバグで無限ループにならないよう試行上限を指定
    
    return await retryUntilSuccess(async () => {
      // IDが被らなかったら成功
      const id = await this.#idGenerator.generate();

      const createdAt = await this.#clock.now();
      const task = Task.create({ id, title, status, due, startedAt, completedAt, cancelledAt, createdAt, updatedAt: createdAt });

      const result = await createTaskOrUndefinedOrThrow(task, this.#taskRepository);
      return result;  // 成功(Task)またはやり直し(undefined)を返す
    }, MAX_EXEC_COUNT);
  }
}

/**
 * IDの重複なく作成できたらその Task を返す。IDの重複があった場合、何も返さない。エラーだった場合はその場で throw する。
 * @param task 
 * @param repository 
 * @returns 成功したら Task, やり直しの場合 undefined, 予期しないエラーの場合 throw
 */
async function createTaskOrUndefinedOrThrow(task: Task, repository: ITaskRepository) {
  try {
    await repository.create(task);
    return task;

  } catch (e) {
    if (e instanceof IdAlreadyExistsError)
      return;
    
    // 予期しないエラー
    throw new Error("Unexpected Error", { cause: e });
  }
}

/**
 * 
 * @param fn 返り値: isSuccess（完了したら Task, 完了しなかったら undefined（リトライ））
 * @param maxExecCount 
 */
async function retryUntilSuccess(fn: () => Promise<Task | undefined>, maxExecCount: number) {
  for (let i = 0; i < maxExecCount; i++) { 
    const result = await fn();

    if (result)
      // 成功したら終了
      return result;
  }

  // 問題なく生成できたら for ループ中で return しているため、到達した時点で試行回数上限
  throw new Error("IDの存在確認の試行回数が上限になりました");
}