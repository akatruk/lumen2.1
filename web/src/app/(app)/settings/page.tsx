"use client";

import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { AppSettings, LanguageCode } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(marketplace.getSettings());
  }, []);

  if (!settings) return <div className="text-sm text-slate-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          UI is English for MVP. Locale switch is prepared for Thai, Russian, and Chinese later.
        </p>
      </div>

      <Card>
        <CardHeader title="Workspace preferences" />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <Field label="Interface language">
            <Select
              value={settings.locale}
              onChange={(e) => setSettings({ ...settings, locale: e.target.value as LanguageCode })}
            >
              <option value="en">English (active)</option>
              <option value="th">Thai (planned)</option>
              <option value="ru">Russian (planned)</option>
              <option value="zh">Chinese (planned)</option>
            </Select>
          </Field>
          <Field label="Default videos to analyze">
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
        <CardHeader title="Match score weights (%)" subtitle="Used for future scoring; shown for transparency" />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          {(
            [
              ["topicRelevance", "Topic relevance"],
              ["audienceGeography", "Audience and geography"],
              ["language", "Language"],
              ["contentStyle", "Content style"],
              ["engagementQuality", "Engagement quality"],
              ["postingConsistency", "Posting consistency"],
              ["brandSafety", "Brand safety"],
              ["commercialFit", "Commercial fit"],
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
        <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
          <Button
            onClick={() => {
              marketplace.saveSettings(settings);
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
          >
            Save settings
          </Button>
          {saved ? <span className="text-sm text-emerald-700">Saved to localStorage</span> : null}
        </div>
      </Card>

      <Card>
        <CardHeader title="Demo data" subtitle="Clears localStorage and reloads seed fixtures" />
        <div className="px-5 py-4">
          <Button
            variant="danger"
            onClick={() => {
              marketplace.resetDemoData();
              window.location.reload();
            }}
          >
            Reset demo data
          </Button>
        </div>
      </Card>
    </div>
  );
}
