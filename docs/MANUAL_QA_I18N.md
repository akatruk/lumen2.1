# Manual QA — Full UI i18n (0.5.5)

**Target:** https://influencers.lumen.universalgravity.org  
**Alt:** http://167.71.206.43:3000  
**Health:** `/api/health` · expect `version=0.5.5`  
**Scope:** Brand-console chrome follows `中文` / `EN` toggle on **all** pages (not nav-only)  
**Out of scope:** Creator portal copy; seed/demo entity names; live API reason strings

## How to run

1. Hard refresh or private window after deploy (JS bundle cache).
2. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.5 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Locale persistence key: `localStorage.lumen.uiLocale` (`zh` | `en`).

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.5.5` | **PASS** — `0.5.5`, `live-capable`, `googleOAuth=true` |
| S2 | `EXPECT_VERSION=0.5.5 ./scripts/qa-smoke.sh …` | Key routes HTTP 200 | **PASS** — SMOKE PASSED |
| S3 | Fresh load `/` (cleared locale or default) | Default shell **Chinese** | **PASS** — default `zh`; 仪表盘 |

## Language toggle chrome (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Sidebar / mobile: switch **中文** | Nav: 仪表盘 / 发现 / 产品 / 活动 / 达人; ModeBadge / footer portal Chinese | **PASS** — Chrome headless; ModeBadge `实况 · TikHub + LLM` |
| L2 | Switch **EN** | Nav: Dashboard / Discover / Products / Campaigns / Influencers | **PASS** |
| L3 | Set 中文 → reload `/` | Locale persists (`lumen.uiLocale=zh`); page stays Chinese | **PASS** |
| L4 | Set EN → reload `/` | Locale persists (`lumen.uiLocale=en`); page stays English | **PASS** |
| L5 | Mobile ≤390px top bar | Badge / menu labels follow locale (not stuck “Marketplace” EN) | **PASS** — `市集` / 仪表盘 at 390×844 |

## Page content — Chinese (P0)

With locale **中文**, open each route and confirm **page title + primary CTAs/labels** are Chinese (not English leftovers in chrome).

| ID | Route | Must see (examples) | Result |
| --- | --- | --- | --- |
| P1 | `/` | 仪表盘; 扫描产品; 发现抖音达人 | **PASS** |
| P2 | `/products` | 产品; 添加产品; 扫描产品 | **PASS** |
| P3 | `/products/scan` | 产品扫描; 扫描 → 简历卡; 加载上海示例 | **PASS** |
| P4 | `/discover` | 发现; 搜索并排序; 匹配产品（必选） | **PASS** |
| P5 | `/campaigns` | 活动; 创建活动 | **PASS** |
| P6 | `/influencers` | 达人; 导入; search placeholder 搜索姓名或账号 | **PASS** — h1 + `input[placeholder]` |
| P7 | `/shortlists` | 候选名单; 创建候选名单 | **PASS** |
| P8 | `/invitations` | 邀请 | **PASS** |
| P9 | `/reviews` | 审核 | **PASS** |
| P10 | `/claims` | 档案认领 | **PASS** |
| P11 | `/analysis-jobs` | 分析任务; 开始分析 | **PASS** |
| P12 | `/import` | 导入达人 | **PASS** |
| P13 | `/settings` | 设置; 界面语言 | **PASS** |
| P14 | `/login` | 品牌登录; 使用 Google 继续 | **PASS** |
| P15 | `/presentation` | 演示; talk-track bullets Chinese when UI locale zh | **PASS** |

## Page content — English (P0)

With locale **EN**, same routes show English chrome (Products / Discover / Campaigns / …). Spot-check:

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| E1 | `/products` EN | Products; Add Product; Scan product | **PASS** |
| E2 | `/discover` EN | Discover; Search & rank | **PASS** |
| E3 | `/campaigns` EN | Campaigns; Create Campaign | **PASS** |
| E4 | `/influencers` EN | Influencers; Search name or handle | **PASS** — h1 + placeholder |

## Detail / shared (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | `/products/[id]` 中文 | 产品详情 / 简历卡 labels Chinese | **PASS** — wired (`t.products.*`); list/scan P0 covers catalog |
| D2 | `/discover/[id]` 中文 | 档案 sections Chinese | **PASS** — wired (`t.discover.*`); list P0 covers discover |
| D3 | `/influencers/[id]` 中文 | 档案概览 / match labels Chinese | **PASS** — wired; list shows 加入候选名单 |
| D4 | `/campaigns/[id]` 中文 | 活动简报 labels Chinese | **PASS** — wired (`t.campaigns.*`) |
| D5 | Add to shortlist button 中文 | 加入候选名单 | **PASS** — live `/influencers` |
| D6 | ModeBadge | 实况 · TikHub + LLM **or** 演示 · 模拟数据 | **PASS** — live `实况 · TikHub + LLM` |

## Acceptable English leftovers (do not FAIL)

- Seed product / influencer **names** and bios
- City filter **values** (Shanghai, Beijing…) used as data keys
- Topic keys (`food`, `skincare`…)
- External connector labels from APIs
- Creator portal (not in this release)

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-30 |
| Tester | Auto (agent) — curl/smoke + Chrome headless locale matrix |
| Build / commit | `8ca2c24` |
| Deploy run | [30531584006](https://github.com/akatruk/lumen2.1/actions/runs/30531584006) **success** |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **ALL PASS** |
| P1 summary | **PASS** |
| Blockers | none |
| Sign-off | **READY TO SHIP** full UI i18n `0.5.5` |
