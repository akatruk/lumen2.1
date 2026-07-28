#!/bin/sh
set -e
mkdir -p /app/data

PRISMA_CLI="/app/node_modules/prisma/build/index.js"
if [ ! -f "$PRISMA_CLI" ]; then
  echo "FATAL: Prisma CLI missing at $PRISMA_CLI"
  exit 1
fi

echo "Running prisma db push..."
node "$PRISMA_CLI" db push --skip-generate --schema=/app/prisma/schema.prisma

exec node server.js
