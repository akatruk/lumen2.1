# UX/UI Audit — Lumen Influencer Marketplace

| Поле | Значение |
| --- | --- |
| Дата | 2026-07-28 |
| URL | https://influencers.lumen.universalgravity.org |
| Version health | **0.4.7** (`mode=live-capable`) |
| Аудитор | Principal UX/FE audit (агент) · проход Puppeteer 1440 + mobile 390 |
| Скриншоты | `docs/reports/ux-audit-shots-2026-07-28/` |

---

## 1. Вердикт

**DESIGN READY WITH CAVEATS**

Визуальный язык (dark cyber-glass, blue CTA, mono `[01]`) уже выглядит как серьёзный product surface и **можно показывать F&B клиенту** на core-flow scan→card→ranked Discover.  
**Нельзя** выдавать Dashboard/IA как «чистый pilot UX»: 13 пунктов навигации, 6 равновесных CTA, demo-copy рядом с Live, пустые секции dossier с ложным `SAFE`, рассинхрон Act-as↔home на creator.

---

## 2. Executive summary

- Visual system **цельный**: dark zinc, blue primary, glass cards, Geist mono labels — не «админ Bootstrap».
- Mode badge **честный**: `Live · TikHub + LLM` (Demo убран).
- Core-flow UX **держится**: Soi scan → conf 92% · live-scan → Save & Discover → ranks с Reach/ER/views, followers ≠ 0.
- Discover empty/loading states есть; toast «Resume card ready» на scan — хороший craft сигнал.
- **P1 trust:** Dashboard copy «Highest match scores in the **demo set**» при Live badge.
- **P1 IA:** Sidebar 13 items; `Login [06]` посреди продуктового меню; Dashboard = CTA-свалка (6 кнопок).
- **P1 info:** Resume card = плоский dump полей; pitch не выделен как decision surface.
- **P1 trust dossier:** `Brand safety SAFE` + «Not analyzed yet»; Style/Audience пустые до analyze.
- **P1 creator:** Act-as `[TikHub] @naaeat…`, но subtitle home — **Narin Chaiyaphum** (seed leak).
- Главный риск демо: stakeholder путает красивый live Discover с «готовым ops console» из-за demo-текстов и пустых dossier-секций.

---

## 3. North star UX scorecard

| Шаг | UX статус | Friction | Доказательство |
| --- | --- | --- | --- |
| 1. Бизнес входит | **PARTIAL** | Login в sidebar как `[06]`; Dashboard не ведёт в north star | `/login`, `/` — 6 CTA, recommended = demo set |
| 2. Scan → resume card | **PASS** | Долгий LLM без progress copy (только disabled) | `/products/scan` · conf 92% · toast ready · `Save & Discover` primary |
| 3. Discover rank + dossier | **PASS** | Reasons шаблонны по структуре; score 70–72 скучен | `04_discover_ranked.png` · `Bangkok · 570K · 6.8% ER` · 4 reasons |
| 4. Catalog / invite path | **PARTIAL** | С dossier нет Invite; только Add to catalog | `05_dossier.png` · CTAs Analyze / Add |
| 5. Creator respond | **PARTIAL** | Act-as понятен как switch, но данные home не от выбранного TikHub | `06_creator.png` · TikHub selected, Narin in subtitle |
| 6. Contract/payments | **N/A** | — | Out of scope |

---

## 4. Visual system findings

| ID | Sev | Где | Наблюдение | Рекомендация |
| --- | --- | --- | --- | --- |
| V1 | P2 | Global | Ambient glow + grid ок; не мешает читаемости на desktop | Оставить; на mobile чуть снизить opacity glow |
| V2 | P1 | Sidebar | 13 пунктов + mono indices — сканируется как «внутренняя админка», не pilot console | Сгруппировать: **Core** (Scan/Discover/Products/Shortlists/Invites) / **More** (Claims, Analysis, Settings, Presentation) |
| V3 | P1 | `/` header | 1 primary + 5 secondary равного визуального веса | Оставить **Scan product** + **Discover** как единственные primary; остальное в «More actions» |
| V4 | P2 | Cards | Glass border system consistent | Не трогать radius/border language |
| V5 | P2 | Score chips | MatchScore blue box читаем | На Discover добавить визуальный gap (color scale) для 65 vs 85 |
| V6 | P2 | Brand | LUMEN 2.1 + MARKETPLACE chip — достаточный brand moment в chrome | Не раздувать hero на app screens |

---

## 5. Interaction / flow findings

| ID | Sev | Где | Наблюдение | Рекомендация |
| --- | --- | --- | --- | --- |
| I1 | P1 | `/` | Первый viewport = dashboard ops, не north star | Redirect logged-in brand → `/products/scan` **или** hero-блок «Start: Scan product» выше stats |
| I2 | P1 | Sidebar | `Login` между Products и Campaigns | Вынести auth в header/avatar; убрать из mid-nav |
| I3 | P2 | Scan | Primary CTA ясен; Load Soi 11 — правильный secondary | Ок |
| I4 | P1 | Scan wait | LLM 4–15s: кнопка disabled, нет progress/skeleton текста | Inline: «Scanning with OpenRouter… ~5–15s» + spinner на кнопке |
| I5 | P2 | Discover | Empty state с copy «not generic TikTok noise» — сильный | Ок |
| I6 | P1 | Dossier | После rank нет прямого «Invite / Shortlist» | Primary: **Add to shortlist / Invite**; Analyze — secondary |
| I7 | P1 | Creator home | Act-as TikHub ≠ displayed persona (Narin subtitle + seed counts) | Привязать home stats/list к `sessionId`; если пусто — empty state «No invites for this creator yet» |
| I8 | P2 | Toast | «Resume card ready — review and save» | Ок; добавить toast после Search & rank |

---

## 6. Information design findings

| ID | Sev | Где | Наблюдение | Рекомендация |
| --- | --- | --- | --- | --- |
| D1 | P1 | Resume card | Все поля в одной сетке равного веса; pitch не доминирует | 2-колонки: **Decision** (pitch, topics, geo, prohibited, conf) / **Details** (budget, metrics, tone) accordion |
| D2 | P2 | Confidence | `confidence 92% · live-scan` без легенды | Tooltip: «How complete/clear the brief is — edit fields to raise trust» |
| D3 | P2 | Discover reasons | 4 буллета с разными числами — лучше, чем было; структура всё ещё шаблон | Варьировать порядок: lead with strongest differentiator (reach vs ER) |
| D4 | P1 | Dashboard recommended | Subtitle «demo set» vs Live badge | Переименовать: «From catalog» / скрыть блок пока нет live matches |
| D5 | P1 | Dossier safety | `SAFE` + «Not analyzed yet» = ложный сигнал | Badge `UNKNOWN` / `PENDING ANALYSIS` пока analyze idle |
| D6 | P2 | Dossier Style/Audience | Пустые «—» занимают grid | Collapse empty sections; CTA «Run analysis to fill» |
| D7 | P2 | Score cluster | 70–72 визуально «все одинаковые» | Показывать delta vs #1 или band (Strong/OK/Weak) |
| D8 | PASS | Reach metrics | `570K · 6.8% ER` читаемы; не `0` | Держать formatCompact |

---

## 7. A11y / responsive findings

| ID | Sev | Где | Наблюдение | Рекомендация |
| --- | --- | --- | --- | --- |
| A1 | P1 | Mobile 390 scan | Есть hamburger, но слева остаётся **узкая desktop-sidebar полоска** («LUMEN Marketplace») | На `<lg` полностью unmount desktop aside; только top bar + drawer |
| A2 | P2 | Mobile | `overflowX: false` на scan — ок | Проверить Discover filters wrap (много controls) |
| A3 | P2 | Contrast | Primary blue на dark — ок для CTA; muted labels borderline | Прогнать AA на `text-muted-foreground` vs bg |
| A4 | P2 | Focus | Не проверено keyboard-only в этой сессии | NOT VERIFIED full keyboard path |
| A5 | P2 | Motion | Ambient glow не ломает текст на desktop | `prefers-reduced-motion`: отключить glow |

---

## 8. Top-10 fixes (приоритет ценности)

1. **Dossier safety honesty** (`SAFE`→`UNKNOWN` until analyzed) — trust — **S** — убирает P0-ощущение ври на демо.  
2. **Creator home sync to Act-as session** — collab demo — **M** — иначе TikHub Act-as бесполезен.  
3. **Dashboard CTA declutter** (2 primary only) + убрать «demo set» copy — first impression — **S**.  
4. **Sidebar IA collapse** (Core vs More) + Login out of mid-nav — scanability — **M**.  
5. **Resume card information hierarchy** (Decision vs Details) — brand decision speed — **M**.  
6. **Scan progress state** (spinner + ETA copy) — perceived quality — **S**.  
7. **Dossier primary = Invite/Shortlist** — close north star loop — **S**.  
8. **Mobile: kill leftover sidebar strip** — usable phone demo — **S**.  
9. **Collapse empty dossier sections** + analyze CTA — less noise — **S**.  
10. **Score differentiation cue** (band/delta) — decision clarity — **S**.

---

## 9. What NOT to change now

- Dark cyber-glass / blue primary / mono `[01]` language — это уже «лицо» продукта.  
- Discover card anatomy (avatar · handle · score · metrics · reasons · Open dossier).  
- Live badges (`Live · TikHub + LLM`, `TIKHUB LIVE`, `LIVE LLM SCAN`) — после фикса Demo они работают.  
- Полный ребренд, новая типографика, light-first, purple gradients.  
- Переписывать весь Dashboard в marketing landing — достаточно сузить CTA и copy.  
- Payments/contract UI — out of scope.

---

## 10. Приложения

### Health
```json
{"status":"ok","service":"lumen-marketplace-web","version":"0.4.7","mode":"live-capable"}
```

### Ключевые URL прохода
- `/` → Dashboard  
- `/products/scan` → Soi 11 → conf **92%** · live-scan  
- `/discover?productId=prod-vakfq9b` → 12 ranked; sample `Bangkok · 570K · 6.8% ER`  
- `/discover/disc-tt-naaeat.ontheearth` → dossier TikHub evidence  
- `/creator` → Act-as `[TikHub] …`

### Скриншоты
| File | Screen |
| --- | --- |
| `00_home.png` | Dashboard CTA clutter + demo set |
| `01_scan_empty.png` | Scan empty + Live badges |
| `02_scan_card.png` | Resume card 92% + toast |
| `03_discover_ready.png` | Discover pre-search |
| `04_discover_ranked.png` | Ranked + reasons |
| `05_dossier.png` | SAFE vs not analyzed |
| `06_creator.png` | Act-as TikHub vs Narin subtitle |
| `07_login.png` | Login |
| `08_invitations.png` | Invitations table |
| `09_influencers.png` | Catalog |
| `10_presentation.png` | Presentation |
| `11_mobile_scan.png` | Mobile scan (sidebar strip) |
| `12_mobile_discover.png` | Mobile discover |

### Цитаты UI
- «Highest match scores in the **demo set**» (`/`)  
- «Live · TikHub + LLM» (sidebar)  
- «Extract-only · no live scraping» + «LIVE LLM SCAN»  
- «confidence 92% · live-scan»  
- «Recent TikTok evidence (TikHub live)»  
- «SAFE» + «Not analyzed yet»  
- «Signed in as … · live catalog» vs subtitle «Narin Chaiyaphum…»

---

*Код не менялся — только audit.*
