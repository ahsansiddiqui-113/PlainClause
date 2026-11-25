"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatISO,
  money,
  noticeDeadline,
  parseDate,
  proratedRent,
} from "@/lib/calculators";

function setQuery(values: Record<string, string>) {
  const p = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(values)) {
    if (v) p.set(k, v);
    else p.delete(k);
  }
  const qs = p.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

const longDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

export function NoticeCalculator() {
  const sp = useSearchParams();
  const [endDate, setEndDate] = useState(sp.get("endDate") ?? "");
  const [noticeDays, setNoticeDays] = useState(sp.get("noticeDays") ?? "30");
  const [rent, setRent] = useState(sp.get("rent") ?? "");
  const [moveIn, setMoveIn] = useState(sp.get("moveIn") ?? "");

  useEffect(() => {
    setQuery({ endDate, noticeDays, rent, moveIn });
  }, [endDate, noticeDays, rent, moveIn]);

  const end = parseDate(endDate);
  const days = Number(noticeDays);
  const notice =
    end && Number.isInteger(days) && days >= 0 && days <= 365 ? noticeDeadline(end, days) : null;

  const rentNum = Number(rent);
  const move = parseDate(moveIn);
  const prorate = move && rentNum > 0 ? proratedRent(rentNum, move) : null;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Notice deadline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="endDate">Lease end date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="noticeDays">Notice required (days)</Label>
              <Input
                id="noticeDays"
                type="number"
                min={0}
                max={365}
                value={noticeDays}
                onChange={(e) => setNoticeDays(e.target.value)}
              />
            </div>
          </div>
          {notice && (
            <div className="rounded-md border p-4" aria-live="polite">
              <p className="text-sm text-muted-foreground">Give written notice no later than</p>
              <p className="text-xl font-semibold">{longDate(notice.deadline)}</p>
              <p
                className={
                  notice.status === "passed"
                    ? "text-sm text-red-600"
                    : notice.daysUntilDeadline <= 14
                      ? "text-sm text-amber-600"
                      : "text-sm text-green-700"
                }
              >
                {notice.status === "passed"
                  ? `This deadline passed ${Math.abs(notice.daysUntilDeadline)} day(s) ago. Check your lease for auto-renewal terms.`
                  : notice.status === "today"
                    ? "That is today."
                    : `${notice.daysUntilDeadline} day(s) from today.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prorated first-month rent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="rent">Monthly rent ($)</Label>
              <Input id="rent" type="number" min={0} step="0.01" value={rent} onChange={(e) => setRent(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="moveIn">Move-in date</Label>
              <Input id="moveIn" type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} />
            </div>
          </div>
          {prorate && move && (
            <div className="rounded-md border p-4" aria-live="polite">
              <p className="text-xl font-semibold">{money(prorate.amount)}</p>
              <p className="text-sm text-muted-foreground">
                {prorate.daysCharged} of {prorate.daysInMonth} days in {formatISO(move).slice(0, 7)} at{" "}
                {money(prorate.dailyRate)}/day, counting the move-in day.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
