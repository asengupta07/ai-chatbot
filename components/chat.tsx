"use client";

import { useState } from "react";
import { ChatHeader } from "@/components/chat-header";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";

const DUMMY_MESSAGES: ChatMessage[] = [
  {
    id: generateUUID(),
    role: "user" as const,
    parts: [{ type: "text", text: "Hey! How's your day going?" }],
  },
  {
    id: generateUUID(),
    role: "assistant" as const,
    parts: [{ type: "text", text: "Great! Just working on some cool projects. You?" }],
  },
  {
    id: generateUUID(),
    role: "user" as const,
    parts: [{ type: "text", text: "Pretty good! Can't wait for the weekend 😄" }],
  },
  {
    id: generateUUID(),
    role: "assistant" as const,
    parts: [{ type: "text", text: "Same here! Any plans?" }],
  },
];

export function Chat({
  id,
  initialMessages = DUMMY_MESSAGES,
  initialVisibilityType,
  isReadonly = false,
  participantId,
}: {
  id: string;
  initialMessages?: ChatMessage[];
  initialVisibilityType: string;
  isReadonly?: boolean;
  participantId: string;
}) {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status] = useState<"connected" | "pending" | "error">(
    "connected"
  );

  const sendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    
    // Simulate a response after a short delay
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: generateUUID(),
        role: "assistant" as const,
        parts: [{ type: "text", text: "That sounds great! 👍" }],
      }]);
    }, 800);
  };

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
