"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Layers,
  Palette,
  Music,
  FileText,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Block-based editor",
    description:
      "Paragraphs, headings, checklists, code blocks, quotes — all composable building blocks.",
  },
  {
    icon: Music,
    title: "Embedded music",
    description:
      "Search and play audio tracks directly inside your notes.",
  },
  {
    icon: Layers,
    title: "Collections",
    description:
      "Organize notes into folders that mirror how you think.",
  },
  {
    icon: Palette,
    title: "Themes",
    description:
      "Switch between Midnight, Minimal, and Coffee to match your mood.",
  },
  {
    icon: Zap,
    title: "Auto-save",
    description:
      "Changes save automatically as you type. Never lose work.",
  },
  {
    icon: Sparkles,
    title: "Installable",
    description:
      "Add to your home screen as a PWA. Works on desktop and mobile.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <span className="text-sm font-bold text-background">S</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Solace</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-32">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Your thoughts,<br />beautifully organized.
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-lg leading-relaxed">
            A block-based workspace for notes, tasks, and ideas. 
            Write freely with text, checklists, code, music, and more.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start writing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Editor preview */}
        <motion.div
          className="mt-20 border border-border rounded-lg overflow-hidden bg-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]/50" />
            </div>
            <span className="flex-1 text-center text-xs text-muted-foreground">
              Project Notes — Solace
            </span>
          </div>
          {/* Mock content */}
          <div className="p-6 md:p-8 space-y-3">
            <h2 className="text-xl font-semibold">Project kickoff</h2>
            <div className="flex gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                #work
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                #planning
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We kicked off the new redesign today. Main goals: improve performance,
              modernize the UI, and add better collaboration features.
            </p>
            <div className="space-y-1.5 pl-0.5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="accent-foreground w-3.5 h-3.5" />
                <span className="line-through text-muted-foreground">Set up repository</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="accent-foreground w-3.5 h-3.5" />
                <span className="line-through text-muted-foreground">Create design system</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" readOnly className="w-3.5 h-3.5" />
                <span>Build component library</span>
              </label>
            </div>
            <blockquote className="border-l-2 border-border pl-3 text-sm text-muted-foreground">
              &ldquo;Good design is as little design as possible.&rdquo; — Dieter Rams
            </blockquote>
            <div className="flex items-center gap-2.5 bg-secondary rounded-lg p-2.5 max-w-[240px]">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background">
                <Music className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">Lofi Focus Beats</p>
                <p className="text-[11px] text-muted-foreground">Chillhop Music</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border border-border">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-card p-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <feature.icon className="h-4 w-4 text-muted-foreground mb-3" />
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Solace
      </footer>
    </div>
  );
}
