# Отчёт приёмки Lumen Influencer Marketplace

| Поле | Значение |
| --- | --- |
| Дата | 2026-07-28 |
| Версия health | **0.3.5** (`mode=demo`) |
| URL | http://167.71.206.43:3000 |
| Тестировщик | BA-агент (промпт `docs/prompts/BA_ACCEPTANCE_REPORT_PROMPT.md`) |
| Источники доказательств | Live HTTP/smoke · service logic (`productScan`/`rankCandidatesForCard`) · prior manual QA `0.3.3`/`0.3.4` · код (mock/localStorage) |

---

## 1. Вердикт

**READY WITH CAVEATS**

Клиенту/инвестору **можно показывать** core-flow **scan → resume card → card-ranked Discover → dossier** на live-демо. Это работающий продуктовый нарратив.  
**Нельзя** обещать live TikHub, реальный LLM/OCR-скан, auth/multi-tenant, серверную persistence и payments — это demo/mock.

---

## 2. Executive summary

- Live **0.3.5**, smoke **PASS**, dark cyber-glass UI на месте.
- **Product scan** (Soi 11): карточка `Soi 11 Thai Kitchen`, topics food/nightlife/bangkok/lifestyle, geo Bangkok, conf **0.92**, prohibited claims заполнены.
- **Discover** требует продукт; ranker даёт score + ≥2 reasons; Soi 11 → **Narin 89 > beauty 54 > RE 37**.
- Collaboration (invite→publish) и presentation EN/ZH (~3:27 / ~3:33) доступны как demo-поверхность.
- Scan = **heuristic demo**, не live LLM; TikTok = **demo connector**, не TikHub.
- Persistence = **localStorage**; auth отсутствует; payments / юр. мини-контракт — out of scope (Phase 3).
- Главный риск демо: stakeholder перепутает убедительный UI с production readiness.

---

## 3. Соответствие north star

| Шаг флоу | Статус | Доказательство | Gap |
| --- | --- | --- | --- |
| 1. Бизнес входит | **PARTIAL** | Открытый demo без login; sidebar «Demo · mock data» | Нет auth / company account |
| 2. Скан → резюме-карточка | **PASS** | `/products/scan` 200; Soi 11 → полная карточка; Save & Discover wired | Demo heuristic, не live OCR/LLM |
| 3. Discover под карточку + rank + dossier | **PASS** | productId required; scores/reasons; dossier route; prior QA add-to-catalog | Demo connector, не live TikHub |
| 4. Invite / brief / accept | **PARTIAL** | `/invitations`, `/reviews`, `/creator/*` 200; flow в demo data | Не полноценный мини-оффер с юр. смыслом |
| 5. Мини-контракт + payments | **N/A** | Roadmap Phase 3; в демо не требуется | Ожидаемо отсутствует |

---

## 4. Результаты чеклиста

### 0. Среда

| ID | Result | Evidence |
| --- | --- | --- |
| Health | **PASS** | `{"status":"ok","version":"0.3.5","mode":"demo"}` |
| Dark UI | **PASS** | Markers: `dark`, `geist_`, `grid-pattern`, `ambient-glow`, `bg-background` |
| Smoke routes | **PASS** | `/`, `/products/scan`, `/discover`, `/influencers`, `/creator`, `/presentation`, `/reviews` → 200; full smoke PASSED |

### 1. Product scan → resume card

| ID | Result | Evidence |
| --- | --- | --- |
| Scan page | **PASS** | Live 200 + UI «Product scan» / «Load Soi 11 sample» / «Demo scan» |
| Soi 11 card | **PASS** | name/brand/category/pitch/geo/topics/langs/benefits/prohibited/conf=0.92 |
| Edit + save | **PASS*** | Wired (`toProductFields`, product detail Resume card) — *код + prior QA; интерактивный клик в этой сессии NOT VERIFIED в браузере* |
| Save & Discover | **PASS*** | `router.push(/discover?productId=…)` + live Discover `productId` |
| Sparse brief | **PASS** | `hi` → не Soi11; missing `audience`,`budget`; conf≈0.83 (не «low», но heuristic path) |

### 2. Card-ranked Discover

| ID | Result | Evidence |
| --- | --- | --- |
| Без продукта | **PASS** | Search & rank `disabled` без productId (live JS) |
| Rank + reasons | **PASS** | ≥2 reasons; top-3: 89 / 54 / 37 |
| Food > beauty/RE | **PASS** | Narin 89 > beauty 54 > RE 37 (+ risks на RE) |
| Dossier | **PASS*** | Route + prior Discover QA 0.3.3; mock analyze |
| Add to catalog | **PASS*** | Prior QA: localStorage `lumen.discoveredInfluencers` |
| Find matches | **PASS** | Product detail chunk: Find matches + productId |

### 3. Collaboration

| ID | Result | Evidence |
| --- | --- | --- |
| Portal routes | **PASS** | `/creator`, briefs, submissions, reviews — 200 |
| Понятность «не payments» | **PASS** | Sidebar Demo; roadmap Phase 3; presentation copy |

### 4. Presentation

| ID | Result | Evidence |
| --- | --- | --- |
| EN/ZH video | **PASS** | demo.mp4 9.2MB ~207s; demo-zh.mp4 9.4MB ~213s; HTTP 200 |
| Контент remaster | **PASS** | Dark slides + Product scan / Card-ranked в ролике 0.3.5 |
| slides.html | **PASS** | cyber-glass, Product scan, Thank you; IP на close **нет** |

### 5. Design

| ID | Result | Evidence |
| --- | --- | --- |
| Lumen/Strom look | **PASS** | Dark + blue primary + glass markers |
| P0 CTA | **PASS** | Scan product / Discover / Save & Discover на месте |

\* = подтверждено кодом + prior signed QA / live markers; полный browser click-through в этой BA-сессии ограничен (нет browser MCP) → см. §9.

---

## 5. Дефекты / gaps

| ID | Severity | Где | Repro / факт | Бизнес-импакт | Рекомендация |
| --- | --- | --- | --- | --- | --- |
| G1 | **P1** | Product scan | Demo heuristic, не live LLM/OCR/URL fetch | Карточка «магическая» только на Soi 11 sample; реальные URL бренда дадут слабее | Live scan pipeline (LLM) до клиентского пилота |
| G2 | **P1** | Discover | MockTikTokConnector, не TikHub | Shortlist не из реального TikTok | Live TikHub connector (NEXT P3) |
| G3 | **P1** | Persistence | localStorage | Данные не шарятся между устройствами/юзерами | Nest + Postgres |
| G4 | **P1** | Auth | Нет login | Нельзя развести бренды | Auth / tenant |
| G5 | **P2** | Sparse scan | conf остаётся ~0.83 при missing fields | BA-ожидание «low confidence» не совпадает с UI | Калибровать confidence / UI badge |
| G6 | **P2** | Discover empty state | Rank без клика Search пустой (ожидаемо) | В демо нужно явно жать Search & rank | OK для demo; скрипт презентации |
| G7 | **N/A→P2 later** | Phase 3 | Нет payments/контракта | Не обещать money movement | Держать в roadmap |

P0 блокеров на core-flow **нет**.

---

## 6. Матрица «заявлено vs реальность»

| Фича | Реально | Ограничение |
| --- | --- | --- |
| Product scan → resume card | **Да** (demo) | Heuristic / Soi 11 path сильный |
| Card-ranked Discover | **Да** (demo) | Demo connector |
| Influencer dossier | **Да** (demo) | Evidence stubs / mock analyze |
| Cyber-glass dark UI | **Да** | Live 0.3.5 |
| EN/ZH presentation videos | **Да** | Remaster 0.3.5 |
| Collaboration invite→publish | **Да** (demo UI) | Mock data |
| Live TikHub | **Нет** | Connector swap point в коде |
| Live Lumen Analysis API | **Нет** | Mock client |
| Auth / multi-tenant | **Нет** | — |
| Payments / escrow | **Нет** | Phase 3 |
| Server persistence | **Нет** | localStorage |

---

## 7. Готовность к пилоту (Таиланд F&B)

### Можно обещать завтра
- Показать бизнесу путь: материалы → резюме-карточка → TikTok shortlist с объяснимым score.
- Показать dossier и add-to-catalog как модель работы.
- Показать creator collaboration loop как целевой workflow (demo).
- Визуально «это Lumen» (dark console).

### Нельзя обещать
- «Мы уже ищем живых TikTok-креаторов через TikHub».
- «AI реально читает ваш сайт/меню с OCR».
- Multi-user / сохранность данных на сервере / SSO.
- Оплату, escrow, юридически значимый контракт.

### Топ-5 до next client demo (по ценности)
1. **Live TikHub connector** (тот же интерфейс Discover).
2. **Live/LLM product scan** (не только Soi 11 heuristic).
3. **Auth + server persistence** (хотя бы один brand account).
4. Подключить **реальный Lumen Analysis** на dossier evidence.
5. Калибровка confidence/UX «что demo / что live» для sales-safe демо.

---

## 8. Метрики демо-сессии

| Метрика | Значение |
| --- | --- |
| scan→card (логика Soi 11) | ~0.5–0.9s artificial delay в сервисе; карточка готова за 1 проход |
| card→ranked top matches | Мгновенно на demo connector + ranker |
| Понятность reasons | **4/5** — topic/geo/lang/ER явно; commercial/style в breakdown менее видимы в UI |
| Health check | <1s |

---

## 9. Приложения

### Health JSON
```json
{"status":"ok","service":"lumen-marketplace-web","version":"0.3.5","mode":"demo","timestamp":"2026-07-28T10:01:06.755Z"}
```

### Top-3 scores (Soi 11 card)
| Creator | Score | Top reason |
| --- | --- | --- |
| @narin_eats | 89 | Topic overlap: food, bangkok, nightlife |
| @beauty_bkk | 54 | Geo fit: Bangkok |
| @re_phuket | 37 | Language / reach; risks: weak topic/geo |

### Live assets
- Presentation EN: http://167.71.206.43:3000/presentation/demo.mp4 (~207s)
- Presentation ZH: http://167.71.206.43:3000/presentation/demo-zh.mp4 (~213s)
- Scan: http://167.71.206.43:3000/products/scan
- Discover: http://167.71.206.43:3000/discover

### Уровни доказательств (честность метода)
| Класс | Что |
| --- | --- |
| (1) Подтверждено live сейчас | health, smoke, routes, videos, slides markers, theme, rank/scan logic |
| (2) Код + prior signed QA | edit/save localStorage, add-to-catalog, dossier analyze, collab demo path |
| (3) NOT VERIFIED в этой сессии | полный ручной click-through в GUI (browser MCP недоступен) |

**Sign-off:** core-flow **READY FOR CLIENT DEMO** при обязательном дисклеймере demo/mock. Production pilot — **не ready** до TikHub + persistence (+ желательно live scan).
