#!/usr/bin/env python3
"""Generate title/idea slides for the presentation video."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "slides"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080
BG = (244, 247, 246)
INK = (15, 23, 42)
MUTED = (100, 116, 139)
TEAL = (15, 118, 110)
CARD = (255, 255, 255)
LINE = (226, 232, 240)


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
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
    draw = ImageDraw.Draw(img)
    # soft corner wash
    for i in range(40):
        a = 8
        draw.ellipse((-200 + i, -200 + i, 700 - i, 500 - i), outline=(15, 118, 110, a))
    return img, draw


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


def slide_title():
    img, d = new_slide()
    d.text((120, 160), "LUMEN", font=font(28, True), fill=TEAL)
    d.text((120, 220), "Influencer Marketplace", font=font(72, True), fill=INK)
    lines = wrap(
        d,
        "A thoughtful Thailand product: match creators by video understanding, then collaborate from invite to published post.",
        font(34),
        1500,
    )
    y = 380
    for line in lines:
        d.text((120, y), line, font=font(34), fill=MUTED)
        y += 48
    d.text((120, 920), "3–5 minute product story  ·  Discovery + Collaboration  ·  Lumen-ready", font=font(26), fill=MUTED)
    save(img, "01_title")


def slide_idea():
    img, d = new_slide()
    d.text((120, 120), "THE IDEA", font=font(26, True), fill=TEAL)
    d.text((120, 180), "Fit over follower count", font=font(58, True), fill=INK)
    points = [
        "Brands need creators whose recent videos match the product.",
        "Lumen turns video into transcript, topics, language, style, and safety.",
        "The marketplace turns that insight into shortlists and campaigns.",
        "Creators stay in control — they publish on their own social accounts.",
    ]
    y = 320
    for p in points:
        d.rounded_rectangle((120, y, 1800, y + 100), radius=16, fill=CARD, outline=LINE)
        d.text((160, y + 30), p, font=font(30), fill=INK)
        y += 120
    save(img, "02_idea")


def slide_problem():
    img, d = new_slide()
    d.text((120, 120), "PROBLEM", font=font(26, True), fill=TEAL)
    d.text((120, 180), "Manual discovery does not scale", font=font(54, True), fill=INK)
    boxes = [
        ("Hunt", "Search creators across TikTok, Instagram, YouTube by hand."),
        ("Watch", "Review dozens of videos to guess topical fit."),
        ("Chat", "Chase briefs and drafts in scattered threads."),
        ("Risk", "Follower count hides language, geo, and brand-safety gaps."),
    ]
    positions = [(120, 320), (1000, 320), (120, 620), (1000, 620)]
    for (x, y), (title, body) in zip(positions, boxes):
        d.rounded_rectangle((x, y, x + 800, y + 220), radius=18, fill=CARD, outline=LINE)
        d.text((x + 40, y + 36), title, font=font(34, True), fill=TEAL)
        for i, line in enumerate(wrap(d, body, font(26), 700)):
            d.text((x + 40, y + 100 + i * 36), line, font=font(26), fill=MUTED)
    save(img, "03_problem")


def slide_solution():
    img, d = new_slide()
    d.text((120, 120), "SOLUTION", font=font(26, True), fill=TEAL)
    d.text((120, 180), "Three pieces, one workflow", font=font(54, True), fill=INK)
    cards = [
        ("Brand console", "Products, campaigns, discovery, shortlists, reviews, performance."),
        ("Creator portal", "Invites, briefs, drafts, publication URLs, profile claims."),
        ("Lumen analysis", "Video intelligence reused from the core Lumen platform."),
    ]
    x = 120
    for title, body in cards:
        d.rounded_rectangle((x, 340, x + 540, 820), radius=20, fill=CARD, outline=LINE)
        d.text((x + 36, 390), title, font=font(32, True), fill=TEAL)
        y = 470
        for line in wrap(d, body, font(28), 460):
            d.text((x + 36, y), line, font=font(28), fill=MUTED)
            y += 40
        x += 580
    save(img, "04_solution")


def slide_integration():
    img, d = new_slide()
    d.text((120, 120), "INTEGRATION WITH LUMEN", font=font(26, True), fill=TEAL)
    d.text((120, 180), "Marketplace on top of analysis", font=font(52, True), fill=INK)
    # architecture boxes
    layers = [
        (220, "Brand Console  ·  Creator Portal", TEAL),
        (440, "Marketplace API  ·  matching, campaigns, invitations", (3, 105, 161)),
        (660, "Lumen Analysis API  ·  ASR, topics, style, brand safety", (15, 23, 42)),
    ]
    for y, label, color in layers:
        d.rounded_rectangle((220, y, 1700, y + 140), radius=18, fill=CARD, outline=LINE)
        d.rectangle((220, y, 250, y + 140), fill=color)
        d.text((290, y + 48), label, font=font(32, True), fill=INK)
    d.text((220, 860), "Same job contract today with a mock client — swap to live Lumen without rewriting the UI.", font=font(26), fill=MUTED)
    save(img, "05_integration")


def slide_workflow():
    img, d = new_slide()
    d.text((120, 120), "COLLABORATION LOOP", font=font(26, True), fill=TEAL)
    d.text((120, 180), "Invite → Publish", font=font(54, True), fill=INK)
    steps = ["Invite", "Accept", "Brief", "Draft", "Review", "Approve", "Publish", "Metrics"]
    x = 100
    for i, s in enumerate(steps):
        d.rounded_rectangle((x, 480, x + 190, 600), radius=40, fill=(236, 253, 245), outline=(167, 243, 208))
        d.text((x + 28, 520), s, font=font(24, True), fill=(6, 95, 70))
        if i < len(steps) - 1:
            d.text((x + 198, 520), "→", font=font(28, True), fill=MUTED)
        x += 220
    d.text((120, 720), "No payments yet — Phase 3. First we prove matching and workflow.", font=font(28), fill=MUTED)
    save(img, "06_workflow")


def slide_roadmap():
    img, d = new_slide()
    d.text((120, 120), "ROADMAP", font=font(26, True), fill=TEAL)
    d.text((120, 180), "Phased, deliberate delivery", font=font(52, True), fill=INK)
    phases = [
        ("Phase 1", "Discovery MVP", "Done"),
        ("Phase 2", "Collaboration", "Done"),
        ("Phase 3", "Contracts & payments", "Next"),
        ("Phase 4", "Scale & learning", "Later"),
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
    d.text((120, 260), "Video understanding", font=font(64, True), fill=INK)
    d.text((120, 350), "→ campaign decisions", font=font(64, True), fill=TEAL)
    d.text((120, 520), "Creator portal · Presentation · Brand console", font=font(30), fill=MUTED)
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
