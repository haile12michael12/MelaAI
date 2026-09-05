"use client";

import React from "react";
import { AlertTriangle, Check, X } from "lucide-react";

export interface ActionConfirmationProps {
  action: string;
  preview?: Record<string, any>;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ActionConfirmation({
  action,
  preview,
  message,
  onConfirm,
  onCancel,
  loading,
}: ActionConfirmationProps) {
  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm backdrop-blur-md dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <h4 className="text-xs font-bold uppercase tracking-wide">Action Confirmation Required</h4>
      </div>

      <p className="mt-1.5 text-xs text-amber-900 dark:text-amber-200">
        {message || `MELA is requesting to execute: ${action}`}
      </p>

      {preview && Object.keys(preview).length > 0 && (
        <div className="mt-2.5 rounded-xl border border-amber-200/80 bg-white/60 p-2.5 font-mono text-[11px] text-neutral-800 dark:border-amber-900/40 dark:bg-neutral-900/60 dark:text-neutral-200">
          <span className="font-semibold text-neutral-500">Parameters:</span>
          <pre className="mt-1 overflow-x-auto">{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700 disabled:opacity-50"
        >
          <Check className="h-3 w-3" />
          {loading ? "Executing..." : "Confirm & Execute"}
        </button>
      </div>
    </div>
  );
}
