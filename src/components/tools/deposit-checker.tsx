"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decodeItems, depositSummary, encodeItems, money } from "@/lib/calculators";

type Row = { label: string; amount: string };

export function DepositChecker() {
  const sp = useSearchParams();
  const [deposit, setDeposit] = useState(sp.get("deposit") ?? "");
  const [rows, setRows] = useState<Row[]>(() => {
    const parsed = decodeItems(sp.get("items")).map((i) => ({ label: i.label, amount: String(i.amount) }));
    return parsed.length ? parsed : [{ label: "", amount: "" }];
  });

  const items = rows.map((r) => ({ label: r.label, amount: Number(r.amount) || 0 }));

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (deposit) p.set("deposit", deposit);
    else p.delete("deposit");
    const enc = encodeItems(items);
    if (enc) p.set("items", enc);
    else p.delete("items");
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deposit, rows]);

  const depositNum = Number(deposit) || 0;
  const summary = depositSummary(depositNum, items);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="deposit">Security deposit paid ($)</Label>
        <Input id="deposit" type="number" min={0} step="0.01" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Landlord&apos;s itemized deductions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Input
                aria-label={`Deduction ${i + 1} description`}
                placeholder="e.g. Carpet cleaning"
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <Input
                aria-label={`Deduction ${i + 1} amount`}
                className="w-32"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={r.amount}
                onChange={(e) => update(i, { amount: e.target.value })}
              />
              <Button
                variant="outline"
                aria-label={`Remove deduction ${i + 1}`}
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : [{ label: "", amount: "" }]))}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button variant="secondary" onClick={() => setRows((rs) => (rs.length < 30 ? [...rs, { label: "", amount: "" }] : rs))}>
            + Add deduction
          </Button>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardContent className="space-y-1 pt-6">
          <p>Total deductions: <strong>{money(summary.totalDeductions)}</strong></p>
          <p className="text-xl font-semibold">Refund due to you: {money(summary.refund)}</p>
          {summary.owedByTenant > 0 && (
            <p className="text-sm text-red-600">
              Deductions exceed the deposit by {money(summary.owedByTenant)}. Ask for receipts and check
              your local rules on what can be charged.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
