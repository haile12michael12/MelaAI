import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function NotesPage() { return <RoutePlaceholder title="Notes" />; }
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
  BookOpen,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/mela/markdown-renderer";
import { toEthiopianDate, formatEthiopianDate } from "@/lib/utils/ethiopian-calendar";
import { useAuth } from "@/hooks/useAuth";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  pinned?: boolean;
}

const NOTE_CATEGORIES = [
  "All",
  "Personal (የግል)",
  "Work & Business (ሥራ / ንግድ)",
  "Equb & Community (እቁብ / ማህበር)",
  "Finance & Budget (ፋይናንስ / በጀት)",
  "Ideas & Creative (ምርምር / ሃሳቦች)",
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: "note-1",
    title: "እቁብ እና ቁጠባ ዕቅድ (Equb & Savings Plan)",
    category: "Equb & Community (እቁብ / ማህበር)",
    updatedAt: new Date().toISOString(),
    pinned: true,
    content: `# እቁብ እና ወርሃዊ የቁጠባ እቅድ

- **የእቁብ ስም**: አቢሲኒያ የንግድ እቁብ (Abyssinia Business Equb)
- **ወርሃዊ መዋጮ**: 5,000 ETB
- **የመክፈያ ቀን**: በየወሩ 5ኛ ቀን
- **የእጣ ተራ**: 4ኛ ዙር (ህዳር 2018 ዓ.ም)

### ቁልፍ ግቦች
1. ወርሃዊ ትርፍን ከ Telebirr ወደ እቁብ በሰዓቱ ማስተላለፍ።
2. የደረሰውን እቁብ ለተጨማሪ የንግድ ኢንቨስትመንት ወይም Fixed Deposit ማዋል::
3. አጠቃላይ የድንገተኛ ጊዜ ቁጠባ ቢያንስ ለ 6 ወራት የሚያስፈልግ ወጪ ማዘጋጀት::`,
  },
  {
    id: "note-2",
    title: "MELA AI Personal OS Setup & Roadmap",
    category: "Work & Business (ሥራ / ንግድ)",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    content: `# MELA AI OS Development Tasks

- [x] Configure Ethiopian Birr (ETB) currency formatting across all views.
- [x] Integrate Ge'ez Calendar converter and national holiday detection.
- [x] Multilingual English and Amharic support.
- [ ] Connect automated CBE Birr and Telebirr SMS ingestion parser.
- [ ] Review quarterly investment allocation and FD rates.`,
  },
  {
    id: "note-3",
    title: "የቤት ወጪ እና የጤፍ ግዢ መዝገብ",
    category: "Finance & Budget (ፋይናንስ / በጀት)",
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    content: `# የወሩ የቤት ፍጆታ

- **ማግኛ ቦታ**: ኤህል በረንዳ / መርካቶ
- **የጤፍ ዓይነት**: ማኛ ነጭ ጤፍ (1 ኩንታል)
- **ግምታዊ ወጪ**: 11,500 ETB
- **የዘይት እና ቅመማ ቅመም**: 4,200 ETB

> ማስታወሻ: የቴሌ እና የኤሌክትሪክ ክፍያዎችን በ Telebirr SuperApp በኩል እስከ ወሩ አጋማሽ መፈጸም ይኖርበታል።`,
  },
];

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_notes_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || "note-1");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved">("Saved");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mela_notes_data", JSON.stringify(notes));
    }
  }, [notes]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) || notes[0],
    [notes, activeNoteId]
  );

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesCat =
        selectedCategory === "All" || note.category === selectedCategory;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleCreateNote = () => {
    const todayEth = toEthiopianDate(new Date());
    const ethHeader = formatEthiopianDate(todayEth, "am");
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: `አዲስ ማስታወሻ (${ethHeader})`,
      category: selectedCategory === "All" ? "Personal (የግል)" : selectedCategory,
      updatedAt: new Date().toISOString(),
      content: `# አዲስ ማስታወሻ\n\nቀን: ${ethHeader}\n\nእዚህ ይጻፉ...`,
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setIsPreview(false);
    setSaveStatus("Saved");
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) return;
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining[0]?.id || "");
    }
  };

  const handleUpdateActiveNote = (updates: Partial<NoteItem>) => {
    if (!activeNote) return;
    setSaveStatus("Saving...");
    const updated = {
      ...activeNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? updated : n)));
    setTimeout(() => setSaveStatus("Saved"), 300);
  };

  const handleInsertEthiopianDate = () => {
    const eth = toEthiopianDate(new Date());
    const formatted = `\n> **ቀን**: ${formatEthiopianDate(eth, "am")} (${formatEthiopianDate(eth, "en")})\n\n`;
    handleUpdateActiveNote({
      content: activeNote ? activeNote.content + formatted : formatted,
    });
  };

  const handleInsertChecklist = () => {
    const checklist = "\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n";
    handleUpdateActiveNote({
      content: activeNote ? activeNote.content + checklist : checklist,
    });
  };

  const handleCopy = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = activeNote?.content.trim().split(/\s+/).filter(Boolean).length || 0;
  const charCount = activeNote?.content.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Notes & Knowledge
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Personal scratchpad, Equb meeting minutes, ideas, and Ge'ez markdown notes
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Note (አዲስ ማስታወሻ)</span>
        </button>
      </div>

      {/* Main Workspace: Master-Detail Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Note List & Filters */}
        <div className="space-y-3 lg:col-span-4">
          {/* Search & Category Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or content..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {NOTE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {cat.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Notes List */}
          <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-400 dark:border-neutral-800">
                No notes found matching your criteria.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === activeNote?.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setIsPreview(false);
                    }}
                    className={`group relative cursor-pointer rounded-2xl border p-3.5 transition ${
                      isActive
                        ? "border-emerald-500/50 bg-emerald-50/40 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-950/20"
                        : "border-neutral-200/80 bg-white hover:border-neutral-300 dark:border-neutral-800/80 dark:bg-neutral-900 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`truncate text-xs font-bold ${
                          isActive
                            ? "text-emerald-900 dark:text-emerald-300"
                            : "text-neutral-900 dark:text-neutral-100"
                        }`}
                      >
                        {note.title}
                      </h3>
                      {notes.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="opacity-0 transition group-hover:opacity-100 text-neutral-400 hover:text-rose-500"
                          title="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                      {note.content.replace(/[#*`_\[\]]/g, "").slice(0, 100)}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 font-medium dark:bg-neutral-800 dark:text-neutral-300">
                        <Tag className="h-2.5 w-2.5" />
                        {note.category.split(" ")[0]}
                      </span>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Editor / Preview */}
        <div className="space-y-3 lg:col-span-8">
          {activeNote ? (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
              {/* Title & Top Toolbar */}
              <div className="flex flex-col gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  placeholder="Note Title..."
                  className="flex-1 text-base font-bold text-neutral-900 focus:outline-none dark:text-neutral-100 dark:bg-transparent"
                />

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Category Selector */}
                  <select
                    value={activeNote.category}
                    onChange={(e) => handleUpdateActiveNote({ category: e.target.value })}
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    {NOTE_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Mode Toggle: Edit vs Preview */}
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    {isPreview ? (
                      <>
                        <Edit3 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Edit</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    title="Copy Markdown"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    title="Export Markdown"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Formatting Quick Inserts (Only in Edit mode) */}
              {!isPreview && (
                <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Insert:</span>
                  <button
                    onClick={handleInsertEthiopianDate}
                    className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <Calendar className="h-3 w-3 text-emerald-500" />
                    <span>Ge'ez Date</span>
                  </button>
                  <button
                    onClick={handleInsertChecklist}
                    className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <Check className="h-3 w-3 text-indigo-500" />
                    <span>Checklist</span>
                  </button>
                  <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {saveStatus}
                  </span>
                </div>
              )}

              {/* Editor or Preview Pane */}
              <div className="mt-3 min-h-[420px]">
                {isPreview ? (
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                    <MarkdownRenderer content={activeNote.content} />
                  </div>
                ) : (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                    placeholder="Type your notes in English or Ge'ez (Amharic)..."
                    rows={18}
                    className="w-full resize-y rounded-xl border-0 bg-transparent p-2 text-xs font-mono leading-relaxed text-neutral-900 focus:outline-none dark:text-neutral-100"
                  />
                )}
              </div>

              {/* Word Count & Status Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-400 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{charCount} characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>Last modified: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400 text-xs">
              Select or create a note to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}