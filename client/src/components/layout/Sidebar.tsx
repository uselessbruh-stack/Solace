"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Heart,
  Trash2,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuth } from "@/providers/AuthProvider";
import { signOutUser } from "@/lib/auth";
import { createNote } from "@/lib/firestore";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/collections", label: "Collections", icon: FolderOpen },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
          collapsed && "justify-center px-2",
          isActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore();
  const { user } = useAuth();
  const router = useRouter();

  const handleNewNote = async () => {
    if (!user) return;
    try {
      const noteId = await createNote({ userId: user.uid });
      router.push(`/note/${noteId}`);
    } catch (err) {
      console.error("Failed to create note:", err);
      toast.error("Failed to create note");
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar h-full transition-all duration-200",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2",
            isCollapsed && "justify-center w-full"
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground flex-shrink-0">
            <span className="text-[10px] font-bold text-background">S</span>
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold tracking-tight">Solace</span>
          )}
        </Link>
        {!isCollapsed && (
          <button
            className="text-muted-foreground hover:text-foreground p-0.5"
            onClick={toggle}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* New Note */}
      <div className="p-2">
        <Button
          onClick={handleNewNote}
          variant="secondary"
          className={cn(
            "w-full gap-1.5 h-8 text-xs",
            isCollapsed && "px-0 justify-center"
          )}
          size="sm"
        >
          <Plus className="h-3.5 w-3.5" />
          {!isCollapsed && "New note"}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-2 mb-1">
          <button
            className="flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
            onClick={() => {/* TODO: command palette */}}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="ml-auto text-[10px] text-muted-foreground/60">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} collapsed={isCollapsed} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-0.5 border-t border-sidebar-border p-2">
        {bottomItems.map((item) => (
          <NavLink key={item.href} {...item} collapsed={isCollapsed} />
        ))}

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors w-full",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && "Sign out"}
        </button>

        {isCollapsed && (
          <button
            onClick={toggle}
            className="flex items-center justify-center rounded-md px-2 py-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors w-full"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
