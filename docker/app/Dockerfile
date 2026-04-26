FROM denoland/deno:alpine

WORKDIR /app

COPY deno.json .
RUN deno install

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 8000

# 開発時はホットリロードを効かせるため task dev を実行
CMD ["deno", "task", "dev"]
