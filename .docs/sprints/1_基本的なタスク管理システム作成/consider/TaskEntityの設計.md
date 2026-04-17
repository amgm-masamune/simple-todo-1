# TaskEntityの設計

## 前提
本アプリは、タスクをワークフローの形（進行する、等）で管理するのではなく、単にタスクという記録をCRUDの形で管理している。
則ち、updateTask(task) のようにして、タスクは完了→未着手のように指定されることもある。
ただし、内部的には不整合な状態を防ぐため、DDDで状態変化を監視しながら行うのが良いと考えている。
View ←記録型→ UseCase ←記録型|ワークフロー→ ドメイン

## 案① ステータスごとのタスクを型にする

class TaskBase
   - id
   - title
   - due
   - status: TaskStatus = "unstarted" | "in-progress" | "completed" | "cancelled"
   - withTitle(title): this
   - withDue(due): this
 
class Unstarted extends Task
   - toInProgress(startedAt): InProgress
   - toCompleted(startedAt?, completedAt): Completed
 
class InProgress extends Task
   - startedAt
   - toUnstarted(): Unstarted
   - toCompleted(completedAt): Completed
 
class Completed extends Task
   - startedAt
   - completedAt
   - toUnstarted(): Unstarted
   - toInProgress(): InProgress
 
メリット：
   - 状態毎にできることがメソッドとして表現でき、DDDのドメイン層としては良さそうに見える。
デメリット：
   - 同じcompleteメソッドでもシグネチャが異なるため、呼び出し元のユースケース等が呼び分ける必要があり、ドメインロジックが漏れている。
   - そもそも状態を持ったエンティティを別クラスにするのは、DDD以前にオブジェクト指向としてどうなのか。Is-aの関係ではあるが、「トイプードルは犬である」という「種類」ではなく、「今は未着手だけど明日には進行中」のような、動的に変わるような種類である。

```ts
class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput) {
    const task = await this.taskRepository.findById(input.id);

    switch (input.status) {
      case "unstarted":
        task.toUnstarted();
        break;
      case "in-progress":
        if (task.status === "unstarted") {
          task.toInProgress(input.startedAt);
        } else if (task.status === "completed") {
          task.toInProgress();
        } else {
          throw new Error("Invalid status transition");
        }
        break;
      case "completed":
        if (task.status === "unstarted") {
          task.toCompleted(input.startedAt, input.completedAt);
        } else if (task.status === "in-progress") {
          task.toCompleted(input.completedAt);
        } else {
          throw new Error("Invalid status transition");
        }
        break;
      default:
        throw new Error("Invalid status");
    }

    await this.taskRepository.save(task);
  }
}
```

## 案② タスク型は1つ、状態遷移をワークフローとして表現する

class Task
   - id
   - title
   - due
   - status: TaskStatus
   - start(props: { startedAt }): Task // 未着手のタスクを進行中にする
   - unstart(): Task // 進行中のタスクを未着手にする
   - complete(props: { startedAt?, completedAt }): Task // 未着手または進行中のタスクを完了にする
      throws status=="unstarted" の時、startedAt が指定されていないとエラー
   - incomplete(): Task // 完了のタスクを進行中にする
   - resetState(): Task // 完了のタスクを未着手にする

または
   - toUnstarted(): Task
   - toInProgress(props: { startedAt? }): Task // (未着手|完了)→進行中
       throws this.status=="unstarted" かつ props.startedAt が指定されていないとエラー
   - toCompleted(props: { startedAt?, completedAt }): Task
       throws this.status=="unstarted" かつ props.startedAt が指定されていないとエラー
      
 
メリット：
   - 呼び出しがシンプル。
   - クラス管理もシンプル。
デメリット：
   - 構造的なビジネスルールがif文で埋もれる（ただしこれはStateパターンで回避可能）。
   - 本来 complete には必要のない startedAt が記載されてしまっている。"unstarted" のタスクでも toUnstarted() を呼び出せてしまう。
   - 実行するまでエラーが発生するかどうか分からない。

```ts
class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput) {
    const task = await this.taskRepository.findById(input.id);

    switch (input.status) {
      case "unstarted":
        task.toUnstarted();
        break;
      case "in-progress":
        task.toInProgress({ startedAt: input.startedAt });
        break;
      case "completed":
        task.toCompleted({ startedAt: input.startedAt, completedAt: input.completedAt });
        break;
      default:
        throw new Error("Invalid status");
    }

    await this.taskRepository.save(task);
  }
}
```

## 案③ タスク型は1つ、状態遷移は内部で処理する

class Task
   - id
   - title
   - due
   - status: TaskStatus
   - updateStatus(status: TaskStatus, props?: { startedAt?, completedAt? }): Task
     throws this.status=="unstarted" かつ status=="completed" の時、startedAt が指定されていないとエラー

メリット：
  - 状態はあくまでプロパティであるため、他の状態と掛け合わせやすい。
  - 状態変更の窓口はupdateStatusただ1つなため、外部からも一貫性をもって利用できる。
デメリット：
  - 単なるセッターのようにも見える。ドメインが貧弱ではないか？
  - エラーが発生するかどうかは実行してみないと分からない。 ← 当たり前。

```ts
class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput) {
    const task = await this.taskRepository.findById(input.id);

    task.updateStatus(input.status, { startedAt: input.startedAt, completedAt: input.completedAt });
 
    await this.taskRepository.save(task);
  }
}
```

## 案④ 全ての状態遷移のパスを定義する

※今回は過剰設計、ここまでしなくてもupdateStatusで十分

class TaskBase
   - id
   - title
   - due
   - status: TaskStatus = "unstarted" | "in-progress" | "completed" | "cancelled"
   - withTitle(title): this
   - withDue(due): this
 
class Unstarted extends Task
   - start(startedAt): InProgress
 
class InProgress extends Task
   - startedAt
   - unstart(): Unstarted
   - complete(completedAt): Completed
 
class Completed extends Task
   - startedAt
   - completedAt
   - reopen(): InProgress

```ts
class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput) {
    const task = await this.taskRepository.findById(input.id);

    switch (input.status) {
      case "unstarted":
        if (task.status === "in-progress") {
          task.unstart();
        } else if (task.status === "completed") {
          task.reopen();
          task.unstart(); // 完了 → 進行中 → 未着手 のパスを辿る
        } else {
          throw new Error("Invalid status transition");
        }
        break;
      case "in-progress":
        if (task.status === "unstarted") {
          task.start(input.startedAt);
        } else if (task.status === "completed") {
          task.reopen();
          task.start(input.startedAt); // 完了 → 進行中 → 進行中 のパスを辿る
        } else {
          throw new Error("Invalid status transition");
        }
        break;
      case "completed":
        if (task.status === "unstarted") {
          task.start(input.startedAt);
          task.complete(input.completedAt);
        } else if (task.status === "in-progress") {
          task.complete(input.completedAt);
        } else {
          throw new Error("Invalid status transition");
        }
        break;
      default:
        throw new Error("Invalid status");
    }

    await this.taskRepository.save(task);
  }
}

```


## 案A メソッドは持たずに関数型で記載する
type Task = UnstartedTask | InProgressTask | CompletedTask

interface TaskBase
   - id
   - title
   - due
   - status: TaskStatus

interface UnstartedTask extends TaskBase
   - status: "unstarted"
 
interface InProgressTask extends TaskBase
   - status: "in-progress"
   - startedAt
 
interface CompletedTask extends TaskBase
   - status: "completed"
   - startedAt
   - completedAt
 
namespace Task
   - withTitle(title): Task;
   - withDue(due): Task;
   - updateStatus(status, props)
 
メリット：
   - モダンな書き方？
デメリット：
   - DDDを表現しにくい。
   - エディタ補完が効かず、できることが分からない。
   - 個別にexportされているならファイルを見に行かなければいけないし、namespace Task にまとまっていてもタスクの変更が task.withTitle(title) → Task.withTitle(task, title) のように Task と書かなくてはならない。
   - オブジェクトはクラスのインスタンスと比べ簡単に作れてしまうため、用意されている関数を使わないで { ...task, startedAt } のようにして作られたとしても見分けがつかない。

```ts
class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput) {
    const task = await this.taskRepository.findById(input.id);

    const updatedTask = Task.updateStatus(task, input.status, { startedAt: input.startedAt, completedAt: input.completedAt });
 
    await this.taskRepository.save(updatedTask);
  }
}
```

## 学び

### **型設計がDDD的に美しくても意味のない** 設計もある

- システム全体としてワークフロー型ならば、①のように型レベルでできることを表現するのは一貫性が保てそう。
  - 例：振込システム等
- 今回の要件のように、あくまでシステムに入力する情報を柔軟に変更したい場合、いくら型レベルで書いてもそれはドメイン層の外に対する制約として顕著に表れる。
  結局いつかはバリデーションを設ける必要があり、そうなると型レベルでの制約はただただ自分たちの決めたドメインルールをドメイン層外に対して合わせてもらうようにしているだけになる。
- 型だけで表現するのは破綻する。型だけですべてを何とかしようとし過ぎない。

## 質問

どれを使うのが良い？または破綻しないより良い方法がある？おすすめ度をそれぞれを最大100%とするパーセンテージで表して。
尚、Statusパターンの導入は必要に応じて行っており、内部的な条件分岐の数は論点ではない。あくまでドメインエンティティの表現方法で悩んでいる。