import { afterEach, describe, expect, it, vi } from "vitest";
import { hasServerConsent, parseEvaluation } from "../app/api/evaluate/route";

describe("server-side AI consent", () => {
  afterEach(() => vi.restoreAllMocks());
  it("requires both durable enablement and a consent timestamp", async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ fields: { aiFeedbackEnabled: { booleanValue: true }, aiConsentAt: { stringValue: "2026-09-06T00:00:00Z" } } }), { status: 200 }));
    await expect(hasServerConsent("owner", "firebase-token")).resolves.toBe(true);
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({ fields: { aiFeedbackEnabled: { booleanValue: true } } }), { status: 200 }));
    await expect(hasServerConsent("owner", "firebase-token")).resolves.toBe(false);
  });
  it("treats a missing settings document as no consent", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 404 }));
    await expect(hasServerConsent("owner", "firebase-token")).resolves.toBe(false);
  });
  it("rejects malformed upstream scores instead of coercing them", () => {
    expect(() => parseEvaluation(JSON.stringify({ accuracy: "3", causalReasoning: 2, simplicity: 2, transfer: 2, feedback: "ok", misconceptions: [], nextRevisionPrompt: "revise" }))).toThrow();
  });
});
