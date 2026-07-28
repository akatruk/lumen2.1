"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { marketplace } from "@/services/marketplace";
import type { Campaign, CampaignStatus, LanguageCode, Platform, Product } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { formatDate, PLATFORM_LABELS } from "@/lib/utils";

const emptyForm = {
  name: "",
  productId: "",
  objective: "",
  audience: "",
  platforms: "tiktok,instagram",
  geography: "Thailand",
  languages: "en,th",
  budgetRange: "",
  startDate: "",
  endDate: "",
  materials: "",
  status: "Draft" as CampaignStatus,
};

export default function CampaignsPage() {
  const search = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = () => {
    setCampaigns(marketplace.listCampaigns());
    setProducts(marketplace.listProducts());
  };

  useEffect(() => {
    refresh();
    const productsList = marketplace.listProducts();
    setForm((f) => ({ ...f, productId: productsList[0]?.id ?? "" }));
    if (search.get("new") === "1") setOpen(true);
  }, [search]);

  function startEdit(c: Campaign) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      productId: c.productId,
      objective: c.objective,
      audience: c.audience,
      platforms: c.platforms.join(","),
      geography: c.geography.join(", "),
      languages: c.languages.join(","),
      budgetRange: c.budgetRange,
      startDate: c.startDate,
      endDate: c.endDate,
      materials: c.materials.join(", "),
      status: c.status,
    });
    setOpen(true);
  }

  function submit() {
    const payload = {
      name: form.name.trim(),
      productId: form.productId,
      objective: form.objective.trim(),
      audience: form.audience.trim(),
      platforms: form.platforms.split(",").map((s) => s.trim()).filter(Boolean) as Platform[],
      geography: form.geography.split(",").map((s) => s.trim()).filter(Boolean),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean) as LanguageCode[],
      budgetRange: form.budgetRange.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      materials: form.materials.split(",").map((s) => s.trim()).filter(Boolean),
      status: form.status,
    };
    if (!payload.name || !payload.productId) return;
    if (editingId) marketplace.updateCampaign(editingId, payload);
    else marketplace.createCampaign(payload);
    setOpen(false);
    setEditingId(null);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">Advertising campaigns linked to products.</p>
        </div>
        <Button size="sm" onClick={() => { setEditingId(null); setOpen(true); }}>Create Campaign</Button>
      </div>

      {open ? (
        <Card>
          <CardHeader title={editingId ? "Edit campaign" : "Create campaign"} />
          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Product">
              <Select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}>
                {(["Draft", "Active", "Reviewing", "Completed"] as CampaignStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Budget range"><Input value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} /></Field>
            <Field label="Platforms"><Input value={form.platforms} onChange={(e) => setForm({ ...form, platforms: e.target.value })} /></Field>
            <Field label="Geography"><Input value={form.geography} onChange={(e) => setForm({ ...form, geography: e.target.value })} /></Field>
            <Field label="Languages"><Input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></Field>
            <Field label="Materials"><Input value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} /></Field>
            <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
            <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
            <div className="md:col-span-2"><Field label="Objective"><Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></Field></div>
            <div className="md:col-span-2"><Field label="Audience"><Textarea value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></Field></div>
          </div>
          <div className="flex gap-2 border-t border-border/40 px-5 py-4">
            <Button onClick={submit}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {campaigns.map((c) => {
          const product = marketplace.getProduct(c.productId);
          return (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/campaigns/${c.id}`} className="text-base font-semibold text-foreground hover:text-primary">
                    {c.name}
                  </Link>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {product?.name ?? "Unknown product"} · {formatDate(c.startDate)} – {formatDate(c.endDate)}
                  </div>
                </div>
                <Badge tone={c.status}>{c.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-foreground">{c.objective}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Platforms: {c.platforms.map((p) => PLATFORM_LABELS[p]).join(", ")}</span>
                <span>Geo: {c.geography.join(", ")}</span>
                <span>Budget: {c.budgetRange}</span>
                <span>Candidates: {c.candidateCount}</span>
                <span>Shortlist: {c.shortlistCount}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/campaigns/${c.id}`}><Button size="sm" variant="secondary">Open</Button></Link>
                <Button size="sm" variant="ghost" onClick={() => startEdit(c)}>Edit</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
