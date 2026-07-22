import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as ts from "typescript";

const SOURCE_ROOT = path.join(process.cwd(), "src");
const SESSION_CALLS = new Set(["getRequestSession", "requireRequestSession"]);
const EXTENSIONS = new Set([".ts", ".tsx"]);

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(fullPath)));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function nearestFunction(node) {
  let current = node.parent;
  while (current) {
    if (ts.isFunctionLike(current)) return current;
    current = current.parent;
  }
  return null;
}

function isAsyncFunction(node) {
  if (!ts.canHaveModifiers(node)) return false;
  return Boolean(ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword));
}

function scriptKindFor(filePath) {
  return filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

async function normalizeFile(filePath) {
  const original = await readFile(filePath, "utf8");
  const source = ts.createSourceFile(
    filePath,
    original,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(filePath),
  );

  const insertions = new Set();
  const unsafe = [];

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      SESSION_CALLS.has(node.expression.text) &&
      !ts.isAwaitExpression(node.parent)
    ) {
      const owner = nearestFunction(node);
      if (owner && isAsyncFunction(owner)) {
        insertions.add(node.getStart(source));
      } else {
        const location = source.getLineAndCharacterOfPosition(node.getStart(source));
        unsafe.push(`${path.relative(process.cwd(), filePath)}:${location.line + 1}:${location.character + 1}`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(source);

  if (unsafe.length > 0) {
    throw new Error(
      `Session calls require manual async conversion:\n${unsafe.map((entry) => `- ${entry}`).join("\n")}`,
    );
  }

  if (insertions.size === 0) return 0;

  let updated = original;
  for (const position of [...insertions].sort((a, b) => b - a)) {
    updated = `${updated.slice(0, position)}await ${updated.slice(position)}`;
  }

  await writeFile(filePath, updated, "utf8");
  return insertions.size;
}

const files = await collectSourceFiles(SOURCE_ROOT);
let changedCalls = 0;
let changedFiles = 0;

for (const file of files) {
  const count = await normalizeFile(file);
  if (count > 0) {
    changedCalls += count;
    changedFiles += 1;
  }
}

console.log(
  changedCalls > 0
    ? `[async-sessions] normalized ${changedCalls} call(s) across ${changedFiles} file(s).`
    : "[async-sessions] all session calls are already awaited.",
);
