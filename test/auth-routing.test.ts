import { describe, expect, it } from "vitest";
import { authErrorMessage, authRedirect, authStorageAvailable, browserAuthStorageAvailable } from "../components/app-provider";

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

  it("explains storage-partitioned browser failures without suggesting redirect auth", () => {
    expect(authErrorMessage({ code: "auth/operation-not-supported-in-this-environment" })).toContain("normal top-level browser tab");
    expect(authErrorMessage({ code: "auth/unsupported-persistence-type" })).toContain("site storage");
  });

  it("detects when popup-required browser storage is blocked", () => {
    const blockedStorage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    } as unknown as Storage;
    expect(authStorageAvailable(blockedStorage)).toBe(false);
    expect(authStorageAvailable(window.sessionStorage)).toBe(true);
  });

  it("rejects sessionStorage-only environments before popup auth starts", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    const blockedStorage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    } as unknown as Storage;
    Object.defineProperty(window, "localStorage", { configurable: true, get: () => blockedStorage });
    try {
      expect(browserAuthStorageAvailable()).toBe(false);
      expect(authErrorMessage({ code: "auth/storage-blocked" })).toContain("local site storage");
    } finally {
      if (original) Object.defineProperty(window, "localStorage", original);
    }
  });

  it("gives actionable popup and Firebase configuration errors", () => {
    expect(authErrorMessage({ code: "auth/popup-blocked" })).toContain("Allow pop-ups");
    expect(authErrorMessage({ code: "auth/unauthorized-domain" })).toContain("Firebase Console");
    expect(authErrorMessage({ code: "auth/popup-closed-by-user" })).toContain("closed");
  });
});
