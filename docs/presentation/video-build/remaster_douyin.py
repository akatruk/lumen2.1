#!/usr/bin/env python3
"""Remaster demo.mp4 / demo-zh.mp4 from SCRIPT_4MIN + regenerated Douyin slides."""
from __future__ import annotations

import asyncio
import re
import shutil
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[3]
BUILD = Path(__file__).resolve().parent
PUBLIC = ROOT / "web" / "public" / "presentation"
DOCS = ROOT / "docs" / "presentation"

EN_VOICE = "en-US-AvaMultilingualNeural"
ZH_VOICE = "zh-CN-XiaoxiaoNeural"
EN_RATE, EN_PITCH = "-12%", "-4Hz"
ZH_RATE, ZH_PITCH = "-8%", "-2Hz"

# Visual sequence aligned to paragraph count (slides + existing product shots)
EN_VISUALS = [
    "slides/01_title.png",
    "slides/02_idea.png",
    "slides/03_problem.png",
    "framed/shot_01_dashboard.png",
    "framed/shot_03b_scan.png",
    "framed/shot_11_discover.png",
    "framed/shot_15_dossier.png",
    "framed/shot_05_creator.png",
    "slides/05_integration.png",
    "slides/07_roadmap.png",
    "slides/08_close.png",
]

ZH_VISUALS = [
    "slides_zh/01_title.png",
    "slides_zh/02_idea.png",
    "slides_zh/03_problem.png",
    "framed_zh/shot_01_dashboard.png" if (BUILD / "framed_zh/shot_01_dashboard.png").exists() else "framed/shot_01_dashboard.png",
    "framed/shot_03b_scan.png",
    "framed/shot_11_discover.png",
    "framed/shot_15_dossier.png",
    "framed/shot_05_creator.png",
    "slides_zh/05_integration.png",
    "slides_zh/07_roadmap.png",
    "slides_zh/08_close.png",
]


def paragraphs_from_script(path: Path) -> list[str]:
    lines = []
    for line in path.read_text().splitlines():
        s = line.strip()
        if not s or s.startswith("#") or s.startswith(">"):
            continue
        lines.append(s)
    # Drop trailing thank-you if we want — keep all narrative paras
    return lines


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)


async def synth(text: str, voice: str, rate: str, pitch: str, dest: Path) -> None:
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(str(dest))


async def build_lang(
    *,
    lang: str,
    script: Path,
    voice: str,
    rate: str,
    pitch: str,
    visuals: list[str],
    out_mp4: Path,
) -> None:
    work = BUILD / f"work_{lang}_remaster"
    audio_dir = work / "audio"
    if work.exists():
        shutil.rmtree(work)
    audio_dir.mkdir(parents=True)

    paras = paragraphs_from_script(script)
    print(f"[{lang}] paragraphs={len(paras)}")
    assert len(paras) >= 3

    # Pad / trim visuals to match para count
    vis = list(visuals)
    while len(vis) < len(paras):
        vis.append(vis[-1])
    vis = vis[: len(paras)]

    mp3s: list[Path] = []
    for i, para in enumerate(paras, 1):
        dest = audio_dir / f"p{i:02d}.mp3"
        print(f"[{lang}] TTS p{i:02d}…")
        await synth(para, voice, rate, pitch, dest)
        (audio_dir / f"p{i:02d}.txt").write_text(para + "\n")
        mp3s.append(dest)

    # concat audio
    concat_audio = work / "audio_concat.txt"
    concat_audio.write_text("".join(f"file '{p}'\n" for p in mp3s))
    narration = work / "narration.mp3"
    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_audio),
            "-c",
            "copy",
            str(narration),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # image timeline from per-para durations
    images_txt = work / "images.txt"
    lines = []
    for para_mp3, rel in zip(mp3s, vis):
        img = BUILD / rel
        if not img.exists():
            # fall back to EN framed / slides
            alt = BUILD / rel.replace("slides_zh", "slides").replace("framed_zh", "framed")
            img = alt if alt.exists() else BUILD / "slides/08_close.png"
        dur = ffprobe_duration(para_mp3)
        lines.append(f"file '{img}'\n")
        lines.append(f"duration {dur:.3f}\n")
    # last frame repeat for concat demuxer
    last = BUILD / vis[-1]
    if not last.exists():
        last = BUILD / "slides/08_close.png"
    lines.append(f"file '{last}'\n")
    images_txt.write_text("".join(lines))

    silent = work / "video_silent.mp4"
    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(images_txt),
            "-vf",
            "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(silent),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    mixed = work / "final.mp4"
    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(silent),
            "-i",
            str(narration),
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            str(mixed),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(mixed, out_mp4)
    print(f"[{lang}] wrote {out_mp4} ({ffprobe_duration(out_mp4):.1f}s)")


def regen_slides() -> None:
    subprocess.check_call(["python3", str(BUILD / "make_slides.py")])
    subprocess.check_call(["python3", str(BUILD / "make_slides_zh.py")])
    # refresh framed copies of slide PNGs used in older concat
    framed = BUILD / "framed"
    framed.mkdir(exist_ok=True)
    for name in ["01_title", "02_idea", "03_problem", "04_solution", "05_integration", "06_workflow", "07_roadmap", "08_close"]:
        src = BUILD / "slides" / f"{name}.png"
        if src.exists():
            shutil.copy2(src, framed / f"{name}.png")
    framed_zh = BUILD / "framed_zh"
    framed_zh.mkdir(exist_ok=True)
    for name in ["01_title", "02_idea", "03_problem", "04_solution", "05_integration", "06_workflow", "07_roadmap", "08_close"]:
        src = BUILD / "slides_zh" / f"{name}.png"
        if src.exists():
            shutil.copy2(src, framed_zh / f"{name}.png")


async def main() -> None:
    regen_slides()
    await build_lang(
        lang="en",
        script=DOCS / "SCRIPT_4MIN.md",
        voice=EN_VOICE,
        rate=EN_RATE,
        pitch=EN_PITCH,
        visuals=EN_VISUALS,
        out_mp4=PUBLIC / "demo.mp4",
    )
    await build_lang(
        lang="zh",
        script=DOCS / "SCRIPT_4MIN_ZH.md",
        voice=ZH_VOICE,
        rate=ZH_RATE,
        pitch=ZH_PITCH,
        visuals=ZH_VISUALS,
        out_mp4=PUBLIC / "demo-zh.mp4",
    )
    print("done")


if __name__ == "__main__":
    asyncio.run(main())
