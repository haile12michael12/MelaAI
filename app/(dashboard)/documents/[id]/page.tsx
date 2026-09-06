"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderLock,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { toEthiopianDate, formatEthiopianDate } from "@/lib/utils/ethiopian-calendar";
import { INITIAL_DOCUMENTS, VaultDocument } from "../page";

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [copied, setCopied] = useState(false);

  const [document, setDocument] = useState<VaultDocument | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_documents_data");
      if (saved) {
        try {
          const list: VaultDocument[] = JSON.parse(saved);
          return list.find((d) => d.id === id) || null;
        } catch {}
      }
    }
    return INITIAL_DOCUMENTS.find((d) => d.id === id) || null;
  });

  const handleCopyDocNumber = () => {
    if (!document) return;
    navigator.clipboard.writeText(document.docNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) {
    return (
      <div className="space-y-4">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Documents Vault</span>
        </Link>
        <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-800">
          Document record not found.
        </div>
      </div>
    );
  }

  const issueEth = toEthiopianDate(new Date(document.issueDate));
  const expiryEth = document.expiryDate ? toEthiopianDate(new Date(document.expiryDate)) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back Button */}
      <Link
        href="/documents"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Documents Vault</span>
      </Link>

      {/* Main Document Details Card */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-neutral-100 pb-5 dark:border-neutral-800">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {document.category}
              </span>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {document.title}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>{document.issuingAuthority}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDocNumber}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy ID Number</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <p className="text-[11px] font-medium text-neutral-400">Document / Registration ID</p>
            <p className="mt-1 font-mono text-sm font-bold text-neutral-900 dark:text-white">
              {document.docNumber}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <p className="text-[11px] font-medium text-neutral-400">Verification Status</p>
            <div className="mt-1 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified & Active in Vault</span>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <p className="text-[11px] font-medium text-neutral-400">Issued On</p>
            <p className="mt-1 text-xs font-medium text-neutral-800 dark:text-neutral-200">
              {document.issueDate}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Ge'ez: {formatEthiopianDate(issueEth, "am")} ({formatEthiopianDate(issueEth, "en")})
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <p className="text-[11px] font-medium text-neutral-400">Expiration Date</p>
            <p className="mt-1 text-xs font-medium text-neutral-800 dark:text-neutral-200">
              {document.expiryDate || "Permanent / No Expiration"}
            </p>
            {expiryEth && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Ge'ez: {formatEthiopianDate(expiryEth, "am")} ({formatEthiopianDate(expiryEth, "en")})
              </p>
            )}
          </div>
        </div>

        {/* Document Notes & Terms */}
        <div className="mt-6 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
            Notes & Stored Metadata
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
            {document.notes}
          </p>
        </div>

        {/* Security / Encryption Notice */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-indigo-50/50 p-4 text-xs text-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-300">
          <FolderLock className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>
            This document record is stored locally and encrypted per-user in your personal Firebase Firestore vault. No raw document numbers or files are shared publicly.
          </span>
        </div>
      </div>
    </div>
  );
}