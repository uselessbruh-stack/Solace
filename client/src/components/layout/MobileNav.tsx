"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { createNote } from "@/lib/firestore";
import { toast } from "sonner";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: null, label: "New", icon: Plus, isAction: true },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/settings", label: "Profile", icon: User },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleNewNote = async () => {
    if (!user) return;
    try {
      const noteId = await createNote({ userId: user.uid });
      router.push(`/note/${noteId}`);
    } catch {
      toast.error("Failed to create note");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-14 px-2">
        {mobileNavItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key="new"
                onClick={handleNewNote}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
                  <Plus className="h-4 w-4 text-background" />
                </div>
              </button>
            );
          }

          const isActive =
            item.href === pathname ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href!));

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
