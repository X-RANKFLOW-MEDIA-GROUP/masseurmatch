import fs from "node:fs";
import path from "node:path";

const KEYWORD_NORMALIZATION_MAP = {
  "rent massuer": "rentmasseur",
  "rent masseur": "rentmasseur",
  massuerfinder: "masseurfinder",
  "masseur finder": "masseurfinder",
};

const UNSAFE_TERMS = ["escort", "erotic", "nuru", "sensual", "xxx", "adult", "explicit"];

function normalizeKeyword(raw) {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return KEYWORD_NORMALIZATION_MAP[cleaned] ?? cleaned;
}

function classifyKeyword(keyword, competitor = "") {
  const normalized = normalizeKeyword(keyword);
  if (UNSAFE_TERMS.some((term) => normalized.includes(term))) return "unsafe adult";
  if (competitor === "rentmen") return "blocked competitor";
  if (normalized.includes("alternative") || normalized.includes("vs") || normalized.includes("sites like")) return "brand alternative";
  if (Object.keys(KEYWORD_NORMALIZATION_MAP).includes(keyword.trim().toLowerCase())) return "misspelling";
  if (normalized.includes("directory") || normalized.includes("massage therapist")) return "safe informational";
  return "safe commercial";
}

function canUseKeywordPublicly(classification) {
  return ["safe commercial", "safe informational", "brand alternative", "misspelling"].includes(classification);
}

function parseCsv(input) {
  const lines = input.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const get = (field) => {
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

const inputPath = process.argv[2];
const fallbackCsv = `keyword,volume,kd,cpc,position,url,intent,source,competitor\nmasseurfinder alternative,90,22,1.2,8,/massage-directories/masseurfinder-alternative,commercial,manual,masseurfinder\nrent massuer alternative,40,19,1.1,12,/massage-directories/rentmasseur-alternative,commercial,manual,rentmasseur`;
const csv = inputPath ? fs.readFileSync(path.resolve(process.cwd(), inputPath), "utf8") : fallbackCsv;
const parsed = parseCsv(csv);
const rows = parsed.map((row) => {
  const normalized = normalizeKeyword(row.keyword);
  const classification = classifyKeyword(row.keyword, row.competitor);
  return { ...row, normalized, classification, publicEligible: canUseKeywordPublicly(classification) };
});
const summary = {
  total: rows.length,
  byClassification: rows.reduce((acc, row) => ((acc[row.classification] = (acc[row.classification] ?? 0) + 1), acc), {}),
  blocked: rows.filter((row) => !row.publicEligible),
};
const outputPath = path.resolve(process.cwd(), "tmp/competitor-keywords.normalized.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify({ summary, rows }, null, 2));
console.log(`[seo:competitors] imported ${summary.total} keywords`);
console.log(`[seo:competitors] output: ${outputPath}`);
