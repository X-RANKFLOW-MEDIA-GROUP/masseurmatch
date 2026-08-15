"use client";

import { useMemo, useRef, useState } from "react";
import { FileUp, Loader2, UploadCloud, X } from "lucide-react";

import { requestJson } from "@/app/_lib/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ParsedRow = {
  phone: string;
  name?: string | null;
  city?: string | null;
  state?: string | null;
  timezone?: string | null;
  profileUrl?: string | null;
  textMessage?: string | null;
};

type ImportResult = {
  ok: boolean;
  received: number;
  inserted: number;
  updated: number;
  skipped: number;
  invalid: Array<{ row: number; phone: string }>;
  duplicatesInsideFile: number;
  protectedOptOuts: number;
  errors: Array<{ row: number; phone: string; error: string }>;
};

const HEADER_ALIASES: Record<string, keyof ParsedRow> = {
  phone: "phone",
  phone_number: "phone",
  mobile: "phone",
  telephone: "phone",
  name: "name",
  full_name: "name",
  first_name: "name",
  city: "city",
  state: "state",
  timezone: "timezone",
  time_zone: "timezone",
  profile_url: "profileUrl",
  url: "profileUrl",
  text_message: "textMessage",
  message: "textMessage",
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines: string[] = [];
  let buffer = "";
  let quoted = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    if (char === '"') {
      if (quoted && normalized[index + 1] === '"') {
        buffer += '""';
        index += 1;
        continue;
      }
      quoted = !quoted;
    }
    if (char === "\n" && !quoted) {
      if (buffer.trim()) lines.push(buffer);
      buffer = "";
      continue;
    }
    buffer += char;
  }
  if (buffer.trim()) lines.push(buffer);
  if (lines.length < 2) throw new Error("CSV needs a header row and at least one contact.");

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_"));
  const mappedHeaders = headers.map((header) => HEADER_ALIASES[header] || null);
  if (!mappedHeaders.includes("phone")) throw new Error("CSV must contain a phone column.");

  const rows: ParsedRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const row: ParsedRow = { phone: "" };
    mappedHeaders.forEach((key, index) => {
      if (!key) return;
      const value = cells[index]?.trim() || "";
      if (value) row[key] = value;
    });
    if (row.phone || row.name) rows.push(row);
  }
  return rows;
}

export default function CsvContactsImport({ onImported }: { onImported: () => void | Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [duplicateMode, setDuplicateMode] = useState<"skip" | "update">("skip");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const preview = useMemo(() => rows.slice(0, 8), [rows]);

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    try {
      setError("");
      setResult(null);
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.length > 10000) throw new Error("Maximum 10,000 contacts per CSV.");
      setRows(parsed);
      setFileName(file.name);
    } catch (err) {
      setRows([]);
      setFileName("");
      setError(err instanceof Error ? err.message : "Could not read CSV.");
    }
  }

  async function importRows() {
    if (rows.length === 0) return;
    setImporting(true);
    setError("");
    setResult(null);
    try {
      const totals: ImportResult = {
        ok: true,
        received: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        invalid: [],
        duplicatesInsideFile: 0,
        protectedOptOuts: 0,
        errors: [],
      };

      for (let start = 0; start < rows.length; start += 250) {
        const batch = rows.slice(start, start + 250);
        const response = await requestJson<ImportResult>("/api/admin/messaging/import", {
          method: "POST",
          body: JSON.stringify({ rows: batch, duplicateMode, source: `admin_csv:${fileName || "upload"}` }),
        });
        totals.received += response.received;
        totals.inserted += response.inserted;
        totals.updated += response.updated;
        totals.skipped += response.skipped;
        totals.duplicatesInsideFile += response.duplicatesInsideFile;
        totals.protectedOptOuts += response.protectedOptOuts;
        totals.invalid.push(...response.invalid.map((item) => ({ ...item, row: item.row + start })));
        totals.errors.push(...response.errors.map((item) => ({ ...item, row: item.row + start })));
      }

      setResult(totals);
      await onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setRows([]);
    setFileName("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><FileUp className="h-4 w-4" />Upload contacts CSV</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Required: phone. Optional: name, city, state, timezone, profile_url, text_message.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={inputRef} className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => void chooseFile(event.target.files?.[0])} />
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={importing}>
              <UploadCloud className="mr-2 h-4 w-4" />Choose CSV
            </Button>
            {rows.length > 0 ? <Button type="button" variant="ghost" onClick={reset} disabled={importing}><X className="mr-2 h-4 w-4" />Clear</Button> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        {rows.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">{fileName}</Badge>
              <Badge variant="outline">{rows.length.toLocaleString()} contacts</Badge>
              <span className="text-slate-500">Duplicates already in MasseurMatch:</span>
              <Button type="button" size="sm" variant={duplicateMode === "skip" ? "default" : "outline"} onClick={() => setDuplicateMode("skip")}>Skip</Button>
              <Button type="button" size="sm" variant={duplicateMode === "update" ? "default" : "outline"} onClick={() => setDuplicateMode("update")}>Update</Button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">City</th><th className="px-3 py-2">State</th><th className="px-3 py-2">Message</th></tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={`${row.phone}-${index}`} className="border-t">
                      <td className="px-3 py-2">{row.name || ""}</td><td className="px-3 py-2 font-mono text-xs">{row.phone}</td><td className="px-3 py-2">{row.city || ""}</td><td className="px-3 py-2">{row.state || ""}</td><td className="max-w-[320px] truncate px-3 py-2">{row.textMessage || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > preview.length ? <p className="text-xs text-slate-500">Previewing first {preview.length} of {rows.length.toLocaleString()} rows.</p> : null}

            <Button type="button" onClick={() => void importRows()} disabled={importing}>
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {importing ? "Importing..." : `Import ${rows.length.toLocaleString()} contacts`}
            </Button>
          </>
        ) : null}

        {result ? (
          <div className="rounded-lg border bg-slate-50 p-3 text-sm">
            <p className="font-medium">Import complete</p>
            <p className="mt-1 text-slate-600">Inserted {result.inserted} · Updated {result.updated} · Skipped {result.skipped} · Invalid {result.invalid.length} · Errors {result.errors.length}</p>
            {result.protectedOptOuts > 0 ? <p className="mt-1 text-amber-700">{result.protectedOptOuts} existing opt outs remained protected.</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
