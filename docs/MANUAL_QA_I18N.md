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
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.5.5` | |
| S2 | `EXPECT_VERSION=0.5.5 ./scripts/qa-smoke.sh …` | Key routes HTTP 200 | |
| S3 | Fresh load `/` (cleared locale or default) | Default shell **Chinese** | |

## Language toggle chrome (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Sidebar / mobile: switch **中文** | Nav: 仪表盘 / 发现 / 产品 / 活动 / 达人; ModeBadge / footer portal Chinese | |
| L2 | Switch **EN** | Nav: Dashboard / Discover / Products / Campaigns / Influencers | |
| L3 | Set 中文 → reload `/` | Locale persists (`lumen.uiLocale=zh`); page stays Chinese | |
| L4 | Set EN → reload `/` | Locale persists (`lumen.uiLocale=en`); page stays English | |
| L5 | Mobile ≤390px top bar | Badge / menu labels follow locale (not stuck “Marketplace” EN) | |

## Page content — Chinese (P0)

With locale **中文**, open each route and confirm **page title + primary CTAs/labels** are Chinese (not English leftovers in chrome).

| ID | Route | Must see (examples) | Result |
| --- | --- | --- | --- |
| P1 | `/` | 仪表盘; 扫描产品; 发现抖音达人 | |
| P2 | `/products` | 产品; 添加产品; 扫描产品 | |
| P3 | `/products/scan` | 产品扫描; 扫描 → 简历卡; 加载上海示例 | |
| P4 | `/discover` | 发现; 搜索并排序; 匹配产品（必选） | |
| P5 | `/campaigns` | 活动; 创建活动 | |
| P6 | `/influencers` | 达人; 导入; search placeholder 搜索姓名或账号 | |
| P7 | `/shortlists` | 候选名单; 创建候选名单 | |
| P8 | `/invitations` | 邀请 | |
| P9 | `/reviews` | 审核 | |
| P10 | `/claims` | 档案认领 | |
| P11 | `/analysis-jobs` | 分析任务; 开始分析 | |
| P12 | `/import` | 导入达人 | |
| P13 | `/settings` | 设置; 界面语言 | |
| P14 | `/login` | 品牌登录; 使用 Google 继续 | |
| P15 | `/presentation` | 演示; talk-track bullets Chinese when UI locale zh | |

## Page content — English (P0)

With locale **EN**, same routes show English chrome (Products / Discover / Campaigns / …). Spot-check:

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| E1 | `/products` EN | Products; Add Product; Scan product | |
| E2 | `/discover` EN | Discover; Search & rank | |
| E3 | `/campaigns` EN | Campaigns; Create Campaign | |
| E4 | `/influencers` EN | Influencers; Search name or handle | |

## Detail / shared (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | `/products/[id]` 中文 | 产品详情 / 简历卡 labels Chinese | |
| D2 | `/discover/[id]` 中文 | 档案 sections Chinese | |
| D3 | `/influencers/[id]` 中文 | 档案概览 / match labels Chinese | |
| D4 | `/campaigns/[id]` 中文 | 活动简报 labels Chinese | |
| D5 | Add to shortlist button 中文 | 加入候选名单 | |
| D6 | ModeBadge | 实况 · TikHub + LLM **or** 演示 · 模拟数据 | |

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
| Tester | |
| Build / commit | |
| Deploy run | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |
