"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FolderLock,
  Plus,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  ExternalLink,
  ShieldCheck,
  Download,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import { toEthiopianDate, formatEthiopianDate } from "@/lib/utils/ethiopian-calendar";

export interface VaultDocument {
  id: string;
  title: string;
  category:
    | "National ID & Kebele"
    | "Tax & TIN"
    | "Business & Trade"
    | "Lease & Real Estate"
    | "Banking & Equb"
    | "Vehicles & Transport"
    | "Certificates & Degrees";
  docNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string | null;
  notes: string;
  fileSize?: string;
  fileType?: string;
}

export const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: "doc-1",
    title: "Ethiopian National Digital ID (Fayda)",
    category: "National ID & Kebele",
    docNumber: "ET-NID-9481-0294",
    issuingAuthority: "National ID Program (NIDP Ethiopia)",
    issueDate: "2024-03-15",
    expiryDate: "2034-03-15",
    notes: "Primary verified biometrics digital identity. Registered in Addis Ababa.",
    fileSize: "1.4 MB",
    fileType: "PDF",
  },
  {
    id: "doc-2",
    title: "Taxpayer Identification Certificate (TIN)",
    category: "Tax & TIN",
    docNumber: "TIN-009281745",
    issuingAuthority: "Ministry of Revenue (የገቢዎች ሚኒስቴር)",
    issueDate: "2022-06-10",
    expiryDate: null,
    notes: "Permanent personal tax identification number for income and freelance declarations.",
    fileSize: "840 KB",
    fileType: "PDF",
  },
  {
    id: "doc-3",
    title: "Bole Residential Lease Agreement (የቤት ኪራይ ውል)",
    category: "Lease & Real Estate",
    docNumber: "LEASE-2025-AA-77",
    issuingAuthority: "Bole Sub-City Administration (የቦሌ ክፍለ ከተማ ውልና ማስረጃ)",
    issueDate: "2025-01-01",
    expiryDate: "2026-12-31",
    notes: "Annual residential contract: 25,000 ETB/month payable quarterly via CBE Birr.",
    fileSize: "2.1 MB",
    fileType: "PDF",
  },
  {
    id: "doc-4",
    title: "Abyssinia Business Equb Bylaws & Member Agreement",
    category: "Banking & Equb",
    docNumber: "EQUB-ABYS-2026-04",
    issuingAuthority: "Abyssinia Equb Steering Committee",
    issueDate: "2026-01-10",
    expiryDate: "2026-10-30",
    notes: "Signed commitment for 5,000 ETB monthly deposit. Turn cycle: Round 4.",
    fileSize: "520 KB",
    fileType: "PDF",
  },
  {
    id: "doc-5",
    title: "Driving License - Grade 3 (የመንጃ ፈቃድ)",
    category: "Vehicles & Transport",
    docNumber: "DL-ETH-AA-38491",
    issuingAuthority: "Federal Transport Authority",
    issueDate: "2023-09-20",
    expiryDate: "2026-09-20",
    notes: "Light vehicles license. Scheduled for renewal at the end of Meskerem.",
    fileSize: "980 KB",
    fileType: "PDF",
  },
];

const CATEGORIES = [
  "All",
  "National ID & Kebele",
  "Tax & TIN",
  "Business & Trade",
  "Lease & Real Estate",
  "Banking & Equb",
  "Vehicles & Transport",
  "Certificates & Degrees",
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_documents_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_DOCUMENTS;
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Valid" | "Expiring Soon" | "Expired">("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new document
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<VaultDocument["category"]>("National ID & Kebele");
  const [newDocNumber, setNewDocNumber] = useState("");
  const [newAuthority, setNewAuthority] = useState("");
  const [newIssueDate, setNewIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mela_documents_data", JSON.stringify(documents));
    }
  }, [documents]);

  const getDocStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { label: "Permanent / Valid", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300" };
    const expiry = new Date(expiryDate).getTime();
    const now = Date.now();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { label: "Expired", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300" };
    }
    if (daysLeft <= 60) {
      return { label: `Expires in ${daysLeft}d`, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300" };
    }
    return { label: "Valid", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300" };
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCat = selectedCategory === "All" || doc.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        doc.title.toLowerCase().includes(q) ||
        doc.docNumber.toLowerCase().includes(q) ||
        doc.issuingAuthority.toLowerCase().includes(q) ||
        doc.notes.toLowerCase().includes(q);

      const status = getDocStatus(doc.expiryDate).label;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Expired" && status === "Expired") ||
        (statusFilter === "Expiring Soon" && status.includes("Expires in")) ||
        (statusFilter === "Valid" && (status === "Valid" || status.includes("Permanent")));

      return matchesCat && matchesSearch && matchesStatus;
    });
  }, [documents, selectedCategory, searchQuery, statusFilter]);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDocNumber.trim()) return;

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      docNumber: newDocNumber.trim(),
      issuingAuthority: newAuthority.trim() || "Official Authority",
      issueDate: newIssueDate,
      expiryDate: newExpiryDate ? newExpiryDate : null,
      notes: newNotes.trim(),
      fileSize: "1.2 MB",
      fileType: "PDF",
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setIsAddModalOpen(false);
    // Reset form
    setNewTitle("");
    setNewDocNumber("");
    setNewAuthority("");
    setNewExpiryDate("");
    setNewNotes("");
  };

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to delete this document from your secure vault?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FolderLock className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Documents & Vault
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Secure vault for Ethiopian IDs (Fayda/Kebele), TIN certificates, lease contracts, and Equb bylaws
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document (ሰነድ መዝግብ)</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Total Documents</span>
            <FolderLock className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {documents.length}
          </p>
          <p className="text-[11px] text-neutral-400">Encrypted in personal vault</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Active & Valid</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {documents.filter((d) => !d.expiryDate || new Date(d.expiryDate).getTime() > Date.now()).length}
          </p>
          <p className="text-[11px] text-neutral-400">Verified status</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Expiring Soon</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {
              documents.filter((d) => {
                if (!d.expiryDate) return false;
                const days = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return days > 0 && days <= 60;
              }).length
            }
          </p>
          <p className="text-[11px] text-neutral-400">Action needed within 60 days</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Government & Legal</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {documents.filter((d) => d.category === "National ID & Kebele" || d.category === "Tax & TIN").length}
          </p>
          <p className="text-[11px] text-neutral-400">Fayda / TIN / Kebele</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, document ID, issuing agency, or keywords..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-neutral-400 font-medium">Status:</span>
            {(["All", "Valid", "Expiring Soon", "Expired"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                selectedCategory === cat
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => {
          const status = getDocStatus(doc.expiryDate);
          const issueEth = toEthiopianDate(new Date(doc.issueDate));
          const expiryEth = doc.expiryDate ? toEthiopianDate(new Date(doc.expiryDate)) : null;

          return (
            <div
              key={doc.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition hover:border-indigo-300 dark:border-neutral-800/80 dark:bg-neutral-900 dark:hover:border-indigo-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {doc.category}
                      </span>
                      <h3 className="line-clamp-1 text-sm font-bold text-neutral-900 dark:text-white">
                        {doc.title}
                      </h3>
                    </div>
                  </div>

                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Doc ID Badge */}
                <div className="mt-3 rounded-xl bg-neutral-50 p-2.5 font-mono text-xs font-semibold text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-200">
                  {doc.docNumber}
                </div>

                {/* Authority & Notes */}
                <div className="mt-3 space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{doc.issuingAuthority}</span>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-neutral-400 pt-1">{doc.notes}</p>
                </div>
              </div>

              {/* Footer Dates and Actions */}
              <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Issued: {formatEthiopianDate(issueEth, "en")}</span>
                  {expiryEth && <span>Exp: {formatEthiopianDate(expiryEth, "en")}</span>}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Record</span>
                  </Link>

                  <button
                    onClick={(e) => handleDeleteDocument(doc.id, e)}
                    className="p-1 text-neutral-400 opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                    title="Delete Document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-800">
          No documents match the current filter. Click "Add Document" to store a new credential or agreement.
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Add Document to Vault
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethiopian National ID (Fayda), TIN, Lease Agreement"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Document / Reg Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ET-NID-9481, TIN-00928"
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Issuing Authority / Agency
                </label>
                <input
                  type="text"
                  placeholder="e.g. NIDP Ethiopia, Ministry of Revenue, Bole Sub-City"
                  value={newAuthority}
                  onChange={(e) => setNewAuthority(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={newIssueDate}
                    onChange={(e) => setNewIssueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Notes & Key Clauses
                </label>
                <textarea
                  rows={3}
                  placeholder="Renewal terms, monthly fee, or branch location..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}