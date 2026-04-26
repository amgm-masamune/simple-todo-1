
import { Task } from "../../domain/Task.ts";
import { CreateTaskUseCase } from "../../usecase/CreateTaskUseCase.ts";
import { SearchActiveTasksUseCase } from "../../usecase/SearchActiveTasksUseCase.ts";
import { UpdateTaskUseCase } from "../../usecase/UpdateTaskUseCase.ts";

/**
 * @deprecated 確認用の為作成しようとしていたが、ひととおりの機能実装やテスト・デバッグ等に時間がかかる見込み。
 * シナリオテストはServiceで行うため、本CLIクラス起因と思われる不具合が残ったままだが、以降の実装を見送る。
 */
export class CliTaskController {
  readonly #createTask: CreateTaskUseCase;
  readonly #updateTask: UpdateTaskUseCase;
  readonly #searchActiveTasks: SearchActiveTasksUseCase;

  constructor(createTask: CreateTaskUseCase, updateTask: UpdateTaskUseCase, searchActiveTasks: SearchActiveTasksUseCase) {
    this.#createTask = createTask;
    this.#updateTask = updateTask;
    this.#searchActiveTasks = searchActiveTasks;
  }

  async main() {
    while (true) {
      await this.section();
    }
  }

  async section() {
    // 未完了タスクの表示
    const notCompletedTasks = await this.#searchActiveTasks.execute({ });
    
    console.log("# 未完了タスク");
    this.displayTasks(notCompletedTasks);

    // 操作

    console.log("");
    console.log("フィルタリング [f]");
    console.log("");
    console.log("-----------------------")
    console.log("+ 新規作成 [n] ");
    console.log("/ 編集 [e{n}] ");
    console.log("× 削除 [d{n}] ");
    
    const operation = prompt("> ");
    console.log();

    switch (operation?.trim()) {
      case "n":
        await this.taskCreation();
        break;
    }

  }

  displayTasks(tasks: Task[]) {
    // TODO: InstanceType<typeof Task.Unstarted> を使えば行けるかも？ Tasks.ts に定義
    // const props: (keyof (typeof Task.Unstarted)["Unstarted"])[] = ["title", "due", "status",]
    const props = ["num", "title", "due", "status", "startedAt", "completedAt", "cancelledAt", "createdAt", "updatedAt"];
    console.table(tasks.map((task, i) => ({ num: i + 1, ...task })), props);
  }

  async taskCreation(): Promise<Task> {
    const title = prompt("## タスク名\n> ");
    console.log();
    const dueInput = prompt("## 期限\n> ");
    console.log(`"${dueInput}"`);
    const status = prompt("## 状態\n- 未着手 [1]\n- 進行中[2]\n- 完了[3]");
    console.log();

    if (title == null) {
      console.log("タスク名を入力してください");
      return this.taskCreation();
    }

    const due = dueInput ? new Date(dueInput) : null;

    if (status === "1") {
      return await this.#createTask.execute({ title, status: "unstarted", due });
    }

    const startedAtInput = prompt("## 開始日時\n> ");
    const startedAt = startedAtInput ? new Date(startedAtInput) : null;

    if (status === "2") {
      return await this.#createTask.execute({ title, status: "in-progress", due, startedAt });
    }

    const completedAtInput = prompt("## 完了日時\n> ");
    const completedAt = completedAtInput ? new Date(completedAtInput) : null;

    return await this.#createTask.execute({ title, status: "completed", due, startedAt, completedAt});
  }
}