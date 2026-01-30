"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ChatHeader } from "@/components/chat-header";
import { useAutoResume } from "@/hooks/use-auto-resume";
import type { ChatMessage } from "@/lib/types";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { toast } from "./toast";

export function Chat({
  id,
  initialMessages,
  initialVisibilityType,
  isReadonly,
  autoResume,
  participantId,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialVisibilityType: string;
  isReadonly: boolean;
  autoResume: boolean;
  participantId: string;
}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const handlePopState = () => {
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<"connected" | "pending" | "error">(
    "connected"
  );

  const sendMessage = async (message: ChatMessage) => {
    try {
      setStatus("pending");
      setMessages((prev) => [...prev, message]);

      const response = await fetchWithErrorHandlers("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          id,
          message,
          participantId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("connected");
      mutate(`/api/messages?chatId=${id}`);
    } catch (error) {
      setStatus("error");
      toast({
        type: "error",
        description: "Failed to send message",
      });
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        id: generateUUID(),
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, hasAppendedQuery, id]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream: () => {},
    setMessages,
  });

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader
        chatId={id}
        isReadonly={isReadonly}
        selectedVisibilityType={initialVisibilityType}
      />

      <Messages
        chatId={id}
        isReadonly={isReadonly}
        messages={messages}
        setMessages={setMessages}
        status={status}
      />

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        {!isReadonly && (
          <MultimodalInput
            chatId={id}
            input={input}
            messages={messages}
            participantId={participantId}
            sendMessage={sendMessage}
            setInput={setInput}
            setMessages={setMessages}
            status={status}
          />
        )}
      </div>
    </div>
  );
}
