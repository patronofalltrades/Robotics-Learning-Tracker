import type { WeekProgress } from "./types";

/**
 * Keep the pending write local to a topic page. This intentionally does not
 * use the provider's cross-feature retry queue: a milestone or settings write
 * must never replace the week payload a learner is trying to recover.
 */
export function snapshotWeekProgress(value: WeekProgress): WeekProgress {
  return {
    ...value,
    completedActivityIds: [...value.completedActivityIds],
    notes: { ...value.notes },
    reflections: Object.fromEntries(Object.entries(value.reflections).map(([id, reflection]) => [id, { ...reflection }])),
    mastery: value.mastery
      ? {
          ...value.mastery,
          dimensions: { ...value.mastery.dimensions },
          completedQuestionIds: [...value.mastery.completedQuestionIds],
          weakQuestionIds: [...value.mastery.weakQuestionIds],
          openQuestions: [...value.mastery.openQuestions],
          misconceptions: [...value.mastery.misconceptions],
        }
      : null,
  };
}

export function createWeekSaveController(write: (value: WeekProgress) => Promise<void>) {
  let pending: WeekProgress | null = null;

  return {
    async save(value: WeekProgress) {
      const payload = snapshotWeekProgress(value);
      pending = payload;
      try {
        await write(payload);
        pending = null;
      } catch (error) {
        // Keep the immutable payload available to the retry action.
        throw error;
      }
    },
    async retry() {
      if (!pending) throw new Error("No pending week write to retry.");
      const payload = pending;
      try {
        await write(payload);
        pending = null;
      } catch (error) {
        throw error;
      }
    },
    hasPending() {
      return pending !== null;
    },
    clear() {
      pending = null;
    },
  };
}
