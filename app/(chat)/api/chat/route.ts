import { auth } from "@/app/(auth)/auth";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatTitleById,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";

export const maxDuration = 60;

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch (_) {
    return null;
  }
}

export { getStreamContext };

interface MessageRequestBody {
  id: string;
  message?: ChatMessage;
  messages?: ChatMessage[];
  participantId: string;
}

export async function POST(request: Request) {
  let requestBody: MessageRequestBody;

  try {
    const json = await request.json();
    requestBody = json;
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message, participantId } = requestBody;
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    // Check rate limiting
    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > 1000) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });

    if (chat) {
      if (
        chat.userId !== session.user.id &&
        chat.participantId !== session.user.id
      ) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    } else if (message?.role === "user") {
      // Create new conversation
      await saveChat({
        id,
        userId: session.user.id,
        title: "Conversation",
        visibility: "private",
        participantId,
        lastMessageAt: new Date(),
      });
    }

    // Save the message
    if (message?.role === "user") {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: "user",
            parts: message.parts,
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });

      // Update last message timestamp
      await updateChatTitleById({ chatId: id, title: "Conversation" });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (
    chat?.userId !== session.user.id &&
    chat?.participantId !== session.user.id
  ) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
