# Discover Search Persist + Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Discover search results durable and refreshable: restore the last ranked list after reload, update stale dossiers with fresh reach (fix 0-follower cache), and let brands save search hits into a shortlist without losing work.

**Architecture:** Keep client `localStorage` as the Source of Truth for anonymous demo (existing `lumen.discovery.lastSearch` / dossiers). Extend the last-search payload with `productId` and restore by re-ranking. On dossier open, merge reach from the latest candidate when the cached dossier is stale/zero. Add an explicit “Save to shortlist” path from ranked cards (auto-add to catalog first). Defer Prisma `DiscoveryCache` server wiring to a follow-up — model exists but is unused; YAGNI until brand-login multi-device is required.

**Tech Stack:** Next.js 16 client services (`discovery.service.ts`, `marketplace.ts`), `localStorage` via `lib/storage.ts`, existing shortlist API when logged in, fixture scripts under `web/scripts/`.

---

## Problem (current)

| Behavior | Today |
| --- | --- |
| Search | Writes `lumen.discovery.lastSearch` silently |
| Reload `/discover` | Restores **query only**; `ranked` stays `[]` → empty UI |
| Dossier | First open freezes reach forever (0 followers after 0.5.10 fix until re-search + new dossier) |
| Explicit save | Only **Add to catalog** on dossier; shortlist only after catalog |
| Server | `DiscoveryCache` Prisma model — **dead** |

## Out of scope (this plan)

- Wiring Prisma `DiscoveryCache` for multi-device brand sync (Phase B / follow-up)
- True Douyin `play_count` (TikHub search still zeroes it)
- Replacing localStorage dossiers with SQLite

## File map

| File | Role |
| --- | --- |
| `web/src/services/discovery/discovery.service.ts` | Extend last-search shape; restore helpers; dossier reach merge |
| `web/src/app/(app)/discover/page.tsx` | Hydrate ranked list on mount; optional Save UX |
| `web/src/app/(app)/discover/[id]/page.tsx` | Pass latest candidate into `openDossier` / refresh reach |
| `web/src/types/index.ts` | `LastDiscoverySearch` type |
| `web/messages/en.json` + `zh.json` | Copy for shortlist save |
| `web/scripts/discovery.persist.fixture.ts` | Unit checks for restore + reach merge |
| `docs/MANUAL_QA_DISCOVER_PERSIST.md` | Manual QA |
| `CHANGELOG.md` + health version | Ship notes |

---

### Task 1: Types + last-search payload with productId

**Files:**
- Modify: `web/src/types/index.ts`
- Modify: `web/src/services/discovery/discovery.service.ts`
- Create: `web/scripts/discovery.persist.fixture.ts`

- [ ] **Step 1: Add `LastDiscoverySearch` type**

In `web/src/types/index.ts`, after `DiscoveryCandidate`:

```ts
export interface LastDiscoverySearch {
  params: DiscoverySearchParams;
  results: DiscoveryCandidate[];
  /** Product used for rank — required to restore ranked UI. */
  productId?: string;
  at: string;
}
```

- [ ] **Step 2: Change `search` to accept/store `productId`**

```ts
async search(
  params: DiscoverySearchParams,
  opts?: { productId?: string },
): Promise<DiscoveryCandidate[]> {
  const results = await getConnector().search(params);
  saveJson(KEYS.lastSearch, {
    params,
    results,
    productId: opts?.productId,
    at: new Date().toISOString(),
  } satisfies LastDiscoverySearch);
  return results;
},

getLastSearch(): LastDiscoverySearch | null {
  return loadJson(KEYS.lastSearch, null);
},
```

- [ ] **Step 3: Fixture — shape smoke**

Create `web/scripts/discovery.persist.fixture.ts` (same `server-only` stub pattern as other fixtures). For this task assert the type shape:

```ts
import type { LastDiscoverySearch } from "../src/types";

const sample: LastDiscoverySearch = {
  params: {
    query: "AI",
    city: "Shanghai",
    language: "zh",
    topic: "tech",
    minFollowers: 0,
    limit: 12,
  },
  results: [],
  productId: "prod-7",
  at: new Date().toISOString(),
};
if (!sample.productId) throw new Error("productId required on LastDiscoverySearch");
console.log("discovery.persist Task1 OK");
```

- [ ] **Step 4: Commit**

```bash
git add web/src/types/index.ts web/src/services/discovery/discovery.service.ts web/scripts/discovery.persist.fixture.ts
git commit -m "feat: persist productId on discovery lastSearch"
```

---

### Task 2: Restore ranked list on `/discover` reload

**Files:**
- Modify: `web/src/app/(app)/discover/page.tsx`
- Modify: `web/messages/en.json`, `web/messages/zh.json` (optional restored hint)

- [ ] **Step 1: Pass `productId` from `runSearch`**

```ts
const list = await discovery.search(params, { productId });
```

- [ ] **Step 2: Replace the broken hydrate `useEffect`**

Current bug (restores query only, leaves `ranked=[]`):

```ts
useEffect(() => {
  const last = discovery.getLastSearch();
  if (last?.results?.length && !searchParams.get("productId")) {
    setSearched(true);
    if (last.params.query) setQuery(last.params.query);
  }
}, [searchParams]);
```

Replace with a one-shot hydrate:

```ts
const hydratedRef = useRef(false);

useEffect(() => {
  if (hydratedRef.current || !products.length) return;

  const last = discovery.getLastSearch();
  if (!last?.results?.length) {
    hydratedRef.current = true;
    return;
  }

  const fromUrl = searchParams.get("productId");
  const pid =
    fromUrl && products.some((p) => p.id === fromUrl)
      ? fromUrl
      : last.productId && products.some((p) => p.id === last.productId)
        ? last.productId
        : products[0]?.id || "";

  if (!pid) {
    hydratedRef.current = true;
    return;
  }

  applyProductDefaults(pid);

  const product = marketplace.getProduct(pid);
  if (!product) {
    hydratedRef.current = true;
    return;
  }

  if (last.params.query) setQuery(last.params.query);
  if (last.params.city) setCity(last.params.city);
  if (last.params.topic) setTopic(last.params.topic);
  if (last.params.language) setLanguage(last.params.language);
  if (typeof last.params.minFollowers === "number") {
    setMinFollowers(last.params.minFollowers);
  }

  const matches = rankCandidatesForCard(last.results, enrichProductForMatch(product));
  setRawCount(last.results.length);
  setRanked(matches);
  setSearched(true);
  hydratedRef.current = true;
}, [products, searchParams]);
```

- [ ] **Step 3: Manual check locally**

1. Search & rank with a product → see cards
2. Soft reload
3. Expect same ranked cards without clicking Search

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(app\)/discover/page.tsx web/messages/en.json web/messages/zh.json
git commit -m "fix: restore ranked Discover results from lastSearch"
```

---

### Task 3: Refresh stale dossier reach from latest candidate

**Files:**
- Modify: `web/src/services/discovery/discovery.service.ts`
- Modify: `web/src/app/(app)/discover/[id]/page.tsx`
- Modify: `web/scripts/discovery.persist.fixture.ts`

- [ ] **Step 1: Extract merge helper (export for fixture)**

```ts
export function mergeDossierReachFromCandidate(
  dossier: InfluencerDossier,
  candidate: DiscoveryCandidate,
): InfluencerDossier {
  const incoming = candidate.followers ?? 0;
  const current = dossier.reach.followers ?? 0;
  const shouldUpdate =
    incoming > 0 &&
    (current <= 0 ||
      incoming !== current ||
      candidate.avgViews !== dossier.reach.avgViews ||
      candidate.engagementRate !== dossier.reach.engagementRate);

  if (!shouldUpdate) return dossier;

  return {
    ...dossier,
    reach: {
      ...dossier.reach,
      followers: incoming,
      avgViews: candidate.avgViews,
      engagementRate: candidate.engagementRate,
    },
    identity: {
      ...dossier.identity,
      bio: candidate.bio || dossier.identity.bio,
      name: candidate.name || dossier.identity.name,
    },
  };
}
```

- [ ] **Step 2: Use merge inside `openDossier`**

```ts
async openDossier(candidate: DiscoveryCandidate): Promise<InfluencerDossier> {
  const map = loadDossiers();
  const existing = Object.values(map).find((d) => d.candidateId === candidate.id);
  if (existing) {
    const merged = mergeDossierReachFromCandidate(existing, candidate);
    merged.inCatalog = catalogHasHandle(candidate.handle);
    map[merged.id] = merged;
    saveDossiers(map);
    return merged;
  }
  // ... existing create path unchanged ...
},
```

- [ ] **Step 3: Dossier page — prefer lastSearch candidate**

In `discover/[id]/page.tsx` load path, keep preferring `last.results.find(...)` over dossier-only reconstruction when both exist (already partial). After `openDossier(candidate)` with enriched followers, Reach must show non-zero.

When only dossier exists (deep link, no lastSearch), keep current behavior.

- [ ] **Step 4: Extend fixture**

Stub `server-only`, import `mergeDossierReachFromCandidate`, assert 0 → 128000 followers update.

Run: `cd web && npx tsx scripts/discovery.persist.fixture.ts` → PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/services/discovery/discovery.service.ts \
  web/src/app/\(app\)/discover/\[id\]/page.tsx \
  web/scripts/discovery.persist.fixture.ts
git commit -m "fix: refresh dossier reach from latest discovery candidate"
```

---

### Task 4: Save ranked hit → catalog + shortlist (explicit)

**Files:**
- Modify: `web/src/services/discovery/discovery.service.ts`
- Modify: `web/src/app/(app)/discover/page.tsx`
- Modify: `web/messages/en.json`, `web/messages/zh.json`

- [ ] **Step 1: Helper to materialize Influencer from candidate**

```ts
saveCandidateToCatalog(candidate: DiscoveryCandidate): Influencer {
  const map = loadDossiers();
  let dossier = Object.values(map).find((d) => d.candidateId === candidate.id);
  if (!dossier) {
    dossier = dossierFromCandidate(candidate);
    map[dossier.id] = dossier;
    saveDossiers(map);
  } else {
    dossier = mergeDossierReachFromCandidate(dossier, candidate);
    map[dossier.id] = dossier;
    saveDossiers(map);
  }
  return this.saveToCatalog(dossier.id);
},
```

- [ ] **Step 2: Page-level shortlist picker + per-card button**

Hydrate shortlists once (same pattern as `AddToShortlistButton`). Per ranked card `onClick` only (never on render):

```ts
const inf = discovery.saveCandidateToCatalog(m.candidate);
await marketplace.addToShortlistAsync(shortlistId, inf.id);
push(fill(t.discover.addedToShortlist, { name: inf.name }));
```

- [ ] **Step 3: i18n keys**

- `discover.addToShortlist`: EN `"Add to shortlist"` / ZH `"加入候选名单"`
- `discover.addedToShortlist`: EN `"Added {name} to shortlist"` / ZH `"已将 {name} 加入候选名单"`

- [ ] **Step 4: Manual check**

1. Search → Add to shortlist on card 1
2. Open `/shortlists` → influencer present
3. Reload Discover → ranked list still there (Task 2)
4. Open dossier that previously had 0 followers → Reach updated (Task 3)

- [ ] **Step 5: Commit**

```bash
git add web/src/services/discovery/discovery.service.ts \
  web/src/app/\(app\)/discover/page.tsx \
  web/messages/en.json web/messages/zh.json
git commit -m "feat: add Discover ranked card save to shortlist"
```

---

### Task 5: Manual QA doc + version + changelog

**Files:**
- Create: `docs/MANUAL_QA_DISCOVER_PERSIST.md`
- Modify: `web/src/app/api/health/route.ts` (bump e.g. `0.5.11`)
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Write Manual QA (P0)**

| ID | Steps | Expected |
| --- | --- | --- |
| S1 | Health version | `0.5.11` |
| P1 | Search & rank → soft reload | Ranked cards restored, same product |
| P2 | Open dossier after new search with enriched followers | Reach ≠ 0 even if old dossier had 0 |
| P3 | Add to shortlist from ranked card | Appears in `/shortlists` |
| P4 | Private window (no lastSearch) | Empty hint until Search (no crash) |

- [ ] **Step 2: Bump health + changelog Added/Fixed section**

- [ ] **Step 3: Commit**

```bash
git add docs/MANUAL_QA_DISCOVER_PERSIST.md web/src/app/api/health/route.ts CHANGELOG.md
git commit -m "docs: Discover persist QA + changelog 0.5.11"
```

---

### Task 6: Build → deploy → QA → push (ops)

- [ ] **Step 1:** `cd web && npm run build`
- [ ] **Step 2:** Push `main` (triggers Deploy workflow)
- [ ] **Step 3:** `EXPECT_VERSION=0.5.11 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
- [ ] **Step 4:** Execute `docs/MANUAL_QA_DISCOVER_PERSIST.md`, fill PASS/FAIL
- [ ] **Step 5:** Commit QA results + changelog QA subsection; push main

---

## Follow-up (not this plan) — Phase B: server `DiscoveryCache`

When multi-device / logged-in brand needs shared search history:

1. Wire Prisma `DiscoveryCache` (`queryKey`, `payload`, `expiresAt`)
2. `POST /api/discovery/cache` session-gated upsert
3. Hydrate lastSearch from API when `lumen_session` present, fallback localStorage
4. TTL e.g. 7 days; do not store TikHub raw blobs longer than needed

---

## Self-review

1. **Spec coverage:** restore ranked ✓ · dossier reach refresh ✓ · explicit shortlist save ✓ · server cache deferred ✓
2. **Placeholders:** none intentional
3. **Types:** `LastDiscoverySearch.productId` used consistently in search + hydrate

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-31-discover-search-persist.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
2. **Inline Execution** — this session, task-by-task with checkpoints

Which approach?
