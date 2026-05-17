import type { Lesson } from "@/lib/types";
import addReview01 from "./add-10-review-01.json" assert { type: "json" };
import addBonds01 from "./add-10-bonds-01.json" assert { type: "json" };

export const allLessons: Record<string, Lesson> = {
  "add-10-review-01": addReview01 as unknown as Lesson,
  "add-10-bonds-01": addBonds01 as unknown as Lesson,
};

export function getLesson(id: string): Lesson | undefined {
  return allLessons[id];
}
