"use client";
import { play } from "@/lib/sound";

interface Props {
  leftFilled: number;
  rightFilled: number;
  onAdd: (next: { left: number; right: number }) => void;
  /** For subtraction: mark the last `takeAway` filled dots across both frames
   * with low opacity and a diagonal strikethrough. */
  takeAway?: number;
  /** Colour for the right frame's dots. Default 'blue' (addition convention
   * where right = second addend). Pass 'orange' for subtraction so both
   * frames show the same quantity colour. */
  rightColour?: "orange" | "blue";
  interactive?: boolean;
}

function Frame({
  filled,
  prefix,
  colour = "orange",
  takenAwayStart = Infinity,
  frameOffset = 0,
}: {
  filled: number;
  prefix: string;
  colour?: "orange" | "blue";
  takenAwayStart?: number;
  frameOffset?: number;
}) {
  const cells = Array.from({ length: 10 }, (_, i) => i < filled);
  return (
    <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-ink/80">
      {cells.map((on, i) => {
        const globalIndex = frameOffset + i;
        const isTakenAway = on && globalIndex >= takenAwayStart;
        return (
          <div
            key={i}
            data-testid={`dtf-cell-${prefix}-${on ? "filled" : "empty"}`}
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-cream"
            style={{ outline: "2px solid var(--ink)" }}
          >
            {on && (
              <div
                className={`relative w-9 h-9 rounded-full ${colour === "blue" ? "bg-blue" : "bg-orange"} ${isTakenAway ? "opacity-30" : ""}`}
              >
                {isTakenAway && (
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 36 36"
                    aria-hidden="true"
                  >
                    <line
                      x1="3"
                      y1="3"
                      x2="33"
                      y2="33"
                      stroke="black"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DoubleTensFrame({
  leftFilled,
  rightFilled,
  onAdd,
  takeAway = 0,
  rightColour = "blue",
  interactive = true,
}: Props) {
  const handleAdd = () => {
    play("drop");
    if (leftFilled < 10) onAdd({ left: leftFilled + 1, right: rightFilled });
    else onAdd({ left: leftFilled, right: rightFilled + 1 });
  };

  const totalFilled = leftFilled + rightFilled;
  // Global index at which taken-away dots start (the last `takeAway` filled dots)
  const takenAwayStart = takeAway > 0 ? totalFilled - takeAway : Infinity;

  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full">
      <div className="flex gap-6">
        <Frame
          filled={leftFilled}
          prefix="L"
          colour="orange"
          takenAwayStart={takenAwayStart}
          frameOffset={0}
        />
        <Frame
          filled={rightFilled}
          prefix="R"
          colour={rightColour}
          takenAwayStart={takenAwayStart}
          frameOffset={leftFilled}
        />
      </div>
      {interactive && (
        <button
          data-testid="dtf-tray-dot"
          onClick={handleAdd}
          className="w-16 h-16 rounded-full bg-orange border-4 border-ink/80 active:scale-95 transition-transform"
        />
      )}
    </div>
  );
}
