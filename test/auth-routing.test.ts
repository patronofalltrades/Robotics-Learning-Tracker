import { describe, expect, it } from "vitest";
import { authRedirect } from "../components/app-provider";

describe("authentication routing", () => {
  it("sends a hydrated authenticated user from login to the tracker", () => {
    expect(authRedirect("/login", false, true, true)).toBe("/");
  });

  it("keeps an unauthenticated user on login", () => {
    expect(authRedirect("/login", false, false, true)).toBeNull();
  });

  it("sends unauthenticated or unhydrated users away from private routes", () => {
    expect(authRedirect("/progress", false, false, true)).toBe("/login");
    expect(authRedirect("/progress", false, true, false)).toBe("/login");
  });

  it("does not redirect while authentication is still loading", () => {
    expect(authRedirect("/login", true, true, true)).toBeNull();
  });
});
