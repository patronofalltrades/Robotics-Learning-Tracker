"use client";

import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { auth, firebaseConfigured, googleProvider } from "../lib/firebase/client";
import { curriculum } from "../lib/curriculum";
import { emptyProgress, MilestoneScore, normalizeMilestone, normalizeProgress, normalizeSettings, UserSettings, validateUserSettings, WeekProgress } from "../lib/types";
import * as repo from "../lib/firebase/repository";

const demoAllowed = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test");
const demoUser = { uid: "demo-user", displayName: "Demo learner", email: "demo@local" };
const defaultSettings: UserSettings = { firstFriday: null, timezone: "America/Los_Angeles", onboardingStatus: "not_started" };
type SaveState = "idle" | "saving" | "saved" | "offline" | "error";
type AppContextValue = { user: User | typeof demoUser | null; loading: boolean; hydrated: boolean; demoMode: boolean; authError: string | null; settings: UserSettings; progress: Record<string, WeekProgress>; milestones: Record<string, MilestoneScore>; saveState: SaveState; saveError: string | null; signIn: () => Promise<void>; signOut: () => Promise<void>; updateSettings: (value: UserSettings) => Promise<void>; updateWeek: (value: WeekProgress) => Promise<void>; updateMilestone: (value: MilestoneScore) => Promise<void>; retry: () => Promise<void>; reset: () => Promise<void>; };
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppContextValue["user"]>(demoAllowed ? demoUser : null);
  const [loading, setLoading] = useState(firebaseConfigured && !demoAllowed);
  const [hydrated, setHydrated] = useState(demoAllowed || !firebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [progress, setProgress] = useState<Record<string, WeekProgress>>({});
  const [milestones, setMilestones] = useState<Record<string, MilestoneScore>>({});
  const [saveState, setSaveState] = useState<SaveState>(demoAllowed ? "offline" : "idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastWrite, setLastWrite] = useState<(() => Promise<void>) | null>(null);
  const requestRef = useRef(0); const pathname = usePathname(); const router = useRouter();
  useEffect(() => {
    if (!firebaseConfigured || !auth) return;
    return onAuthStateChanged(auth, async (nextUser) => {
      const request = ++requestRef.current;
      // Keep the previous account fully out of the tracker while this account
      // hydrates. The authenticated user is published only after all three
      // owner-scoped reads have completed successfully.
      setUser(null); setLoading(true); setHydrated(false); setAuthError(null); setSettings(defaultSettings); setProgress({}); setMilestones({}); setSaveState("idle"); setSaveError(null);
      if (!nextUser) { setLoading(false); setHydrated(true); return; }
      try {
        const [storedSettings, storedWeeks, storedMilestones] = await Promise.all([repo.loadSettings(nextUser.uid), repo.loadWeeks(nextUser.uid), repo.loadMilestones(nextUser.uid)]);
        if (request !== requestRef.current) return;
        setUser(nextUser);
        setSettings({ ...normalizeSettings(storedSettings), displayName: nextUser.displayName ?? undefined, email: nextUser.email ?? undefined });
        setProgress(Object.fromEntries(Object.entries(storedWeeks).map(([id, value]) => [id, normalizeProgress(value)])));
        setMilestones(Object.fromEntries(Object.entries(storedMilestones).map(([id, value]) => [id, normalizeMilestone(value)])));
        setHydrated(true); setLoading(false);
      } catch { if (request !== requestRef.current) return; setUser(null); setAuthError("Could not load your private notebook. Sign in again to retry."); setLoading(false); setHydrated(false); }
    });
  }, []);
  useEffect(() => { if (!loading && pathname !== "/login" && (!user || !hydrated)) router.replace("/login"); }, [loading, hydrated, pathname, router, user]);
  const withSave = async (write: () => Promise<void>) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { setSaveState("offline"); setSaveError("You appear offline. Reconnect, then retry."); setLastWrite(() => write); throw new Error("offline"); }
    setSaveState("saving"); setSaveError(null); setLastWrite(() => write);
    try { await write(); setSaveState("saved"); } catch (error) { setSaveState("error"); setSaveError("Could not save. Check your connection and retry."); throw error; }
  };
  const signIn = async () => { setAuthError(null); if (demoAllowed) { setUser(demoUser); setHydrated(true); setLoading(false); router.replace("/"); return; } if (!auth || !firebaseConfigured) { setAuthError("Firebase is not configured for this environment. Ask an administrator to add the public Firebase variables."); return; } try { await signInWithPopup(auth, googleProvider); } catch { setAuthError("Google sign-in did not complete. Try again."); } };
  const signOut = async () => { requestRef.current += 1; setUser(null); setLoading(true); setHydrated(false); setSettings(defaultSettings); setProgress({}); setMilestones({}); if (auth) await firebaseSignOut(auth); setLoading(false); setHydrated(true); router.replace("/login"); };
  const updateSettings = async (value: UserSettings) => { const errors = validateUserSettings(value); if (errors.length) throw new Error(errors[0]); const stamped = { ...value, onboardingStatus: "complete" as const, updatedAt: new Date().toISOString() }; setSettings(stamped); if (user && firebaseConfigured && hydrated) await withSave(() => repo.saveSettings(user.uid, stamped)); else if (demoAllowed) setSaveState("offline"); else throw new Error("not hydrated"); };
  const updateWeek = async (value: WeekProgress) => { const normalized = normalizeProgress(value); setProgress((previous) => ({ ...previous, [normalized.weekId]: normalized })); if (user && firebaseConfigured && hydrated) await withSave(() => repo.saveWeek(user.uid, normalized)); else if (demoAllowed) setSaveState("offline"); else throw new Error("not hydrated"); };
  const updateMilestone = async (value: MilestoneScore) => { const normalized = normalizeMilestone(value); setMilestones((previous) => ({ ...previous, [normalized.checkpointId]: normalized })); if (user && firebaseConfigured && hydrated) await withSave(() => repo.saveMilestone(user.uid, normalized)); else if (demoAllowed) setSaveState("offline"); else throw new Error("not hydrated"); };
  const retry = async () => { if (!lastWrite) throw new Error("No pending write to retry."); await withSave(lastWrite); };
  const reset = async () => { if (!user) return; if (firebaseConfigured && hydrated) await withSave(() => repo.resetUserData(user.uid)); else if (!demoAllowed) throw new Error("not hydrated"); setSettings(defaultSettings); setProgress({}); setMilestones({}); };
  const value: AppContextValue = { user, loading, hydrated, demoMode: demoAllowed, authError, settings, progress, milestones, saveState, saveError, signIn, signOut, updateSettings, updateWeek, updateMilestone, retry, reset };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => { const value = useContext(AppContext); if (!value) throw new Error("useApp must be inside AppProvider"); return value; };
export const getWeekProgress = (progress: Record<string, WeekProgress>, id: string) => progress[id] ?? emptyProgress(id);
export const totalActivities = curriculum.reduce((sum, week) => sum + week.friday.activities.length + week.saturday.activities.length, 0);
