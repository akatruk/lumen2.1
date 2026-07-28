#!/bin/sh
set -e
mkdir -p /app/data
npx prisma db push --skip-generate --schema=/app/prisma/schema.prisma || true
exec node server.js
