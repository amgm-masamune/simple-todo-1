import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// 公式ドキュメント：<https://orm.drizzle.team/docs/sql-schema-declaration>

export const taskStatusEnum = pgEnum('task_status', [
  "unstarted",
  "in-progress",
  "completed",
  "cancelled"
]);

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text().notNull(),
  status: taskStatusEnum("status").notNull(),
  due: timestamp("due", { mode: "date" }),
  startedAt: timestamp("started_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  cancelledAt: timestamp("cancelled_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date(Date.now()))
});
