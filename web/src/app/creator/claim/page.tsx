"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import { useCreatorSessionId } from "@/hooks/useCreatorSession";
import type { ProfileClaim } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";

export default function CreatorClaimPage() {
  const { push } = useToast();
  const influencerId = useCreatorSessionId();
  const [claims, setClaims] = useState<ProfileClaim[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [proof, setProof] = useState("I control the listed social accounts and can post a verification code.");

  const me = marketplace.getInfluencer(influencerId);

  const refresh = () => {
    setClaims(collaboration.listClaims().filter((c) => c.influencerId === influencerId));
  };

  useEffect(() => {
    const current = marketplace.getInfluencer(influencerId);
    setName(current?.name ?? "");
    setEmail(
      current?.contactEmail ??
        `${(current?.name ?? "creator").toLowerCase().replace(/\s+/g, ".")}@example.com`,
    );
    setClaims(collaboration.listClaims().filter((c) => c.influencerId === influencerId));
  }, [influencerId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Claim profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Request ownership of {me?.name}. Brand operators review claims in the console.
        </p>
      </div>

      <Card>
        <CardHeader title="Submit claim" subtitle={`Current status: ${me?.claimStatus ?? "Unclaimed"}`} />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <Field label="Your name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <div className="md:col-span-2">
            <Field label="Proof note">
              <Textarea value={proof} onChange={(e) => setProof(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="border-t border-border/40 px-5 py-4">
          <Button
            onClick={() => {
              collaboration.submitClaim({
                influencerId,
                claimantName: name,
                claimantEmail: email,
                proofNote: proof,
              });
              push("Claim submitted for review");
              refresh();
            }}
          >
            Submit claim
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Your claim history" />
        <div className="divide-y divide-border/40">
          {claims.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <div className="font-medium">{c.claimantEmail}</div>
                <div className="text-muted-foreground">{c.proofNote}</div>
              </div>
              <Badge tone={c.status === "Verified" ? "Active" : c.status === "Rejected" ? "Failed" : "Reviewing"}>
                {c.status}
              </Badge>
            </div>
          ))}
          {!claims.length ? <div className="px-5 py-4 text-sm text-muted-foreground">No claims yet.</div> : null}
        </div>
      </Card>
    </div>
  );
}
