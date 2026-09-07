import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./client";
import { defaultUserSettings, MilestoneScore, QuizAttempt, UserSettings, WeekProgress } from "../types";

const requireDb = () => { if (!db) throw new Error("Firebase is not configured"); return db; };

export async function loadSettings(uid: string): Promise<UserSettings | null> {
  const snap = await getDoc(doc(requireDb(), "users", uid));
  return snap.exists() ? snap.data() as UserSettings : null;
}
export async function saveSettings(uid: string, value: UserSettings) {
  // The Web SDK setDoc promise resolves after the backend acknowledges the write.
  // Persistence is not enabled in client.ts, so an offline write rejects instead
  // of being reported as saved; callers retain their draft and expose Retry.
  await setDoc(doc(requireDb(), "users", uid), value, { merge: true });
}
export async function loadWeeks(uid: string): Promise<Record<string, WeekProgress>> {
  const snaps = await getDocs(collection(requireDb(), "users", uid, "weeks"));
  return Object.fromEntries(snaps.docs.map((item) => [item.id, item.data() as WeekProgress]));
}
export async function saveWeek(uid: string, value: WeekProgress) {
  // Await the server acknowledgement; do not add a second wait or timeout that
  // could turn one user action into duplicate or misleading writes.
  await setDoc(doc(requireDb(), "users", uid, "weeks", value.weekId), value, { merge: true });
}
export async function loadMilestones(uid: string): Promise<Record<string, MilestoneScore>> {
  const snaps = await getDocs(collection(requireDb(), "users", uid, "milestones"));
  return Object.fromEntries(snaps.docs.map((item) => [item.id, item.data() as MilestoneScore]));
}
export async function saveMilestone(uid: string, value: MilestoneScore) {
  // setDoc resolves on backend acknowledgement (offline persistence is disabled).
  await setDoc(doc(requireDb(), "users", uid, "milestones", value.checkpointId), value, { merge: true });
}
export async function loadQuizAttempts(uid: string, weekId: string): Promise<Record<string, QuizAttempt>> {
  const snaps = await getDocs(collection(requireDb(), "users", uid, "weeks", weekId, "quizAttempts"));
  return Object.fromEntries(snaps.docs.map((item) => [item.id, item.data() as QuizAttempt]));
}
export async function saveQuizAttempt(uid: string, value: QuizAttempt) {
  await setDoc(doc(requireDb(), "users", uid, "weeks", value.weekId, "quizAttempts", value.id), value, { merge: true });
}
export async function resetUserData(uid: string) {
  const database = requireDb();
  const [weeks, milestones] = await Promise.all([
    getDocs(collection(database, "users", uid, "weeks")), getDocs(collection(database, "users", uid, "milestones")),
  ]);
  const attempts = await Promise.all(weeks.docs.map((week) => getDocs(collection(database, "users", uid, "weeks", week.id, "quizAttempts"))));
  await Promise.all([...weeks.docs, ...milestones.docs, ...attempts.flatMap((result) => result.docs)].map((item) => deleteDoc(item.ref)));
  await setDoc(doc(database, "users", uid), { ...defaultUserSettings, updatedAt: new Date().toISOString() }, { merge: true });
}
