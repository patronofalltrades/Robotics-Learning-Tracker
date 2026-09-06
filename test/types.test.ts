import { describe, expect, it } from "vitest";
import { emptyNotes, normalizeMilestone, normalizeProgress, validateUserSettings } from "../lib/types";
describe("runtime data constraints", () => {
  it("normalizes progress fields to the contract", () => { const value = normalizeProgress({ weekId: "week-1", confidence: 99, minutes: -3, notes: { ...emptyNotes, evidence: "e" } }); expect(value.confidence).toBe(5); expect(value.minutes).toBe(0); expect(value.notes.evidence).toBe("e"); expect(value.createdAt).toBeTruthy(); expect(value.updatedAt).toBeTruthy(); });
  it("derives milestone total and bounds rubric scores", () => { const value = normalizeMilestone({ checkpointId: "week-4", closedLoop: 2, vocabulary: 2, diagnosis: 2, modelEvaluation: 2, deployment: 2, conversation: 2 }); expect(value.total).toBe(12); expect(normalizeMilestone({ checkpointId: "week-8", closedLoop: 8 }).closedLoop).toBe(2); });
  it("rejects non-Friday setup dates", () => { expect(validateUserSettings({ firstFriday: "2026-09-05", timezone: "America/Los_Angeles", onboardingStatus: "not_started" })).toContain("First Friday must be a valid Friday date."); });
});
