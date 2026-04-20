"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ValidationResult = {
  email: string;
  status: "VALID" | "RISKY" | "INVALID";
  reason: string;
};

const STATUS_STYLES: Record<ValidationResult["status"], string> = {
  VALID: "bg-green-100 text-green-800",
  RISKY: "bg-yellow-100 text-yellow-800",
  INVALID: "bg-red-100 text-red-800",
};

export default function ValidatePage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleValidate() {
    const emails = input
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (!emails.length) return;

    setLoading(true);
    const res = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    const data = await res.json();
    setResults(data.results);
    setLoading(false);
  }

  const counts = results.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email Validation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste emails below (one per line or comma-separated). Each email is
          checked for format, MX records, and disposable domains.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="john@example.com&#10;jane@gmail.com&#10;test@mailinator.com"
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={handleValidate} disabled={loading}>
            {loading ? "Validating..." : "Validate Emails"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="flex gap-3">
            {(["VALID", "RISKY", "INVALID"] as const).map((s) => (
              <Card key={s} className="flex-1">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {s}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <span className="text-2xl font-bold">{counts[s] ?? 0}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.email}>
                      <TableCell className="font-mono text-sm">
                        {r.email}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[r.status]}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
