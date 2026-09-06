import { describe, expect, it } from "vitest";
import { currentWeek, sessionFor } from "../lib/dates";
import { isFridayDate, isValidTimezone, validateUserSettings } from "../lib/types";
describe("calendar logic", () => {
  it("starts at week one without a date", () => expect(currentWeek(null, new Date("2026-09-06T12:00:00Z"))).toBe(1));
  it("advances by Friday anchors", () => { expect(currentWeek("2026-09-04", new Date("2026-09-11T18:00:00Z"), "America/Los_Angeles")).toBe(2); });
  it("labels Friday and Saturday sessions", () => { expect(sessionFor("2026-09-04", new Date("2026-09-04T18:00:00Z"), "America/Los_Angeles").session).toBe("friday"); expect(sessionFor("2026-09-04", new Date("2026-09-05T18:00:00Z"), "America/Los_Angeles").session).toBe("saturday"); });
  it("handles pre-start, post-end, DST, and invalid inputs", () => { expect(currentWeek("2026-09-11", new Date("2026-09-04T12:00:00Z"))).toBe(1); expect(currentWeek("2026-09-04", new Date("2027-01-01T12:00:00Z"))).toBe(12); expect(sessionFor("2026-03-06", new Date("2026-03-13T07:30:00Z"), "America/Los_Angeles").week).toBe(2); expect(isFridayDate("2026-09-04")).toBe(true); expect(isFridayDate("2026-09-05")).toBe(false); expect(isValidTimezone("Not/Timezone")).toBe(false); expect(validateUserSettings({ firstFriday: "2026-09-05", timezone: "Not/Timezone", onboardingStatus: "not_started" })).toHaveLength(2); });
});
