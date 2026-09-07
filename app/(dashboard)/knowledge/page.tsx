"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Search,
  BookOpen,
  FileText,
  FileCode,
  Lightbulb,
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Compass,
  Link as LinkIcon
} from "lucide-react";
import { KnowledgeItem, KnowledgeType, SearchResultItem, RelatedItemMatch, KnowledgeStats } from "@/lib/knowledge/types";

const KNOWLEDGE_TABS: { id: KnowledgeType | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Knowledge', icon: Layers },
  { id: 'note', label: 'Notes', icon: FileText },
  { id: 'document', label: 'Documents', icon: FileCode },
  { id: 'book_note', label: 'Book Notes', icon: BookOpen },
  { id: 'saved_article', label: 'Saved Articles', icon: Bookmark },
  { id: 'idea', label: 'Ideas', icon: Lightbulb },
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<KnowledgeType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<RelatedItemMatch[]>([]);
  const [isCapturingIdea, setIsCapturingIdea] = useState<boolean>(false);

  // Idea Capture Form
  const [ideaTitle, setIdeaTitle] = useState<string>("");
  const [ideaDescription, setIdeaDescription] = useState<string>("");
  const [ideaCategory, setIdeaCategory] = useState<string>("Fintech");
  const [ideaTags, setIdeaTags] = useState<string>("Innovation, ETB");

  useEffect(() => {
    executeSearch();
  }, [activeTab, searchQuery]);

  const executeSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (activeTab !== 'all') params.set('type', activeTab);

      const res = await fetch("/api/knowledge?" + params.toString());
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setStats(data.stats || null);
        if (data.results.length > 0 && !selectedItem) {
          handleSelectItem(data.results[0].item);
        }
      }
    } catch (err) {
      console.error("Search error", err);
    }
  };

  const handleSelectItem = async (item: KnowledgeItem) => {
    setSelectedItem(item);
    try {
      const res = await fetch("/api/knowledge?relatedTo=" + item.id);
      const data = await res.json();
      if (data.success) {
        setRelatedItems(data.related || []);
      }
    } catch (err) {
      console.error("Failed to fetch related items", err);
    }
  };

  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;

    try {
      const tagsArray = ideaTags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: 'idea',
          title: ideaTitle,
          description: ideaDescription,
          category: ideaCategory,
          tags: tagsArray
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsCapturingIdea(false);
        setIdeaTitle("");
        setIdeaDescription("");
        executeSearch();
      }
    } catch (err) {
      console.error("Failed to capture idea", err);
    }
  };

  const getTypeBadge = (type: KnowledgeType) => {
    switch (type) {
      case 'note':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">Note</span>;
      case 'document':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">Document</span>;
      case 'book_note':
        return <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px]">Book Note</span>;
      case 'saved_article':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">Article</span>;
      case 'idea':
        return <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px]">Idea</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              MELA Unified Knowledge Engine
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Hybrid Semantic Search
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect notes, document archives, reading insights, and personal ideas with vector-powered related concept mapping.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCapturingIdea(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Capture Idea / Insight
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
            <div className="text-lg font-bold text-slate-100">{stats.totalItems}</div>
            <div className="text-[11px] text-slate-400">Total Knowledge</div>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
            <div className="text-lg font-bold text-blue-400">{stats.notesCount}</div>
            <div className="text-[11px] text-slate-400">Notes</div>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
            <div className="text-lg font-bold text-emerald-400">{stats.documentsCount}</div>
            <div className="text-[11px] text-slate-400">Documents</div>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
            <div className="text-lg font-bold text-purple-400">{stats.bookNotesCount}</div>
            <div className="text-[11px] text-slate-400">Book Notes</div>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
            <div className="text-lg font-bold text-amber-400">{stats.savedArticlesCount}</div>
            <div className="text-[11px] text-slate-400">Saved Articles</div>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
            <div className="text-lg font-bold text-pink-400">{stats.ideasCount}</div>
            <div className="text-[11px] text-slate-400">Ideas</div>
          </div>
        </div>
      )}

      {/* Omnisearch & Filter Navigation */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search across all personal notes, contracts, books, and articles using natural keywords or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {KNOWLEDGE_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition " + (
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
              <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">No knowledge items match your query</h3>
              <p className="text-xs text-slate-500 mt-1">Try broader terms or capture a new thought.</p>
            </div>
          ) : (
            results.map(({ item, score, matchType }) => {
              const isSelected = selectedItem && selectedItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={"p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between group shadow-sm " + (
                    isSelected
                      ? "bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/40"
                      : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(item.type)}
                        {item.folder && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            • {item.folder}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                        {score}% Match ({matchType.replace('_', ' ')})
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1 mb-1.5">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-0.5 transition font-medium">
                      Inspect & Link <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Knowledge Explorer & Related Content */}
        <div className="lg:col-span-5 space-y-4">
          {selectedItem ? (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between mb-2">
                  {getTypeBadge(selectedItem.type)}
                  <span className="text-[10px] text-slate-500 font-mono">ID: {selectedItem.id}</span>
                </div>
                <h3 className="font-bold text-slate-100 text-base">{selectedItem.title}</h3>
              </div>

              <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-4 max-h-60 overflow-y-auto custom-scrollbar text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedItem.content}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Connected Knowledge Graph
                  </h4>
                </div>

                {relatedItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No strongly correlated knowledge items found.</p>
                ) : (
                  <div className="space-y-2">
                    {relatedItems.map(({ item, similarityScore, relationshipReason }) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-indigo-500/30 transition cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate">{item.title}</div>
                          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{relationshipReason}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
                          {Math.round(similarityScore * 100)}% Sim
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center text-slate-500 text-xs">
              Select any knowledge node to explore details and related connections.
            </div>
          )}
        </div>
      </div>

      {/* Idea Capture Modal */}
      {isCapturingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={handleSaveIdea} className="bg-slate-900 rounded-2xl border border-slate-700/80 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-slate-100 text-base">Capture Personal Idea / Insight</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Idea Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Micro-Equb algorithm with zero fees"
                  value={ideaTitle}
                  onChange={e => setIdeaTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Fintech, Personal Growth"
                  value={ideaCategory}
                  onChange={e => setIdeaCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="e.g. Innovation, ETB, Algorithm"
                  value={ideaTags}
                  onChange={e => setIdeaTags(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description / Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the idea or breakthrough insight..."
                  value={ideaDescription}
                  onChange={e => setIdeaDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCapturingIdea(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                Save Knowledge Node
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
