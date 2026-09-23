"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, Code } from "lucide-react";
import Link from "next/link";
import { Citation } from "@/types";

interface MarkdownRendererProps {
  content: string;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  citations = [],
  onCitationClick,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Pre-process content to handle citations [1], [2] cleanly
  const renderInlineFormatted = (text: string) => {
    // Regex to split on citation markers like [1], [2], or bold **text**, or `code`
    const parts = text.split(/(\[\d+\]|\*\*.*?\*\*|\`.*?\`)/g);

    return parts.map((part, idx) => {
      // Citation badge match: [1], [2], etc.
      const citeMatch = part.match(/^\[(\d+)\]$/);
      if (citeMatch) {
        const citeNum = parseInt(citeMatch[1], 10);
        const citation = citations[citeNum - 1];

        return (
          <span
            key={idx}
            onClick={() => citation && onCitationClick && onCitationClick(citation)}
            className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded-md bg-blue-100/80 hover:bg-blue-200 text-blue-800 font-bold text-[11px] cursor-pointer border border-blue-200 transition shadow-2xs group relative"
            title={citation ? `${citation.paper_title} (Page ${citation.page_number})` : `Citation [${citeNum}]`}
          >
            <span>[{citeNum}]</span>
          </span>
        );
      }

      // Bold match: **text**
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={idx} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Inline code match: `code`
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded-md bg-slate-100 text-blue-700 font-mono text-[11px] border border-slate-200 font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  // Parse lines for headers, lists, codeblocks, blockquotes
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="space-y-1.5 my-2.5 pl-1">
          {currentList.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start space-x-2 text-slate-700 text-xs md:text-sm leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <div className="flex-1">{renderInlineFormatted(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushCode = (key: number) => {
    if (inCodeBlock) {
      const fullCode = codeBuffer.join("\n");
      elements.push(
        <div key={`code-${key}`} className="my-3 rounded-2xl bg-slate-900 text-slate-100 p-4 border border-slate-800 text-xs font-mono shadow-md overflow-hidden relative group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400 text-[11px]">
            <span>{codeLang || "Code snippet"}</span>
            <button
              onClick={() => handleCopyCode(fullCode)}
              className="flex items-center space-x-1 hover:text-white transition px-2 py-0.5 rounded bg-slate-800 text-[10px]"
            >
              {copiedCode === fullCode ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto leading-relaxed">{fullCode}</pre>
        </div>
      );
      inCodeBlock = false;
      codeBuffer = [];
      codeLang = "";
    }
  };

  lines.forEach((line, index) => {
    // Code block delimiters
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        flushList(index);
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, "").trim();
      } else {
        flushCode(index);
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList(index);
      elements.push(
        <h3 key={index} className="text-sm font-extrabold text-slate-900 mt-4 mb-1.5 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
          {renderInlineFormatted(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList(index);
      elements.push(
        <h2 key={index} className="text-base font-black text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-100 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-lg bg-blue-600 inline-block shadow-2xs" />
          {renderInlineFormatted(trimmed.replace(/^##\s+/, ""))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      flushList(index);
      elements.push(
        <h1 key={index} className="text-lg font-black text-slate-900 mt-6 mb-2">
          {renderInlineFormatted(trimmed.replace(/^#\s+/, ""))}
        </h1>
      );
      return;
    }

    // Bullet Lists (handling -, *, or hashtags mistakenly used as bullets)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      currentList.push(trimmed.replace(/^[-*•]\s+/, ""));
      return;
    }

    // Numbered Lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      flushList(index);
      elements.push(
        <div key={index} className="flex items-start space-x-2 my-1.5 text-xs md:text-sm text-slate-700 leading-relaxed">
          <span className="font-extrabold text-blue-600 bg-blue-50 border border-blue-200/80 rounded-md px-1.5 py-0.5 text-[10px] shrink-0 font-mono">
            {numMatch[1]}
          </span>
          <div className="flex-1">{renderInlineFormatted(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList(index);
      elements.push(
        <blockquote key={index} className="border-l-4 border-blue-500 bg-blue-50/50 pl-3.5 py-2 my-2 text-xs md:text-sm italic text-slate-700 rounded-r-xl">
          {renderInlineFormatted(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      flushList(index);
      return;
    }

    // Standard paragraph
    flushList(index);
    elements.push(
      <p key={index} className="text-xs md:text-sm text-slate-700 leading-relaxed my-2">
        {renderInlineFormatted(line)}
      </p>
    );
  });

  flushList(lines.length);
  flushCode(lines.length);

  return <div className="space-y-1">{elements}</div>;
};
