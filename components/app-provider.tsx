"use client";

import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithPopup, signOut as firebaseSignOut, type AuthError, type User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { auth, firebaseConfigured, googleProvider } from "../lib/firebase/client";
import { curriculum } from "../lib/curriculum";
import { defaultUserSettings, emptyProgress, MilestoneScore, normalizeMilestone, normalizeProgress, normalizeSettings, QuizAttempt, UserSettings, validateUserSettings, WeekProgress } from "../lib/types";
import * as repo from "../lib/firebase/repository";

const demoAllowed = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test");
const demoUser = { uid: "demo-user", displayName: "Demo learner", email: "demo@local", photoURL: undefined };
const defaultSettings: UserSettings = defaultUserSettings;
type SaveState = "idle" | "saving" | "saved" | "offline" | "error";
type AppContextValue = { user: User | typeof demoUser | null; loading: boolean; hydrated: boolean; demoMode: boolean; authError: string | null; settings: UserSettings; progress: Record<string, WeekProgress>; milestones: Record<string, MilestoneScore>; attempts: Record<string, QuizAttempt>; saveState: SaveState; saveError: string | null; signIn: () => Promise<void>; signOut: () => Promise<void>; updateSettings: (value: UserSettings) => Promise<void>; updateWeek: (value: WeekProgress) => Promise<void>; updateMilestone: (value: MilestoneScore) => Promise<void>; saveQuizAttempt: (value: QuizAttempt) => Promise<void>; retry: () => Promise<void>; reset: () => Promise<void>; };
const AppContext = createContext<AppContextValue | null>(null);

/** Firebase's popup resolver requires at least one usable web-storage backend. */
export function authStorageAvailable(storage: Storage | undefined) {
  if (!storage) return false;
  const key = "__robotics_learning_tracker_auth_probe__";
  try {
    const previous = storage.getItem(key);
    storage.setItem(key, "ok");
    storage.removeItem(key);
    if (previous !== null) storage.setItem(key, previous);
    return true;
  } catch {
    return false;
  }
}

export function browserAuthStorageAvailable() {
  if (typeof window === "undefined") return false;
  const getStorage = (kind: "localStorage" | "sessionStorage") => {
    try {
      return window[kind];
    } catch {
      return undefined;
    }
  };
  return authStorageAvailable(getStorage("localStorage"));
}

export async function configureAuthPersistence(authInstance: NonNullable<typeof auth>): Promise<"LOCAL" | null> {
  try {
    await setPersistence(authInstance, browserLocalPersistence);
    return "LOCAL";
  } catch {
    // Popup auth cannot bootstrap without localStorage.
  }
  return null;
}

export function authErrorMessage(error: unknown) {
  const code = (error as Partial<AuthError> | undefined)?.code ?? "";
  switch (code) {
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups for this site, then try again.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before sign-in finished. Try again when you are ready.";
    case "auth/cancelled-popup-request":
      return "A Google sign-in window is already open. Finish it or close it before trying again.";
    case "auth/unauthorized-domain":
      return "This deployment is not authorized in Firebase Authentication. Add its domain in Firebase Console, then retry.";
    case "auth/operation-not-supported-in-this-environment":
    case "auth/unsupported-persistence-type":
      return "This browser is blocking authentication storage. Open the tracker in a normal top-level browser tab and allow site storage.";
    case "auth/storage-blocked":
      return "This browser is blocking local site storage. Open the tracker in a normal top-level browser tab and allow local site storage.";
    case "auth/network-request-failed":
      return "Google sign-in could not reach Firebase. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Firebase temporarily paused sign-in attempts from this browser. Wait a moment, then try again.";
    default:
      return "Google sign-in did not complete. Try again.";
  }
}

export function authRedirect(pathname: string, loading: boolean, hasUser: boolean, hydrated: boolean) {
  if (loading) return null;
  if (pathname === "/login") return hasUser && hydrated ? "/" : null;
  return !hasUser || !hydrated ? "/login" : null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppContextValue["user"]>(demoAllowed ? demoUser : null);
  const [loading, setLoading] = useState(firebaseConfigured && !demoAllowed);
  const [hydrated, setHydrated] = useState(demoAllowed || !firebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [progress, setProgress] = useState<Record<string, WeekProgress>>({});
  const [milestones, setMilestones] = useState<Record<string, MilestoneScore>>({});
  const [attempts, setAttempts] = useState<Record<string, QuizAttempt>>({});
  const [saveState, setSaveState] = useState<SaveState>(demoAllowed ? "offline" : "idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastWrite, setLastWrite] = useState<(() => Promise<void>) | null>(null);
  const persistenceReadyRef = useRef<Promise<"LOCAL" | "SESSION" | null> | null>(null);
  const signInInFlightRef = useRef(false);
  const requestRef = useRef(0); const pathname = usePathname(); const router = useRouter();
  useEffect(() => {
    if (demoAllowed) return;
    if (!firebaseConfigured || !auth) return;
    persistenceReadyRef.current = configureAuthPersistence(auth);
    return onAuthStateChanged(auth, async (nextUser) => {
      const request = ++requestRef.current;
      // Keep the previous account fully out of the tracker while this account
      // hydrates. The authenticated user is published only after all three
      // owner-scoped reads have completed successfully.
      setUser(null); setLoading(true); setHydrated(false); setAuthError(null); setSettings(defaultSettings); setProgress({}); setMilestones({}); setAttempts({}); setSaveState("idle"); setSaveError(null);
      if (!nextUser) { setLoading(false); setHydrated(true); return; }
      try {
        const [storedSettings, storedWeeks, storedMilestones] = await Promise.all([repo.loadSettings(nextUser.uid), repo.loadWeeks(nextUser.uid), repo.loadMilestones(nextUser.uid)]);
        const storedAttempts = await Promise.all(curriculum.map((week) => repo.loadQuizAttempts(nextUser.uid, week.id)));
        if (request !== requestRef.current) return;
        setUser(nextUser);
        setSettings({ ...normalizeSettings(storedSettings), displayName: nextUser.displayName ?? undefined, email: nextUser.email ?? undefined });
        setProgress(Object.fromEntries(Object.entries(storedWeeks).map(([id, value]) => [id, normalizeProgress(value)])));
        setMilestones(Object.fromEntries(Object.entries(storedMilestones).map(([id, value]) => [id, normalizeMilestone(value)])));
        setAttempts(Object.assign({}, ...storedAttempts));
        setHydrated(true); setLoading(false);
      } catch { if (request !== requestRef.current) return; setUser(null); setAuthError("Could not load your private notebook. Sign in again to retry."); setLoading(false); setHydrated(false); }
    });
  }, []);
  useEffect(() => {
    const destination = authRedirect(pathname, loading, Boolean(user), hydrated);
    if (destination) router.replace(destination);
  }, [loading, hydrated, pathname, router, user]);
  const withSave = async (write: () => Promise<void>) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { setSaveState("offline"); setSaveError("You appear offline. Reconnect, then retry."); setLastWrite(() => write); throw new Error("offline"); }
    setSaveState("saving"); setSaveError(null); setLastWrite(() => write);
    try { await write(); setSaveState("saved"); } catch (error) { setSaveState("error"); setSaveError("Could not save. Check your connection and retry."); throw error; }
  };
  const signIn = async () => {
    if (signInInFlightRef.current) return;
    setAuthError(null);
    if (demoAllowed) { setUser(demoUser); setHydrated(true); setLoading(false); router.replace("/"); return; }
    if (!auth || !firebaseConfigured) { setAuthError("Firebase is not configured for this environment. Ask an administrator to add the public Firebase variables."); return; }
    signInInFlightRef.current = true;
    setLoading(true);
    try {
      if (!browserAuthStorageAvailable()) throw { code: "auth/storage-blocked" };
      const persistence = await (persistenceReadyRef.current ?? configureAuthPersistence(auth));
      if (!persistence) throw { code: "auth/storage-blocked" };
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      setHydrated(true);
      setAuthError(authErrorMessage(error));
    } finally {
      signInInFlightRef.current = false;
    }
  };
  const signOut = async () => { requestRef.current += 1; setUser(null); setLoading(true); setHydrated(false); setSettings(defaultSettings); setProgress({}); setMilestones({}); setAttempts({}); if (auth) await firebaseSignOut(auth); setLoading(false); setHydrated(true); router.replace("/login"); };
  const updateSettings = async (value: UserSettings) => { const errors = validateUserSettings(value); if (errors.length) throw new Error(errors[0]); const stamped = { ...value, onboardingStatus: "complete" as const, updatedAt: new Date().toISOString() }; setSettings(stamped); if (demoAllowed) setSaveState("offline"); else if (user && firebaseConfigured && hydrated) await withSave(() => repo.saveSettings(user.uid, stamped)); else throw new Error("not hydrated"); };
  const updateWeek = async (value: WeekProgress) => { const normalized = normalizeProgress(value); setProgress((previous) => ({ ...previous, [normalized.weekId]: normalized })); if (demoAllowed) setSaveState("offline"); else if (user && firebaseConfigured && hydrated) await withSave(() => repo.saveWeek(user.uid, normalized)); else throw new Error("not hydrated"); };
  const updateMilestone = async (value: MilestoneScore) => { const normalized = normalizeMilestone(value); setMilestones((previous) => ({ ...previous, [normalized.checkpointId]: normalized })); if (demoAllowed) setSaveState("offline"); else if (user && firebaseConfigured && hydrated) await withSave(() => repo.saveMilestone(user.uid, normalized)); else throw new Error("not hydrated"); };
  const saveQuizAttempt = async (value: QuizAttempt) => { setAttempts((previous) => ({ ...previous, [value.id]: value })); if (demoAllowed) setSaveState("offline"); else if (user && firebaseConfigured && hydrated) await withSave(() => repo.saveQuizAttempt(user.uid, value)); else throw new Error("not hydrated"); };
  const retry = async () => { if (!lastWrite) throw new Error("No pending write to retry."); await withSave(lastWrite); };
  const reset = async () => { if (!user) return; if (demoAllowed) setSaveState("offline"); else if (firebaseConfigured && hydrated) await withSave(() => repo.resetUserData(user.uid)); else throw new Error("not hydrated"); setSettings(defaultSettings); setProgress({}); setMilestones({}); setAttempts({}); };
  const value: AppContextValue = { user, loading, hydrated, demoMode: demoAllowed, authError, settings, progress, milestones, attempts, saveState, saveError, signIn, signOut, updateSettings, updateWeek, updateMilestone, saveQuizAttempt, retry, reset };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => { const value = useContext(AppContext); if (!value) throw new Error("useApp must be inside AppProvider"); return value; };
export const getWeekProgress = (progress: Record<string, WeekProgress>, id: string) => progress[id] ?? emptyProgress(id);
export const totalActivities = curriculum.reduce((sum, week) => sum + week.friday.activities.length + week.saturday.activities.length, 0);
