#!/usr/bin/env python3
"""Generate cyber-glass dark slides for the presentation video (EN)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "slides"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080
BG = (0, 0, 0)
INK = (248, 250, 252)
MUTED = (148, 163, 184)
BLUE = (59, 130, 246)
BLUE_DIM = (37, 99, 235)
CARD = (15, 23, 42)
LINE = (39, 48, 66)
GLOW = (30, 64, 175)


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in candidates:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def new_slide():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # ambient glows
    for i in range(80):
        a = 80 - i
        d.ellipse((-280 + i, -280 + i, 720 - i, 520 - i), outline=(30, 64, 175))
    for i in range(60):
        d.ellipse((1280 + i, 620 + i, 2100 - i, 1280 - i), outline=(30, 41, 80))
    # subtle grid dots
    for x in range(40, W, 48):
        for y in range(40, H, 48):
            d.point((x, y), fill=(30, 41, 59))
    return img, d


def wrap(draw, text, f, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=f) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def save(img, name):
    path = OUT / f"{name}.png"
    img.save(path, "PNG")
    print("slide", path.name)


def card(d, box, title, body, title_f=None, body_f=None):
    title_f = title_f or font(30, True)
    body_f = body_f or font(24)
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, radius=16, fill=CARD, outline=LINE)
    d.rectangle((x0, y0, x0 + 4, y1), fill=BLUE)
    d.text((x0 + 28, y0 + 24), title, font=title_f, fill=BLUE)
    y = y0 + 70
    for line in wrap(d, body, body_f, x1 - x0 - 56):
        d.text((x0 + 28, y), line, font=body_f, fill=MUTED)
        y += 34


def slide_title():
    img, d = new_slide()
    d.text((120, 150), "LUMEN 2.1", font=font(28, True), fill=BLUE)
    d.text((120, 210), "Influencer Marketplace", font=font(68, True), fill=INK)
    lines = wrap(
        d,
        "Cyber-glass brand console: scan a product, discover TikTok creators, rank by resume card, then collaborate to publish.",
        font(32),
        1500,
    )
    y = 360
    for line in lines:
        d.text((120, y), line, font=font(32), fill=MUTED)
        y += 46
    d.text(
        (120, 900),
        "Live TikHub  ·  Live LLM  ·  Honest safety  ·  Act-as sync",
        font=font(24),
        fill=MUTED,
    )
    save(img, "01_title")


def slide_idea():
    img, d = new_slide()
    d.text((120, 100), "THE IDEA", font=font(24, True), fill=BLUE)
    d.text((120, 160), "Start from the product", font=font(54, True), fill=INK)
    points = [
        "Brand login → server-backed products, shortlists, invites, and briefs.",
        "Live LLM product scan → editable Resume Card with confidence.",
        "Live TikHub Discover → real creators ranked vs the card.",
        "Invite → accept → brief → draft → approve → publish on creator accounts.",
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
    d.text((120, 100), "PROBLEM", font=font(24, True), fill=BLUE)
    d.text((120, 160), "Manual discovery does not scale", font=font(50, True), fill=INK)
    boxes = [
        ("Hunt", "Search creators across TikTok by hand and paste links into sheets."),
        ("Guess", "Watch dozens of videos to infer topical and geo fit."),
        ("Chat chaos", "Chase briefs and drafts in scattered messenger threads."),
        ("Risk", "Follower count hides language, city, and brand-safety gaps."),
    ]
    positions = [(120, 300), (1000, 300), (120, 620), (1000, 620)]
    for (x, y), (title, body) in zip(positions, boxes):
        card(d, (x, y, x + 800, y + 240), title, body, font(32, True), font(26))
    save(img, "03_problem")


def slide_solution():
    img, d = new_slide()
    d.text((120, 100), "SOLUTION", font=font(24, True), fill=BLUE)
    d.text((120, 160), "Scan → Discover → Collaborate", font=font(48, True), fill=INK)
    cards = [
        ("Live product scan", "Decision first — pitch, topics, geo, prohibitions, confidence."),
        ("Live TikHub Discover", "Real reach + ER reasons; Pending Analysis until scanned."),
        ("Honest workflow", "Live badge, Core/More nav, Act-as sync, server persistence."),
    ]
    x = 120
    for title, body in cards:
        card(d, (x, 340, x + 540, 820), title, body, font(30, True), font(26))
        x += 580
    save(img, "04_solution")


def slide_integration():
    img, d = new_slide()
    d.text((120, 100), "INTEGRATION WITH LUMEN", font=font(24, True), fill=BLUE)
    d.text((120, 160), "Marketplace on top of analysis", font=font(48, True), fill=INK)
    layers = [
        (220, "Brand Console  ·  Creator Portal  ·  Product Scan + Discover", BLUE),
        (440, "Marketplace services  ·  matching, campaigns, invitations, dossiers", BLUE_DIM),
        (660, "Lumen Analysis API  ·  ASR, topics, style, brand safety", INK),
    ]
    for y, label, color in layers:
        d.rounded_rectangle((220, y, 1700, y + 140), radius=16, fill=CARD, outline=LINE)
        d.rectangle((220, y, 250, y + 140), fill=color)
        d.text((290, y + 48), label, font=font(28, True), fill=INK)
    d.text(
        (220, 860),
        "TikHub discovery and OpenRouter scan are live today — Lumen Analysis API is next.",
        font=font(24),
        fill=MUTED,
    )
    save(img, "05_integration")


def slide_workflow():
    img, d = new_slide()
    d.text((120, 100), "COLLABORATION LOOP", font=font(24, True), fill=BLUE)
    d.text((120, 160), "Invite → Publish", font=font(50, True), fill=INK)
    steps = ["Invite", "Accept", "Brief", "Draft", "Review", "Approve", "Publish", "Metrics"]
    x = 90
    for i, s in enumerate(steps):
        d.rounded_rectangle((x, 480, x + 195, 600), radius=36, fill=(15, 23, 42), outline=BLUE)
        tw = d.textlength(s, font=font(22, True))
        d.text((x + (195 - tw) / 2, 522), s, font=font(22, True), fill=BLUE)
        if i < len(steps) - 1:
            d.text((x + 200, 522), "→", font=font(26, True), fill=MUTED)
        x += 225
    d.text((120, 720), "No payments yet — Phase 3. First we prove scan, matching, and workflow.", font=font(26), fill=MUTED)
    save(img, "06_workflow")


def slide_roadmap():
    img, d = new_slide()
    d.text((120, 100), "ROADMAP", font=font(24, True), fill=BLUE)
    d.text((120, 160), "Phased, deliberate delivery", font=font(48, True), fill=INK)
    phases = [
        ("Phase 1", "Discovery + live scan", "Live"),
        ("Phase 2", "Collab + persistence", "Live"),
        ("Phase 3", "Contracts & payments", "Next"),
        ("Phase 4", "More sources + learning", "Later"),
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
    d.text((120, 260), "Video understanding", font=font(60, True), fill=INK)
    d.text((120, 350), "→ campaign decisions", font=font(60, True), fill=BLUE)
    d.text((120, 500), "Live TikHub · Live LLM · Pending Analysis · Act-as sync", font=font(28), fill=MUTED)
    d.text((120, 700), "Thank you.", font=font(40, True), fill=INK)
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
