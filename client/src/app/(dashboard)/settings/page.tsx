"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { signOutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Check, Moon, Sun, Blend } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeDefinition } from "@/types";

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeDefinition;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative rounded-lg border p-3 text-left transition-all hover:scale-[1.02]",
        isActive
          ? "border-foreground ring-1 ring-foreground/20"
          : "border-border hover:border-muted-foreground"
      )}
    >
      {isActive && (
        <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-foreground">
          <Check className="h-2.5 w-2.5 text-background" />
        </div>
      )}
      {/* Color swatches */}
      <div className="flex gap-1 mb-2.5">
        <div
          className="h-6 w-6 rounded-md shadow-sm"
          style={{ backgroundColor: theme.colors.background, border: "1px solid " + theme.colors.border }}
        />
        <div
          className="h-6 w-6 rounded-md shadow-sm"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="h-6 w-6 rounded-md shadow-sm"
          style={{ backgroundColor: theme.colors.card, border: "1px solid " + theme.colors.border }}
        />
        <div
          className="h-6 w-6 rounded-md shadow-sm"
          style={{ backgroundColor: theme.colors.secondary, border: "1px solid " + theme.colors.border }}
        />
      </div>
      <h3 className="text-xs font-medium">{theme.name}</h3>
      <p className="text-[11px] text-muted-foreground">{theme.description}</p>
    </button>
  );
}

export default function SettingsPage() {
  const { themeKey, setTheme, availableThemes } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  const darkThemes = availableThemes.filter((t) => t.isDark);
  const lightThemes = availableThemes.filter((t) => !t.isDark);

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Customize your workspace</p>
      </div>

      {/* Account */}
      <section className="mb-8">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Account</h2>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm font-medium">{user?.displayName ?? "User"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </section>

      {/* Dark Themes */}
      <section className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <Moon className="h-3 w-3 text-muted-foreground" />
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dark Themes</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {darkThemes.map((theme) => (
            <ThemeCard
              key={theme.key}
              theme={theme}
              isActive={themeKey === theme.key}
              onSelect={() => setTheme(theme.key)}
            />
          ))}
        </div>
      </section>

      {/* Light Themes */}
      <section className="mb-8">
        <div className="flex items-center gap-1.5 mb-3">
          <Sun className="h-3 w-3 text-muted-foreground" />
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Light Themes</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {lightThemes.map((theme) => (
            <ThemeCard
              key={theme.key}
              theme={theme}
              isActive={themeKey === theme.key}
              onSelect={() => setTheme(theme.key)}
            />
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mb-8">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">About</h2>
        <div className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Solace v0.1.0</p>
        </div>
      </section>

      {/* Sign out */}
      <section>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleSignOut}>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </section>
    </div>
  );
}
