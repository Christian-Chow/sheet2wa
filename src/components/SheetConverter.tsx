"use client";

import { useState } from "react";
import { AlertIcon, CheckIcon, ClipboardIcon, TableIcon } from "./icons";
import { buildWhatsAppMessage } from "@/lib/transform";
import { format } from "@/lib/format";
import type { Dictionary } from "@/lib/dictionaries";

export default function SheetConverter({ t }: { t: Dictionary["converter"] }) {
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const result = buildWhatsAppMessage(raw);
    if (!result.ok) {
      setMessage("");
      setRowCount(0);
      setError(t.errors[result.errorCode]);
      setCopied(false);
      return;
    }
    setMessage(result.message);
    setRowCount(result.rowCount);
    setError(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
          <TableIcon className="h-4 w-4 text-slate-400" />
          {t.step1Title}
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={t.pastePlaceholder}
          rows={12}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#BFB378] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BFB378]/20"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!raw.trim()}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-[#BFB378] to-[#998F60] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-[#BFB378]/20 transition-transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {t.generateButton}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ClipboardIcon className="h-4 w-4 text-slate-400" />
            {t.step2Title}
          </div>
          {rowCount > 0 && (
            <span className="rounded-full bg-[#F3F1E4] px-2.5 py-0.5 text-xs font-medium text-[#7C744E]">
              {format(rowCount === 1 ? t.rowCount.one : t.rowCount.other, { count: rowCount })}
            </span>
          )}
        </div>
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <textarea
          value={message}
          readOnly
          placeholder={t.outputPlaceholder}
          rows={12}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!message}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-[#BFB378] hover:text-[#998F60] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 text-emerald-600" />
              {t.copiedButton}
            </>
          ) : (
            <>
              <ClipboardIcon className="h-4 w-4" />
              {t.copyButton}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
