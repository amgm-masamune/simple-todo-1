# Docker 関連学び

## Windows利用時、`.sh` ファイルは `CRLF` → `LF`

- ログには `/bin/bash^M: bad interpreter: No such file or directory` のように表示される

## DBのログの出力は `docker compose logs db` で確認

## PostgreSQL 公式イメージのユーザー名は `postgres`

- init.sh では -U オプションの指定が必要
- 内部的には `USER=postgres` で実行されるため、ユーザーを指定してあげないとエラーになる。
