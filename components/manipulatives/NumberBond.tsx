"use client";

interface Props {
  whole: number | null;
  partA: number | null;
  partB: number | null;
  onSet: (slot: "whole" | "partA" | "partB") => void;
}

function Circle({
  value,
  testId,
  onClick,
}: {
  value: number | null;
  testId: string;
  onClick: () => void;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="w-24 h-24 rounded-full bg-white border-4 border-ink/80 flex items-center justify-center text-3xl font-bold"
    >
      {value ?? "?"}
    </button>
  );
}

export function NumberBond({ whole, partA, partB, onSet }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Circle value={whole} testId="nb-whole" onClick={() => onSet("whole")} />
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <div className="w-1 h-6 bg-ink/70" />
          <Circle
            value={partA}
            testId="nb-part-a"
            onClick={() => onSet("partA")}
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-1 h-6 bg-ink/70" />
          <Circle
            value={partB}
            testId="nb-part-b"
            onClick={() => onSet("partB")}
          />
        </div>
      </div>
    </div>
  );
}
