import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError, POST, type EvaluateDependencies } from "../app/api/evaluate/route";

const answer = "A closed loop measures the world, compares the measurement with a goal, and changes the next action. This explanation follows the signal through a concrete robot behavior and names the evidence that would show a failure.";
const validEvaluation = { accuracy: 3, causalReasoning: 2, simplicity: 3, transfer: 2, feedback: "Clear mechanism; connect the sensor evidence to the next action.", misconceptions: [], nextRevisionPrompt: "Trace one failure and the signal that reveals it." };
const validBody = { weekId: "week-1", questionId: "w1-q1", answer };

function request(body: unknown = validBody, authorization = "Bearer valid-token") {
  const init: RequestInit = { method: "POST", headers: { Authorization: authorization, "Content-Type": "application/json" } };
  if (body !== undefined) init.body = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/evaluate", init);
}

function dependencies(status = 200, content: unknown = validEvaluation): EvaluateDependencies {
  const gatewayFetch = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status }));
  return { verifyToken: async () => ({ sub: "owner" }), hasConsent: async () => true, gatewayFetch: gatewayFetch as unknown as typeof fetch };
}

describe("POST /api/evaluate", () => {
  beforeEach(() => { process.env.AI_GATEWAY_API_KEY = "test-gateway-key"; });
  afterEach(() => { delete process.env.AI_GATEWAY_API_KEY; vi.restoreAllMocks(); });

  it("rejects missing and invalid authentication with 401", async () => {
    expect((await POST(request(validBody, ""))).status).toBe(401);
    expect((await POST(request(validBody, "Bearer malformed-token"))).status).toBe(401);
    const deps = dependencies();
    deps.verifyToken = async () => { throw new AuthError("invalid"); };
    expect((await POST(request(), deps)).status).toBe(401);
  });

  it("rejects without durable consent before invoking the gateway", async () => {
    const deps = dependencies();
    deps.hasConsent = async () => false;
    const response = await POST(request(), deps);
    expect(response.status).toBe(403);
    expect((deps.gatewayFetch as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("rejects invalid body, question, and answer with 422", async () => {
    const deps = dependencies();
    expect((await POST(request({}, "Bearer valid-token"), deps)).status).toBe(422);
    expect((await POST(request({ ...validBody, questionId: "missing" }), deps)).status).toBe(422);
    expect((await POST(request({ ...validBody, answer: "too short" }), deps)).status).toBe(422);
    expect((deps.gatewayFetch as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("returns strict structured scoring and sends ZDR gateway options", async () => {
    const deps = dependencies();
    const response = await POST(request(), deps);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject(validEvaluation);
    const init = (deps.gatewayFetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(init.body)) as { response_format: { type: string; json_schema: { strict: boolean; schema: { additionalProperties: boolean } } }; providerOptions: { gateway: { zeroDataRetention: boolean; order: string[] } } };
    expect(payload.response_format.type).toBe("json_schema");
    expect(payload.response_format.json_schema.strict).toBe(true);
    expect(payload.response_format.json_schema.schema.additionalProperties).toBe(false);
    expect(payload.providerOptions.gateway.zeroDataRetention).toBe(true);
    expect(payload.providerOptions.gateway.order).toEqual(["cheapest"]);
  });

  it.each([[402, 402], [429, 429], [500, 502]])("maps gateway status %i to %i", async (gatewayStatus, expected) => {
    const deps = dependencies(gatewayStatus);
    expect((await POST(request(), deps)).status).toBe(expected);
  });

  it("returns 502 for malformed or schema-invalid upstream output", async () => {
    const malformed = dependencies(200, "not json");
    expect((await POST(request(), malformed)).status).toBe(502);
    const invalid = dependencies(200, { ...validEvaluation, accuracy: "3" });
    expect((await POST(request(), invalid)).status).toBe(502);
    const brokenEnvelope = dependencies();
    brokenEnvelope.gatewayFetch = vi.fn(async () => new Response("not json", { status: 200 })) as unknown as typeof fetch;
    expect((await POST(request(), brokenEnvelope)).status).toBe(502);
  });

  it("returns 504 when the gateway times out", async () => {
    const deps = dependencies();
    deps.gatewayTimeoutMs = 5;
    deps.gatewayFetch = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_, reject) => {
      init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("timed out"), { name: "AbortError" })), { once: true });
    })) as unknown as typeof fetch;
    expect((await POST(request(), deps)).status).toBe(504);
  });
});
