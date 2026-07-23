"use client";

import { useEffect, useMemo, useState } from "react";
import { Presentation } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { loadJson, saveJson } from "@/lib/storage";

const VIDEO_KEY = "lumen.presentationVideoUrl";

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
  const envDefault = process.env.NEXT_PUBLIC_PRESENTATION_VIDEO_URL ?? "/presentation/demo.mp4";
  const [url, setUrl] = useState(envDefault);
  const [draft, setDraft] = useState(envDefault);

  useEffect(() => {
    const saved = loadJson<string>(VIDEO_KEY, envDefault);
    const next = saved?.trim() ? saved.trim() : envDefault;
    setUrl(next);
    setDraft(next);
  }, [envDefault]);

  const embed = useMemo(() => toEmbed(url), [url]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            <Presentation className="h-3.5 w-3.5" />
            Stakeholder demo
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Presentation</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Host the pitch video on this page and open the interactive slide deck. Drop a YouTube,
            Vimeo, or MP4 URL below — or put a file at{" "}
            <code className="rounded bg-slate-100 px-1">/presentation/demo.mp4</code>.
          </p>
        </div>
        <a href="/presentation/slides.html" target="_blank" rel="noreferrer">
          <Button size="sm">Open slides fullscreen</Button>
        </a>
      </div>

      <Card>
        <CardHeader title="Video" subtitle="5–10 minute English walkthrough" />
        <div className="space-y-4 px-5 py-4">
          {embed?.kind === "file" ? (
            <video
              className="aspect-video w-full rounded-xl border border-slate-200 bg-slate-950"
              controls
              playsInline
              src={embed.src}
            />
          ) : embed && embed.kind !== "unknown" ? (
            <iframe
              title="Lumen presentation video"
              className="aspect-video w-full rounded-xl border border-slate-200 bg-slate-950"
              src={embed.src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <p className="text-sm font-medium text-slate-800">No video URL configured yet</p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Paste a YouTube / Vimeo / MP4 link, or upload{" "}
                <code className="rounded bg-white px-1">web/public/presentation/demo.mp4</code> and
                set URL to <code className="rounded bg-white px-1">/presentation/demo.mp4</code>.
              </p>
              <a href="/presentation/slides.html" className="mt-4 text-sm font-medium text-teal-700 hover:underline">
                Meanwhile: open the slide deck →
              </a>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="Video URL">
              <Input
                value={draft}
                placeholder="https://youtu.be/... or /presentation/demo.mp4"
                onChange={(e) => setDraft(e.target.value)}
              />
            </Field>
            <Button
              onClick={() => {
                saveJson(VIDEO_KEY, draft.trim());
                setUrl(draft.trim());
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
              <a href="/presentation/slides.html" target="_blank" rel="noreferrer" className="text-xs font-medium text-teal-700 hover:underline">
                Open alone
              </a>
            }
          />
          <iframe
            title="Lumen slides"
            src="/presentation/slides.html"
            className="h-[28rem] w-full border-0 bg-white xl:h-[32rem]"
          />
        </Card>

        <Card>
          <CardHeader title="Talk track" subtitle="~7:30 English narration" />
          <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
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
              className="inline-block pt-2 font-medium text-teal-700 hover:underline"
            >
              Full script (SCRIPT.md) →
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
