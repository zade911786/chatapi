const BASE_URL = "https://api.freetheai.xyz/v1/chat/completions";
const API_KEY  = "sta_8f5a2ca28b730cfc3021d7691df8ac2c44656653ad9388a9";
const OWNER    = "@zade4everbot";

const CAT_MODELS = [
  "cat/agent-1",
  "cat/gpt-4.1",
  "cat/gpt-4.1-mini",
  "cat/gpt-5-mini",
  "cat/gpt-5",
  "cat/gpt-5.1",
  "cat/gpt-5.2",
  "cat/gpt-5.4-mini",
  "cat/gpt-5.4",
  "cat/claude-4-5-haiku",
  "cat/claude-4-5-sonnet",
  "cat/claude-4-6-sonnet",
  "cat/gemini-2-5-flash",
  "cat/gemini-3-flash",
  "cat/gemini-3-1-pro",
];

const YNG_MODELS = CAT_MODELS.map(m => m.replace("cat/", "yng/"));

export async function handleRequest(req, res, prefix) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const validModels = prefix === "cat" ? CAT_MODELS : YNG_MODELS;

  // ── Parse params (GET query or POST body) ──
  let prompt, model;

  if (req.method === "GET") {
    prompt = req.query?.prompt;
    model  = req.query?.model;
  } else {
    // POST — body already parsed by Vercel if content-type is json
    prompt = req.body?.prompt;
    model  = req.body?.model;
  }

  // Default model if none given
  if (!model) model = `${prefix}/agent-1`;

  // Validate model prefix
  if (!model.startsWith(`${prefix}/`)) {
    return res.status(400).json({
      ok: false,
      owner: OWNER,
      error: `Model must start with "${prefix}/". Valid models: ${validModels.join(", ")}`,
    });
  }

  if (!validModels.includes(model)) {
    return res.status(400).json({
      ok: false,
      owner: OWNER,
      error: `Unknown model "${model}".`,
      valid_models: validModels,
    });
  }

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({
      ok: false,
      owner: OWNER,
      error: "prompt is required.",
      usage: `GET /api/${prefix}?prompt=Hello&model=${prefix}/agent-1`,
      valid_models: validModels,
    });
  }

  const requestedAt = new Date().toISOString();
  const startMs     = Date.now();

  // ── Call FreeTheAI ──
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 55_000); // 55s

  let upstream;
  try {
    upstream = await fetch(BASE_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    const isTimeout = err.name === "AbortError";
    return res.status(isTimeout ? 504 : 502).json({
      ok: false,
      owner: OWNER,
      error: isTimeout
        ? "Request timed out after 55s."
        : "Upstream fetch failed: " + err.message,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const endMs      = Date.now();
  const timeTookMs = endMs - startMs;

  let data;
  try {
    data = await upstream.json();
  } catch {
    return res.status(502).json({
      ok: false,
      owner: OWNER,
      error: "Upstream returned non-JSON response.",
      http_status: upstream.status,
    });
  }

  if (!upstream.ok) {
    return res.status(upstream.status).json({
      ok: false,
      owner: OWNER,
      error: data?.error?.message || "Upstream error.",
      upstream_status: upstream.status,
      time_took_ms: timeTookMs,
      timestamp: requestedAt,
    });
  }

  const choice     = data?.choices?.[0];
  const message    = choice?.message?.content ?? null;
  const finishReason = choice?.finish_reason ?? null;
  const usage      = data?.usage ?? {};

  return res.status(200).json({
    ok: true,
    owner: OWNER,
    prefix,
    model,
    prompt,
    response: message,
    finish_reason: finishReason,
    usage: {
      prompt_tokens:     usage.prompt_tokens     ?? null,
      completion_tokens: usage.completion_tokens ?? null,
      total_tokens:      usage.total_tokens      ?? null,
    },
    performance: {
      time_took_ms: timeTookMs,
      time_took_s:  (timeTookMs / 1000).toFixed(2),
    },
    timestamp: {
      requested_at:  requestedAt,
      completed_at:  new Date().toISOString(),
    },
    meta: {
      api_provider:  "FreeTheAI (freetheai.xyz)",
      api_base:      "https://api.freetheai.xyz/v1",
      valid_models:  validModels,
      upstream_id:   data?.id ?? null,
    },
  });
}
