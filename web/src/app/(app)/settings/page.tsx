"use client";

import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { AppSettings } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useI18n, type UiLocale } from "@/lib/i18n";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = marketplace.getSettings();
    setSettings({ ...s, locale });
  }, [locale]);

  if (!settings) return <div className="text-sm text-muted-foreground">{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.settings.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      <Card>
        <CardHeader title={t.settings.workspace} />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <Field label={t.settings.interfaceLanguage}>
            <Select
              value={locale}
              onChange={(e) => {
                const next = e.target.value as UiLocale;
                setLocale(next);
                setSettings({ ...settings, locale: next });
              }}
            >
              <option value="zh">{t.settings.langZh}</option>
              <option value="en">{t.settings.langEn}</option>
            </Select>
          </Field>
          <Field label={t.settings.defaultVideos}>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.defaultVideosToAnalyze}
              onChange={(e) =>
                setSettings({ ...settings, defaultVideosToAnalyze: Number(e.target.value) || 5 })
              }
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title={t.settings.matchWeights} subtitle={t.settings.matchWeightsSub} />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          {(
            [
              ["topicRelevance", t.settings.topicRelevance],
              ["audienceGeography", t.settings.audienceGeography],
              ["language", t.settings.language],
              ["contentStyle", t.settings.contentStyle],
              ["engagementQuality", t.settings.engagementQuality],
              ["postingConsistency", t.settings.postingConsistency],
              ["brandSafety", t.settings.brandSafety],
              ["commercialFit", t.settings.commercialFit],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                value={settings.matchWeights[key]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    matchWeights: {
                      ...settings.matchWeights,
                      [key]: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-border/40 px-5 py-4">
          <Button
            onClick={() => {
              marketplace.saveSettings({ ...settings, locale });
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
          >
            {t.settings.saveSettings}
          </Button>
          {saved ? <span className="text-sm text-emerald-500">{t.settings.savedLocal}</span> : null}
        </div>
      </Card>

      <Card>
        <CardHeader title={t.settings.demoData} subtitle={t.settings.demoDataSub} />
        <div className="px-5 py-4">
          <Button
            variant="danger"
            onClick={() => {
              marketplace.resetDemoData();
              window.location.reload();
            }}
          >
            {t.settings.resetDemo}
          </Button>
        </div>
      </Card>
    </div>
  );
}
