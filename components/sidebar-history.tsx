"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatItem } from "./sidebar-history-item";

const DUMMY_CHATS = [
  {
    id: "chat-1",
    title: "Project Discussion",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: "chat-2",
    title: "Design Feedback",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "chat-3",
    title: "Team Meeting Notes",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "chat-4",
    title: "Client Requirements",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
];

export function SidebarHistory({ user }: { user?: { name?: string; email?: string } }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const id = pathname?.startsWith("/chat/") ? pathname.split("/")[2] : null;

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chats, setChats] = useState(DUMMY_CHATS);

  const handleDelete = () => {
    if (deleteId) {
      setChats((prev) => prev.filter((chat) => chat.id !== deleteId));
    }
    setShowDeleteDialog(false);

    if (pathname === `/chat/${deleteId}`) {
      router.replace("/");
    }
  };

  return (
    <>
      <SidebarGroup>
        <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
          Conversations
        </div>
        <SidebarGroupContent>
          <SidebarMenu>
            {chats.map((chat, index) => (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                initial={{ opacity: 0, x: -10 }}
                key={chat.id}
                transition={{ delay: index * 0.05 }}
              >
                <ChatItem
                  chat={chat}
                  isActive={id === chat.id}
                  onDelete={(chatId) => {
                    setDeleteId(chatId);
                    setShowDeleteDialog(true);
                  }}
                  setOpenMobile={setOpenMobile}
                />
              </motion.div>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This conversation will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
