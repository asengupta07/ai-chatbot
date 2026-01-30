import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <ChatPage params={props.params} />
    </Suspense>
  );
}

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    redirect("/");
  }

  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  if (chat.visibility === "private") {
    if (!session.user) {
      return notFound();
    }

    if (
      session.user.id !== chat.userId &&
      session.user.id !== chat.participantId
    ) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const isReadonly =
    session?.user?.id !== chat.userId &&
    session?.user?.id !== chat.participantId;

  const participantId =
    session.user.id === chat.userId ? chat.participantId : chat.userId;

  return (
    <Chat
      autoResume={true}
      id={chat.id}
      initialMessages={uiMessages}
      initialVisibilityType={chat.visibility}
      isReadonly={isReadonly}
      participantId={participantId}
    />
  );
}
