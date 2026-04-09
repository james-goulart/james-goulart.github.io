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
    "Access-Control-Allow-Headers": "Content-Type, Accept",
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

function readClientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

/** OpenAI `user` must be <= 64 chars (long IPv6 / headers otherwise cause HTTP 400). */
function openAiUserId(request) {
  var id = readClientIp(request);
  if (id.length <= 64) return id;
  return id.slice(0, 64);
}

function buildApiMessages(messages) {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.slice(-MAX_CONVERSATION_MESSAGES).map((m) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: String(m?.content || "").slice(0, 2000),
    })),
  ].filter((m) => m.role === "system" || String(m.content || "").trim().length > 0);
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
            const delta = data?.choices?.[0]?.delta?.content;
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

    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: "messages array is required" }, 400, request);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse(
        {
          error:
            "Missing OPENAI_API_KEY in Worker secrets. Set it with: wrangler secret put OPENAI_API_KEY",
        },
        503,
        request
      );
    }

    const apiMessages = buildApiMessages(messages);
    const nonSystem = apiMessages.filter((m) => m.role !== "system");
    if (nonSystem.length === 0) {
      return jsonResponse(
        { error: "Send at least one non-empty user or assistant message." },
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
      user: openAiUserId(request),
    };

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openAiPayload),
    });

    if (!upstream.ok) {
      let detail = `OpenAI request failed (${upstream.status})`;
      try {
        const errText = await upstream.text();
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) {
          detail = errJson.error.message;
        } else if (typeof errJson?.error === "string") {
          detail = errJson.error;
        } else if (errText) {
          detail = errText.slice(0, 500);
        }
      } catch {
        // Keep generic detail.
      }
      return jsonResponse({ error: detail }, 502, request);
    }

    const bodyStream = await streamOpenAIToClient(upstream);
    const response = new Response(bodyStream, {
      headers: { ...sseHeaders(), ...corsHeaders(request) },
    });
    return response;
  },
};
