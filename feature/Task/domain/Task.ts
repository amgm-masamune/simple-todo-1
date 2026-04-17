export type TaskStatus = "unstarted" | "in-progress" | "completed" | "cancelled";

type TaskArgs = { 
  id: string;
  title: string;
  status: TaskStatus;
  due: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date; 
};

export class Task {
  readonly id: string;
  readonly title: string;
  readonly due: Date | null;
  readonly startedAt?: Date | null;
  readonly completedAt?: Date | null;
  readonly cancelledAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  readonly status: TaskStatus;
  
  private constructor({ id, title, due, status, startedAt, completedAt, cancelledAt, createdAt, updatedAt = createdAt }: TaskArgs) {
    validateId(id);
    validateTitle(title);
    validateDue(due);
    validateStatus(status, { startedAt, completedAt, cancelledAt });

    if (startedAt !== undefined) validateStartedAt(startedAt);
    if (completedAt !== undefined) validateCompletedAt(completedAt, { startedAt });
    if (cancelledAt !== undefined) validateCancelledAt(cancelledAt ?? null);
    
    validateCreatedAt(createdAt);
    validateUpdatedAt(updatedAt, { createdAt });
    
    this.id = id;
    this.title = title;
    this.due = due;
    this.status = status;

    switch (status) {
      case "unstarted":
        break;
    
      case "in-progress":
        this.startedAt = startedAt;
        break;
    
      case "completed":
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        break;
    
      case "cancelled":
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.cancelledAt = cancelledAt;
    }

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(args: TaskArgs) {
    return new Task(args);
  }

  private copy(args: this, updatedAt: Date): Task {
    return new Task({ ...args, updatedAt });
  }

  withTitle(title: string, updatedAt: Date) {
    return this.copy({ ...this, title }, updatedAt);
  }

  withDue(due: Date | null, updatedAt: Date) {
    return this.copy({ ...this, due }, updatedAt);
  }

  withStartedAt(startedAt: Date | null, updatedAt: Date) {
    // 制約の確認はコンストラクタに委譲
    return this.copy({ ...this, startedAt }, updatedAt);
  }

  withCompletedAt(completedAt: Date | null, updatedAt: Date) {
    // 制約の確認はコンストラクタに委譲
    return this.copy({ ...this, completedAt }, updatedAt);
  }

  withCancelledAt(cancelledAt: Date | null, updatedAt: Date) {
    // 制約の確認はコンストラクタに委譲
    return this.copy({ ...this, cancelledAt }, updatedAt);
  }

  toUnstarted(updatedAt: Date) {
    return this.copy({ 
      ...this, 
      status: "unstarted", 
      // startedAt・completedAt・cancelledAt は undefined で上書きするため敢えて指定。
      startedAt: undefined, 
      completedAt: undefined,
      cancelledAt: undefined
    }, updatedAt);
  }

  /**
   * ※ 呼び出し元にドメイン知識の記述（startedAt 有無の判定ロジック）を強要しないよう、汎用的に
   * @param props 
   * @param updatedAt 
   * @returns 
   */
  toInProgress(props: { startedAt?: Date | null; }, updatedAt: Date) {
    // NOTE: ↓ Entityのコンストラクタのバリデーションで行っているからいらない？
    if (this.startedAt === undefined && props.startedAt === undefined) {
      throw new Error("進行中にするには startedAt の指定が必要です");
    }

    return this.copy({ 
      ...this, 
      status: "in-progress",
      startedAt: props.startedAt !== undefined ? props.startedAt : this.startedAt, 
      completedAt: undefined, 
      cancelledAt: undefined
    }, updatedAt);
  }

  toCompleted(props: { startedAt?: Date | null; completedAt?: Date | null; }, updatedAt: Date) {
    if (this.startedAt === undefined && props.startedAt === undefined) {
      throw new Error("完了にするには startedAt の指定が必要です");
    }
    
    if (this.completedAt === undefined && props.completedAt === undefined) {
      throw new Error("完了にするには completedAt の指定が必要です");
    }

    return this.copy({ 
      ...this,
      status: "completed",
      startedAt: props.startedAt !== undefined ? props.startedAt : this.startedAt,
      completedAt: props.completedAt !== undefined ? props.completedAt : this.completedAt,
      cancelledAt: undefined
    }, updatedAt);
  }

  toCancelled({ cancelledAt }: { cancelledAt?: Date | null }, updatedAt: Date) {
    if (cancelledAt === undefined) {
      throw new Error("キャンセル状態にするには cancelledAt が必要です");
    }

    return this.copy({ 
      ...this,
      status: "cancelled",
      cancelledAt
    }, updatedAt);
  }

  /**
   * 状態を変更する。
   * 
   * ※各状態毎にシグネチャを変える方法もあるが、呼び出し元にその構造での呼び出しが強制され、結果判定ロジックが漏れ出してしまうため、汎用的な引数に。
   * @param status 
   * @param props 
   * @param updatedAt 
   * @returns 
   */
  changeStatus(status: TaskStatus, props: { startedAt?: Date | null; completedAt?: Date | null; cancelledAt?: Date | null; }, updatedAt: Date) {
    switch (status) {
      case "unstarted":
        return this.toUnstarted(updatedAt);
      case "in-progress":
        return this.toInProgress(props, updatedAt);
      case "completed":
        return this.toCompleted(props, updatedAt);
      case "cancelled":
        return this.toCancelled(props, updatedAt);
    }
  }
}

function validateId(id: string) {
  if (id.length < 1) {
    throw new Error("IDは1文字以上です");
  }

  return true;
}

function validateTitle(_title: string) {
  return true;
}

function validateDue(due: Date | null) {
  if (due == null) {
    return true;
  }

  if (Number.isNaN(due.getTime())) {
    throw new Error(`期限の指定が不正です`);
  }

  return true;
}

function validateCreatedAt(createdAt: Date) {
  if (Number.isNaN(createdAt.getTime())) {
    throw new Error("createdAt の 日付に指定した記述が不正です");
  }

  return true;
}


/**
 * test/task/creation.test.ts 作成日時 > 更新日時を拒否
 * @param updatedAt 
 * @param createdAt 
 * @returns 
 */
function validateUpdatedAt(updatedAt: Date, deps: { createdAt: Date; }) {
  if (Number.isNaN(updatedAt.getTime())) {
    throw new Error("updatedAt の 日付に指定した記述が不正です");
  }

  if (updatedAt.getTime() < deps.createdAt.getTime()) {
    throw new Error("更新日時は作成日時よりも後である必要があります");
  }

  return true;
}

/**
 * 不正な日付を拒否
 * @param startedAt 
 * @returns 
 */
function validateStartedAt(startedAt: Date | null) {
  if (startedAt == null) {
    return true;
  }

  if (Number.isNaN(startedAt.getTime())) {
    throw new Error("startedAt の日付に指定した記述が不正です");
  }

  return true;
}

/**
 * test/task/creation.test.ts 開始日時 > 完了日時 を拒否・NaNを拒否
 * @param completedAt 
 * @param startedAt 
 * @returns 
 */
function validateCompletedAt(completedAt: Date | null, deps: { startedAt: Date | null | undefined; }) {
  if (completedAt == null) {
    return true;
  }

  if (Number.isNaN(completedAt.getTime())) {
    throw new Error("completedAt の日付に指定した記述不正です");
  }

  if (deps.startedAt != null && completedAt.getTime() < deps.startedAt.getTime()) {
    throw new Error("タスク完了時刻はタスク開始時刻よりも後である必要があります");
  }

  return true;
}


/**
 * 不正な日付を拒否
 * @param startedAt 
 * @returns 
 */

function validateCancelledAt(cancelledAt: Date | null) {
  if (cancelledAt == null) {
    return true;
  }

  if (Number.isNaN(cancelledAt.getTime())) {
    throw new Error("cancelledAt の 日付に指定した記述が不正です");
  }

  return true;
}

function validateStatus(status: TaskStatus, props: { startedAt?: Date | null; completedAt?: Date | null; cancelledAt?: Date | null }) {
  switch (status) {
    case "unstarted":
      break;

    case "in-progress":
      if (props.startedAt === undefined)
        throw new Error("進行中タスクには startedAt の指定が必要です");

      validateStartedAt(props.startedAt);
      break;
    
    case "completed":
      if (props.startedAt === undefined)
        throw new Error("進行中タスクには startedAt の指定が必要です");

      if (props.completedAt === undefined)
        throw new Error("完了タスクには completedAt の指定が必要です");

      validateStartedAt(props.startedAt);
      validateCompletedAt(props.completedAt, { startedAt: props.startedAt });
      break;
    
    case "cancelled":
      if (props.cancelledAt === undefined)
        throw new Error("キャンセルされたタスクには cancelledAt の指定が必要です");
      
      if (props.startedAt !== undefined)
        validateStartedAt(props.startedAt);
      
      if (props.completedAt !== undefined)
        validateCompletedAt(props.completedAt, { startedAt: props.startedAt });
      
      validateCancelledAt(props.cancelledAt);
      break;
    
    default:
      throw new Error(`不正な状態です: "${status}"`);
  }

  return true;
}