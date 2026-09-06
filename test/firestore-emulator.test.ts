import { afterAll, beforeAll, describe, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";

const enabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
describe.skipIf(!enabled)("Firestore emulator owner isolation", () => {
  let env: RulesTestEnvironment;
  beforeAll(async () => { env = await initializeTestEnvironment({ projectId: "robotics-tracker-rules", firestore: { rules: readFileSync("firestore.rules", "utf8") } }); });
  afterAll(async () => { await env.cleanup(); });
  it("denies unauthenticated root access and other-user access at every owner path", async () => { await assertFails(env.unauthenticatedContext().firestore().collection("users").doc("a").get()); const other = env.authenticatedContext("b").firestore(); await assertFails(other.collection("users").doc("a").get()); await assertFails(other.collection("users").doc("a").set({ bad: true })); await assertFails(getDoc(doc(other, "users", "a", "weeks", "week-1"))); await assertFails(setDoc(doc(other, "users", "a", "weeks", "week-1"), { bad: true })); await assertFails(getDoc(doc(other, "users", "a", "milestones", "week-4"))); await assertFails(setDoc(doc(other, "users", "a", "milestones", "week-4"), { bad: true })); });
  it("allows the owner root, weeks, and milestones", async () => { const db = env.authenticatedContext("a").firestore(); await assertSucceeds(setDoc(doc(db, "users", "a"), { onboardingStatus: "complete" })); await assertSucceeds(setDoc(doc(db, "users", "a", "weeks", "week-1"), { weekId: "week-1" })); await assertSucceeds(setDoc(doc(db, "users", "a", "milestones", "week-4"), { checkpointId: "week-4" })); await assertSucceeds(getDoc(doc(db, "users", "a"))); });
  it("denies unexpected roots", async () => { await assertFails(env.authenticatedContext("a").firestore().collection("admin").doc("x").set({ bad: true })); });
});
