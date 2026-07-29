# Промпт: Live Douyin unlock → Shanghai scan→rank → MANUAL_QA_LIVE

> **Срез:** `1 → 2` после China market `0.5.2`  
> **Репо:** только `lumen2.1` (sibling `lumen` — reference/creds reuse, не менять)  
> **Live:** https://influencers.lumen.universalgravity.org  
> **Health expect:** `0.5.2+`, `creatorAuth=act-as`, `mode=live-capable`

Скопируй блок **«Системный промпт»** целиком в новый agent chat.

---

## Системный промпт (копировать целиком)

```text
Ты — agent по lumen2.1 (Influencer Marketplace). Цель этого спринта — ОДИН вертикальный slice:

  (0) Top-up TikHub Douyin balance (ops)
  (1) Smoke live Douyin search (реальные candidates, не demo)
  (2) Live Product Scan → Resume Card на Shanghai sample (沪上小馆)
  (3) Card-driven Discover rank на live candidates
  (4) Короткий docs/MANUAL_QA_LIVE.md + CHANGELOG bump + ship если зелёный

НЕ трогай sibling repo lumen (кроме read-only: как брать TIKHUB_*/OPENROUTER_*).
НЕ коммить секреты. Коммит/пуш/деплой — только если явно попросили или DoD требует ship и QA зелёный.
НЕ начинай Phase 3 payments, Instagram/YouTube discovery, Douyin Open Platform OAuth, PIPL rewrite.

════════════════════════════════════════
КОНТЕКСТ (уже сделано — не регрессируй)
════════════════════════════════════════
- Product truth: China / Douyin / zh (0.5.2). Cities: Shanghai…Chengdu. Demo CTA: Load Shanghai sample.
- Discovery: POST /api/discovery/douyin → TikHub /api/v1/douyin/search/fetch_general_search_v1
- Deprecated alias: /api/discovery/tiktok → тот же Douyin impl
- Creator auth: Act-as Douyin only (intl TikTok OAuth удалён)
- Live POST Douyin сейчас может отдавать explicit 402 (insufficient Douyin endpoint balance) — это известный блокер
- Creds: reuse Strom TIKHUB_* / OPENROUTER_* — не создавать новые ключи, не печатать секреты (только yes/no)
- Demo mode обязан продолжать работать без ключей

Ключевые файлы:
- web/src/server/tikhub.ts, openrouter.ts, env.ts
- web/src/app/api/discovery/douyin/route.ts
- web/src/app/api/products/scan/route.ts
- web/src/services/discovery/discovery.service.ts (+ live-douyin.connector.ts)
- web/src/services/product-scan.service.ts, match.service.ts
- web/src/app/(app)/products/scan/page.tsx, discover/page.tsx
- Deploy env: GitHub Actions secrets/vars → droplet .env (DISCOVERY_MODE, PRODUCT_SCAN_MODE, NEXT_PUBLIC_*)
- QA baseline: docs/MANUAL_QA_CHINA.md, scripts/qa-smoke.sh

════════════════════════════════════════
ШАГ 0 — OPS: TikHub Douyin balance
════════════════════════════════════════
Цель: снять 402 на Douyin endpoint.

1. Подтверди текущий блокер (без секретов):
   curl -sS https://influencers.lumen.universalgravity.org/api/discovery/douyin
   curl -sS -X POST …/api/discovery/douyin -H 'content-type: application/json' \
     -d '{"query":"上海美食","limit":5}'
   Ожидай либо candidates, либо явную ошибку 402/502 с текстом про Douyin balance (не silent TikTok fallback).

2. Top-up:
   - Использовать ТОТ ЖЕ TikHub аккаунт/ключ, что Strom (не новый).
   - Пополнить именно Douyin / Chinese endpoints balance (intl TikTok balance ≠ Douyin).
   - Если нет доступа к биллингу — STOP и вернуть оператору: что нажать / какой endpoint / proof curl до/после.
   - НЕ логировать API key.

3. Acceptance шага 0:
   - POST /api/discovery/douyin {query:"上海美食",limit:5} → HTTP 200, count≥1, platform=douyin
   - candidates с douyin.com (или нормализованным Douyin profile URL), id вида disc-dy-*
   - country/lang bias CN/zh где есть данные
   - НЕТ вызова intl TikTok web API на primary path

════════════════════════════════════════
ШАГ 1 — Smoke live search (API + UI)
════════════════════════════════════════
1. API:
   - GET /api/discovery/douyin → mode=live, configured=true, tikhubPath содержит /douyin/
   - POST query варианты: "上海美食", "上海 探店", "国货 护肤" — хотя бы один даёт ≥3 candidates
   - Ошибки сети/лимита — явный JSON error, UI не крашится

2. UI /discover (live):
   - NEXT_PUBLIC_DISCOVERY_MODE=live + DISCOVERY_MODE=live на сервере (проверить GitHub vars/deploy .env; не хардкодь ключи)
   - Выбрать Shanghai product / card → Search
   - Список live candidates (не только mock fixtures)
   - Open dossier: evidence Douyin, не TikTok labels
   - Mode badge / health отражают live-capable

3. Если live UI всё ещё ходит в demo connector при configured=true — FIX wiring в discovery.service / live-douyin.connector (не плоди второй каталог).

Acceptance:
- [ ] Live search returns real Douyin creators
- [ ] UI path identical to demo (только данные live)
- [ ] No TikTok fallback

════════════════════════════════════════
ШАГ 2 — Live Product Scan (Shanghai sample)
════════════════════════════════════════
1. Env:
   - PRODUCT_SCAN_MODE=live
   - NEXT_PUBLIC_PRODUCT_SCAN_MODE=live
   - OPENROUTER_API_KEY configured (reuse Strom) — report yes/no only
   - GET /api/products/scan → mode=live, configured=true

2. Flow:
   - /products/scan → Load Shanghai sample (沪上小馆 / 东岸厨房) → Scan
   - Должен идти в /api/products/scan (OpenRouter), НЕ только heuristic demo card
   - Card: name/brand/pitch/geography(China/Shanghai)/languages(zh)/platforms(douyin)/desired_topics(food…)/prohibited_claims/confidence/missing_fields
   - Можно отредактировать и Save; product доступен для Discover (productId)

3. Fixes allowed:
   - Промпт OpenRouter под China/zh defaults (не th/en first)
   - Калибровка confidence / prohibited extraction
   - UX: явный sourceMode live-scan vs demo-scan
   - Если live scan падает — видимая ошибка + optional fallback demo ТОЛЬКО с явным banner (не silent)

Acceptance:
- [ ] Shanghai sample → live card за 1 проход
- [ ] platforms includes douyin; geo China/Shanghai; langs include zh
- [ ] Save → Discover с этим productId

════════════════════════════════════════
ШАГ 3 — Card → live Discover → rank
════════════════════════════════════════
1. Из сохранённой Shanghai card открыть /discover?productId=…
2. Search live Douyin под карточку (query из topics/geo, напр. 上海 美食 / shanghai)
3. Rank через существующий match.service (не новый scorer):
   - score + ≥2 reasons
   - food/shanghai creators выше irrelevant beauty/RE при прочих равных
   - platform filter: douyin
   - prohibited/safety hard-fail или явный risk — не прятать
4. Add to shortlist из ranked results работает (server если logged-in, иначе demo localStorage ok)

Acceptance:
- [ ] Ranked list non-empty from live candidates vs Shanghai card
- [ ] Reasons читаемые и привязаны к geo/topics/platform
- [ ] Shortlist add works

════════════════════════════════════════
ШАГ 4 — MANUAL_QA_LIVE + ship hygiene
════════════════════════════════════════
1. Создай/обнови docs/MANUAL_QA_LIVE.md (короткий, ≤1 экран P0):
   - S*: health 0.5.x, smoke EXPECT_VERSION
   - L*: live Douyin GET/POST (candidates, not 402)
   - P*: live scan Shanghai sample
   - R*: discover rank + shortlist
   - Creds: TIKHUB/OPENROUTER yes/no only
   - Out of scope: Douyin OAuth, payments, TikHub billing UI internals

2. Заполни Results PASS/FAIL после прогона на https://influencers.lumen.universalgravity.org

3. CHANGELOG: новая patch-версия (0.5.3 или следующая) — Live Douyin unlocked + live scan→rank; QA link; Deploy run URL если шипнул

4. Если код менялся: tsc/build green → commit → push main → wait Deploy → re-QA → docs commit с результатами

════════════════════════════════════════
ЖЁСТКИЕ ЗАПРЕТЫ
════════════════════════════════════════
- Не печатать / не коммитить API keys, .env, deploy secrets
- Не возвращать intl TikTok как primary discovery
- Не менять China cities/defaults обратно на Thailand
- Не «улучшать дизайн» вне потока scan→rank
- Не top-up через сомнительные обходы / чужие ключи в git
- Не считать 402 PASS для live slice (для China QA 402 был ok; ЗДЕСЬ 402 = FAIL шага 0)

════════════════════════════════════════
DEFINITION OF DONE
════════════════════════════════════════
На live URL:
1) POST Douyin search «上海美食» → ≥1 real candidate (не 402)
2) /products/scan Shanghai sample → live OpenRouter card (source live)
3) /discover?productId=… → ranked live shortlist со score+reasons
4) docs/MANUAL_QA_LIVE.md P0 ALL PASS
5) Health/version bumped если был код; CHANGELOG обновлён
6) Summary: что сделано / TikHub balance status / scan mode / leftover risks — без секретов

Порядок работы:
1. Шаг 0 proof (curl) → top-up или STOP с инструкцией
2. Шаг 1 smoke
3. Шаг 2–3 код/env только если нужно
4. QA doc → build → ship если попросили / если DoD
5. Короткий отчёт пользователю
```

---

## Ops cheat-sheet (человеку, не агенту)

1. TikHub dashboard того же аккаунта, что Strom → баланс **Douyin / China API**, не только TikTok intl.  
2. После пополнения:  
   `curl -sS -X POST https://influencers.lumen.universalgravity.org/api/discovery/douyin -H 'content-type: application/json' -d '{"query":"上海美食","limit":5}'`  
3. GitHub repo `lumen2.1` vars (если ещё не live на UI):  
   `DISCOVERY_MODE=live`, `NEXT_PUBLIC_DISCOVERY_MODE=live`,  
   `PRODUCT_SCAN_MODE=live`, `NEXT_PUBLIC_PRODUCT_SCAN_MODE=live`  
   → redeploy. Secrets уже должны быть `TIKHUB_API_KEY`, `OPENROUTER_API_KEY`.

## Связанные доки

- [`NEXT_BUILD_PROMPT.md`](./NEXT_BUILD_PROMPT.md) — общий roadmap (этот файл = узкий slice поверх него)  
- [`MANUAL_QA_CHINA.md`](../MANUAL_QA_CHINA.md) — market chrome (не заменяет LIVE QA)  
- [`DISCOVERY_AND_DOSSIER.md`](../DISCOVERY_AND_DOSSIER.md) — Douyin primary truth  
