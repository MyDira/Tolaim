import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A deliberately small markdown renderer.
 *
 * Admin-authored bodies use four things: paragraphs, bold, links and lists.
 * A full markdown library plus a sanitiser is a lot of dependency and a lot of
 * ongoing patching for that. This renders to React elements rather than an
 * HTML string, so there is no `dangerouslySetInnerHTML` anywhere on the site
 * and nothing an author types can become markup.
 */

type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

function parse(source: string): Block[] {
  const blocks: Block[] = [];

  for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n").map((l) => l.trim());

    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      blocks.push({ kind: "ul", items: lines.map((l) => l.replace(/^[-*]\s+/, "")) });
      continue;
    }

    if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      blocks.push({ kind: "ol", items: lines.map((l) => l.replace(/^\d+[.)]\s+/, "")) });
      continue;
    }

    if (/^#{1,6}\s+/.test(lines[0]) && lines.length === 1) {
      blocks.push({ kind: "h", text: lines[0].replace(/^#{1,6}\s+/, "") });
      continue;
    }

    // A paragraph that is entirely bold is used as a run-in heading.
    const joined = lines.join(" ");
    const wholeBold = joined.match(/^\*\*(.+)\*\*$/);
    if (wholeBold) {
      blocks.push({ kind: "h", text: wholeBold[1] });
      continue;
    }

    blocks.push({ kind: "p", text: joined });
  }

  return blocks;
}

/** Inline: `**bold**` and `[text](href)`. Everything else is literal text. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${index}`}>{match[1]}</strong>);
    } else {
      const [, , label, href] = match;
      const external = /^https?:\/\//.test(href);
      nodes.push(
        external ? (
          <a key={`${keyPrefix}-a${index}`} href={href} rel="noopener noreferrer" target="_blank" data-print-url={href}>
            {label}
          </a>
        ) : (
          <Link key={`${keyPrefix}-a${index}`} href={href}>
            {label}
          </Link>
        ),
      );
    }

    cursor = match.index + match[0].length;
    index += 1;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  const blocks = parse(source);
  if (blocks.length === 0) return null;

  return (
    <div className={`rich ${className}`}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "h":
            return <h3 key={i}>{inline(block.text, `h${i}`)}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item, `u${i}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item, `o${i}-${j}`)}</li>
                ))}
              </ol>
            );
          default:
            return <p key={i}>{inline(block.text, `p${i}`)}</p>;
        }
      })}
    </div>
  );
}
