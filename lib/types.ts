export type SessionKind = "friday" | "saturday" | "conversation";

export type CurriculumResource = {
  id: string;
  title: string;
  source: string;
  url?: string;
  kind: "course" | "book" | "paper" | "vault" | "docs" | "video" | "repository" | "essay";
};

export type CurriculumActivity = {
  id: string;
  title: string;
  detail: string;
  session: "friday" | "saturday";
  optional?: boolean;
  /** A short, plain-language teaching frame shown before the reflection fields. */
  explanation?: string;
  source?: string;
  sourceIds?: string[];
};

export type FeynmanQuestion = {
  id: string;
  prompt: string;
  dimension: "accuracy" | "causalReasoning" | "simplicity" | "transfer";
  rubric: string;
};

export type CurriculumWeek = {
  id: string;
  number: number;
  title: string;
  mechanisms: string[];
  friday: { duration: string; summary: string; activities: CurriculumActivity[] };
  saturday: { duration: string; summary: string; activities: CurriculumActivity[] };
  output: string;
  conversationTest: string;
  resources: CurriculumResource[];
  summary?: string;
  objective?: string;
  tags?: string[];
  sources?: string[];
  questions?: [FeynmanQuestion, FeynmanQuestion, FeynmanQuestion, FeynmanQuestion];
};

export type LessonReflection = {
  activityId: string;
  explanation: string;
  unclear: string;
  scratchNotes: string;
  explanationSavedAt?: string;
  unclearSavedAt?: string;
  updatedAt: string;
};

export type FeynmanEvaluation = {
  id: string;
  questionId: string;
  accuracy: number;
  causalReasoning: number;
  simplicity: number;
  transfer: number;
  feedback: string;
  misconceptions: string[];
  nextRevisionPrompt: string;
  model: string;
  createdAt: string;
};

export type QuizAttempt = {
  id: string;
  weekId: string;
  questionId: string;
  answer: string;
  evaluation?: FeynmanEvaluation;
  revisionOf?: string;
  challenged?: boolean;
  challengeRationale?: string;
  createdAt: string;
  updatedAt: string;
};

export type TopicMasterySummary = {
  weekId: string;
  score: number;
  passed: boolean;
  dimensions: { accuracy: number; causalReasoning: number; simplicity: number; transfer: number };
  completedQuestionIds: string[];
  weakQuestionIds: string[];
  openQuestions: string[];
  misconceptions: string[];
  updatedAt: string;
};

export type LearningNotes = {
  mechanism: string;
  loopPosition: string;
  tradeoff: string;
  evidence: string;
  failureMode: string;
  businessImplication: string;
  founderQuestion: string;
  engineerQuestion: string;
  investorQuestion: string;
  twoMinuteExplanation: string;
  gaps: string;
  retrievalPrompt: string;
};

export type WeekProgress = {
  weekId: string;
  completedActivityIds: string[];
  fridayComplete: boolean;
  saturdayComplete: boolean;
  briefComplete: boolean;
  notes: LearningNotes;
  confidence: number | null;
  minutes: number | null;
  biggestQuestion: string;
  reflections: Record<string, LessonReflection>;
  mastery: TopicMasterySummary | null;
  createdAt: string;
  updatedAt: string;
};

export type MilestoneScore = {
  checkpointId: "week-4" | "week-8" | "week-12";
  closedLoop: number | null;
  vocabulary: number | null;
  diagnosis: number | null;
  modelEvaluation: number | null;
  deployment: number | null;
  conversation: number | null;
  total: number;
  notes: string;
  completionDate: string | null;
};

export type UserSettings = {
  firstFriday: string | null;
  timezone: string;
  onboardingStatus: "not_started" | "complete";
  weeklyGoalMinutes?: number;
  aiFeedbackEnabled?: boolean;
  aiConsentAt?: string | null;
  quizDifficulty?: "gentle" | "conversation-ready" | "rigorous";
  feedbackDepth?: "brief" | "standard" | "deep";
  displayName?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const defaultUserSettings: UserSettings = { firstFriday: null, timezone: "America/Los_Angeles", onboardingStatus: "not_started", weeklyGoalMinutes: 420, aiFeedbackEnabled: false, aiConsentAt: null, quizDifficulty: "conversation-ready", feedbackDepth: "standard" };

export const emptyNotes: LearningNotes = {
  mechanism: "", loopPosition: "", tradeoff: "", evidence: "", failureMode: "", businessImplication: "",
  founderQuestion: "", engineerQuestion: "", investorQuestion: "", twoMinuteExplanation: "",
  gaps: "", retrievalPrompt: "",
};

export const emptyProgress = (weekId: string): WeekProgress => ({
  weekId, completedActivityIds: [], fridayComplete: false, saturdayComplete: false, briefComplete: false,
  notes: { ...emptyNotes }, confidence: null, minutes: null, biggestQuestion: "", reflections: {}, mastery: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

export function isValidTimezone(timezone: string): boolean {
  try { new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(); return true; } catch { return false; }
}
export function isFridayDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getUTCDay() === 5;
}
export function validateUserSettings(value: UserSettings): string[] {
  const errors: string[] = []; if (value.firstFriday && !isFridayDate(value.firstFriday)) errors.push("First Friday must be a valid Friday date."); if (!isValidTimezone(value.timezone)) errors.push("Choose a valid IANA timezone."); const weeklyGoalMinutes = value.weeklyGoalMinutes ?? 420; if (!Number.isFinite(weeklyGoalMinutes) || weeklyGoalMinutes < 1 || weeklyGoalMinutes > 10080) errors.push("Weekly target must be between 1 and 10,080 minutes."); return errors;
}
export function normalizeSettings(value: Partial<UserSettings> | null | undefined): UserSettings {
  const candidate: UserSettings = { firstFriday: value?.firstFriday ?? null, timezone: value?.timezone ?? "America/Los_Angeles", onboardingStatus: value?.onboardingStatus === "complete" ? "complete" : "not_started", weeklyGoalMinutes: Number.isFinite(Number(value?.weeklyGoalMinutes)) ? Number(value?.weeklyGoalMinutes) : 420, aiFeedbackEnabled: value?.aiFeedbackEnabled === true, aiConsentAt: value?.aiConsentAt ?? null, quizDifficulty: value?.quizDifficulty === "gentle" || value?.quizDifficulty === "rigorous" ? value.quizDifficulty : "conversation-ready", feedbackDepth: value?.feedbackDepth === "brief" || value?.feedbackDepth === "deep" ? value.feedbackDepth : "standard", displayName: value?.displayName, email: value?.email, createdAt: value?.createdAt, updatedAt: value?.updatedAt };
  return validateUserSettings(candidate).length ? { ...candidate, firstFriday: null, timezone: "America/Los_Angeles", onboardingStatus: "not_started", weeklyGoalMinutes: 420 } : candidate;
}
export function normalizeProgress(value: Partial<WeekProgress> & Pick<WeekProgress, "weekId">): WeekProgress {
  const now = new Date().toISOString(); const notes = { ...emptyNotes, ...(value.notes ?? {}) }; const numberOrNull = (item: number | null | undefined, floor: number, ceiling?: number) => { if (item == null || !Number.isFinite(Number(item))) return null; return Math.max(floor, ceiling == null ? Number(item) : Math.min(ceiling, Number(item))); };
  const completed = value.completedActivityIds ?? []; return { weekId: value.weekId, completedActivityIds: completed, fridayComplete: value.fridayComplete ?? false, saturdayComplete: value.saturdayComplete ?? false, briefComplete: value.briefComplete ?? false, notes, confidence: numberOrNull(value.confidence, 1, 5), minutes: numberOrNull(value.minutes, 0), biggestQuestion: value.biggestQuestion ?? notes.gaps, reflections: value.reflections ?? {}, mastery: normalizeMastery(value.mastery, value.weekId), createdAt: value.createdAt ?? now, updatedAt: value.updatedAt ?? now };
}

export function reflectionIsComplete(reflection: LessonReflection | undefined): boolean {
  return Boolean(reflection?.explanation.trim() && reflection?.unclear.trim());
}

export function latestValidEvaluations(attempts: QuizAttempt[], questionIds: string[]): Record<string, FeynmanEvaluation> {
  const allowed = new Set(questionIds); const latest: Record<string, FeynmanEvaluation> = {};
  for (const attempt of attempts) {
    const evaluation = attempt.evaluation; if (!evaluation || !allowed.has(attempt.questionId) || evaluation.questionId !== attempt.questionId) continue;
    const scores = [evaluation.accuracy, evaluation.causalReasoning, evaluation.simplicity, evaluation.transfer];
    if (!scores.every((score) => Number.isInteger(score) && score >= 0 && score <= 3)) continue;
    const previous = latest[attempt.questionId]; if (!previous || new Date(evaluation.createdAt).getTime() >= new Date(previous.createdAt).getTime()) latest[attempt.questionId] = evaluation;
  }
  return latest;
}

export function buildTopicMasterySummary(weekId: string, questionIds: string[], attempts: QuizAttempt[]): TopicMasterySummary {
  const latest = latestValidEvaluations(attempts, questionIds); const values = Object.values(latest); const dimensions = { accuracy: values.length ? Math.min(...values.map((item) => item.accuracy)) : 0, causalReasoning: values.length ? Math.min(...values.map((item) => item.causalReasoning)) : 0, simplicity: values.length ? Math.min(...values.map((item) => item.simplicity)) : 0, transfer: values.length ? Math.min(...values.map((item) => item.transfer)) : 0 }; const rawScore = values.reduce((total, item) => total + item.accuracy + item.causalReasoning + item.simplicity + item.transfer, 0); const score = values.length ? Math.round(rawScore / values.length) : 0; const weakQuestionIds = values.filter((item) => Math.min(item.accuracy, item.causalReasoning, item.simplicity, item.transfer) < 2).map((item) => item.questionId); return { weekId, score, passed: values.length === questionIds.length && new Set(values.map((item) => item.questionId)).size === questionIds.length && score >= 9 && Object.values(dimensions).every((item) => item >= 2), dimensions, completedQuestionIds: values.map((item) => item.questionId), weakQuestionIds, openQuestions: [], misconceptions: values.flatMap((item) => item.misconceptions), updatedAt: new Date().toISOString() };
}

export function normalizeMastery(value: TopicMasterySummary | null | undefined, weekId: string): TopicMasterySummary | null {
  if (!value) return null;
  const clamp = (score: number) => Math.max(0, Math.min(3, Number.isFinite(Number(score)) ? Number(score) : 0));
  const dimensions = { accuracy: clamp(value.dimensions?.accuracy), causalReasoning: clamp(value.dimensions?.causalReasoning), simplicity: clamp(value.dimensions?.simplicity), transfer: clamp(value.dimensions?.transfer) };
  return { weekId, score: Math.max(0, Math.min(12, Number(value.score) || Object.values(dimensions).reduce((a, b) => a + b, 0))), passed: Boolean(value.passed) && Object.values(dimensions).every((item) => item >= 2), dimensions, completedQuestionIds: value.completedQuestionIds ?? [], weakQuestionIds: value.weakQuestionIds ?? [], openQuestions: value.openQuestions ?? [], misconceptions: value.misconceptions ?? [], updatedAt: value.updatedAt ?? new Date().toISOString() };
}
export function normalizeMilestone(value: Partial<MilestoneScore> & Pick<MilestoneScore, "checkpointId">): MilestoneScore {
  const score = (item: number | null | undefined) => item == null || !Number.isFinite(Number(item)) ? null : Math.max(0, Math.min(2, Number(item))); const fields = { closedLoop: score(value.closedLoop), vocabulary: score(value.vocabulary), diagnosis: score(value.diagnosis), modelEvaluation: score(value.modelEvaluation), deployment: score(value.deployment), conversation: score(value.conversation) }; return { checkpointId: value.checkpointId, ...fields, total: Object.values(fields).reduce<number>((sum, item) => sum + (item ?? 0), 0), notes: value.notes ?? "", completionDate: value.completionDate ?? null };
}

export function validateCurriculum(weeks: CurriculumWeek[]): string[] {
  const errors: string[] = [];
  if (weeks.length !== 12) errors.push(`Expected 12 weeks, found ${weeks.length}`);
  const weekIds = new Set<string>();
  const activityIds = new Set<string>();
  weeks.forEach((week, index) => {
    if (week.number !== index + 1) errors.push(`Week sequence breaks at ${week.id}`);
    if (weekIds.has(week.id)) errors.push(`Duplicate week id: ${week.id}`);
    weekIds.add(week.id);
    [...week.friday.activities, ...week.saturday.activities].forEach((activity) => {
      if (activityIds.has(activity.id)) errors.push(`Duplicate activity id: ${activity.id}`);
      activityIds.add(activity.id);
      if (!activity.id.startsWith(`w${week.number}-`)) errors.push(`Activity outside week: ${activity.id}`);
    });
    if (!week.output || !week.conversationTest) errors.push(`Week ${week.number} is missing its output/test`);
    if (!week.summary || !week.objective || !week.tags?.length || !week.sources?.length || week.questions?.length !== 4) errors.push(`Week ${week.number} is missing Feynman metadata`);
  });
  return errors;
}
