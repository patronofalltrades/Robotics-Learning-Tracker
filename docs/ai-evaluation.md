# AI evaluation and provider notes

The notebook's `POST /api/evaluate` endpoint is intentionally narrow: it accepts a Firebase ID token, one curriculum question, and an 80–4,000 character answer. Curriculum context and scoring references are resolved server-side. The endpoint never sends profile details, unrelated notes, or other progress to a model.

Production uses Vercel OIDC; local development may set `AI_GATEWAY_API_KEY`. The primary route is `openai/gpt-oss-120b` with `openai/gpt-oss-20b` as fallback, low temperature, bounded output, cost-prioritized routing, a 20-second timeout, and `providerOptions.gateway.zeroDataRetention: true`. Configure the Vercel project AI Gateway budget to $5/month with alerts at 50%, 75%, and 100%; budget enforcement belongs to the Vercel project rather than source control.

Expected API responses are structured JSON with four 0–3 dimensions, feedback, misconceptions, and a revision prompt. Client-visible failures are explicit: 401 authentication, 402 budget, 422 validation/structure, 429 rate limit, 502 upstream/configuration, and 504 timeout.

Documented alternatives for a future architecture review (not implemented here): OpenRouter, Groq, Together AI, Fireworks AI, Cloudflare Workers AI, Hugging Face Inference Endpoints, and self-hosted vLLM. Any replacement must preserve token verification, context minimization, structured output, timeout bounds, and a documented retention policy.
