#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://127.0.0.1:3000}"
FAIL=0

check() {
  local path="$1"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}${path}" || echo "000")
  if [ "$code" = "200" ]; then
    echo "PASS  ${code}  ${path}"
  else
    echo "FAIL  ${code}  ${path}"
    FAIL=1
  fi
}

echo "Smoke against ${BASE}"
check "/api/health"
check "/"
check "/presentation"
check "/influencers"
check "/products"
check "/campaigns"
check "/shortlists"
check "/invitations"
check "/reviews"
check "/claims"
check "/analysis-jobs"
check "/settings"
check "/import"
check "/creator"
check "/creator/invitations"
check "/creator/briefs"
check "/creator/submissions"
check "/creator/claim"

body=$(curl -sS "${BASE}/api/health")
echo "Health body: ${body}"
echo "$body" | grep -q '"status":"ok"' || {
  echo "FAIL  health payload missing status=ok"
  FAIL=1
}

if [ "$FAIL" -ne 0 ]; then
  echo "SMOKE FAILED"
  exit 1
fi
echo "SMOKE PASSED"
