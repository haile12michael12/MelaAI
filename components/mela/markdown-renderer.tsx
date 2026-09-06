"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple, robust markdown chunk parser
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = "";
    let codeIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("```")) {
        if (inCodeBlock) {
          const codeString = codeBuffer.join("\n");
          const idx = codeIndex++;
          elements.push(
            <div key={`code-${idx}`} className="my-3 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-4 py-1.5 text-xs text-neutral-400">
                <span className="font-mono text-[11px]">{codeLang || "text"}</span>
                <button
                  onClick={() => handleCopyCode(codeString, idx)}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition hover:bg-neutral-800 hover:text-white"
                >
                  {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.replace("```", "").trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.startsWith("### ")) {
        elements.push(<h4 key={i} className="mt-3 mb-1 text-sm font-bold text-neutral-900 dark:text-white">{line.replace("### ", "")}</h4>);
      } else if (line.startsWith("## ")) {
        elements.push(<h3 key={i} className="mt-4 mb-1.5 text-base font-bold text-neutral-900 dark:text-white">{line.replace("## ", "")}</h3>);
      } else if (line.startsWith("# ")) {
        elements.push(<h2 key={i} className="mt-5 mb-2 text-lg font-bold text-neutral-900 dark:text-white">{line.replace("# ", "")}</h2>);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={i} className="ml-4 list-disc text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
            {formatInline(line.substring(2))}
          </li>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
            {formatInline(line)}
          </p>
        );
      }
    }

    return elements;
  };

  const formatInline = (text: string): React.ReactNode => {
    // Bold formatting: **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-neutral-950 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[11px] text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return <div className="space-y-1">{parseMarkdown(content)}</div>;
}
