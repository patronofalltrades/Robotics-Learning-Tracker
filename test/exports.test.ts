import { describe, expect, it } from "vitest";
import { buildExportPayload, markdownExport } from "../lib/exports";
import { emptyNotes, normalizeMilestone, normalizeProgress, UserSettings } from "../lib/types";

const settings: UserSettings = { firstFriday: "2026-09-04", timezone: "America/Los_Angeles", onboardingStatus: "complete" };
const progress = { "week-1": normalizeProgress({ weekId: "week-1", completedActivityIds: ["w1-f1"], fridayComplete: false, saturdayComplete: false, briefComplete: false, confidence: 4, minutes: 120, notes: { ...emptyNotes, evidence: "Measured run", gaps: "Latency" }, biggestQuestion: "Latency" }) };
describe("exports", () => {
  const milestones = { "week-4": normalizeMilestone({ checkpointId: "week-4", closedLoop: 2, vocabulary: 2, diagnosis: 2, modelEvaluation: 2, deployment: 2, conversation: 2, notes: "Strong synthesis", completionDate: "2026-10-02" }) };
  it("includes schema metadata, settings, every week map, and milestones in JSON", () => { const payload = buildExportPayload(settings, progress, milestones); expect(payload.schema).toBe("robotics-learning-tracker"); expect(payload.version).toBeTruthy(); expect(payload.settings).toEqual(settings); expect(payload.weeks["week-1"].minutes).toBe(120); expect(payload.milestones["week-4"].total).toBe(12); });
  it("includes every required LearningNotes field, progress metadata, and milestone rubric in Markdown", () => { const output = markdownExport(settings, progress, milestones); for (const heading of ["Mechanism", "Loop position", "Tradeoff", "Evidence", "Failure mode", "Business implication", "Founder question", "Engineer question", "Investor question", "Two-minute explanation", "Gaps", "Retrieval prompt", "Biggest question"]) expect(output).toContain(`### ${heading}`); expect(output).toContain("Friday complete:"); expect(output).toContain("Confidence: 4/5"); expect(output).toContain("Time: 120 minutes"); expect(output.match(/### Milestone score/g)).toHaveLength(3); expect(output).toContain("Total: 12/12"); expect(output).toContain("Strong synthesis"); expect(output).toContain("Completion date: 2026-10-02"); });
});
