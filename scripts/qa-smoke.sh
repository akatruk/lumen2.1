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
check "/discover"
check "/products/scan"
check "/login"
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
if [ -n "${EXPECT_VERSION:-}" ]; then
  echo "$body" | grep -q "\"version\":\"${EXPECT_VERSION}\"" || {
    echo "FAIL  health version != ${EXPECT_VERSION}"
    FAIL=1
  }
fi
# Theme markers in HTML (Strom glass port)
html=$(curl -sS "${BASE}/")
for marker in 'LUMEN' 'Marketplace' 'geist_' 'grid-pattern' 'ambient-glow' 'bg-background'; do
  if echo "$html" | grep -F -q "$marker"; then
    echo "PASS  marker  ${marker}"
  else
    echo "FAIL  marker  ${marker}"
    FAIL=1
  fi
done

if [ "$FAIL" -ne 0 ]; then
  echo "SMOKE FAILED"
  exit 1
fi
echo "SMOKE PASSED"
