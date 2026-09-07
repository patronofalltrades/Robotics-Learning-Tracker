import { createPublicKey, verify as verifySignature } from "node:crypto";
import { curriculum } from "../../../lib/curriculum";

export const runtime = "nodejs";

type Claims = { user_id?: string; sub?: string; aud?: string; iss?: string; exp?: number; email?: string };
type Score = { accuracy: number; causalReasoning: number; simplicity: number; transfer: number; feedback: string; misconceptions: string[]; nextRevisionPrompt: string };
export class AuthError extends Error {}
class UpstreamError extends Error {}
class UpstreamMalformed extends Error {}

function decodePart(value: string): Record<string, unknown> {
  try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>; } catch { throw new AuthError("Malformed token payload"); }
}

async function verifyFirebaseToken(token: string): Promise<Claims> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) throw new AuthError("Malformed token");
  const header = decodePart(encodedHeader) as { alg?: string; kid?: string };
  const payload = decodePart(encodedPayload) as Claims;
  if (header.alg !== "RS256" || !header.kid || payload.iss !== `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}` || payload.aud !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !payload.sub || !payload.exp || payload.exp * 1000 <= Date.now()) throw new AuthError("Invalid token claims");
  const response = await fetch("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com", { cache: "no-store" });
  if (!response.ok) throw new Error("Certificate lookup failed");
  const certificates = await response.json() as Record<string, string>;
  const certificate = certificates[header.kid];
  if (!certificate) throw new AuthError("Unknown signing key");
  const key = createPublicKey(certificate);
  const valid = verifySignature("RSA-SHA256", Buffer.from(`${encodedHeader}.${encodedPayload}`), key, Buffer.from(encodedSignature, "base64url"));
  if (!valid) throw new AuthError("Invalid token signature");
  return payload;
}

function json(status: number, body: Record<string, unknown>) { return Response.json(body, { status, headers: { "Cache-Control": "no-store" } }); }

export async function hasServerConsent(uid: string, token: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new UpstreamError("Firebase project is not configured");
  const response = await fetcher(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (response.status === 404) return false;
  if (!response.ok) throw new UpstreamError("Consent lookup failed");
  const document = await response.json() as { fields?: { aiFeedbackEnabled?: { booleanValue?: boolean }; aiConsentAt?: { stringValue?: string } } };
  return document.fields?.aiFeedbackEnabled?.booleanValue === true && Boolean(document.fields?.aiConsentAt?.stringValue);
}

const evaluationSchema = { type: "object", additionalProperties: false, required: ["accuracy", "causalReasoning", "simplicity", "transfer", "feedback", "misconceptions", "nextRevisionPrompt"], properties: { accuracy: { type: "integer", minimum: 0, maximum: 3 }, causalReasoning: { type: "integer", minimum: 0, maximum: 3 }, simplicity: { type: "integer", minimum: 0, maximum: 3 }, transfer: { type: "integer", minimum: 0, maximum: 3 }, feedback: { type: "string", minLength: 1, maxLength: 2000 }, misconceptions: { type: "array", items: { type: "string", maxLength: 500 }, maxItems: 8 }, nextRevisionPrompt: { type: "string", minLength: 1, maxLength: 500 } } };

export function parseEvaluation(content: string): Score {
  let parsed: Partial<Score>;
  try { parsed = JSON.parse(content) as Partial<Score>; } catch { throw new UpstreamMalformed("Malformed evaluation JSON"); }
  const validScore = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 3;
  const allowedKeys = ["accuracy", "causalReasoning", "simplicity", "transfer", "feedback", "misconceptions", "nextRevisionPrompt"]; const valid = Object.keys(parsed).every((key) => allowedKeys.includes(key)) && validScore(parsed.accuracy) && validScore(parsed.causalReasoning) && validScore(parsed.simplicity) && validScore(parsed.transfer) && typeof parsed.feedback === "string" && parsed.feedback.length > 0 && parsed.feedback.length <= 2000 && Array.isArray(parsed.misconceptions) && parsed.misconceptions.length <= 8 && parsed.misconceptions.every((item) => typeof item === "string" && item.length <= 500) && typeof parsed.nextRevisionPrompt === "string" && parsed.nextRevisionPrompt.length > 0 && parsed.nextRevisionPrompt.length <= 500;
  if (!valid) throw new UpstreamMalformed("Malformed evaluation schema");
  return { accuracy: parsed.accuracy!, causalReasoning: parsed.causalReasoning!, simplicity: parsed.simplicity!, transfer: parsed.transfer!, feedback: parsed.feedback!, misconceptions: parsed.misconceptions!, nextRevisionPrompt: parsed.nextRevisionPrompt! };
}

export type EvaluateDependencies = { verifyToken: (token: string) => Promise<Claims>; hasConsent: (uid: string, token: string) => Promise<boolean>; gatewayFetch: typeof fetch; gatewayTimeoutMs?: number };
const productionDependencies: EvaluateDependencies = { verifyToken: verifyFirebaseToken, hasConsent: (uid, token) => hasServerConsent(uid, token), gatewayFetch: fetch };

type RouteContext = { params: Promise<Record<string, string>> };

export async function POST(request: Request, context?: RouteContext | EvaluateDependencies) {
  const dependencies: EvaluateDependencies = context && "gatewayFetch" in context ? context : productionDependencies;
  try {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) return json(401, { error: "Authentication required." });
    const token = authorization.slice(7); let claims: Claims;
    try { claims = await dependencies.verifyToken(token); } catch (error) { return error instanceof AuthError ? json(401, { error: "Authentication could not be verified." }) : json(502, { error: "Authentication certificates are temporarily unavailable." }); }
    try { if (!(await dependencies.hasConsent(claims.sub!, token))) return json(403, { error: "AI evaluation requires explicit account consent." }); } catch { return json(502, { error: "Could not verify AI consent." }); }
    let body: { weekId?: string; questionId?: string; answer?: string; priorAttemptId?: string };
    try { body = await request.json() as typeof body; } catch { return json(422, { error: "The request body was not valid JSON." }); }
    const week = curriculum.find((item) => item.id === body.weekId);
    const question = week?.questions?.find((item) => item.id === body.questionId);
    if (!week || !question || typeof body.answer !== "string") return json(422, { error: "weekId, questionId, and answer are required." });
    if (body.answer.trim().length < 80 || body.answer.length > 4000) return json(422, { error: "Answer must be between 80 and 4,000 characters." });
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    const gatewayToken = apiKey || process.env.VERCEL_OIDC_TOKEN;
    if (!gatewayToken) return json(502, { error: "AI Gateway is not configured." });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), dependencies.gatewayTimeoutMs ?? 20_000);
    try {
      const response = await dependencies.gatewayFetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${gatewayToken}` },
        body: JSON.stringify({ model: "openai/gpt-oss-120b", fallbackModel: "openai/gpt-oss-20b", temperature: 0.1, max_tokens: 700, providerOptions: { gateway: { zeroDataRetention: true, order: ["cheapest"] } }, response_format: { type: "json_schema", json_schema: { name: "feynman_evaluation", strict: true, schema: evaluationSchema } }, messages: [{ role: "system", content: "You are a rigorous but encouraging Feynman coach. Score the learner's answer against the supplied rubric. Never infer personal details." }, { role: "user", content: JSON.stringify({ topic: week.title, summary: week.summary, objective: week.objective, mechanisms: week.mechanisms, question: question.prompt, rubric: question.rubric, answer: body.answer }) }] }),
      });
      if (response.status === 401) return json(401, { error: "AI Gateway authentication failed." });
      if (response.status === 402) return json(402, { error: "AI Gateway budget is exhausted." });
      if (response.status === 429) return json(429, { error: "AI Gateway is rate limited. Try again shortly." });
      if (!response.ok) return json(502, { error: "AI Gateway could not evaluate this answer." });
      const completion = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const result = parseEvaluation(completion.choices?.[0]?.message?.content ?? "");
      return json(200, { ...result, model: "openai/gpt-oss-120b", priorAttemptId: body.priorAttemptId ?? null });
    } finally { clearTimeout(timeout); }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return json(504, { error: "AI evaluation timed out. Retry when the gateway is responsive." });
    if (error instanceof UpstreamMalformed) return json(502, { error: "AI Gateway returned malformed structured output." });
    return json(502, { error: "Evaluation service is temporarily unavailable." });
  }
}
