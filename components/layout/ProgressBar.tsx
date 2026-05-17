"use client";

interface Props {
  total: number;
  filled: number;
}

export function ProgressBar({ total, filled }: Props) {
  return (
    <div className="flex gap-2 w-full">
      {Array.from({ length: total }, (_, i) => {
        const on = i < filled;
        return (
          <div
            key={i}
            data-testid="pb-dot"
            className={`flex-1 h-4 rounded-full border-2 border-ink/60 ${on ? "bg-yellow" : "bg-white"}`}
          >
            {on && <span data-testid="pb-dot-filled" className="hidden" />}
          </div>
        );
      })}
    </div>
  );
}
