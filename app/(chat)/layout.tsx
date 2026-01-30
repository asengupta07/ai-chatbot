import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar user={{ name: "User", email: "user@example.com" }} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
