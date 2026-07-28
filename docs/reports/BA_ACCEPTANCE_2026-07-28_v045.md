# Отчёт приёмки Lumen Influencer Marketplace

| Поле | Значение |
| --- | --- |
| Дата | 2026-07-28 (вечер, прогон v0.4.5) |
| Версия health | **0.4.5** (`mode=live-capable`) |
| URL (прогон) | http://167.71.206.43:3000 |
| Public HTTPS | https://influencers.lumen.universalgravity.org |
| Тестировщик | BA-агент (browser MCP + API) |
| Промпт | `docs/prompts/BA_ACCEPTANCE_REPORT_PROMPT.md` |
| Предыдущий BA | `docs/reports/BA_ACCEPTANCE_2026-07-28.md` (0.3.5) · status `BA_STATUS_2026-07-28_v2.md` (0.4.1 wiring) |

---

## 1. Вердикт

**READY WITH CAVEATS**

Клиенту **можно показывать** core-flow **scan → editable resume card → card-ranked Discover → dossier** — на live стеке это уже не heuristic/demo connector.  
**Нельзя** продавать как production pilot: followers=0 в TikHub выдаче, sidebar всё ещё «Demo · mock data», auth/persist реально только на HTTPS, creator/catalog analysis частично mock, payments отсутствуют.

---

## 2. Executive summary

- Health: `{"status":"ok","version":"0.4.5","mode":"live-capable"}` — **не** `mode=demo` (промпт 0.3.x устарел).
- Soi 11 browser: Load sample → Scan → card `Soi 11 Thai Kitchen` / `Bangkok Bites Co.` / `Restaurant`, badge **LIVE LLM SCAN**, label `confidence 50% · live-scan` → edit pitch → **Save & Discover** → `/discover?productId=prod-bk9hmtj`.
- API scan: `mode=live`, `source=openrouter`, `sourceMode=live-scan` (~4.2s на Soi brief). Sparse `hi` → conf **0.2**, `missing_fields` длинный, name `Unknown`.
- Discover: badge **TIKHUB LIVE**; Search & rank → **12 ranked / 12 fetched**; top-3 **70 / 69 / 68**; ≥2 reasons (topic + geo). Без продукта кнопка **disabled**.
- Dossier `@onlythegoodplaces`: source **tikhub**, секции Identity/Reach/Topics/Style/Audience/Safety/Evidence; **Add to catalog** → виден в `/influencers`; Evidence UI всё ещё пишет «demo connector».
- Invite/brief: HTTPS session → POST/PATCH `/api/invitations` → Accepted + autoBrief + GET `/api/briefs` **PASS**. На анонимном `:3000` Invitations = seed demo rows.
- Presentation: EN/ZH `?v=0.4.5`, ZH video `readyState=4`, duration ~130s; talk-track про live LLM/TikHub/persist. Sidebar honesty conflict = главный risk демо.

---

## 3. Соответствие north star

| Шаг флоу | Статус | Доказательство | Gap |
| --- | --- | --- | --- |
| 1. Бизнес входит | **PARTIAL** | `/login` 200; register/login API OK; HTTPS cookie `lumen_session` Secure sticks; HTTP `:3000` login JSON без usable cookie (Secure) | Ops URL без рабочей сессии; multi-tenant тонкий (1 brand user) |
| 2. Скан → резюме-карточка | **PASS** | Browser Soi 11 card + editable pitch + product detail `prod-bk9hmtj`; API `source=openrouter` | Confidence занижен/нестабилен; prohibited claims часто пустые; OCR/URL scrape нет («Extract-only · no live scraping») |
| 3. Discover под карточку + rank + dossier | **PASS** | `productId` required; TikHub live 12 results; scores+reasons; dossier sections; Find matches → `/discover?productId=prod-bk9hmtj` | Followers=0; reasons шаблонные; food>beauty/RE на live search **не воспроизводится** (выдача уже food) |
| 4. Invite / brief / accept | **PARTIAL** | Server API accept+autoBrief на HTTPS; UI routes `/invitations`,`/creator/*`,`/reviews` 200 | Creator без auth; UI на `:3000` = seed; не юр. оффер |
| 5. Мини-контракт + payments | **N/A** | Out of scope | Ожидаемо |

---

## 4. Результаты чеклиста

### 0. Среда

| ID | Result | Evidence | Severity |
| --- | --- | --- | --- |
| Health | **PASS** | `version=0.4.5`, `mode=live-capable` (HTTP+HTTPS) | — |
| Dark UI | **PASS** | Dark cyber-glass, blue primary; theme toggle «Switch to light mode» | — |
| Smoke routes | **PASS** | `/` `/products/scan` `/discover` `/influencers` `/creator` `/presentation` `/reviews` `/login` → **200** | — |

### 1. Product scan → resume card

| ID | Result | Evidence | Severity |
| --- | --- | --- | --- |
| Scan page | **PASS** | `/products/scan`; UI «LIVE LLM SCAN»; «Load Soi 11 sample» | — |
| Soi 11 card fields | **PARTIAL** | name/brand/category/pitch/geo/topics/langs/benefits/confidence есть; **prohibited claims пустые** в UI | P2 |
| Edit + save | **PASS** | Pitch → `BA-EDITED:…`; после edit label `confidence 50% · manual`; detail page показывает тот же pitch | — |
| Save & Discover | **PASS** | URL `/discover?productId=prod-bk9hmtj`; product selected in combobox | — |
| Sparse brief | **PASS** | API `briefText=hi` → conf 0.2, missing_fields включает name/brand/pitch/… | — |

### 2. Card-ranked Discover

| ID | Result | Evidence | Severity |
| --- | --- | --- | --- |
| Без продукта | **PASS** | `/discover` → Search & rank `disabled`, combobox «Select product…» | — |
| Rank + reasons | **PASS** | 12 ranked; ≥2 reasons: «Topic overlap: food», «Geo fit: Bangkok…» | — |
| Food > beauty/RE | **N/A → PARTIAL** | Live TikHub food query → все food/Bangkok; catalog suggestions: Narin **88** > onlythegoodplaces **80** > Pim **78** | P2 (criterion устарел для live) |
| Dossier | **PASS** | `/discover/disc-tt-onlythegoodplaces`; Identity…Evidence; `source tikhub` | — |
| Add to catalog | **PASS** | Button → «Already in catalog»; `/influencers` содержит `onlythegoodplaces` (localStorage `lumen.discoveredInfluencers`) | — |
| Find matches | **PASS** | href `/discover?productId=prod-bk9hmtj` | — |

### 3. Collaboration

| ID | Result | Evidence | Severity |
| --- | --- | --- | --- |
| Portal routes | **PASS** | `/creator`, briefs, submissions, invitations, reviews → 200 | — |
| Invite→brief (server) | **PASS*** | HTTPS API: invite `cms4s3m3i…` Pending→Accepted + brief `Soi 11 soft-open TikTok` | — |
| UI full accept→publish | **PARTIAL** | Seed invites на `/invitations`; creator «Act as» = demo personas; draft/approve/publish path UI есть, live creator identity **нет** | P1 |
| «Не payments» | **PASS** | Talk-track Phase 3; sidebar Demo; presentation roadmap | — |

\*Browser click-through invite UI под logged-in HTTPS в этой сессии не делался — API verified.

### 4. Presentation

| ID | Result | Evidence | Severity |
| --- | --- | --- | --- |
| EN/ZH video | **PASS** | `demo.mp4?v=0.4.5` / `demo-zh.mp4?v=0.4.5` HTTP 200; ZH `readyState=4`, ~129.6s; EN ~130.7s | — |
| Контент remaster | **PASS** | Talk-track: live LLM scan, TikHub, persist, Phase 3 | — |
| slides.html | **PASS** | Cyber-glass; «Live product scan»; Close «Thank you.»; **нет** IP `167.71` | — |

### 5. Design

| ID | Result | Evidence | Severity |
| --- | --- | --- | --- |
| Lumen/Strom look | **PASS** | Dark + blue + glass | — |
| P0 CTA | **PASS** | Scan / Save & Discover / Search & rank / Find matches | — |
| Honesty labels | **FAIL (honesty)** | Badges LIVE + sidebar «Demo · mock data» одновременно | P1 |

---

## 5. Дефекты / gaps

| ID | Sev | Где | Repro | Бизнес-импакт | Рекомендация |
| --- | --- | --- | --- | --- | --- |
| D1 | **P1** | Discover cards / dossier Reach | Live Search & rank Soi 11 → «Bangkok · **0** · x% ER» | Нельзя оценивать размер аудитории | Починить TikHub→followers mapping |
| D2 | **P1** | Sidebar vs badges | Любая live страница | Stakeholder думает «всё mock» или наоборот | Режимный label: `Live · TikHub+LLM` / убрать Demo когда live |
| D3 | **P1** | Auth на `:3000` | Register/login на HTTP при `COOKIE_SECURE=true` | Ops URL бесполезен для persist demo | Клиентам только HTTPS; или Secure off на raw :3000 |
| D4 | **P1** | Dossier Evidence | Live tikhub dossier | Copy «Recent TikTok stubs **(demo connector)**» при live source | Переименовать по `source` |
| D5 | **P1** | Creator portal | Act-as list = seed influencers | Live-discovered creator не «входит» как persona | Creator auth **или** Act-as включает discovered IDs |
| D6 | **P2** | Scan card | Soi sample → prohibited claims empty | Compliance поля теряются | Prompt/schema enforcement |
| D7 | **P2** | Scan confidence | Rich Soi → UI 50% / API ~0.4 | Бизнес не доверяет карточке | Калибровка confidence (G5) |
| D8 | **P2** | Rank reasons | Почти идентичные 2 буллета на всех | Слабая объяснимость shortlist | Больше сигналов (ER, views, lang, niche) |
| D9 | **P2** | Analysis | «Analyze recent videos» IDLE; Audience empty until analysis | Dossier неполный | Подключить analysis или честно hide empty |

---

## 6. Матрица «заявлено vs реальность»

| Фича | Реально | Ограничение |
| --- | --- | --- |
| CHANGELOG 0.4.5 remaster videos | **Да** — `/presentation` EN/ZH `v=0.4.5` | ~2:10, не «4 min» wall-clock |
| Live OpenRouter scan | **Да** — `source=openrouter`, UI LIVE LLM SCAN | Нет OCR/scraping URL; conf шумный |
| Live TikHub Discover | **Да** — `source=tikhub`, TIKHUB LIVE | followers=0; reasons тонкие |
| Brand auth | **Да** на HTTPS | **Нет** рабочей cookie на HTTP :3000 |
| Products/shortlists/invites/briefs persist | **Да** API session-gated | Аноним = localStorage + seed; creator hydrate same-browser |
| Sidebar «Demo · mock data» | **Устарело** при live mode | Misleading |
| Lumen Analysis API | **Mock/idle** | Не live analysis pipeline |
| Payments / юр. контракт | **Нет** | Phase 3 |

### Честность продукта (обязательно)

| Вопрос | Ответ |
| --- | --- |
| Demo scan (heuristic, не live LLM) | **Нет** — live OpenRouter (`live-scan`) |
| Demo TikTok (не TikHub) | **Нет** — live TikHub |
| Persistence = localStorage | **Partial** — anonymous localStorage; logged-in HTTPS: products/shortlists/invitations/briefs на SQLite |
| Auth / multi-tenant | **Brand JWT есть** (HTTPS); creator auth **нет**; multi-tenant минимальный |
| Payments / escrow / юр. контракт | **Нет** |
| Live Lumen Analysis API | **Mock / not connected** |

---

## 7. Готовность к пилоту (Таиланд F&B)

### Можно обещать завтра
- Продуктовый walkthrough: brief/URL names → resume card → TikTok search ranked under card → dossier → shortlist/catalog.
- Live поиск Bangkok food creators через TikHub (с оговоркой по метрикам).
- Live LLM сборка карточки из brief (с ручной правкой).
- Brand login + server invites/briefs на **HTTPS** URL.
- EN/ZH demo video на `/presentation`.

### Нельзя обещать
- «Followers/reach точные» (сейчас 0 на карточках Discover).
- «Полный production multi-user / creator login».
- «AI читает сайт/фото» (extract-only, photo = имена файлов).
- «Мини-контракт и payments».
- «Всё уже не demo» — пока sidebar врёт.

### Топ-5 до next client demo (ценность)
1. **P1** Followers/reach mapping из TikHub.  
2. **P1** Честный mode badge (убрать ложный Demo при live).  
3. **P1** Richer match reasons + разброс scores.  
4. **P1** Creator path для live-discovered ID (хотя бы Act-as).  
5. **P2** Confidence + prohibited_claims качество карточки.

---

## 8. Метрики демо-сессии

| Метрика | Значение |
| --- | --- |
| Scan→card (API Soi brief) | **~4.2 s** |
| Scan→card (browser) | ~8–15 s (сеть/LLM) |
| Card→top matches (Search & rank) | **~3–12 s** до 12 results |
| Понятность reasons | **2/5** (корректны, но шаблонны) |

---

## 9. Приложения

### Health JSON
```json
{"status":"ok","service":"lumen-marketplace-web","version":"0.4.5","mode":"live-capable","timestamp":"2026-07-28T14:51:31.807Z"}
```

### Top-3 Discover (Soi 11, query `food bangkok dining restaurant`, city Bangkok)
| Rank | Handle | Score | Reasons |
| --- | --- | --- | --- |
| 1 | @onlythegoodplaces | **70** | Topic overlap: food; Geo fit: Bangkok |
| 2 | @kp_talonlak | **69** | same |
| 3 | @bangkok.secret | **68** | same |

### Ключевые URL
- Product: http://167.71.206.43:3000/products/prod-bk9hmtj  
- Discover: http://167.71.206.43:3000/discover?productId=prod-bk9hmtj  
- Dossier: http://167.71.206.43:3000/discover/disc-tt-onlythegoodplaces  
- Presentation: http://167.71.206.43:3000/presentation (и HTTPS mirror)  
- Invite API evidence: invitation `cms4s3m3i0005s1kbnp9ydw29`, brief `cms4s3m8y0007s1kbaarqx13k`

### Deploy
- Presentation remaster commit (из prior ship): `edad133`, health 0.4.5.

---

## 10. Сверка было → стало

| Критерий | Было (BA 0.3.5 / status 0.4.1) | Стало (0.4.5 этот прогон) |
| --- | --- | --- |
| Health mode | `demo` | **`live-capable`** |
| Product scan | Heuristic demo, conf ~0.92 | **Live OpenRouter**, conf ~0.4–0.5 |
| TikTok Discover | Demo connector | **Live TikHub** (реальные handles) |
| Top-3 scores | Narin 89 / beauty 54 / RE 37 | **70 / 69 / 68** (live food cluster) |
| Auth | Нет | **Brand JWT** (HTTPS); HTTP :3000 сломан Secure |
| Persistence | localStorage only | **Partial server** products/shortlists/invites/briefs |
| Invite→brief | Demo UI | **Server API PASS** + UI seed для anonymous |
| HTTPS public URL | Не было / later 0.4.2 | **Есть** influencers.lumen… |
| Presentation | ~3:27 EN / ~3:33 ZH (0.3.5) | **~2:10 EN/ZH**, narrative live stack `v=0.4.5` |
| Вердикт | READY WITH CAVEATS (demo core) | **READY WITH CAVEATS** (live core, pilot gaps) |
| Главный риск | UI ≠ production | **Live UI + ложный Demo label + followers=0** |

---

*Конец отчёта. Код не менялся — только приёмка.*
