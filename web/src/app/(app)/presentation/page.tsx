"use client";

import { useEffect, useMemo, useState } from "react";
import { Presentation } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { loadJson, saveJson } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

const VIDEO_KEY_EN = "lumen.presentationVideoUrl";
const VIDEO_KEY_ZH = "lumen.presentationVideoUrlZh";

type VideoLang = "en" | "zh";

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
  const { t, locale } = useI18n();
  const defaultEn =
    process.env.NEXT_PUBLIC_PRESENTATION_VIDEO_URL ?? "/presentation/demo.mp4?v=0.5.2";
  const defaultZh =
    process.env.NEXT_PUBLIC_PRESENTATION_VIDEO_URL_ZH ?? "/presentation/demo-zh.mp4?v=0.5.2";

  const [videoLang, setVideoLang] = useState<VideoLang>("en");
  const [urlEn, setUrlEn] = useState(defaultEn);
  const [urlZh, setUrlZh] = useState(defaultZh);
  const [draftEn, setDraftEn] = useState(defaultEn);
  const [draftZh, setDraftZh] = useState(defaultZh);

  useEffect(() => {
    const normalizeDefault = (saved: string | undefined, def: string) => {
      const s = saved?.trim();
      if (!s) return def;
      if (s === "/presentation/demo.mp4" || s === "/presentation/demo-zh.mp4") return def;
      if (s.startsWith("/presentation/demo.mp4?") || s.startsWith("/presentation/demo-zh.mp4?")) {
        return def;
      }
      return s;
    };
    const savedEn = loadJson<string>(VIDEO_KEY_EN, defaultEn);
    const savedZh = loadJson<string>(VIDEO_KEY_ZH, defaultZh);
    const nextEn = normalizeDefault(savedEn, defaultEn);
    const nextZh = normalizeDefault(savedZh, defaultZh);
    setUrlEn(nextEn);
    setUrlZh(nextZh);
    setDraftEn(nextEn);
    setDraftZh(nextZh);
  }, [defaultEn, defaultZh]);

  useEffect(() => {
    setVideoLang(locale);
  }, [locale]);

  const url = videoLang === "zh" ? urlZh : urlEn;
  const draft = videoLang === "zh" ? draftZh : draftEn;
  const setDraft = videoLang === "zh" ? setDraftZh : setDraftEn;
  const embed = useMemo(() => toEmbed(url), [url]);

  const talkBullets = [
    t.presentation.bullet1,
    t.presentation.bullet2,
    t.presentation.bullet3,
    t.presentation.bullet4,
    t.presentation.bullet5,
    t.presentation.bullet6,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Presentation className="h-3.5 w-3.5" />
            {t.presentation.eyebrow}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{t.presentation.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.presentation.subtitle}</p>
        </div>
        <a href="/presentation/slides.html" target="_blank" rel="noreferrer">
          <Button size="sm">{t.presentation.openSlides}</Button>
        </a>
      </div>

      <Card>
        <CardHeader
          title={t.presentation.video}
          subtitle={videoLang === "zh" ? t.presentation.videoSubZh : t.presentation.videoSubEn}
          action={
            <div className="flex gap-1 rounded-lg border border-border bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setVideoLang("en")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  videoLang === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t.lang.en}
              </button>
              <button
                type="button"
                onClick={() => setVideoLang("zh")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  videoLang === "zh" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t.lang.zh}
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
              title={t.presentation.iframeTitle}
              className="aspect-video w-full rounded-lg border border-border bg-black"
              src={embed.src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted px-6 text-center">
              <p className="text-sm font-medium text-foreground">{t.presentation.noVideo}</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{t.presentation.defaultFiles}</p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <Field label={videoLang === "zh" ? t.presentation.zhUrl : t.presentation.enUrl}>
              <Input
                value={draft}
                placeholder={
                  videoLang === "zh" ? "/presentation/demo-zh.mp4" : "/presentation/demo.mp4"
                }
                onChange={(e) => setDraft(e.target.value)}
              />
            </Field>
            <Button
              onClick={() => {
                const next = draft.trim();
                if (videoLang === "zh") {
                  saveJson(VIDEO_KEY_ZH, next);
                  setUrlZh(next);
                } else {
                  saveJson(VIDEO_KEY_EN, next);
                  setUrlEn(next);
                }
              }}
            >
              {t.presentation.saveUrl}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader
            title={t.presentation.slideDeck}
            subtitle={t.presentation.slideHint}
            action={
              <a
                href="/presentation/slides.html"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                {t.presentation.openAlone}
              </a>
            }
          />
          <iframe
            title={t.presentation.slidesTitle}
            src="/presentation/slides.html"
            className="h-[28rem] w-full border-0 bg-card xl:h-[32rem]"
          />
        </Card>

        <Card>
          <CardHeader
            title={t.presentation.talkTrack}
            subtitle={locale === "zh" ? t.presentation.talkSubZh : t.presentation.talkSubEn}
          />
          <div className="space-y-3 px-5 py-4 text-sm text-foreground">
            {talkBullets.map((bullet) => (
              <p key={bullet}>{bullet}</p>
            ))}
            <a
              href={locale === "zh" ? "/presentation/SCRIPT_4MIN_ZH.md" : "/presentation/SCRIPT.md"}
              target="_blank"
              rel="noreferrer"
              className="inline-block pt-2 font-medium text-primary hover:underline"
            >
              {t.presentation.fullScript}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
