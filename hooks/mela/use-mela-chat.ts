"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface PendingAction {
  action: string;
  params: Record<string, any>;
  message?: string;
  preview?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  pendingAction?: PendingAction | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "mela_conversations_v1";

export function useMelaChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Conversation[];
          setConversations(parsed);
          if (parsed.length > 0 && !activeId) {
            setActiveId(parsed[0].id);
          }
        } else {
          // Default initial conversation
          const initial: Conversation = {
            id: String(Date.now()),
            title: "New Conversation",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [
              {
                id: "welcome",
                role: "assistant",
                content: "Hello! I am MELA, your personal AI operating system companion. You can ask me about your finances, investments, subscriptions, watchlist, reading lists, goals, and tasks.",
                createdAt: Date.now(),
              },
            ],
          };
          setConversations([initial]);
          setActiveId(initial.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([initial]));
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    }
  }, [activeId]);

  const saveConversations = (convs: Conversation[]) => {
    setConversations(convs);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: String(Date.now()),
      title: "New Conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content: "Hello! How can I help you with your finances, portfolio, tasks, or lifestyle tracking today?",
          createdAt: Date.now(),
        },
      ],
    };
    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setActiveId(newConv.id);
  }, [conversations]);

  const deleteConversation = useCallback(
    (id: string) => {
      const updated = conversations.filter((c) => c.id !== id);
      saveConversations(updated);
      if (activeId === id) {
        setActiveId(updated[0]?.id || null);
      }
    },
    [conversations, activeId]
  );

  const renameConversation = useCallback(
    (id: string, newTitle: string) => {
      const updated = conversations.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c));
      saveConversations(updated);
    },
    [conversations]
  );

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !activeConversation) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const isFirstUserMessage = activeConversation.messages.filter((m) => m.role === "user").length === 0;

    const updatedMessages = [...activeConversation.messages, userMsg];
    const updatedConv = { ...activeConversation, messages: updatedMessages, updatedAt: Date.now() };

    const newConversations = conversations.map((c) => (c.id === activeConversation.id ? updatedConv : c));
    saveConversations(newConversations);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mela/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.idToken || ""}`,
        },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          isFirstMessage: isFirstUserMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to communicate with MELA AI.");
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 2),
        role: "assistant",
        content: data.reply || (data.pendingConfirmation ? "I require your confirmation before executing this sensitive operation:" : "I have received your request."),
        createdAt: Date.now(),
        pendingAction: data.pendingConfirmation || null,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      const finalTitle = data.suggestedTitle || (isFirstUserMessage ? text.slice(0, 28) : activeConversation.title);

      const finalConversations = conversations.map((c) =>
        c.id === activeConversation.id
          ? { ...c, title: finalTitle, messages: finalMessages, updatedAt: Date.now() }
          : c
      );
      saveConversations(finalConversations);
    } catch (err: any) {
      console.error("[useMelaChat] Send error:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async (msgId: string, actionObj: PendingAction) => {
    if (!activeConversation) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/mela/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.idToken || ""}`,
        },
        body: JSON.stringify({
          action: actionObj.action,
          params: actionObj.params,
          confirmed: true,
        }),
      });

      const data = await res.json();
      const successMessage = data.message || "Action executed successfully.";

      // Update message to remove pending action
      const updatedMessages = activeConversation.messages.map((m) =>
        m.id === msgId ? { ...m, pendingAction: null, content: m.content + "\n\n" + `✅ **${successMessage}**` } : m
      );

      const updatedConv = { ...activeConversation, messages: updatedMessages, updatedAt: Date.now() };
      saveConversations(conversations.map((c) => (c.id === activeConversation.id ? updatedConv : c)));
    } catch (err: any) {
      console.error("Action confirmation failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAction = (msgId: string) => {
    if (!activeConversation) return;
    const updatedMessages = activeConversation.messages.map((m) =>
      m.id === msgId ? { ...m, pendingAction: null, content: m.content + "\n\n*Action cancelled by user.*" } : m
    );
    const updatedConv = { ...activeConversation, messages: updatedMessages, updatedAt: Date.now() };
    saveConversations(conversations.map((c) => (c.id === activeConversation.id ? updatedConv : c)));
  };

  const regenerateResponse = async () => {
    if (!activeConversation || loading) return;
    const userMessages = activeConversation.messages.filter((m) => m.role === "user");
    if (userMessages.length === 0) return;

    const lastUserMessage = userMessages[userMessages.length - 1];
    // Remove last assistant message
    const trimmed = activeConversation.messages.slice(0, -1);
    const updatedConv = { ...activeConversation, messages: trimmed };
    const updatedConvs = conversations.map((c) => (c.id === activeConversation.id ? updatedConv : c));
    saveConversations(updatedConvs);

    await sendMessage(lastUserMessage.content);
  };

  return {
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
  };
}
