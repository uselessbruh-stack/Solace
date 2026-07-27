"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import type { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/collections?id=${collection._id}`}>
        <article className="glass-card overflow-hidden group cursor-pointer">
          <div className="relative aspect-[16/9] bg-secondary overflow-hidden">
            {collection.coverPhoto ? (
              <Image
                src={collection.coverPhoto}
                alt={collection.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="font-semibold text-white">{collection.name}</h3>
              <p className="text-xs text-white/70 mt-0.5">
                {collection.memoryCount}{" "}
                {collection.memoryCount === 1 ? "memory" : "memories"}
              </p>
            </div>
          </div>
          {collection.description && (
            <p className="p-4 text-sm text-muted-foreground line-clamp-2">
              {collection.description}
            </p>
          )}
        </article>
      </Link>
    </motion.div>
  );
}
