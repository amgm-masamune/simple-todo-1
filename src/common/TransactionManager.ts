export interface ITransactionManager<Tx = unknown> {
  run<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}

/**
 * トランザクションを正しく再現しようとすると、
 * 
 * - DB全体のスナップショット作成
 * - 排他制御・リトライ
 * - コミット
 * 
 * 等、複雑になるため割愛する。
 * 
 * **トランザクションを利用したユースケースは別途 Integration テストを実施**する。
 */
export class InMemoryTransactionManager implements ITransactionManager<void> {
  run<T>(fn: (tx: void) => Promise<T>): Promise<T> {
    return fn();
  }
}
