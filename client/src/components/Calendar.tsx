"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Memory } from "@/types";

interface CalendarProps {
  memories: Memory[];
  onDateSelect?: (date: Date) => void;
}

export function CalendarView({ memories, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = monthStart.getDay();
  const paddingDays = Array.from({ length: startPadding }, (_, i) => i);

  const memoriesByDate = memories.reduce<Record<string, Memory[]>>(
    (acc, memory) => {
      const key = format(new Date(memory.createdAt), "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(memory);
      return acc;
    },
    {}
  );

  const selectedMemories = selectedDate
    ? memoriesByDate[format(selectedDate, "yyyy-MM-dd")] ?? []
    : [];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayMemories = memoriesByDate[dateKey] ?? [];
            const hasMemories = dayMemories.length > 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={dateKey}
                onClick={() => {
                  setSelectedDate(day);
                  onDateSelect?.(day);
                }}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors text-sm",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground/40",
                  isToday(day) && "ring-1 ring-primary",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && "hover:bg-white/5"
                )}
              >
                {format(day, "d")}
                {hasMemories && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayMemories.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 w-1 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-primary"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          {selectedMemories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No memories on this day.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedMemories.map((memory) => (
                <Link
                  key={memory._id}
                  href={`/memory/${memory._id}`}
                  className="flex items-center gap-3 glass-card p-3 hover:bg-card transition-colors"
                >
                  {memory.photos[0] && (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={memory.photos[0].url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{memory.title}</p>
                    {memory.mood && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {memory.mood}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
