"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SongWithVotes } from "@/lib/types";
import { roleFor } from "@/lib/setlist";
import { updateSetlistOrder, resetSetlistOrder } from "./actions";

const ROLE_LABEL: Record<string, string> = {
  opener: "오프닝",
  finale: "피날레",
  body: "",
};

export function SetlistEditor({
  slug,
  songs,
  isManual,
}: {
  slug: string;
  songs: SongWithVotes[];
  isManual: boolean;
}) {
  const [items, setItems] = useState(songs);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next); // 낙관적 업데이트
    setError(null);
    startTransition(async () => {
      const result = await updateSetlistOrder(
        slug,
        next.map((s) => s.id),
      );
      if (!result.ok) {
        setError(result.error);
        setItems(items); // 실패 시 롤백
      }
    });
  }

  function onReset() {
    setError(null);
    startTransition(async () => {
      const result = await resetSetlistOrder(slug);
      if (!result.ok) setError(result.error);
      // 성공 시 revalidate 로 서버가 추천 순서를 다시 내려줌
    });
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="flex flex-col">
            {items.map((song, i) => (
              <SortableRow
                key={song.id}
                song={song}
                position={i + 1}
                role={roleFor(i, items.length)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {isManual && (
        <button
          type="button"
          onClick={onReset}
          disabled={pending}
          className="mt-3 text-xs text-muted underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
        >
          [ 추천 순서로 초기화 ]
        </button>
      )}
    </div>
  );
}

function SortableRow({
  song,
  position,
  role,
}: {
  song: SongWithVotes;
  position: number;
  role: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        "flex items-center gap-3 border-[var(--line)] bg-background py-2 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-dashed",
        isDragging ? "relative z-10 opacity-80" : "",
      ].join(" ")}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="드래그해서 순서 변경"
        className="flex-shrink-0 cursor-grab touch-none px-1 text-muted hover:text-foreground active:cursor-grabbing"
      >
        ⠿
      </button>
      <span className="text-sm font-bold tabular-nums text-muted">
        {String(position).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {song.title}
      </span>
      {ROLE_LABEL[role] && (
        <span className="flex-shrink-0 border border-foreground px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide">
          {ROLE_LABEL[role]}
        </span>
      )}
      <span className="flex-shrink-0 text-xs tabular-nums text-muted">
        ▲{String(song.vote_count).padStart(2, "0")}
      </span>
    </li>
  );
}
