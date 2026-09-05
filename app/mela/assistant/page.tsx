"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMelaChat } from "@/hooks/mela/use-mela-chat";
import { MarkdownRenderer } from "@/components/mela/markdown-renderer";
import { ActionConfirmation } from "@/components/mela/action-confirmation";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  RotateCcw,
  Send,
  MessageSquare,
  Bot,
  User,
  Compass,
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Target,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function MelaAssistantPage() {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    sendMessage,
    confirmAction,
    cancelAction,
    regenerateResponse,
    loading,
    actionLoading,
    error,
  } = useMelaChat();

  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, loading]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedPrompts = [
    { label: "How much did I spend this month?", icon: TrendingUp },
    { label: "What are my biggest expenses?", icon: TrendingUp },
    { label: "How are my investments performing?", icon: Target },
    { label: "What subscriptions renew this week?", icon: CreditCard },
    { label: "What should I focus on today?", icon: Target },
    { label: "Recommend a book based on my reading list", icon: BookOpen },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50/50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Sidebar: Conversation History */}
      <aside className="flex w-72 flex-col border-r border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80 max-md:hidden">
        {/* Brand & New Chat */}
        <div className="border-b border-neutral-200/80 p-4 dark:border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-950 dark:text-white">MELA AI</h2>
                <p className="text-[10px] text-neutral-400">Assistant Interface</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
              title="Return to Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          </div>

          <button
            onClick={createNewConversation}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-2 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Recent Conversations
          </p>
          {conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                onClick={() => !isEditing && setActiveId(conv.id)}
                className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                  isActive
                    ? "bg-indigo-50 font-semibold text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400"}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      autoFocus
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => {
                        if (editTitle.trim()) renameConversation(conv.id, editTitle);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editTitle.trim()) renameConversation(conv.id, editTitle);
                          setEditingId(null);
                        }
                      }}
                      className="w-36 rounded border border-indigo-300 bg-white px-1.5 py-0.5 text-xs dark:bg-neutral-800"
                    />
                  ) : (
                    <span className="truncate">{conv.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(conv.id);
                      setEditTitle(conv.title);
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    title="Rename"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Footer */}
        {user && (
          <div className="border-t border-neutral-200/80 p-3.5 dark:border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {(user.displayName || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">{user.displayName || "User"}</p>
                <p className="truncate text-[10px] text-neutral-400">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-neutral-200/80 bg-white/70 px-6 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 md:hidden">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-bold text-neutral-950 dark:text-white">
              {activeConversation?.title || "MELA Assistant"}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Classic</span>
            </Link>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {activeConversation?.messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`group relative max-w-[85%] rounded-3xl p-4.5 shadow-2xs ${
                    isUser
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "border border-neutral-200/80 bg-white/90 text-neutral-900 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/90 dark:text-neutral-100"
                  }`}>
                    <MarkdownRenderer content={msg.content} />

                    {/* Action Confirmation Card if pending */}
                    {msg.pendingAction && (
                      <ActionConfirmation
                        action={msg.pendingAction.action}
                        preview={msg.pendingAction.preview}
                        message={msg.pendingAction.message}
                        loading={actionLoading}
                        onConfirm={() => confirmAction(msg.id, msg.pendingAction!)}
                        onCancel={() => cancelAction(msg.id)}
                      />
                    )}

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopyMessage(msg.content, msg.id)}
                      className={`absolute top-3 right-3 opacity-0 transition group-hover:opacity-100 ${
                        isUser ? "text-neutral-400 hover:text-white dark:text-neutral-500 dark:hover:text-neutral-900" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Loading indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-3xl border border-neutral-200/80 bg-white/90 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/90">
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                    <Sparkles className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span>Mela is thinking & executing tools...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error recovery banner */}
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                <span>{error}</span>
                <button
                  onClick={regenerateResponse}
                  className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Prompts (when starting a conversation) */}
        {activeConversation && activeConversation.messages.length <= 2 && (
          <div className="mx-auto max-w-3xl px-4 py-2">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.label)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-1.5 text-xs text-neutral-700 shadow-2xs transition hover:border-indigo-300 hover:text-indigo-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:border-indigo-700"
                  >
                    <Icon className="h-3 w-3 text-indigo-500" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-neutral-200/80 bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
          <form onSubmit={handleSend} className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask MELA about expenses, investments, tasks, goals, media, or advice..."
              className="flex-1 max-h-32 resize-none rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-white dark:placeholder-neutral-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-neutral-400">
            MELA analyzes your financial and lifestyle records securely without sharing your raw database.
          </div>
        </div>
      </main>
    </div>
  );
}
