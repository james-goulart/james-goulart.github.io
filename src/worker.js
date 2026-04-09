const SYSTEM_PROMPT = `You are JamesCVBot on James Goulart's portfolio.

Scope:
- Only answer about James's professional experience, leadership, products, case studies, and companies he worked at.
- If outside scope, politely decline and redirect to James's professional topics.
- Do not invent facts. If data is missing, say so.

Format every answer with this exact markdown structure:
### SUMMARY
### PROOF
### SOURCES
### NEXT
`;

const MAX_CONVERSATION_MESSAGES = 20;

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, X-Chat-Debug",
    "Access-Control-Max-Age": "86400",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  return headers;
}

function jsonResponse(body, status = 200, request = null, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...(request ? corsHeaders(request) : {}),
    ...extraHeaders,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
}

function normalizeClientMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i];
    if (!m || typeof m !== "object") continue;
    const role = m.role === "assistant" ? "assistant" : "user";
    const content = String(m.content ?? m.text ?? "").trim();
    if (!content) continue;
    out.push({ role, content: content.slice(0, 2000) });
  }
  return out.slice(-MAX_CONVERSATION_MESSAGES);
}

function buildApiMessages(messages) {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    })),
  ].filter((m) => m.role === "system" || String(m.content || "").trim().length > 0);
}

/** Read body once; avoids rare empty reads from .text() on some responses. */
async function bodyTextFromResponse(res) {
  try {
    const ab = await res.arrayBuffer();
    return new TextDecoder("utf-8").decode(ab);
  } catch {
    try {
      return await res.text();
    } catch {
      return "";
    }
  }
}

function openAiBaseUrl(env) {
  return String(env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/+$/,
    ""
  );
}

/**
 * Keys starting with sk-proj- are already scoped to one project; sending
 * OpenAI-Project with a mismatched id can cause empty 400s. Omit unless forced.
 */
function shouldSendOpenAIProjectHeader(env, key) {
  const pid = env.OPENAI_PROJECT_ID && String(env.OPENAI_PROJECT_ID).trim();
  if (!pid) return false;
  if (env.OPENAI_FORCE_PROJECT_HEADER === "1" || env.OPENAI_FORCE_PROJECT_HEADER === "true") {
    return true;
  }
  if (key.startsWith("sk-proj-")) {
    return false;
  }
  return true;
}

/** Auth + optional org/project. Use for GET; add Content-Type for POST JSON. */
function openAiAuthHeaders(env) {
  const key = String(env.OPENAI_API_KEY || "").trim();
  const headers = {
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
    "User-Agent": "james-portfolio-chat-worker/1.0",
  };
  if (env.OPENAI_ORG_ID && String(env.OPENAI_ORG_ID).trim()) {
    headers["OpenAI-Organization"] = String(env.OPENAI_ORG_ID).trim();
  }
  if (shouldSendOpenAIProjectHeader(env, key)) {
    headers["OpenAI-Project"] = String(env.OPENAI_PROJECT_ID).trim();
  }
  return headers;
}

/** Safe hints for diagnostics (no secrets). */
function openAiEnvHints(env) {
  const key = String(env.OPENAI_API_KEY || "").trim();
  return {
    keyPrefix: key.length >= 7 ? key.slice(0, 7) : key.slice(0, 3),
    hasOrgId: !!(env.OPENAI_ORG_ID && String(env.OPENAI_ORG_ID).trim()),
    hasProjectIdSecret: !!(env.OPENAI_PROJECT_ID && String(env.OPENAI_PROJECT_ID).trim()),
    projectHeaderSent: shouldSendOpenAIProjectHeader(env, key),
    skProjKey: key.startsWith("sk-proj-"),
  };
}

function openAiHeaders(env) {
  return {
    ...openAiAuthHeaders(env),
    "Content-Type": "application/json",
  };
}

/** GET /v1/models — proves key + base URL + org/project headers work. */
async function probeModelsList(env) {
  const base = openAiBaseUrl(env);
  const r = await fetch(`${base}/models`, {
    method: "GET",
    headers: openAiAuthHeaders(env),
  });
  const text = await bodyTextFromResponse(r);
  return {
    modelsStatus: r.status,
    modelsLen: text.length,
    modelsPreview: text.slice(0, 500),
    modelsRequestId:
      r.headers.get("openai-request-id") ||
      r.headers.get("x-request-id") ||
      null,
  };
}

function parseOpenAIErrorBody(text) {
  const s = parseOpenAIErrorStructured(text);
  return s.message || null;
}

/** Returns { message, code, param, type } from OpenAI JSON error body. */
function parseOpenAIErrorStructured(text) {
  const out = { message: null, code: null, param: null, type: null };
  if (!text || !String(text).trim()) return out;
  try {
    const j = JSON.parse(text);
    const e = j.error;
    if (typeof e === "object" && e) {
      out.message = e.message ? String(e.message) : null;
      out.code = e.code != null ? String(e.code) : null;
      out.param = e.param != null ? String(e.param) : null;
      out.type = e.type != null ? String(e.type) : null;
      if (!out.message && (out.code || out.type || out.param)) {
        out.message = [out.type, out.code, out.param].filter(Boolean).join(" · ");
      }
      if (!out.message) {
        out.message = JSON.stringify(e).slice(0, 500);
      }
      return out;
    }
    if (typeof e === "string") {
      out.message = e;
      return out;
    }
  } catch {
    /* fall through */
  }
  out.message = String(text).slice(0, 800);
  return out;
}

function mergeOpenAIMeta(a, b) {
  return {
    code: a.code || b.code || null,
    param: a.param || b.param || null,
    type: a.type || b.type || null,
  };
}

function wantsDebug(request, env) {
  if (env.CHAT_DEBUG === "1" || env.CHAT_DEBUG === "true") return true;
  const secret = env.CHAT_DEBUG_SECRET && String(env.CHAT_DEBUG_SECRET).trim();
  if (secret && request.headers.get("X-Chat-Debug") === secret) return true;
  return false;
}

async function fetchOpenAIChat(env, payload) {
  const url = `${openAiBaseUrl(env)}/chat/completions`;
  const h = openAiHeaders(env);
  let firstErrorText = null;
  let res = await fetch(url, {
    method: "POST",
    headers: h,
    body: JSON.stringify(payload),
  });
  if (res.status === 400) {
    firstErrorText = await bodyTextFromResponse(res);
    const minimal = {
      model: payload.model,
      messages: payload.messages,
      stream: true,
    };
    res = await fetch(url, {
      method: "POST",
      headers: h,
      body: JSON.stringify(minimal),
    });
  }
  return { res, firstErrorText };
}

/** Minimal non-stream call to isolate key/model vs. full chat payload. */
async function probeOpenAIKey(env) {
  const url = `${openAiBaseUrl(env)}/chat/completions`;
  const h = openAiHeaders(env);
  const model = (env.OPENAI_CHAT_MODEL || "gpt-4o-mini").trim();
  const r = await fetch(url, {
    method: "POST",
    headers: h,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 5,
      stream: false,
    }),
  });
  const text = await bodyTextFromResponse(r);
  return {
    probeStatus: r.status,
    probeLen: text.length,
    probePreview: text.slice(0, 600),
    probeRequestId:
      r.headers.get("openai-request-id") ||
      r.headers.get("x-request-id") ||
      null,
  };
}

function responseMeta(res) {
  return {
    status: res.status,
    contentType: res.headers.get("content-type") || "",
    contentLength: res.headers.get("content-length") || "",
    openaiRequestId:
      res.headers.get("openai-request-id") ||
      res.headers.get("x-request-id") ||
      "",
  };
}

async function streamOpenAIToClient(openAIResponse) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = openAIResponse.body.getReader();

  let sentAny = false;
  let buffer = "";

  const pump = async () => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;

          if (payload === "[DONE]") {
            await writer.write(encoder.encode("data: [DONE]\n\n"));
            await writer.close();
            return;
          }

          try {
            const data = JSON.parse(payload);
            if (data.error) {
              const errMsg =
                typeof data.error === "object" && data.error?.message
                  ? data.error.message
                  : String(data.error);
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
              );
              await writer.write(encoder.encode("data: [DONE]\n\n"));
              await writer.close();
              return;
            }
            const choice = data?.choices?.[0];
            const d = choice?.delta;
            const refusal = d?.refusal || choice?.message?.refusal;
            if (refusal) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    error: String(refusal).slice(0, 500),
                  })}\n\n`
                )
              );
              await writer.write(encoder.encode("data: [DONE]\n\n"));
              await writer.close();
              return;
            }
            const delta = d?.content;
            if (delta) {
              sentAny = true;
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
              );
            }
          } catch {
            // Ignore malformed upstream chunks and continue stream.
          }
        }
      }

      if (!sentAny) {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "The model returned no text. Try again with another prompt.",
            })}\n\n`
          )
        );
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
      await writer.close();
    } catch (err) {
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            error: `Streaming failed: ${String(err?.message || err)}`.slice(0, 240),
          })}\n\n`
        )
      );
      await writer.close();
    }
  };

  pump();
  return readable;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (url.pathname === "/api/chat" && method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (url.pathname !== "/api/chat") {
      return env.ASSETS.fetch(request);
    }

    if (method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400, request);
    }

    const rawMessages = body?.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return jsonResponse(
        { error: "messages array is required", code: "NO_MESSAGES" },
        400,
        request
      );
    }

    if (!env.OPENAI_API_KEY || !String(env.OPENAI_API_KEY).trim()) {
      return jsonResponse(
        {
          error:
            "Missing or empty OPENAI_API_KEY. Set it with: wrangler secret put OPENAI_API_KEY (paste key with no extra spaces or newlines).",
        },
        503,
        request
      );
    }

    const normalized = normalizeClientMessages(rawMessages);
    if (normalized.length === 0) {
      return jsonResponse(
        {
          error:
            "Send at least one message with non-empty content (role + content).",
          code: "EMPTY_MESSAGES",
        },
        400,
        request
      );
    }

    const apiMessages = buildApiMessages(normalized);
    const nonSystem = apiMessages.filter((m) => m.role !== "system");
    if (nonSystem.length === 0) {
      return jsonResponse(
        {
          error: "Send at least one non-empty user or assistant message.",
          code: "NO_TURNS",
        },
        400,
        request
      );
    }

    const openAiPayload = {
      model: (env.OPENAI_CHAT_MODEL || "gpt-4o-mini").trim(),
      messages: apiMessages,
      max_tokens: 1024,
      temperature: 0.4,
      stream: true,
    };

    const { res: upstream, firstErrorText } = await fetchOpenAIChat(
      env,
      openAiPayload
    );

    if (!upstream.ok) {
      const errText = await bodyTextFromResponse(upstream);
      const firstS = parseOpenAIErrorStructured(firstErrorText);
      const lastS = parseOpenAIErrorStructured(errText);
      const openai = mergeOpenAIMeta(firstS, lastS);
      const rawFallback =
        (firstErrorText && String(firstErrorText).trim()
          ? String(firstErrorText).slice(0, 800)
          : "") ||
        (errText && String(errText).trim() ? String(errText).slice(0, 800) : "");
      let detail =
        firstS.message ||
        lastS.message ||
        rawFallback ||
        `OpenAI request failed (${upstream.status})`;

      const lastMeta = responseMeta(upstream);
      let probe = null;
      if (
        !(firstErrorText || "").trim() &&
        !String(errText || "").trim() &&
        (upstream.status === 400 || upstream.status === 401)
      ) {
        try {
          const ping = await probeOpenAIKey(env);
          const models = await probeModelsList(env);
          probe = { ...ping, ...models };

          if (models.modelsStatus === 401) {
            detail =
              "GET /v1/models returned 401 — the API key is rejected. Re-create the secret (no newline), or add OPENAI_ORG_ID / OPENAI_PROJECT_ID if your key is org- or project-scoped.";
          } else if (models.modelsStatus === 200 && models.modelsLen > 0) {
            detail =
              "The API key works (GET /v1/models returned data), but POST /chat/completions returned HTTP " +
              upstream.status +
              " with an empty body. If your key is project-scoped, set Worker secrets OPENAI_PROJECT_ID (and OPENAI_ORG_ID if required). Otherwise verify OPENAI_CHAT_MODEL matches an available model id.";
          } else if (ping.probePreview && ping.probeStatus !== 200) {
            detail =
              parseOpenAIErrorBody(ping.probePreview) ||
              ping.probePreview.slice(0, 400) ||
              detail;
          } else if (ping.probeStatus === 200) {
            detail =
              "OpenAI returned empty error bodies for the chat request, but a minimal ping with the same model succeeded. The problem is likely the system prompt size, total message length, or message shape — not the API key.";
          }
        } catch (pe) {
          probe = { probeError: String(pe?.message || pe) };
        }
      }

      console.error("[chat] OpenAI error", {
        upstreamStatus: upstream.status,
        lastMeta,
        model: openAiPayload.model,
        messageCount: apiMessages.length,
        firstError: (firstErrorText || "").slice(0, 1500),
        lastError: (errText || "").slice(0, 1500),
        openai,
        detail,
        probe,
      });

      const body = {
        error: detail,
        upstreamStatus: upstream.status,
        diagnostics: {
          firstLen: (firstErrorText || "").length,
          lastLen: (errText || "").length,
          firstPreview: (firstErrorText || "").slice(0, 400),
          lastPreview: (errText || "").slice(0, 400),
          lastResponse: lastMeta,
          envHints: openAiEnvHints(env),
          probe,
        },
        openai:
          openai.code || openai.param || openai.type ? openai : undefined,
      };
      if (wantsDebug(request, env)) {
        body.debug = {
          model: openAiPayload.model,
          messageCount: apiMessages.length,
          firstErrorSnippet: (firstErrorText || "").slice(0, 800),
          lastErrorSnippet: (errText || "").slice(0, 800),
        };
      }
      return jsonResponse(body, 502, request);
    }

    const bodyStream = await streamOpenAIToClient(upstream);
    const response = new Response(bodyStream, {
      headers: { ...sseHeaders(), ...corsHeaders(request) },
    });
    return response;
  },
};
