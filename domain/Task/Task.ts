type TaskStatus = "unstarted" | "in-progress" | "completed" | "cancelled";

export abstract class Task {
  readonly title: string;
  readonly due: Date | null;
  readonly createdAt: Date
  readonly updatedAt: Date;

  abstract readonly status: TaskStatus;
  
  private constructor({ title, due, createdAt, updatedAt = createdAt }: { title: string; due: Date | null; createdAt: Date; updatedAt?: Date; }) {
    validateTitle(title);
    validateUpdatedAt(updatedAt, createdAt);
    
    this.title = title;
    this.due = due;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  
  static readonly Unstarted = class Unstarted extends Task {
    override status = "unstarted" as const;

    constructor({ title, due, createdAt, updatedAt }: { title: string; due: Date | null; createdAt: Date; updatedAt?: Date; }) {
      super({ title, due, createdAt, updatedAt });
    }
  }

  static readonly InProgress = class InProgress extends Task {
    override status = "in-progress" as const;
    readonly startedAt: Date | null;

    constructor({ title, due, createdAt, updatedAt, startedAt }: { title: string; due: Date | null; createdAt: Date; updatedAt?: Date; startedAt: Date | null; }) {
      super({ title, due, createdAt, updatedAt });
      this.startedAt = startedAt;
    }
  }

  static readonly Completed = class Completed extends Task {
    override status = "completed" as const;
    readonly startedAt: Date | null;
    readonly completedAt: Date | null;

    constructor({ title, due, createdAt, updatedAt, startedAt, completedAt }: { title: string; due: Date | null; createdAt: Date; updatedAt?: Date; startedAt: Date | null; completedAt: Date | null; }) {
      super({ title, due, createdAt, updatedAt });

      validateCompletedAt(completedAt, startedAt);

      this.startedAt = startedAt;
      this.completedAt = completedAt;
    }
  }

  static readonly Cancelled = class Cancelled extends Task {
    override status = "cancelled" as const;
    readonly startedAt: Date | null;
    readonly completedAt: Date | null;
    readonly cancelledAt: Date | null;

    constructor({ title, due, createdAt, updatedAt, startedAt, completedAt, cancelledAt }: { title: string; due: Date | null; createdAt: Date; updatedAt?: Date; startedAt: Date | null; completedAt: Date | null; cancelledAt: Date | null; }) {
      super({ title, due, createdAt, updatedAt });

      validateCompletedAt(completedAt, startedAt);

      this.startedAt = startedAt;
      this.completedAt = completedAt
      this.cancelledAt = cancelledAt;
    }
  }

}

function validateTitle(title: string) {
  if (title.length > 255)
    throw new Error("タイトルは255文字以内です");
  
  return true;
}

/**
 * test/task/creation.test.ts 開始日時 > 完了日時 を拒否
 * @param completedAt 
 * @param startedAt 
 * @returns 
 */
function validateCompletedAt(completedAt: Date | null, startedAt: Date | null) {
  if (completedAt == null || startedAt == null) {
    return true;
  }

  if (completedAt.getTime() < startedAt.getTime()) {
    throw new Error("タスク完了時刻はタスク開始時刻よりも後である必要があります");
  }

  return true;
}

/**
 * test/task/creation.test.ts 作成日時 > 更新日時を拒否
 * @param updatedAt 
 * @param createdAt 
 * @returns 
 */
function validateUpdatedAt(updatedAt: Date, createdAt: Date) {
  if (updatedAt.getTime() < createdAt.getTime()) {
    throw new Error("更新日時は作成日時よりも後である必要があります");
  }

  return true;
}