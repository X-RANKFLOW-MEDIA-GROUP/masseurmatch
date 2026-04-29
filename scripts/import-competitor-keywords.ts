import fs from "node:fs";
import path from "node:path";
import {
  canUseKeywordPublicly,
  classifyKeyword,
  normalizeKeyword,
  type ImportedKeyword,
} from "../src/lib/seo/competitorKeywords";

type ParsedRow = ImportedKeyword & {
  normalized: string;
  classification: ReturnType<typeof classifyKeyword>;
  publicEligible: boolean;
};

function parseCsv(input: string): ImportedKeyword[] {
  const lines = input.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const get = (field: string) => {
      const idx = headers.indexOf(field);
      return idx >= 0 ? cells[idx]?.trim() : undefined;
    };
    return {
      keyword: get("keyword") ?? "",
      volume: Number(get("volume") ?? 0) || 0,
      kd: Number(get("kd") ?? 0) || 0,
      cpc: Number(get("cpc") ?? 0) || 0,
      position: Number(get("position") ?? 0) || 0,
      url: get("url"),
      intent: get("intent"),
      source: get("source"),
      competitor: get("competitor"),
    };
  }).filter((row) => row.keyword.length > 0);
}

function main() {
  const inputPath = process.argv[2];
  const fallbackCsv = `keyword,volume,kd,cpc,position,url,intent,source,competitor\nmasseurfinder alternative,90,22,1.2,8,/massage-directories/masseurfinder-alternative,commercial,manual,masseurfinder\nrent massuer alternative,40,19,1.1,12,/massage-directories/rentmasseur-alternative,commercial,manual,rentmasseur`;
  const csv = inputPath
    ? fs.readFileSync(path.resolve(process.cwd(), inputPath), "utf8")
    : fallbackCsv;
  const parsed = parseCsv(csv);

  const enriched: ParsedRow[] = parsed.map((row) => {
    const normalized = normalizeKeyword(row.keyword);
    const classification = classifyKeyword(row.keyword, row.competitor);
    return {
      ...row,
      normalized,
      classification,
      publicEligible: canUseKeywordPublicly(classification),
    };
  });

  const summary = {
    total: enriched.length,
    byClassification: enriched.reduce<Record<string, number>>((acc, row) => {
      acc[row.classification] = (acc[row.classification] ?? 0) + 1;
      return acc;
    }, {}),
    blocked: enriched.filter((row) => !row.publicEligible),
  };

  const outputPath = path.resolve(process.cwd(), "tmp/competitor-keywords.normalized.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ summary, rows: enriched }, null, 2));

  console.log(`[seo:competitors] imported ${summary.total} keywords`);
  console.log(`[seo:competitors] output: ${outputPath}`);
}

main();
