import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";

export default function Page() {
  const id = generateUUID();
  const participantId = generateUUID();

  return (
    <Chat
      id={id}
      initialVisibilityType="private"
      participantId={participantId}
    />
  );
}
