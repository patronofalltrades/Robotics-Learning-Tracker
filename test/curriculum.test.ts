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
});
