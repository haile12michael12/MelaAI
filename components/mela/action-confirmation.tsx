import React from "react";

export function ActionConfirmation({ action, onConfirm, onCancel }: { action: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Confirm Action: {action}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={onConfirm} className="rounded bg-amber-600 px-3 py-1 text-xs text-white">Confirm</button>
        <button onClick={onCancel} className="rounded border border-amber-300 px-3 py-1 text-xs text-amber-900 dark:border-amber-800 dark:text-amber-200">Cancel</button>
      </div>
    </div>
  );
}
