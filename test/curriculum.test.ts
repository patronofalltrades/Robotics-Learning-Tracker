import { describe, expect, it } from "vitest";
import { curriculum, curriculumErrors, resources } from "../lib/curriculum";

describe("curriculum contract", () => {
  it("contains exactly twelve ordered weeks with unique activities", () => {
    expect(curriculum).toHaveLength(12);
    expect(curriculumErrors).toEqual([]);
    const ids = curriculum.flatMap((week) => [...week.friday.activities, ...week.saturday.activities].map((item) => item.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("keeps the core resource spine represented", () => {
    expect(resources.map((item) => item.title)).toEqual(expect.arrayContaining(["Modern Robotics", "LeRobot documentation", "ROS 2 documentation", "Underactuated Robotics"]));
  });
  it("contains the Feynman metadata contract", () => {
    expect(curriculum.flatMap((week) => [...week.friday.activities, ...week.saturday.activities])).toHaveLength(69);
    expect(curriculum.flatMap((week) => week.questions ?? [])).toHaveLength(48);
    expect(new Set(curriculum.flatMap((week) => week.questions ?? []).map((question) => question.id)).size).toBe(48);
    expect(curriculum.every((week) => week.summary && week.objective && week.tags?.length && week.sources?.length)).toBe(true);
  });
});
