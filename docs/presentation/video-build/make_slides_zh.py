#!/usr/bin/env python3
"""Generate cyber-glass dark slides for the ZH presentation video."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "slides_zh"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080
BG = (0, 0, 0)
INK = (248, 250, 252)
MUTED = (148, 163, 184)
BLUE = (59, 130, 246)
BLUE_DIM = (37, 99, 235)
CARD = (15, 23, 42)
LINE = (39, 48, 66)

CJK_CANDIDATES = [
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/Supplemental/Songti.ttc",
    "/Library/Fonts/Arial Unicode.ttf",
]


def font(size, bold=False, index=0):
    for p in CJK_CANDIDATES:
        if not Path(p).exists():
            continue
        try:
            if p.endswith(".ttc"):
                idx = 1 if (bold and "Hiragino" in p) else index
                return ImageFont.truetype(p, size, index=idx)
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def new_slide():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for i in range(80):
        d.ellipse((-280 + i, -280 + i, 720 - i, 520 - i), outline=(30, 64, 175))
    for i in range(60):
        d.ellipse((1280 + i, 620 + i, 2100 - i, 1280 - i), outline=(30, 41, 80))
    for x in range(40, W, 48):
        for y in range(40, H, 48):
            d.point((x, y), fill=(30, 41, 59))
    return img, d


def wrap(draw, text, f, max_w):
    lines, cur = [], ""
    for ch in text:
        test = cur + ch
        if draw.textlength(test, font=f) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def save(img, name):
    path = OUT / f"{name}.png"
    img.save(path, "PNG")
    print("slide", path.name)


def card(d, box, title, body):
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, radius=16, fill=CARD, outline=LINE)
    d.rectangle((x0, y0, x0 + 4, y1), fill=BLUE)
    d.text((x0 + 28, y0 + 24), title, font=font(30, True), fill=BLUE)
    y = y0 + 74
    for line in wrap(d, body, font(24), x1 - x0 - 56):
        d.text((x0 + 28, y), line, font=font(24), fill=MUTED)
        y += 36


def slide_title():
    img, d = new_slide()
    d.text((120, 150), "LUMEN 2.1", font=font(28, True), fill=BLUE)
    d.text((120, 210), "网红市集", font=font(72, True), fill=INK)
    lines = wrap(
        d,
        "赛博玻璃品牌控制台：扫描产品、发现 TikTok 创作者、按简历卡排序，再协作到发布。",
        font(32),
        1500,
    )
    y = 360
    for line in lines:
        d.text((120, y), line, font=font(32), fill=MUTED)
        y += 48
    d.text((120, 900), "Live TikHub · Live LLM · 诚实安全 · Act-as 同步", font=font(24), fill=MUTED)
    save(img, "01_title")


def slide_idea():
    img, d = new_slide()
    d.text((120, 100), "核心理念", font=font(24, True), fill=BLUE)
    d.text((120, 160), "从产品出发", font=font(54, True), fill=INK)
    points = [
        "品牌登录 → 产品、短名单、邀请与 Brief 服务端保存。",
        "Live LLM 产品扫描 → 可编辑简历卡与置信度。",
        "Live TikHub Discover → 真实创作者按卡片排序。",
        "邀请 → 接受 → Brief → 成片 → 批准 → 自有账号发布。",
    ]
    y = 300
    for p in points:
        d.rounded_rectangle((120, y, 1800, y + 110), radius=14, fill=CARD, outline=LINE)
        d.rectangle((120, y, 126, y + 110), fill=BLUE)
        d.text((160, y + 36), p, font=font(28), fill=INK)
        y += 130
    save(img, "02_idea")


def slide_problem():
    img, d = new_slide()
    d.text((120, 100), "问题", font=font(24, True), fill=BLUE)
    d.text((120, 160), "手工发现无法规模化", font=font(50, True), fill=INK)
    boxes = [
        ("搜寻", "在 TikTok 手工找人，把链接粘贴进表格。"),
        ("猜测", "看大量视频来推断主题与地域契合度。"),
        ("沟通乱", "Brief 与成片散落在各种聊天工具里。"),
        ("风险", "粉丝数掩盖语言、城市与品牌安全缺口。"),
    ]
    positions = [(120, 300), (1000, 300), (120, 620), (1000, 620)]
    for (x, y), (title, body) in zip(positions, boxes):
        card(d, (x, y, x + 800, y + 240), title, body)
    save(img, "03_problem")


def slide_solution():
    img, d = new_slide()
    d.text((120, 100), "方案", font=font(24, True), fill=BLUE)
    d.text((120, 160), "扫描 → 发现 → 协作", font=font(48, True), fill=INK)
    cards = [
        ("Live 产品扫描", "先看决策区——卖点、主题、地域、禁用宣称与置信度。"),
        ("Live TikHub Discover", "真实触达与互动理由；未分析前 Pending Analysis。"),
        ("诚实流程", "Live 徽章、Core/More 导航、Act-as 同步、服务端持久化。"),
    ]
    x = 120
    for title, body in cards:
        card(d, (x, 340, x + 540, 820), title, body)
        x += 580
    save(img, "04_solution")


def slide_integration():
    img, d = new_slide()
    d.text((120, 100), "与 Lumen 集成", font=font(24, True), fill=BLUE)
    d.text((120, 160), "分析之上的市集", font=font(48, True), fill=INK)
    layers = [
        (220, "品牌控制台 · 创作者门户 · 产品扫描 + Discover", BLUE),
        (440, "市集服务 · 匹配、活动、邀请、档案", BLUE_DIM),
        (660, "Lumen Analysis API · 转录、主题、风格、品牌安全", INK),
    ]
    for y, label, color in layers:
        d.rounded_rectangle((220, y, 1700, y + 140), radius=16, fill=CARD, outline=LINE)
        d.rectangle((220, y, 250, y + 140), fill=color)
        d.text((290, y + 48), label, font=font(28, True), fill=INK)
    d.text(
        (220, 860),
        "今天 TikHub 发现与 OpenRouter 扫描已上线——下一步接入 Lumen Analysis API。",
        font=font(24),
        fill=MUTED,
    )
    save(img, "05_integration")


def slide_workflow():
    img, d = new_slide()
    d.text((120, 100), "协作闭环", font=font(24, True), fill=BLUE)
    d.text((120, 160), "邀请 → 发布", font=font(50, True), fill=INK)
    steps = ["邀请", "接受", "Brief", "成片", "审核", "批准", "发布", "数据"]
    x = 90
    for i, s in enumerate(steps):
        d.rounded_rectangle((x, 480, x + 195, 600), radius=36, fill=(15, 23, 42), outline=BLUE)
        tw = d.textlength(s, font=font(22, True))
        d.text((x + (195 - tw) / 2, 522), s, font=font(22, True), fill=BLUE)
        if i < len(steps) - 1:
            d.text((x + 200, 522), "→", font=font(26, True), fill=MUTED)
        x += 225
    d.text((120, 720), "暂无支付 — 第三阶段。先验证扫描、匹配与流程。", font=font(26), fill=MUTED)
    save(img, "06_workflow")


def slide_roadmap():
    img, d = new_slide()
    d.text((120, 100), "路线图", font=font(24, True), fill=BLUE)
    d.text((120, 160), "分阶段稳健交付", font=font(48, True), fill=INK)
    phases = [
        ("第一阶段", "发现 + Live 扫描", "已上线"),
        ("第二阶段", "协作 + 持久化", "已上线"),
        ("第三阶段", "合同与支付", "下一步"),
        ("第四阶段", "更多数据源 + 学习", "稍后"),
    ]
    x = 120
    for title, body, state in phases:
        d.rounded_rectangle((x, 360, x + 400, 720), radius=16, fill=CARD, outline=LINE)
        d.rectangle((x, 360, x + 4, 720), fill=BLUE)
        d.text((x + 32, 400), title, font=font(26, True), fill=BLUE)
        d.text((x + 32, 470), body, font=font(28, True), fill=INK)
        d.text((x + 32, 600), state, font=font(24), fill=MUTED)
        x += 440
    save(img, "07_roadmap")


def slide_close():
    img, d = new_slide()
    d.text((120, 260), "视频理解", font=font(60, True), fill=INK)
    d.text((120, 350), "→ 活动决策", font=font(60, True), fill=BLUE)
    d.text((120, 500), "Live TikHub · Live LLM · Pending Analysis · Act-as 同步", font=font(28), fill=MUTED)
    d.text((120, 700), "谢谢。", font=font(40, True), fill=INK)
    save(img, "08_close")


if __name__ == "__main__":
    slide_title()
    slide_idea()
    slide_problem()
    slide_solution()
    slide_integration()
    slide_workflow()
    slide_roadmap()
    slide_close()
