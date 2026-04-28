# Drizzle

## 初期構築

### Deno での構築

<https://deno.com/blog/build-database-app-drizzle>

```bash
deno install npm:drizzle-orm npm:drizzle-kit npm:pg npm:@types/pg
```

## コマンド

<https://orm.drizzle.team/docs/migrations>

### スキーマ(`schema.ts`)からマイグレーションファイル(`drizzle/….sql`)を生成する

```bash
deno -A npm:drizzle-kit generate
```

### 現在のDBからマイグレーションファイルを生成する

```bash
deno -A npm:drizzle-kit pull
```

### マイグレーションファイルを実行する

※ エントリポイントに書いて自動で実行することも

```bash
deno -A npm:drizzle-kit migrate
```

### マイグレーションファイルをロールバックする

```bash
deno -A npm:drizzle-kit rollback
```
