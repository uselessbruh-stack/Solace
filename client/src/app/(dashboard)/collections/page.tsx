"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getCollections, createCollection } from "@/lib/firestore";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Collection } from "@/types";

export default function CollectionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getCollections(user.uid);
      setCollections(data);
    } catch (err) {
      console.error("Failed to load collections:", err);
      toast.error("Failed to load collections");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    try {
      await createCollection({ userId: user.uid, name: newName.trim() });
      setNewName("");
      setShowCreate(false);
      fetchCollections();
      toast.success("Collection created");
    } catch {
      toast.error("Failed to create collection");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Collections</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Organize your notes into folders
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>

      {showCreate && (
        <div className="border border-border rounded-lg p-3 mb-4 flex gap-2 animate-fade-in">
          <Input
            placeholder="Collection name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
            className="h-8 text-sm"
          />
          <Button onClick={handleCreate} disabled={!newName.trim()} size="sm" className="h-8 text-xs">
            Create
          </Button>
          <Button variant="ghost" onClick={() => setShowCreate(false)} size="sm" className="h-8 text-xs">
            Cancel
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections"
          description="Create collections to organize your notes."
          actionLabel="Create collection"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="border border-border rounded-lg p-4 cursor-pointer hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{col.icon}</span>
                <h3 className="font-medium text-sm truncate">{col.name}</h3>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {col.createdAt.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
