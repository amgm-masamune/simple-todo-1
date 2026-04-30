import { TransactionRollbackError } from "drizzle-orm/errors";
import { createDependencies, Dependencies } from "@deps/CompositionRoot.ts";
import { PgTransaction } from "@deps/PgDrizzle.ts";

export async function pgDrizzleDbTestAllSetup() {
  return await createDependencies("pg-drizzle", { 
    tempSchemaName: `test_${crypto.randomUUID().replaceAll("-", "")}`
  });
}

export async function dbTest(deps: Dependencies<"pg-drizzle">, fn: (tx: PgTransaction) => Promise<void>) {
  try {
    await deps.transactionManager.run(async tx => { // Rollback されるとこのメソッドもエラーを返す
      await fn(tx);
      tx.rollback()
    });
  } catch (e) {
    if (e instanceof TransactionRollbackError)
      return;
    throw e;
  };
}