"use client";

import { useEffect, useMemo, useState } from "react";
import { Presentation } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { loadJson, saveJson } from "@/lib/storage";

const VIDEO_KEY_EN = "lumen.presentationVideoUrl";
const VIDEO_KEY_ZH = "lumen.presentationVideoUrlZh";

type Lang = "en" | "zh";

function toEmbed(url: string): { kind: "youtube" | "vimeo" | "file" | "unknown"; src: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const yt =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/) ||
    trimmed.match(/youtube\.com\/shorts\/([\w-]{6,})/);
  if (yt) return { kind: "youtube", src: `https://www.youtube.com/embed/${yt[1]}` };

  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "vimeo", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed) || trimmed.startsWith("/")) {
    return { kind: "file", src: trimmed };
  }

  return { kind: "unknown", src: trimmed };
}

export default function PresentationPage() {
  const defaultEn = process.env.NEXT_PUBLIC_PRESENTATION_VIDEO_URL ?? "/presentation/demo.mp4";
  const defaultZh =
    process.env.NEXT_PUBLIC_PRESENTATION_VIDEO_URL_ZH ?? "/presentation/demo-zh.mp4";

  const [lang, setLang] = useState<Lang>("en");
  const [urlEn, setUrlEn] = useState(defaultEn);
  const [urlZh, setUrlZh] = useState(defaultZh);
  const [draftEn, setDraftEn] = useState(defaultEn);
  const [draftZh, setDraftZh] = useState(defaultZh);

  useEffect(() => {
    const savedEn = loadJson<string>(VIDEO_KEY_EN, defaultEn);
    const savedZh = loadJson<string>(VIDEO_KEY_ZH, defaultZh);
    const nextEn = savedEn?.trim() ? savedEn.trim() : defaultEn;
    const nextZh = savedZh?.trim() ? savedZh.trim() : defaultZh;
    setUrlEn(nextEn);
    setUrlZh(nextZh);
    setDraftEn(nextEn);
    setDraftZh(nextZh);
  }, [defaultEn, defaultZh]);

  const url = lang === "zh" ? urlZh : urlEn;
  const draft = lang === "zh" ? draftZh : draftEn;
  const setDraft = lang === "zh" ? setDraftZh : setDraftEn;
  const embed = useMemo(() => toEmbed(url), [url]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Presentation className="h-3.5 w-3.5" />
            Stakeholder demo
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Presentation</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            English and Chinese walkthroughs on this page. Open the interactive slide deck, or paste a
            YouTube / Vimeo / MP4 URL below.
          </p>
        </div>
        <a href="/presentation/slides.html" target="_blank" rel="noreferrer">
          <Button size="sm">Open slides fullscreen</Button>
        </a>
      </div>

      <Card>
        <CardHeader
          title="Video"
          subtitle={lang === "zh" ? "中文版 · 约 3–5 分钟" : "English · ~3–5 minutes"}
          action={
            <div className="flex gap-1 rounded-lg border border-border bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  lang === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("zh")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  lang === "zh" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                中文
              </button>
            </div>
          }
        />
        <div className="space-y-4 px-5 py-4">
          {embed?.kind === "file" ? (
            <video
              key={embed.src}
              className="aspect-video w-full rounded-lg border border-border bg-black"
              controls
              playsInline
              src={embed.src}
            />
          ) : embed && embed.kind !== "unknown" ? (
            <iframe
              key={embed.src}
              title="Lumen presentation video"
              className="aspect-video w-full rounded-lg border border-border bg-black"
              src={embed.src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted px-6 text-center">
              <p className="text-sm font-medium text-foreground">No video URL configured yet</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Default files:{" "}
                <code className="rounded bg-card px-1">/presentation/demo.mp4</code> ·{" "}
                <code className="rounded bg-card px-1">/presentation/demo-zh.mp4</code>
              </p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <Field label={lang === "zh" ? "中文视频 URL" : "English video URL"}>
              <Input
                value={draft}
                placeholder={
                  lang === "zh" ? "/presentation/demo-zh.mp4" : "/presentation/demo.mp4"
                }
                onChange={(e) => setDraft(e.target.value)}
              />
            </Field>
            <Button
              onClick={() => {
                const next = draft.trim();
                if (lang === "zh") {
                  saveJson(VIDEO_KEY_ZH, next);
                  setUrlZh(next);
                } else {
                  saveJson(VIDEO_KEY_EN, next);
                  setUrlEn(next);
                }
              }}
            >
              Save video URL
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader
            title="Slide deck"
            subtitle="← → or Space · F fullscreen inside the frame"
            action={
              <a
                href="/presentation/slides.html"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open alone
              </a>
            }
          />
          <iframe
            title="Lumen slides"
            src="/presentation/slides.html"
            className="h-[28rem] w-full border-0 bg-card xl:h-[32rem]"
          />
        </Card>

        <Card>
          <CardHeader
            title="Talk track"
            subtitle={lang === "zh" ? "中文旁白要点" : "~4 min English narration"}
          />
          <div className="space-y-3 px-5 py-4 text-sm text-foreground">
            {lang === "zh" ? (
              <>
                <p>1. 切入 — 内容契合度高于粉丝数</p>
                <p>2. 问题 — 泰国创作者手工筛选难规模化</p>
                <p>3. 方案 — 品牌端 + 创作者端 + Lumen 分析</p>
                <p>4. 演示发现 — 匹配分数与目录</p>
                <p>5. 演示协作 — 邀请到发布</p>
                <p>6. 路线图 — 第三阶段合同与支付</p>
                <a
                  href="/presentation/SCRIPT_4MIN_ZH.md"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block pt-2 font-medium text-primary hover:underline"
                >
                  完整中文脚本 →
                </a>
              </>
            ) : (
              <>
                <p>1. Hook — video fit over follower count</p>
                <p>2. Problem — manual Thailand creator hunt</p>
                <p>3. Solution — brand console + creator portal + Lumen analysis</p>
                <p>4. Demo Discovery — match scores & catalog</p>
                <p>5. Demo Collaboration — invite → publish</p>
                <p>6. Roadmap — Phase 3 contracts/payments</p>
                <a
                  href="/presentation/SCRIPT.md"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block pt-2 font-medium text-primary hover:underline"
                >
                  Full script (SCRIPT.md) →
                </a>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
