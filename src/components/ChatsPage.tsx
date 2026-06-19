import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";
import { ArrowLeft, Search, Send, MessageCircle, Loader2, Flag, X, Trash2 } from "lucide-react";
import {
  deleteChatConversation,
  fetchChatConversations,
  fetchChatMessages,
  getBackendOriginForSocket,
  markChatRead,
  openChatWithUser,
  reportChatConversation,
  type ChatConversationSummary,
  type ChatMessageItem,
} from "@/services/api";
import { useFirebaseUser, useUser } from "@/stores/useAuthHooks";
import { AxiosError } from "axios";
import { handleApiError } from "@/services/errorHandler";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface ChatsPageProps {
  theme: "light" | "dark";
  onBack: () => void;
  initialPeerUserId?: string | null;
  initialConversationId?: string | null;
  onConsumedInitialPeer?: () => void;
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatConvTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return formatMessageTime(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ChatsPage({
  theme,
  onBack,
  initialPeerUserId,
  initialConversationId,
  onConsumedInitialPeer,
}: ChatsPageProps) {
  const firebaseUser = useFirebaseUser();
  const profileUser = useUser();
  const myId = profileUser?._id ?? "";

  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const openingPeerRef = useRef(false);
  const selectedConvRef = useRef<string | null>(null);
  const myIdRef = useRef<string>("");

  selectedConvRef.current = selectedConvId;
  myIdRef.current = myId;

  useEffect(() => {
    if (!reportOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReportOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reportOpen]);

  useEffect(() => {
    if (!deleteConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteConfirmOpen]);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const list = await fetchChatConversations();
      setConversations(list);
    } catch (e: unknown) {
      const msg = e instanceof AxiosError ? handleApiError(e) : "Could not load conversations.";
      setListError(msg);
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations, firebaseUser?.uid]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMessages(true);
      try {
        const rows = await fetchChatMessages(conversationId);
        setMessages(rows);
        await markChatRead(conversationId);
        void loadConversations();
        socketRef.current?.emit("mark_read", { conversationId });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMessages(false);
      }
    },
    [loadConversations],
  );

  useEffect(() => {
    if (!selectedConvId || !myId) return;
    void loadMessages(selectedConvId);
  }, [selectedConvId, myId, loadMessages]);

  const [socketStatus, setSocketStatus] = useState<
    "idle" | "connecting" | "connected" | "reconnecting"
  >("idle");

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;
    const origin = getBackendOriginForSocket();

    const connectSocket = async () => {
      setSocketStatus("connecting");
      let token: string;
      try {
        token = await firebaseUser.getIdToken(true);
      } catch {
        setSocketStatus("idle");
        return;
      }
      if (cancelled) return;

      const socket = io(`${origin}/chat`, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setSocketConnected(true);
        setSocketStatus("connected");
      });
      socket.on("disconnect", (reason) => {
        setSocketConnected(false);
        if (reason === "io server disconnect" || reason === "transport close") {
          setSocketStatus("reconnecting");
          socket.disconnect();
          if (!cancelled) void reconnectWithFreshToken();
        } else {
          setSocketStatus("reconnecting");
        }
      });
      socket.on("connect_error", () => {
        setSocketStatus("reconnecting");
      });

      socket.on(
        "chat:new_message",
        (payload: { conversation_id: string; message: ChatMessageItem }) => {
          void fetchChatConversations().then(setConversations).catch(console.error);
          if (selectedConvRef.current === payload.conversation_id) {
            setMessages((m) => {
              if (m.some((x) => x.id === payload.message.id)) return m;
              return [...m, payload.message];
            });
            if (payload.message.sender_id !== myIdRef.current) {
              socket.emit("mark_read", { conversationId: payload.conversation_id });
            }
          }
        },
      );
    };

    const reconnectWithFreshToken = async () => {
      if (cancelled) return;
      socketRef.current?.disconnect();
      socketRef.current = null;
      await connectSocket();
    };

    void connectSocket();

    return () => {
      cancelled = true;
      setSocketConnected(false);
      setSocketStatus("idle");
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [firebaseUser?.uid]);

  useEffect(() => {
    if (!firebaseUser || openingPeerRef.current) return;
    if (!initialPeerUserId && !initialConversationId) return;
    openingPeerRef.current = true;
    void (async () => {
      try {
        await loadConversations();
        if (initialConversationId) {
          setSelectedConvId(initialConversationId);
        } else if (initialPeerUserId) {
          const convId = await openChatWithUser(initialPeerUserId);
          setSelectedConvId(convId);
        }
        onConsumedInitialPeer?.();
      } catch (e) {
        console.error(e);
      } finally {
        openingPeerRef.current = false;
      }
    })();
  }, [
    initialPeerUserId,
    initialConversationId,
    firebaseUser,
    loadConversations,
    onConsumedInitialPeer,
  ]);

  const filtered = conversations.filter((c) =>
    c.other_user.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null;

  const submitReport = async () => {
    if (!selectedConvId) return;
    setReportSubmitting(true);
    try {
      await reportChatConversation(selectedConvId, reportReason);
      toast.success("Report submitted. Thank you.");
      setReportOpen(false);
      setReportReason("");
    } catch (e: unknown) {
      const ax = e as AxiosError<{ message?: string }>;
      if (ax.response?.status === 409) {
        toast.error(
          typeof ax.response.data?.message === "string"
            ? ax.response.data.message
            : "You already have an open report for this conversation.",
        );
      } else if (e instanceof AxiosError) {
        toast.error(handleApiError(e));
      } else {
        toast.error("Could not submit report.");
      }
    } finally {
      setReportSubmitting(false);
    }
  };

  const submitDeleteConversation = async () => {
    if (!selectedConvId) return;
    const conversationId = selectedConvId;
    setDeleteSubmitting(true);
    try {
      await deleteChatConversation(conversationId);
      setConversations((list) => list.filter((c) => c.id !== conversationId));
      setSelectedConvId(null);
      setMessages([]);
      setDeleteConfirmOpen(false);
      toast.success("Chat deleted from your inbox.");
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast.error(handleApiError(e));
      } else {
        toast.error("Could not delete chat.");
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text || !selectedConv || !socketConnected) return;
    setSendError(null);
    const recipientUserId = selectedConv.other_user.id;
    socketRef.current.emit(
      "send_message",
      { recipientUserId, text },
      (resp: { ok?: boolean; error?: string }) => {
        if (resp && resp.ok === false) {
          setSendError(resp.error ?? "Could not send message.");
        }
      },
    );
    setMessageText("");
  };

  const panelMuted = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <>
      <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 pointer-events-none z-0">
        {theme === "dark" && (
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        )}
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-gradient-to-br from-[#1a1a2e]/30 via-transparent to-transparent" : ""
          }`}
        />
      </div>

      <div
        className={`relative z-10 flex h-full w-full flex-col shadow-2xl backdrop-blur-2xl ${
          theme === "dark" ? "bg-[#121218]/95" : "bg-white/95"
        }`}
      >
        <div
          className={`flex-shrink-0 border-b px-8 py-4 backdrop-blur-xl ${
            theme === "dark" ? "border-white/10 bg-[#0f0f14]/50" : "border-gray-200 bg-white/50"
          }`}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className={`rounded-xl transition-all ${
              theme === "dark"
                ? "text-gray-300 hover:bg-white/10 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className={`flex w-96 flex-col border-r ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
            <div className={`border-b p-4 ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
              <h2 className={`mb-4 font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Inbox</h2>
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <Input
                  id="chats-inbox-search"
                  name="inboxSearch"
                  type="search"
                  placeholder="Search people…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  className={`rounded-xl pl-10 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                      : "border-gray-200 bg-gray-50 placeholder:text-gray-500"
                  }`}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {loadingList && !conversations.length ? (
                  <div className={`flex justify-center py-8 ${panelMuted}`}>
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : null}
                {listError ? <p className="px-2 py-4 text-sm text-red-500">{listError}</p> : null}
                {!loadingList && filtered.length === 0 ? (
                  <div className={`px-3 py-10 text-center ${panelMuted}`}>
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                      {conversations.length === 0
                        ? "No conversations yet"
                        : "No matches"}
                    </p>
                    {conversations.length === 0 ? (
                      <p className="text-xs mt-1 opacity-80">
                        Visit a peer's profile and start a chat from there.
                      </p>
                    ) : (
                      <p className="text-xs mt-1 opacity-80">
                        Try a different name or search term.
                      </p>
                    )}
                  </div>
                ) : null}
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedConvId(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedConvId(c.id);
                      }
                    }}
                    className={`mb-1 cursor-pointer rounded-xl p-3 shadow-sm transition-all ${
                      selectedConvId === c.id
                        ? theme === "dark"
                          ? "border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/10 shadow-md"
                          : "border border-purple-300 bg-gradient-to-br from-purple-100 to-blue-50 shadow-md"
                        : theme === "dark"
                          ? "hover:bg-white/5 hover:shadow-md"
                          : "hover:bg-gray-50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={c.other_user.profilePhoto ?? undefined} alt={c.other_user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#5B6FD8] to-[#7C4DFF] text-white">
                          {c.other_user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className={`truncate font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {c.other_user.name}
                          </p>
                          <p className={`shrink-0 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {formatConvTime(c.last_message_at)}
                          </p>
                        </div>
                        <p className={`truncate text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {c.last_message_text || "Say hello…"}
                        </p>
                      </div>
                      {c.unread_count > 0 ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5B6FD8]">
                          <span className="text-[10px] text-white">{c.unread_count > 9 ? "9+" : c.unread_count}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {selectedConv ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div
                className={`relative z-20 flex flex-shrink-0 items-center justify-between gap-3 border-b p-4 ${
                  theme === "dark" ? "border-white/10" : "border-gray-200"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={selectedConv.other_user.profilePhoto ?? undefined} alt={selectedConv.other_user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#5B6FD8] to-[#7C4DFF] text-white">
                      {selectedConv.other_user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className={`truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {selectedConv.other_user.name}
                    </h3>
                    <p className={`text-xs ${panelMuted}`}>Direct message</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={
                      theme === "dark"
                        ? "touch-manipulation border-white/20 bg-white/5 text-gray-200 hover:bg-white/10 [&_svg]:pointer-events-auto"
                        : "touch-manipulation [&_svg]:pointer-events-auto"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setReportOpen(true);
                    }}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={
                      theme === "dark"
                        ? "touch-manipulation border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 [&_svg]:pointer-events-auto"
                        : "touch-manipulation border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 [&_svg]:pointer-events-auto"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {loadingMessages ? (
                  <div className={`flex h-full items-center justify-center ${panelMuted}`}>
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const sent = message.sender_id === myId;
                        return (
                          <div key={message.id} className={`flex ${sent ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-md rounded-2xl px-4 py-2 shadow-sm ${
                                sent
                                  ? "rounded-br-md bg-gradient-to-br from-[#5B6FD8] to-[#7C4DFF] text-white"
                                  : theme === "dark"
                                    ? "rounded-bl-md bg-white/10 text-white"
                                    : "rounded-bl-md bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="mb-1 text-sm">{message.body}</p>
                              <p
                                className={`text-xs ${
                                  sent ? "text-white/70" : theme === "dark" ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {formatMessageTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className={`flex-shrink-0 border-t p-4 ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                {sendError ? <p className="mb-2 text-sm text-red-500">{sendError}</p> : null}
                <div className="flex items-center gap-3">
                  <Input
                    id="chat-message-input"
                    name="message"
                    placeholder="Type a message…"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className={`flex-1 rounded-xl ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white placeholder:text-gray-400"
                        : "border-gray-200 bg-gray-50 placeholder:text-gray-500"
                    }`}
                  />
                  <Button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !socketConnected}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-[#7C4DFF] to-[#5B6FD8] text-white shadow-lg hover:from-[#6B3FEE] hover:to-[#4A5FC7]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {!socketConnected && firebaseUser ? (
                  <p className={`mt-2 text-xs ${panelMuted}`}>
                    {socketStatus === "reconnecting"
                      ? "Reconnecting…"
                      : "Connecting to chat…"}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div
                  className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${
                    theme === "dark" ? "bg-white/5" : "bg-gray-100"
                  }`}
                >
                  <MessageCircle className={`h-12 w-12 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                </div>
                <h3 className={`mb-2 ${panelMuted}`}>Select a conversation</h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                  Choose someone from your inbox or message them from their profile.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {reportOpen ? (
        <div
          className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close report dialog"
            onClick={() => setReportOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-report-dialog-title"
            className={cn(
              "relative z-10 grid w-full max-w-md gap-4 rounded-lg border p-6 shadow-lg",
              theme === "dark"
                ? "border-white/10 bg-[#121218] text-gray-100"
                : "border-gray-200 bg-white text-gray-900",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2
                id="chat-report-dialog-title"
                className={cn("text-lg font-semibold leading-none", theme === "dark" ? "text-white" : "text-gray-900")}
              >
                Report conversation
              </h2>
              <p className={cn("text-sm", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
                Our team will review this thread. You can add an optional reason below.
              </p>
            </div>
            <Textarea
              id="chat-report-reason"
              name="reportReason"
              placeholder="Reason (optional)"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              maxLength={500}
              autoComplete="off"
              className={
                theme === "dark"
                  ? "min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  : "min-h-[100px]"
              }
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReportOpen(false)}
                className={theme === "dark" ? "border-white/20 bg-transparent text-gray-200" : undefined}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={reportSubmitting}
                onClick={() => void submitReport()}
                className="rounded-xl bg-gradient-to-r from-[#7C4DFF] to-[#5B6FD8] text-white"
              >
                {reportSubmitting ? "Submitting…" : "Submit report"}
              </Button>
            </div>
            <button
              type="button"
              className={cn(
                "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                theme === "dark" && "ring-offset-[#121218]",
              )}
              onClick={() => setReportOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
      {deleteConfirmOpen ? (
        <div
          className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close delete dialog"
            onClick={() => setDeleteConfirmOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-delete-dialog-title"
            className={cn(
              "relative z-10 grid w-full max-w-md gap-4 rounded-lg border p-6 shadow-lg",
              theme === "dark"
                ? "border-white/10 bg-[#121218] text-gray-100"
                : "border-gray-200 bg-white text-gray-900",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2
                id="chat-delete-dialog-title"
                className={cn("text-lg font-semibold leading-none", theme === "dark" ? "text-white" : "text-gray-900")}
              >
                Delete chat?
              </h2>
              <p className={cn("text-sm", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
                This removes the conversation from your inbox only. The other person will still keep their copy.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className={theme === "dark" ? "border-white/20 bg-transparent text-gray-200" : undefined}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={deleteSubmitting}
                onClick={() => void submitDeleteConversation()}
                className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                {deleteSubmitting ? "Deleting…" : "Delete chat"}
              </Button>
            </div>
            <button
              type="button"
              className={cn(
                "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/50",
                theme === "dark" && "ring-offset-[#121218]",
              )}
              onClick={() => setDeleteConfirmOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
    </>
  );
}
