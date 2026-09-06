import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Static fallback checks (not a substitute for emulator coverage). Run the real
 * assertions in firestore-emulator.test.ts against the Firestore
 * emulator with `firebase emulators:exec --only firestore "npm test"` in CI.
 * The static assertions keep the deny-by-default posture visible even when no
 * emulator process is available in a local preview.
 */
describe("Firestore owner-only rules", () => {
  const rules = readFileSync("firestore.rules", "utf8");
  it("requires auth ownership for the user root and both subcollections", () => {
    expect(rules).toContain("request.auth != null && request.auth.uid == userId");
    expect(rules).toContain("match /weeks/{weekId}");
    expect(rules).toContain("match /milestones/{checkpointId}");
  });
  it("denies unexpected roots by default", () => {
    expect(rules).toContain("match /{document=**} { allow read, write: if false; }");
  });
});
