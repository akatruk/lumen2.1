#!/usr/bin/env python3
"""Generate Chinese title/idea slides for the ZH presentation video."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "slides_zh"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080
BG = (244, 247, 246)
INK = (15, 23, 42)
MUTED = (100, 116, 139)
TEAL = (15, 118, 110)
CARD = (255, 255, 255)
LINE = (226, 232, 240)

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
                # Hiragino W6 is often index 1 for bold-ish
                idx = 1 if (bold and "Hiragino" in p) else index
                return ImageFont.truetype(p, size, index=idx)
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def new_slide():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    for i in range(40):
        draw.ellipse((-200 + i, -200 + i, 700 - i, 500 - i), outline=(15, 118, 110))
    return img, draw


def wrap(draw, text, f, max_w):
    """Wrap CJK/Latin mixed text by character when needed."""
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


def slide_title():
    img, d = new_slide()
    d.text((120, 160), "LUMEN", font=font(28, True), fill=TEAL)
    d.text((120, 220), "网红市集", font=font(72, True), fill=INK)
    lines = wrap(
        d,
        "面向泰国的产品构想：用视频理解匹配创作者，再从邀请协作到正式发布。",
        font(34),
        1500,
    )
    y = 400
    for line in lines:
        d.text((120, y), line, font=font(34), fill=MUTED)
        y += 52
    d.text((120, 920), "3–5 分钟产品故事  ·  发现 + 协作  ·  对接 Lumen", font=font(26), fill=MUTED)
    save(img, "01_title")


def slide_idea():
    img, d = new_slide()
    d.text((120, 120), "核心想法", font=font(26, True), fill=TEAL)
    d.text((120, 180), "契合度，而不是粉丝数", font=font(54, True), fill=INK)
    points = [
        "品牌需要近期内容真正匹配产品的创作者。",
        "Lumen 把视频变成转录、主题、语言、风格与安全信号。",
        "市集把洞察变成短名单与活动流程。",
        "创作者保持主导——在自己的社交账号发布。",
    ]
    y = 320
    for p in points:
        d.rounded_rectangle((120, y, 1800, y + 100), radius=16, fill=CARD, outline=LINE)
        d.text((160, y + 30), p, font=font(30), fill=INK)
        y += 120
    save(img, "02_idea")


def slide_problem():
    img, d = new_slide()
    d.text((120, 120), "问题", font=font(26, True), fill=TEAL)
    d.text((120, 180), "手工发现无法规模化", font=font(52, True), fill=INK)
    boxes = [
        ("搜寻", "在 TikTok、Instagram、YouTube 上手动找人。"),
        ("观看", "反复看片，猜测主题是否契合。"),
        ("沟通", "Brief 与成片散落在各种聊天线程。"),
        ("风险", "粉丝数掩盖语言、地域与品牌安全缺口。"),
    ]
    positions = [(120, 320), (1000, 320), (120, 620), (1000, 620)]
    for (x, y), (title, body) in zip(positions, boxes):
        d.rounded_rectangle((x, y, x + 800, y + 220), radius=18, fill=CARD, outline=LINE)
        d.text((x + 40, y + 36), title, font=font(34, True), fill=TEAL)
        for i, line in enumerate(wrap(d, body, font(26), 700)):
            d.text((x + 40, y + 100 + i * 40), line, font=font(26), fill=MUTED)
    save(img, "03_problem")


def slide_solution():
    img, d = new_slide()
    d.text((120, 120), "方案", font=font(26, True), fill=TEAL)
    d.text((120, 180), "三部分，一条工作流", font=font(52, True), fill=INK)
    cards = [
        ("品牌控制台", "产品、活动、发现、短名单、审核与效果。"),
        ("创作者门户", "邀请、Brief、成片、发布链接与认领资料。"),
        ("Lumen 分析", "复用核心 Lumen 平台的视频智能。"),
    ]
    x = 120
    for title, body in cards:
        d.rounded_rectangle((x, 340, x + 540, 820), radius=20, fill=CARD, outline=LINE)
        d.text((x + 36, 390), title, font=font(32, True), fill=TEAL)
        y = 470
        for line in wrap(d, body, font(28), 460):
            d.text((x + 36, y), line, font=font(28), fill=MUTED)
            y += 44
        x += 580
    save(img, "04_solution")


def slide_integration():
    img, d = new_slide()
    d.text((120, 120), "与 Lumen 集成", font=font(26, True), fill=TEAL)
    d.text((120, 180), "市集叠在分析能力之上", font=font(48, True), fill=INK)
    layers = [
        (220, "品牌控制台  ·  创作者门户", TEAL),
        (440, "市集 API  ·  匹配、活动、邀请", (3, 105, 161)),
        (660, "Lumen Analysis API  ·  转录、主题、风格、品牌安全", (15, 23, 42)),
    ]
    for y, label, color in layers:
        d.rounded_rectangle((220, y, 1700, y + 140), radius=18, fill=CARD, outline=LINE)
        d.rectangle((220, y, 250, y + 140), fill=color)
        d.text((290, y + 48), label, font=font(30, True), fill=INK)
    d.text(
        (220, 860),
        "今天用模拟客户端复用同一任务契约——换成真实 Lumen，无需重写界面。",
        font=font(26),
        fill=MUTED,
    )
    save(img, "05_integration")


def slide_workflow():
    img, d = new_slide()
    d.text((120, 120), "协作闭环", font=font(26, True), fill=TEAL)
    d.text((120, 180), "邀请 → 发布", font=font(52, True), fill=INK)
    steps = ["邀请", "接受", "Brief", "成片", "审核", "批准", "发布", "数据"]
    x = 100
    for i, s in enumerate(steps):
        d.rounded_rectangle((x, 480, x + 190, 600), radius=40, fill=(236, 253, 245), outline=(167, 243, 208))
        # center-ish label
        tw = d.textlength(s, font=font(24, True))
        d.text((x + (190 - tw) / 2, 520), s, font=font(24, True), fill=(6, 95, 70))
        if i < len(steps) - 1:
            d.text((x + 198, 520), "→", font=font(28, True), fill=MUTED)
        x += 220
    d.text((120, 720), "尚无支付——第三阶段。先验证匹配与流程。", font=font(28), fill=MUTED)
    save(img, "06_workflow")


def slide_roadmap():
    img, d = new_slide()
    d.text((120, 120), "路线图", font=font(26, True), fill=TEAL)
    d.text((120, 180), "分阶段、审慎交付", font=font(52, True), fill=INK)
    phases = [
        ("第一阶段", "发现 MVP", "已完成"),
        ("第二阶段", "协作", "已完成"),
        ("第三阶段", "合同与支付", "下一步"),
        ("第四阶段", "规模与学习", "之后"),
    ]
    x = 120
    for title, body, state in phases:
        d.rounded_rectangle((x, 360, x + 400, 720), radius=18, fill=CARD, outline=LINE)
        d.text((x + 32, 400), title, font=font(28, True), fill=TEAL)
        d.text((x + 32, 470), body, font=font(30, True), fill=INK)
        d.text((x + 32, 600), state, font=font(26), fill=MUTED)
        x += 440
    save(img, "07_roadmap")


def slide_close():
    img, d = new_slide()
    d.text((120, 280), "视频理解", font=font(64, True), fill=INK)
    d.text((120, 380), "→ 活动决策", font=font(64, True), fill=TEAL)
    d.text((120, 540), "创作者门户 · 演示 · 品牌控制台", font=font(30), fill=MUTED)
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
