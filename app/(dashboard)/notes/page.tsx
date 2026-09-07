"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Search,
  Download,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Tag,
  Clock,
  Eye,
  Edit3,
  Star,
  Pin,
  Folder,
  Paperclip,
  Share2,
  BookOpen
} from "lucide-react";
import { MarkdownRenderer } from "@/components/mela/markdown-renderer";
import { toEthiopianDate, formatEthiopianDate } from "@/lib/utils/ethiopian-calendar";
import { NoteItem } from "@/lib/knowledge/types";

const NOTE_FOLDERS = [
  "All Notes",
  "Finance & Budget",
  "Legal & Tax",
  "Business & Ventures",
  "Equb & Community",
  "Personal Ideas"
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>("All Notes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Draft state
  const [draftTitle, setDraftTitle] = useState<string>("");
  const [draftContent, setDraftContent] = useState<string>("");
  const [draftFolder, setDraftFolder] = useState<string>("General");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success && data.notes) {
        setNotes(data.notes);
        if (data.notes.length > 0 && !selectedNoteId) {
          selectNote(data.notes[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  const selectNote = (note: NoteItem) => {
    setSelectedNoteId(note.id);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setDraftFolder(note.folder);
    setDraftTags(note.tags || []);
    setIsEditing(false);
  };

  const handleCreateNewNote = () => {
    const newNote: NoteItem = {
      id: "note-" + Date.now(),
      userId: "user-ethiopia-01",
      title: "Untitled Note (አዲስ ማስታወሻ)",
      content: "# New Note\n\nStart writing markdown or thoughts here...",
      folder: activeFolder === "All Notes" ? "General" : activeFolder,
      tags: ["Draft"],
      isFavorite: false,
      isPinned: false,
      attachments: [],
      wordCount: 8,
      readingTimeMinutes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    selectNote(newNote);
    setIsEditing(true);
  };

  const handleSaveNote = async () => {
    if (!selectedNoteId) return;
    setIsSaving(true);
    try {
      const selected = notes.find(n => n.id === selectedNoteId);
      const payload = {
        id: selectedNoteId,
        title: draftTitle || "Untitled Note",
        content: draftContent,
        folder: draftFolder,
        tags: draftTags,
        isFavorite: selected ? selected.isFavorite : false,
        isPinned: selected ? selected.isPinned : false,
        attachments: selected ? selected.attachments : []
      };

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.note) {
        setNotes(prev => prev.map(n => n.id === data.note.id ? data.note : n));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = notes.find(n => n.id === id);
    if (!target) return;
    const updated = { ...target, isPinned: !target.isPinned };
    setNotes(prev => prev.map(n => n.id === id ? updated : n));

    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = notes.find(n => n.id === id);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    setNotes(prev => prev.map(n => n.id === id ? updated : n));

    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch("/api/notes?id=" + id, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        const remaining = notes.filter(n => n.id !== id);
        setNotes(remaining);
        if (selectedNoteId === id && remaining.length > 0) {
          selectNote(remaining[0]);
        } else if (remaining.length === 0) {
          setSelectedNoteId(null);
        }
      }
    } catch (err) {
      console.error("Error deleting note", err);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !draftTags.includes(newTagInput.trim())) {
      setDraftTags([...draftTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDraftTags(draftTags.filter(t => t !== tagToRemove));
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (activeFolder !== "All Notes" && n.folder !== activeFolder) return false;
      if (showFavoritesOnly && !n.isFavorite) return false;
      if (filterTag && !n.tags.includes(filterTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notes, activeFolder, showFavoritesOnly, filterTag, searchQuery]);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4 p-4 max-w-[1600px] mx-auto overflow-hidden">
      {/* Sidebar: Folders & Filters */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100 text-sm">Notes Hub</h2>
              <p className="text-[11px] text-slate-400">የግል ማስታወሻዎች</p>
            </div>
          </div>
          <button
            onClick={handleCreateNewNote}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
            title="Create Note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filters */}
        <div className="space-y-1 mb-4">
          <button
            onClick={() => { setActiveFolder("All Notes"); setShowFavoritesOnly(false); setFilterTag(null); }}
            className={"w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition " + (
              activeFolder === "All Notes" && !showFavoritesOnly && !filterTag
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-300 hover:bg-slate-800/50"
            )}
          >
            <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> All Notes</span>
            <span className="text-[11px] text-slate-500">{notes.length}</span>
          </button>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={"w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition " + (
              showFavoritesOnly
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-300 hover:bg-slate-800/50"
            )}
          >
            <span className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> Favorites</span>
            <span className="text-[11px] text-slate-500">{notes.filter(n => n.isFavorite).length}</span>
          </button>
        </div>

        {/* Folders List */}
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Folders</div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {NOTE_FOLDERS.filter(f => f !== "All Notes").map(folder => {
            const count = notes.filter(n => n.folder === folder).length;
            const isActive = activeFolder === folder && !showFavoritesOnly;
            return (
              <button
                key={folder}
                onClick={() => { setActiveFolder(folder); setShowFavoritesOnly(false); }}
                className={"w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition " + (
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{folder}</span>
                </span>
                <span className="text-[10px] text-slate-500 ml-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Tag Clouds */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
            <span>Tags</span>
            {filterTag && (
              <button onClick={() => setFilterTag(null)} className="text-[10px] text-indigo-400 hover:underline">Clear</button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {Array.from(new Set(notes.flatMap(n => n.tags || []))).slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={"px-2 py-0.5 rounded-md text-[10px] font-medium transition " + (
                  filterTag === tag
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column 2: Notes List with Search */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, tags, content..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notes found.
            </div>
          ) : (
            filteredNotes.map(note => {
              const isSelected = note.id === selectedNoteId;
              const ethDate = toEthiopianDate(new Date(note.updatedAt));
              const plainSnippet = note.content.replace(/[^a-zA-Z0-9ሀ-፿s]/g, '').slice(0, 100);
              return (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={"p-3 rounded-xl border transition cursor-pointer relative group " + (
                    isSelected
                      ? "bg-slate-800/90 border-indigo-500/50 shadow-md shadow-indigo-950/30"
                      : "bg-slate-800/30 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 flex-1">
                      {note.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={e => handleTogglePin(note.id, e)}
                        className={"p-1 rounded hover:bg-slate-700/60 " + (note.isPinned ? "text-indigo-400" : "text-slate-500")}
                        title={note.isPinned ? "Unpin note" : "Pin note to top"}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => handleToggleFavorite(note.id, e)}
                        className={"p-1 rounded hover:bg-slate-700/60 " + (note.isFavorite ? "text-amber-400" : "text-slate-500")}
                        title="Favorite"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 font-normal">
                    {plainSnippet}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatEthiopianDate(ethDate, "short")}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                      {note.folder}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Column 3: Active Note Editor / Markdown Preview */}
      <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden">
        {selectedNote ? (
          <>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center gap-3 flex-1 mr-4">
                <input
                  type="text"
                  value={draftTitle}
                  onChange={e => { setDraftTitle(e.target.value); setIsEditing(true); }}
                  placeholder="Note Title..."
                  className="bg-transparent text-slate-100 font-semibold text-base w-full focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1.5 py-0.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
                  <button
                    onClick={() => setViewMode("edit")}
                    className={"px-2.5 py-1 rounded-md transition " + (viewMode === "edit" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200")}
                  >
                    <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => setViewMode("split")}
                    className={"px-2.5 py-1 rounded-md transition " + (viewMode === "split" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200")}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setViewMode("preview")}
                    className={"px-2.5 py-1 rounded-md transition " + (viewMode === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200")}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
                  </button>
                </div>

                <button
                  onClick={handleCopyContent}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs border border-slate-700/60"
                  title="Copy markdown text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs font-medium shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </button>

                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition text-xs border border-rose-500/20"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Folder className="w-3.5 h-3.5 text-indigo-400" />
                  <select
                    value={draftFolder}
                    onChange={e => { setDraftFolder(e.target.value); setIsEditing(true); }}
                    className="bg-slate-800/80 border border-slate-700/60 rounded-md px-2 py-0.5 text-slate-300 text-xs focus:outline-none"
                  >
                    {NOTE_FOLDERS.filter(f => f !== "All Notes").map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {draftTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] flex items-center gap-1"
                    >
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-rose-400">&times;</button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="+ tag"
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddTag()}
                      className="bg-slate-800/60 border border-slate-700/50 rounded px-1.5 py-0.5 text-[11px] text-slate-300 w-16 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                <span>{draftContent.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>•</span>
                <span>~{Math.max(1, Math.ceil(draftContent.trim().split(/\s+/).filter(Boolean).length / 150))} min read</span>
                <span>•</span>
                <span>{formatEthiopianDate(toEthiopianDate(new Date(selectedNote.updatedAt)), "long")}</span>
              </div>
            </div>

            {/* Attachments Bar */}
            {selectedNote.attachments && selectedNote.attachments.length > 0 && (
              <div className="flex items-center gap-2 px-6 py-2 bg-slate-900/30 border-b border-slate-800/40 text-xs">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Attachments:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedNote.attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                      <span>{att.name}</span>
                      <span className="text-[10px] text-slate-500">({(att.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Editor & Preview Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {(viewMode === "edit" || viewMode === "split") && (
                <div className={"flex-1 flex flex-col p-4 " + (viewMode === "split" ? "border-r border-slate-800/80" : "")}>
                  <textarea
                    value={draftContent}
                    onChange={e => { setDraftContent(e.target.value); setIsEditing(true); }}
                    placeholder="Write your markdown note here..."
                    className="w-full h-full bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar placeholder-slate-600"
                  />
                </div>
              )}

              {(viewMode === "preview" || viewMode === "split") && (
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950/20">
                  <MarkdownRenderer content={draftContent || "*No content to preview*"} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <BookOpen className="w-12 h-12 mb-3 text-slate-600 stroke-[1.5]" />
            <h3 className="text-sm font-medium text-slate-300 mb-1">No Note Selected</h3>
            <p className="text-xs text-slate-500 mb-4">Choose a note from the left or create a new one.</p>
            <button
              onClick={handleCreateNewNote}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
