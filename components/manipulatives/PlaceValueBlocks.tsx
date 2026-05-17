"use client";
import { play } from "@/lib/sound";

interface Props {
  tens: number;
  ones: number;
  onChange: (next: { tens: number; ones: number }) => void;
}

export function PlaceValueBlocks({ tens, ones, onChange }: Props) {
  const handleAddRod = () => {
    play("drop");
    onChange({ tens: tens + 1, ones });
  };
  const handleAddCube = () => {
    play("drop");
    onChange({ tens, ones: ones + 1 });
  };
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 items-end min-h-[200px]">
        {Array.from({ length: tens }, (_, i) => (
          <div
            key={`r${i}`}
            data-testid="pv-rod"
            className="w-10 h-[180px] bg-blue rounded-md border-2 border-ink/80"
          />
        ))}
        <div className="flex flex-wrap w-32 gap-1 items-end">
          {Array.from({ length: ones }, (_, i) => (
            <div
              key={`c${i}`}
              data-testid="pv-cube"
              className="w-8 h-8 bg-coral rounded-sm border-2 border-ink/80"
            />
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <button
          data-testid="pv-add-rod"
          onClick={handleAddRod}
          className="px-4 py-3 bg-blue rounded-xl border-2 border-ink/80"
        >
          + Rod (10)
        </button>
        <button
          data-testid="pv-add-cube"
          onClick={handleAddCube}
          className="px-4 py-3 bg-coral rounded-xl border-2 border-ink/80"
        >
          + Cube (1)
        </button>
      </div>
    </div>
  );
}
