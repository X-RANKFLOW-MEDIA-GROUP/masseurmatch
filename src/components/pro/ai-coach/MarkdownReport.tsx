import type { ReactNode } from "react";

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      : part,
  );
}

function cells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isDivider(line: string) {
  return cells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parse(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length as 1 | 2 | 3, text: heading[2] });
      index += 1;
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && isDivider(lines[index + 1])) {
      const headers = cells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(cells(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        const match = isOrdered ? /^\d+\.\s+(.+)$/.exec(candidate) : /^[-*]\s+(.+)$/.exec(candidate);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (!candidate || /^(#{1,3})\s+/.test(candidate) || /^[-*]\s+/.test(candidate) || /^\d+\.\s+/.test(candidate)) break;
      if (candidate.includes("|") && index + 1 < lines.length && isDivider(lines[index + 1])) break;
      paragraph.push(candidate);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

export function MarkdownReport({ content }: { content: string }) {
  const blocks = parse(content);

  return (
    <div className="mt-3 space-y-3 text-sm leading-6 text-[#514B46]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const className = block.level === 1
            ? "text-xl font-semibold text-[#211D1A]"
            : block.level === 2
              ? "text-lg font-semibold text-[#2D2824]"
              : "text-base font-semibold text-[#3A342F]";
          const Tag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
          return <Tag key={index} className={className}>{inline(block.text)}</Tag>;
        }

        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={index} className={block.ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}
            </Tag>
          );
        }

        if (block.type === "table") {
          return (
            <div key={index} className="overflow-x-auto rounded-xl border border-[#E8E0DA]">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead className="bg-[#F8F4F0]">
                  <tr>{block.headers.map((header, cellIndex) => <th key={cellIndex} className="border-b border-[#E8E0DA] px-3 py-2 font-semibold text-[#3A342F]">{inline(header)}</th>)}</tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-[#EFE8E2] last:border-0">
                      {block.headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2 align-top">{inline(row[cellIndex] || "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <p key={index}>{inline(block.text)}</p>;
      })}
    </div>
  );
}
