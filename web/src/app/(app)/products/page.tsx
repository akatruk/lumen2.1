"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { marketplace } from "@/services/marketplace";
import type { LanguageCode, Product } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  description: "",
  imageEmoji: "📦",
  priceLabel: "",
  geography: "China",
  audience: "",
  languages: "en,th" as string,
  benefits: "",
  prohibitedClaims: "",
  desiredTopics: "",
};

export default function ProductsPage() {
  const search = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = () => setProducts(marketplace.listProducts());

  useEffect(() => {
    void marketplace.hydrateBrandPersistence().then(() => {
      refresh();
      if (search.get("new") === "1") setOpen(true);
    });
  }, [search]);

  const title = useMemo(() => (editingId ? "Edit product" : "Create product"), [editingId]);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      imageEmoji: p.imageEmoji,
      priceLabel: p.priceLabel,
      geography: p.geography.join(", "),
      audience: p.audience,
      languages: p.languages.join(","),
      benefits: p.benefits.join(", "),
      prohibitedClaims: p.prohibitedClaims.join(", "),
      desiredTopics: p.desiredTopics.join(", "),
    });
    setOpen(true);
  }

  async function submit() {
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      imageEmoji: form.imageEmoji || "📦",
      priceLabel: form.priceLabel.trim(),
      geography: form.geography.split(",").map((s) => s.trim()).filter(Boolean),
      audience: form.audience.trim(),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean) as LanguageCode[],
      benefits: form.benefits.split(",").map((s) => s.trim()).filter(Boolean),
      prohibitedClaims: form.prohibitedClaims.split(",").map((s) => s.trim()).filter(Boolean),
      desiredTopics: form.desiredTopics.split(",").map((s) => s.trim()).filter(Boolean),
      platforms: ["douyin" as const],
    };
    if (!payload.name || !payload.brand) return;
    if (editingId) await marketplace.updateProductAsync(editingId, payload);
    else await marketplace.createProductAsync(payload);
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Brand offers used for matching and campaigns.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/scan">
            <Button size="sm" variant="secondary">
              Scan product
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {open ? (
        <Card>
          <CardHeader title={title} />
          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Price / range"><Input value={form.priceLabel} onChange={(e) => setForm({ ...form, priceLabel: e.target.value })} /></Field>
            <Field label="Image emoji"><Input value={form.imageEmoji} onChange={(e) => setForm({ ...form, imageEmoji: e.target.value })} /></Field>
            <Field label="Geography (comma-separated)"><Input value={form.geography} onChange={(e) => setForm({ ...form, geography: e.target.value })} /></Field>
            <Field label="Languages (th,en,ru,zh)"><Input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></Field>
            <Field label="Desired topics"><Input value={form.desiredTopics} onChange={(e) => setForm({ ...form, desiredTopics: e.target.value })} /></Field>
            <div className="md:col-span-2"><Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div>
            <div className="md:col-span-2"><Field label="Target audience"><Textarea value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></Field></div>
            <Field label="Benefits"><Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} /></Field>
            <Field label="Prohibited claims"><Textarea value={form.prohibitedClaims} onChange={(e) => setForm({ ...form, prohibitedClaims: e.target.value })} /></Field>
          </div>
          <div className="flex gap-2 border-t border-border/40 px-5 py-4">
            <Button onClick={() => void submit()}>Save</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="flex flex-col p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl">{p.imageEmoji}</div>
              <div className="min-w-0">
                <Link href={`/products/${p.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                  {p.name}
                </Link>
                <div className="text-xs text-muted-foreground">{p.brand} · {p.category}</div>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-3 text-xs text-muted-foreground">{p.priceLabel} · {p.geography.join(", ")}</div>
            <div className="mt-4 flex gap-2">
              <Link href={`/products/${p.id}`}><Button size="sm" variant="secondary">Open</Button></Link>
              <Button size="sm" variant="ghost" onClick={() => startEdit(p)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
