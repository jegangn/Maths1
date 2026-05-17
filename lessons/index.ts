import type { Lesson } from "@/lib/types";
import addReview01 from "./add-10-review-01.json" assert { type: "json" };
import addReview02 from "./add-10-review-02.json" assert { type: "json" };
import addReview03 from "./add-10-review-03.json" assert { type: "json" };
import addBonds01 from "./add-10-bonds-01.json" assert { type: "json" };
import addBonds02 from "./add-10-bonds-02.json" assert { type: "json" };
import addBonds03 from "./add-10-bonds-03.json" assert { type: "json" };
import addBonds04 from "./add-10-bonds-04.json" assert { type: "json" };
import addBonds05 from "./add-10-bonds-05.json" assert { type: "json" };
import addMakeTen01 from "./add-20-make-ten-01.json" assert { type: "json" };
import addMakeTen02 from "./add-20-make-ten-02.json" assert { type: "json" };
import addMakeTen03 from "./add-20-make-ten-03.json" assert { type: "json" };
import addMakeTen04 from "./add-20-make-ten-04.json" assert { type: "json" };
import addMakeTen05 from "./add-20-make-ten-05.json" assert { type: "json" };
import addMakeTen06 from "./add-20-make-ten-06.json" assert { type: "json" };
import add10001 from "./add-100-01.json" assert { type: "json" };
import add10002 from "./add-100-02.json" assert { type: "json" };
import add10003 from "./add-100-03.json" assert { type: "json" };
import add10004 from "./add-100-04.json" assert { type: "json" };
import add10005 from "./add-100-05.json" assert { type: "json" };
import subTakeaway01 from "./sub-5-takeaway-01.json" assert { type: "json" };
import subTakeaway02 from "./sub-5-takeaway-02.json" assert { type: "json" };
import subTakeaway03 from "./sub-5-takeaway-03.json" assert { type: "json" };
import subCountback01 from "./sub-10-countback-01.json" assert { type: "json" };
import subCountback02 from "./sub-10-countback-02.json" assert { type: "json" };
import subCountback03 from "./sub-10-countback-03.json" assert { type: "json" };
import subCountback04 from "./sub-10-countback-04.json" assert { type: "json" };
import subCountback05 from "./sub-10-countback-05.json" assert { type: "json" };
import subMissing01 from "./sub-10-missing-01.json" assert { type: "json" };
import subMissing02 from "./sub-10-missing-02.json" assert { type: "json" };
import subMissing03 from "./sub-10-missing-03.json" assert { type: "json" };
import subMissing04 from "./sub-10-missing-04.json" assert { type: "json" };
import subCrossTen01 from "./sub-20-cross-ten-01.json" assert { type: "json" };
import subCrossTen02 from "./sub-20-cross-ten-02.json" assert { type: "json" };
import subCrossTen03 from "./sub-20-cross-ten-03.json" assert { type: "json" };
import subCrossTen04 from "./sub-20-cross-ten-04.json" assert { type: "json" };
import subCrossTen05 from "./sub-20-cross-ten-05.json" assert { type: "json" };
import mulGroups01 from "./mul-groups-01.json" assert { type: "json" };
import mulGroups02 from "./mul-groups-02.json" assert { type: "json" };
import mulGroups03 from "./mul-groups-03.json" assert { type: "json" };
import mulGroups04 from "./mul-groups-04.json" assert { type: "json" };
import mulArrays01 from "./mul-arrays-01.json" assert { type: "json" };
import mulArrays02 from "./mul-arrays-02.json" assert { type: "json" };
import mulArrays03 from "./mul-arrays-03.json" assert { type: "json" };
import mulArrays04 from "./mul-arrays-04.json" assert { type: "json" };
import mulSkip01 from "./mul-skip-01.json" assert { type: "json" };
import mulSkip02 from "./mul-skip-02.json" assert { type: "json" };
import mulSkip03 from "./mul-skip-03.json" assert { type: "json" };
import mulSkip04 from "./mul-skip-04.json" assert { type: "json" };
import mulSkip05 from "./mul-skip-05.json" assert { type: "json" };
import mulTimes01 from "./mul-times-01.json" assert { type: "json" };
import mulTimes02 from "./mul-times-02.json" assert { type: "json" };
import mulTimes03 from "./mul-times-03.json" assert { type: "json" };
import mulTimes04 from "./mul-times-04.json" assert { type: "json" };
import mulTimes05 from "./mul-times-05.json" assert { type: "json" };
import mulTimes06 from "./mul-times-06.json" assert { type: "json" };

export const allLessons: Record<string, Lesson> = {
  "add-10-review-01": addReview01 as unknown as Lesson,
  "add-10-review-02": addReview02 as unknown as Lesson,
  "add-10-review-03": addReview03 as unknown as Lesson,
  "add-10-bonds-01": addBonds01 as unknown as Lesson,
  "add-10-bonds-02": addBonds02 as unknown as Lesson,
  "add-10-bonds-03": addBonds03 as unknown as Lesson,
  "add-10-bonds-04": addBonds04 as unknown as Lesson,
  "add-10-bonds-05": addBonds05 as unknown as Lesson,
  "add-20-make-ten-01": addMakeTen01 as unknown as Lesson,
  "add-20-make-ten-02": addMakeTen02 as unknown as Lesson,
  "add-20-make-ten-03": addMakeTen03 as unknown as Lesson,
  "add-20-make-ten-04": addMakeTen04 as unknown as Lesson,
  "add-20-make-ten-05": addMakeTen05 as unknown as Lesson,
  "add-20-make-ten-06": addMakeTen06 as unknown as Lesson,
  "add-100-01": add10001 as unknown as Lesson,
  "add-100-02": add10002 as unknown as Lesson,
  "add-100-03": add10003 as unknown as Lesson,
  "add-100-04": add10004 as unknown as Lesson,
  "add-100-05": add10005 as unknown as Lesson,
  "sub-5-takeaway-01": subTakeaway01 as unknown as Lesson,
  "sub-5-takeaway-02": subTakeaway02 as unknown as Lesson,
  "sub-5-takeaway-03": subTakeaway03 as unknown as Lesson,
  "sub-10-countback-01": subCountback01 as unknown as Lesson,
  "sub-10-countback-02": subCountback02 as unknown as Lesson,
  "sub-10-countback-03": subCountback03 as unknown as Lesson,
  "sub-10-countback-04": subCountback04 as unknown as Lesson,
  "sub-10-countback-05": subCountback05 as unknown as Lesson,
  "sub-10-missing-01": subMissing01 as unknown as Lesson,
  "sub-10-missing-02": subMissing02 as unknown as Lesson,
  "sub-10-missing-03": subMissing03 as unknown as Lesson,
  "sub-10-missing-04": subMissing04 as unknown as Lesson,
  "sub-20-cross-ten-01": subCrossTen01 as unknown as Lesson,
  "sub-20-cross-ten-02": subCrossTen02 as unknown as Lesson,
  "sub-20-cross-ten-03": subCrossTen03 as unknown as Lesson,
  "sub-20-cross-ten-04": subCrossTen04 as unknown as Lesson,
  "sub-20-cross-ten-05": subCrossTen05 as unknown as Lesson,
  "mul-groups-01": mulGroups01 as unknown as Lesson,
  "mul-groups-02": mulGroups02 as unknown as Lesson,
  "mul-groups-03": mulGroups03 as unknown as Lesson,
  "mul-groups-04": mulGroups04 as unknown as Lesson,
  "mul-arrays-01": mulArrays01 as unknown as Lesson,
  "mul-arrays-02": mulArrays02 as unknown as Lesson,
  "mul-arrays-03": mulArrays03 as unknown as Lesson,
  "mul-arrays-04": mulArrays04 as unknown as Lesson,
  "mul-skip-01": mulSkip01 as unknown as Lesson,
  "mul-skip-02": mulSkip02 as unknown as Lesson,
  "mul-skip-03": mulSkip03 as unknown as Lesson,
  "mul-skip-04": mulSkip04 as unknown as Lesson,
  "mul-skip-05": mulSkip05 as unknown as Lesson,
  "mul-times-01": mulTimes01 as unknown as Lesson,
  "mul-times-02": mulTimes02 as unknown as Lesson,
  "mul-times-03": mulTimes03 as unknown as Lesson,
  "mul-times-04": mulTimes04 as unknown as Lesson,
  "mul-times-05": mulTimes05 as unknown as Lesson,
  "mul-times-06": mulTimes06 as unknown as Lesson,
};

export function getLesson(id: string): Lesson | undefined {
  return allLessons[id];
}
