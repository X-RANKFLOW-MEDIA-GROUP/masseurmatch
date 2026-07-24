#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appRoot = path.join(root, "src", "app");
const args = process.argv.slice(2);

function getArg(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const jsonOutput = getArg("--json", "artifacts/orphan-pages-report.json");
const markdownOutput = getArg("--markdown", "artifacts/or