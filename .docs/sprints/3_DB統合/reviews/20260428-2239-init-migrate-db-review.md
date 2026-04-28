# コードレビュー: DBの初期化・マイグレーションの処理追加

- **PR**: DBの初期化・マイグレーションの処理追加
- **対象ブランチ**: `feature/init-migrate-db`
- **レビュー日時**: 2026-04-28

---

## Findings

### [Major] `Environment` 型と実装の不一致

**対象箇所**: `src/deps/CompositionRoot.ts` — 37〜44行目

```typescript
export type Environment = "in-memory" | "pg-drizzle";

switch (environment) {
  case "in-memory":
    return createInMemoryDependencies(idGenerator, clock);
  // case "pg-drizzle":
  //   return createPgDrizzleDependencies(idGenerator, clock);
  default:
    throw new Error(`Unknown environment: ${environment}`);
}
```

**問題**  
`Environment` 型に `"pg-drizzle"` が含まれているにもかかわらず、対応する `case` がコメントアウトされている。TypeScript は `"pg-drizzle"` を有効な値として許可するが、実行時には `default` ブランチで例外がスローされる。型と実装が乖離しており、型安全性が破綻している。

**影響**  
`createDependencies("pg-drizzle")` を呼ぶと実行時エラー。TypeScript のコンパイルエラーにはならないため、発見が遅れる。

**修正案**  
実装が完成するまでは `Environment` 型から `"pg-drizzle"` を除外するか、コメントアウトを外して実装を完成させる。

```typescript
// 実装が未完の間は型からも除外する
export type Environment = "in-memory"; // "pg-drizzle" は実装完了後に追加

// または、コメントを外して実装を完成させる
case "pg-drizzle":
  return createPgDrizzleDependencies(idGenerator, clock);
```

---

### [Major] `createDependencies` の戻り値型が `Dependencies | Promise<Dependencies>`

**対象箇所**: `src/deps/CompositionRoot.ts` — 31行目

```typescript
export function createDependencies(...): Dependencies | Promise<Dependencies>
```

**問題**  
`in-memory` は同期、`pg-drizzle` は非同期という非対称な設計になっている。呼び出し側はすべて `await` で統一されているが、戻り値型が `Dependencies | Promise<Dependencies>` である限り、型システム上は「awaitしなくても型エラーにならない」ケースが生じる。また、将来的に `in-memory` 以外の環境を追加する際に、毎回 Union 型を広げる必要があり保守性が低い。

**影響**  
呼び出し側が `await` を忘れても TypeScript のエラーにならない環境が生まれる。テストコードと本番コードの一貫性が崩れやすい。

**修正案**  
常に `Promise<Dependencies>` を返すように統一する。`in-memory` の場合も `Promise.resolve()` でラップする。

```typescript
export async function createDependencies(...): Promise<Dependencies> {
  switch (environment) {
    case "in-memory":
      return createInMemoryDependencies(idGenerator, clock);
    case "pg-drizzle":
      return createPgDrizzleDependencies(idGenerator, clock);
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}
```

---

### [Major] `{} as ITaskRepository` による型アサーション

**対象箇所**: `src/deps/CompositionRoot.ts` — 78行目

```typescript
const taskRepository = {} as ITaskRepository; // new PgDrizzleTaskRepository();
```

**問題**  
空オブジェクトを `ITaskRepository` にキャストしている。コメントから未実装のプレースホルダーであることはわかるが、誤ってこのパスが実行された場合（例: 環境変数 `DB_APP_URL` を設定した状態で `"pg-drizzle"` を試みた場合）、メソッド呼び出し時にランタイムエラーが発生する。型安全性が完全に失われている。

**影響**  
実行時クラッシュ。エラー発生箇所が `CompositionRoot.ts` から離れたユースケース層になり、原因特定が困難になる。

**修正案**  
未実装であることを明示するか、TODO コメントを追加し、マージ前に実装を完成させる。あるいは `"pg-drizzle"` 環境の実装が完了するまでは switch 分岐ごと実装しない。

---

### [Major] マイグレーションファイルが `.gitignore` に含まれている

**対象箇所**: `.gitignore` — `drizzle/` ディレクトリ

**問題**  
`migrate(db, { migrationsFolder: "./drizzle" })` が参照するマイグレーションファイルのディレクトリ `drizzle/` が `.gitignore` に含まれており、リポジトリに存在しない。`drizzle generate` で生成した SQL ファイルを手元に持っていない環境ではマイグレーションが必ず失敗する。

**影響**  
本番・CI 環境へのデプロイ時にマイグレーションが実行できずサービス起動が失敗する。

**修正案**  
`drizzle/` (もしくはマイグレーション SQL ファイルを含む `drizzle/migrations/` など) は `.gitignore` から除外してリポジトリに含める。Drizzle が自動生成するスナップショットファイル (`drizzle/meta/`) のみを除外する運用も検討する。

```gitignore
# マイグレーションSQLは管理対象に含める
# drizzle/  ← コメントアウトまたは削除

# 生成メタ情報だけ除外する場合
drizzle/meta/
```

---

### [Minor] `main()` の unhandled Promise rejection リスク

**対象箇所**: `src/main.ts` — 15行目

```typescript
main();
```

**問題**  
`main()` は `async function` だが、呼び出し時に `await` や `.catch()` が付いていない。`createDependencies` や `migrate` が例外をスローした場合、Unhandled Promise Rejection となり、Deno のデフォルト動作ではプロセスが終了するが、ログ出力が不明瞭になる可能性がある。

**修正案**  
```typescript
main().catch((err) => {
  console.error("Fatal error during startup:", err);
  Deno.exit(1);
});
```

---

### [Minor] `postgres` と `pg` の二重依存

**対象箇所**: `deno.json`

**問題**  
`postgres` (postgres.js) と `pg` (node-postgres) の両方が依存に含まれている。Drizzle の `node-postgres` アダプタ (`drizzle-orm/node-postgres`) は `pg` を使用し、`postgres.js` アダプタ (`drizzle-orm/postgres-js`) は `postgres` を使用する。どちらか一方に統一できるなら、不要な依存を削除する方が望ましい。

**修正案**  
現在 `node-postgres` アダプタを使っているなら `postgres` パッケージが不要かどうかを確認し、不要であれば削除する。

---

### [Minor] `drizzle.config.ts` の非 null アサーション

**対象箇所**: `drizzle.config.ts` — 4行目

```typescript
const dbUrl = Deno.env.get("DB_APP_URL")!;
```

**問題**  
`!` による非 null アサーションは、環境変数が未設定の場合でもコンパイルエラーにならず、`undefined` のまま `dbCredentials.url` に渡される。`CompositionRoot.ts` では `null` チェックをしているのに、config ファイルでは行っていない点で一貫性がない。

**修正案**  
コメントに「よくわからないので throw しないようにした」とあるが、Drizzle Kit の config ファイルはマイグレーション CLI 実行時にのみ参照されるため、実際に `DB_APP_URL` が設定されていない状態で `drizzle generate` を呼ぶことは通常ない。ただし、一貫性のため `null` チェックを追加するか、またはコメントを更新して意図を明確にすることを推奨する。

---

## Open Questions

1. **`drizzle/` の管理方針**: マイグレーションファイルはバージョン管理するのか、CI でその都度生成するのか？方針を決めて `.gitignore` と CI/CD パイプラインを整合させる必要がある。

2. **`postgres` パッケージの用途**: 現在 `drizzle-orm/node-postgres` アダプタを使っているが、`postgres` (postgres.js) は他の箇所で使われているか？使われていない場合は削除を検討する。

---

## Summary

### 全体所見

DB 接続・マイグレーション機能の追加という方向性は適切。ただし現時点では `"pg-drizzle"` 環境の実装が未完成であり、型（`Environment` 型）と実装（コメントアウトされた `case`）の間に乖離がある。これはビルド時には検出されない実行時バグの温床となる。

`createDependencies` の戻り値型を `Dependencies | Promise<Dependencies>` にした点は、呼び出し側全体に `await` を強制することになり、型の意図と実際の使われ方が一致していない。`Promise<Dependencies>` に統一することで、型がシンプルになり呼び出し側の変更も最小化できる。

マイグレーションファイルが `.gitignore` に含まれている点は、本番・CI での動作に直結するため早急に対応が必要。

### 残余リスク

- `PgDrizzleTaskRepository` の実装が存在しないため、`"pg-drizzle"` 環境は現時点で動作しない。
- マイグレーション失敗時のロールバック戦略が未定義。
- DB 接続タイムアウトや接続プールの設定が未実装。
