"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FolderLock,
  Plus,
  Trash2,
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Shield,
  UploadCloud,
  Eye,
  Tag,
  Lock,
  Calendar,
  X,
  HardDrive
} from "lucide-react";
import { toEthiopianDate, formatEthiopianDate } from "@/lib/utils/ethiopian-calendar";
import { DocumentItem } from "@/lib/knowledge/types";

const DOC_CATEGORIES = [
  "All Categories",
  "Contracts",
  "Financial Statements",
  "Regulations",
  "Identity & Legal",
  "Reports"
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Form State
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<string>("Contracts");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [uploadTags, setUploadTags] = useState<string>("Legal, Ethiopia");
  const [uploadPreviewText, setUploadPreviewText] = useState<string>("");
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to securely delete this document?")) return;
    try {
      const res = await fetch("/api/documents?id=" + id, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        if (previewDoc && previewDoc.id === id) setPreviewDoc(null);
      }
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFileName.trim()) return;

    setIsUploading(true);
    try {
      const tagsArray = uploadTags.split(",").map(t => t.trim()).filter(Boolean);
      const payload = {
        title: uploadTitle,
        fileName: uploadFileName,
        fileSize: Math.floor(Math.random() * 3500000) + 250000,
        folder: uploadCategory,
        category: uploadCategory,
        tags: tagsArray,
        description: uploadDescription,
        previewText: uploadPreviewText || ("Uploaded document content for " + uploadTitle),
        isEncrypted
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.document) {
        setDocuments([data.document, ...documents]);
        setIsUploadModalOpen(false);
        setUploadTitle("");
        setUploadFileName("");
        setUploadDescription("");
        setUploadPreviewText("");
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: DocumentItem['fileType']) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-6 h-6 text-rose-400" />;
      case "xlsx":
        return <FileSpreadsheet className="w-6 h-6 text-emerald-400" />;
      case "docx":
      case "txt":
        return <FileCode className="w-6 h-6 text-blue-400" />;
      default:
        return <FileCheck className="w-6 h-6 text-purple-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(d => {
      if (activeCategory !== "All Categories" && d.category !== activeCategory && d.folder !== activeCategory) {
        return false;
      }
      if (selectedTag && !d.tags.includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          d.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [documents, activeCategory, selectedTag, searchQuery]);

  const totalVaultSize = documents.reduce((sum, d) => sum + d.fileSize, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FolderLock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Secure Document Vault
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                End-to-End Scoped
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure storage, metadata tracking, and previews for Ethiopian contracts, tax filings, and business papers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{documents.length} Vault Documents</div>
            <div className="text-[11px] text-slate-400">{formatBytes(totalVaultSize)} Used</div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20"
          >
            <UploadCloud className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800/60 p-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          {DOC_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={"px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition " + (
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name, tag, or text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
            <HardDrive className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No documents found</h3>
            <p className="text-xs text-slate-500 mt-1">Upload files or adjust your search filters.</p>
          </div>
        ) : (
          filteredDocuments.map(doc => {
            const ethDate = toEthiopianDate(new Date(doc.uploadedAt));
            return (
              <div
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 hover:border-indigo-500/40 hover:bg-slate-800/40 transition cursor-pointer flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {doc.isEncrypted && (
                        <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="AES-256 Encrypted">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                      <button
                        onClick={e => handleDelete(doc.id, e)}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1 mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono line-clamp-1 mb-2">
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {doc.description || (doc.previewText ? doc.previewText.slice(0, 100) : "No description provided.")}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {doc.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] border border-slate-700/60">
                        #{tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-500">
                        +{doc.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span>{formatBytes(doc.fileSize)}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatEthiopianDate(ethDate, "short")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/80 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {getFileIcon(previewDoc.fileType)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-base">{previewDoc.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">{previewDoc.fileName} • {formatBytes(previewDoc.fileSize)}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Category: {previewDoc.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                MIME: {previewDoc.mimeType}
              </span>
              {previewDoc.isEncrypted && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 font-medium">
                  <Shield className="w-3.5 h-3.5" /> AES-256 Vault Encrypted
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950/60 rounded-xl border border-slate-800 p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-slate-300 leading-relaxed">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Extracted Document Preview:</div>
              {previewDoc.previewText || "No text preview available."}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Uploaded {formatEthiopianDate(toEthiopianDate(new Date(previewDoc.uploadedAt)), "long")}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.storageUrl}
                  download={previewDoc.fileName}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={handleUploadSubmit} className="bg-slate-900 rounded-2xl border border-slate-700/80 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-slate-100 text-base">Upload to Document Vault</h3>
              </div>
              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Addis Ababa Office Lease Agreement"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. lease_agreement_2026.pdf"
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {DOC_CATEGORIES.filter(c => c !== "All Categories").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Legal, Tax, Contract"
                    value={uploadTags}
                    onChange={e => setUploadTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this document..."
                  value={uploadDescription}
                  onChange={e => setUploadDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preview / Extracted Text (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Paste excerpt or key clauses for semantic search indexing..."
                  value={uploadPreviewText}
                  onChange={e => setUploadPreviewText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enc"
                  checked={isEncrypted}
                  onChange={e => setIsEncrypted(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-800 border-slate-700"
                />
                <label htmlFor="enc" className="text-slate-300 text-xs flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Apply Vault Encryption
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/20"
              >
                {isUploading ? "Uploading..." : "Save to Vault"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
