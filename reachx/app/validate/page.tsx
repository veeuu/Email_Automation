"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";

type ValidationResult = {
  email: string;
  status: "VALID" | "RISKY" | "INVALID";
  reason: string;
};

const STATUS_STYLES: Record<ValidationResult["status"], string> = {
  VALID: "bg-green-100 text-green-700 border-green-200",
  RISKY: "bg-amber-100 text-amber-700 border-amber-200",
  INVALID: "bg-red-100 text-red-700 border-red-200",
};

export default function ValidatePage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleValidate() {
    const emails = input.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">R</div>
            <span className="text-xl font-bold text-gray-900">ReachX</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard →
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Validation</h1>
          <p className="text-gray-500 mt-2">
            Paste emails below (one per line or comma-separated). Each email is checked for format, MX records, and mailbox existence.
          </p>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="john@example.com&#10;jane@gmail.com&#10;test@mailinator.com"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-gray-50 border-gray-200 rounded-xl font-mono text-sm focus-visible:ring-blue-500"
            />
            <Button
              onClick={handleValidate}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 border-0"
            >
              {loading ? "Validating..." : "Validate Emails →"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <>
            <div className="flex gap-3">
              {(["VALID", "RISKY", "INVALID"] as const).map((s) => (
                <Card key={s} className="flex-1 border-gray-200 shadow-sm">
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <span className={`text-2xl font-bold ${s === "VALID" ? "text-green-600" : s === "RISKY" ? "text-amber-600" : "text-red-600"}`}>
                      {counts[s] ?? 0}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100">
                      <TableHead className="text-gray-600">Email</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.email} className="border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-mono text-sm text-gray-700">{r.email}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_STYLES[r.status]} border text-xs font-medium`}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{r.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
