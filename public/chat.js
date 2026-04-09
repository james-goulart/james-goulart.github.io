(function () {
  "use strict";

  var STORAGE_KEY = "jamescvbot-messages-v1";

  var SESSION_ID =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : "s-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);

  var MAX_MESSAGES = 40;

  var SUGGESTED_QUESTIONS = [
    "Fintech experience",
    "AI experience",
    "Proptech Experience",
    "Biggest outcomes",
    "Leadership highlights",
    "0\u21921 work",
    "Marketplace experience",
    "Strongest case study",
  ];

  var COPY_ICON_SVG =
    '<svg class="chat-copy-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var CHECK_ICON_SVG =
    '<svg class="chat-copy-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

  var EMPTY_STATE_TITLE = "About Me";
  var EMPTY_STATE_SUBTITLE = "Product leader with 10 years of experience on marketplaces, search, AI, and platforms. Led cross-functional initiatives across proptech and fintech, turning ambiguous structural problems into clearer product direction, stronger discovery, and better business outcomes.<br><br>Use the copilot below to explore my experiences.";

  var CHAT_WORKER_ORIGIN =
    "https://james-portfolio-chat.james-portfolio-chat.workers.dev";

  function resolveChatEndpoint() {
    var config = window.JamesCVBotConfig || {};
    var override = config.chatBackendUrl;
    if (typeof override === "string" && override.trim()) {
      return override.replace(/\/+$/, "") + "/api/chat";
    }
    if (typeof location !== "undefined" && location.hostname) {
      if (
        location.hostname === "james-goulart.github.io" ||
        /\.github\.io$/i.test(location.hostname)
      ) {
        return CHAT_WORKER_ORIGIN + "/api/chat";
      }
    }
    return "/api/chat";
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMarkdown(md) {
    var raw = md;
    
    // Split by sections
    var summaryMatch = raw.match(/### SUMMARY\n?([\s\S]*?)(?=###|$)/);
    var proofMatch = raw.match(/### PROOF\n?([\s\S]*?)(?=###|$)/);
    var sourcesMatch = raw.match(/### SOURCES\n?([\s\S]*?)(?=###|$)/);
    var mentionsMatch = raw.match(/### NEW MENTIONS\n?([\s\S]*?)(?=###|$)/);
    var nextMatch = raw.match(/### NEXT\n?([\s\S]*?)(?=###|$)/);

    var html = "";
    
    if (summaryMatch) {
      html += '<div class="chat-section chat-section--summary"><h4>Summary</h4>' + formatContent(summaryMatch[1], false) + '</div>';
    }
    if (proofMatch) {
      html += '<div class="chat-section chat-section--proof"><h4>Proof Points</h4>' + formatContent(proofMatch[1], true) + '</div>';
    }
    if (sourcesMatch) {
      html += '<div class="chat-section chat-section--sources"><h4>Sources</h4>' + formatContent(sourcesMatch[1], false) + '</div>';
    }
    if (mentionsMatch) {
      var mentionsText = String(mentionsMatch[1] || "").replace(/\s+/g, " ").trim();
      if (mentionsText && !/^none(?: for this answer)?\.?$/i.test(mentionsText)) {
        html +=
          '<div class="chat-section chat-section--mentions"><h4>News mentions</h4>' +
          formatContent(mentionsMatch[1], false) +
          "</div>";
      }
    } else {
      var autoMentionsHtml = buildMentionsFromSources(
        sourcesMatch ? sourcesMatch[1] : "",
        proofMatch ? proofMatch[1] : ""
      );
      if (autoMentionsHtml) {
        html +=
          '<div class="chat-section chat-section--mentions"><h4>News mentions</h4>' +
          autoMentionsHtml +
          "</div>";
      }
    }
    if (nextMatch) {
      html += '<div class="chat-section chat-section--next"><h4>Suggested follow-ups</h4>' + formatContent(nextMatch[1], false) + '</div>';
    }

    // Fallback if no sections
    if (!html) {
      html = formatContent(raw, false);
    }

    return html;
  }

  function formatContent(text, isProof) {
    var html = escapeHtml(text);
    
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      function (_, text, href) {
        var isExternal =
          href.indexOf("http") === 0 || href.indexOf("//") === 0;
        var cls = isExternal ? "" : ' class="chat-link chat-link--internal"';
        return (
          '<a href="' +
          href +
          '"' +
          cls +
          (isExternal ? ' target="_blank" rel="noopener noreferrer"' : "") +
          ">" +
          text +
          "</a>"
        );
      }
    );

    html = html.replace(
      /(?:^|\n)((?:- .+(?:\n|$))+)/g,
      function (_, block) {
        var items = block
          .trim()
          .split("\n")
          .map(function (line) {
            var content = line.replace(/^- /, "");
            if (isProof) {
                return '<li class="proof-pill">' + content + '</li>';
            }
            return "<li>" + content + "</li>";
          })
          .join("");
        return '<ul class="' + (isProof ? 'proof-list' : '') + '">' + items + "</ul>";
      }
    );

    html = html
      .split(/\n{2,}/)
      .map(function (p) {
        p = p.trim();
        if (!p) return "";
        if (p.indexOf("<ul>") === 0 || p.indexOf("<ol>") === 0 || p.indexOf("<div") === 0) return p;
        return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
      })
      .join("");

    return html;
  }

  function buildMentionsFromSources(sourcesText, proofText) {
    var source = String(sourcesText || "") + "\n" + String(proofText || "");
    if (!source.trim()) return "";
    var caseIds = [];
    var expIds = [];
    var match;
    
    var caseRegex = /case\.html#([a-zA-Z0-9-_]+)/g;
    while ((match = caseRegex.exec(source))) {
      caseIds.push(match[1]);
    }
    
    var expRegex = /experience\.html#([a-zA-Z0-9-_]+)/g;
    while ((match = expRegex.exec(source))) {
      expIds.push(match[1]);
    }

    if (!caseIds.length && !expIds.length) return "";
    
    var uniqueUrls = {};
    var mentionItems = [];
    var data = window.PORTFOLIO_DATA;
    if (!data || !Array.isArray(data.experiences)) return "";
    
    data.experiences.forEach(function (exp) {
      var isExpMatch = expIds.indexOf(exp.id) !== -1;
      (exp.cases || []).forEach(function (c) {
        if (!isExpMatch && caseIds.indexOf(c.id) === -1) return;
        (c.relatedNews || []).forEach(function (url) {
          var clean = String(url || "").trim();
          if (!clean || uniqueUrls[clean]) return;
          uniqueUrls[clean] = true;
          
          var label = clean;
          // Try to use the curated title if available
          if (window.Portfolio && window.Portfolio.relatedNewsTitleEn) {
            var preset = window.Portfolio.relatedNewsTitleEn(clean);
            if (preset) label = preset;
          }
          if (label === clean) {
            try {
              var u = new URL(clean);
              label = u.hostname.replace(/^www\./, "");
            } catch (e) {}
          }
          
          mentionItems.push(
            '<li><a href="' +
              escapeHtml(clean) +
              '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(label) +
              "</a></li>"
          );
        });
      });
    });
    if (!mentionItems.length) return "";
    return "<ul>" + mentionItems.join("") + "</ul>";
  }

  var messages = [];
  var isStreaming = false;
  var container = null;
  var messagesEl = null;
  var emptyStateEl = null;
  var inputEl = null;
  var sendBtn = null;
  var suggestionsEl = null;
  var clearBtn = null;
  var initOpts = {};

  function persistMessages() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 1, messages: messages })
      );
    } catch (e) {}
  }

  function loadStoredMessages() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.messages)) return null;
      return data.messages.filter(function (m) {
        return (
          m &&
          (m.role === "user" || m.role === "assistant") &&
          String(m.content || "").length > 0
        );
      });
    } catch (e) {
      return null;
    }
  }

  function updateClearVisibility() {
    if (clearBtn && clearBtn.parentNode) {
      clearBtn.parentNode.style.display = messages.length > 0 ? "" : "none";
    }
  }

  function wireFollowUpChips(bodyEl) {
    if (!bodyEl) return;
    var section = bodyEl.querySelector(".chat-section--next");
    if (!section) return;
    var ul = section.querySelector("ul");
    if (!ul) return;
    var items = ul.querySelectorAll("li");
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      if (li.querySelector(".chat-followup-chip")) continue;
      var text = (li.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) continue;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-followup-chip";
      btn.textContent = text;
      (function (q) {
        btn.addEventListener("click", function () {
          sendMessage(q);
        });
      })(text);
      li.innerHTML = "";
      li.appendChild(btn);
    }
  }

  function createMessageEl(role, html) {
    var wrap = document.createElement("div");
    wrap.className = "chat-msg chat-msg--" + role;
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble chat-bubble--" + role;

    if (role === "assistant") {
      var body = document.createElement("div");
      body.className = "chat-bubble__body";
      body.innerHTML = html;
      bubble.appendChild(body);

      var actions = document.createElement("div");
      actions.className = "chat-msg-actions";
      
      var copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "chat-copy-btn";
      copyBtn.setAttribute("aria-label", "Copy");
      copyBtn.innerHTML = COPY_ICON_SVG;
      
      copyBtn.addEventListener("click", function () {
        var textToCopy = body.innerText || "";
        function showCopied() {
          copyBtn.innerHTML = CHECK_ICON_SVG;
          copyBtn.setAttribute("aria-label", "Copied");
          setTimeout(function () {
            copyBtn.innerHTML = COPY_ICON_SVG;
            copyBtn.setAttribute("aria-label", "Copy");
          }, 2000);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(showCopied).catch(function () {});
        }
      });
      
      actions.appendChild(copyBtn);
      wrap.appendChild(bubble);
      wrap.appendChild(actions);
    } else {
      bubble.innerHTML = html;
      wrap.appendChild(bubble);
    }

    return wrap;
  }

  function appendMessage(role, contentHtml) {
    var el = createMessageEl(role, contentHtml);
    if (suggestionsEl && suggestionsEl.parentNode === messagesEl) {
      messagesEl.insertBefore(el, suggestionsEl);
    } else {
      messagesEl.appendChild(el);
    }
    scrollToBottom();
    return el;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function wireSuggestions(container) {
    var target = container || suggestionsEl;
    if (!target) return;
    target.innerHTML = "";
    SUGGESTED_QUESTIONS.forEach(function (q) {
      var btn = document.createElement("button");
      btn.className = "chat-suggestion";
      btn.type = "button";
      btn.textContent = q;
      btn.addEventListener("click", function () {
        sendMessage(q);
      });
      target.appendChild(btn);
    });
  }

  function wireSuggestionsToContainer(customContainer) {
    if (!customContainer) return;
    wireSuggestions(customContainer);
  }

  window.wireChatSuggestionsToContainer = wireSuggestionsToContainer;

  function createEmptyState() {
    var el = document.createElement("section");
    el.className = "chat-empty-state";
    el.innerHTML =
      '<h2 class="chat-empty-state__title">' +
      escapeHtml(EMPTY_STATE_TITLE) +
      "</h2>" +
      '<p class="chat-empty-state__subtitle">' +
      EMPTY_STATE_SUBTITLE +
      "</p>";
    return el;
  }

  function clearChat() {
    messages = [];
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    messagesEl.innerHTML = "";
    suggestionsEl = document.createElement("div");
    suggestionsEl.className = "chat-suggestions";
    wireSuggestions();
    if (!initOpts.noEmptyState) {
      emptyStateEl = createEmptyState();
      messagesEl.appendChild(emptyStateEl);
    }
    if (!initOpts.noSuggestions) {
      messagesEl.appendChild(suggestionsEl);
    } else {
      suggestionsEl.style.display = "none";
      messagesEl.appendChild(suggestionsEl);
    }

    var clearBtnContainer = document.createElement("div");
    clearBtnContainer.className = "chat-clear-container";
    clearBtnContainer.appendChild(clearBtn);
    messagesEl.appendChild(clearBtnContainer);

    updateClearVisibility();
    if (inputEl) inputEl.focus();
  }

  function sendMessage(text) {
    if (isStreaming || !text.trim()) return;
    var userText = text.trim();

    if (suggestionsEl) {
      suggestionsEl.style.display = "none";
    }
    if (emptyStateEl && emptyStateEl.parentNode) {
      emptyStateEl.parentNode.removeChild(emptyStateEl);
    }

    messages.push({ role: "user", content: userText });
    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(-MAX_MESSAGES);
    }
    persistMessages();
    updateClearVisibility();

    appendMessage("user", escapeHtml(userText));

    inputEl.value = "";
    inputEl.disabled = true;
    sendBtn.disabled = true;
    isStreaming = true;

    var botWrap = appendMessage("assistant", "");
    var bodyEl = botWrap.querySelector(".chat-bubble__body");
    if (bodyEl) {
      bodyEl.innerHTML =
        '<span class="chat-typing">Analyzing CV and cases\u2026</span>';
    }

    var accumulated = "";
    var streamFinalized = false;

    if (location.protocol === "file:") {
      if (bodyEl) {
        bodyEl.innerHTML =
          '<p class="chat-error">JamesCVBot needs the dev server. In this folder run <code>npm start</code>, then open <strong>http://localhost:3000</strong> (not the file directly).</p>';
      }
      finishStream();
      return;
    }

    fetch(resolveChatEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages, sessionId: SESSION_ID }),
    })
      .then(async function (res) {
        if (!res.ok) {
          var detail = "Request failed (" + res.status + ").";
          try {
            var j = await res.json();
            if (j && j.error) detail = j.error;
          } catch (e) {}
          throw new Error(detail);
        }
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";

        function processChunk(result) {
          if (result.done) {
            finishStream();
            return;
          }
          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line.startsWith("data: ")) continue;
            var payload = line.slice(6);
            if (payload === "[DONE]") {
              finishStream();
              return;
            }
            try {
              var data = JSON.parse(payload);
              if (data.content) {
                accumulated += data.content;
                if (bodyEl) {
                  bodyEl.innerHTML = renderMarkdown(accumulated);
                }
                scrollToBottom();
              }
              if (data.error) {
                if (bodyEl) {
                  bodyEl.innerHTML =
                    '<p class="chat-error">' +
                    escapeHtml(String(data.error)) +
                    "</p>";
                }
                finishStream();
                return;
              }
            } catch (e) {}
          }
          return reader.read().then(processChunk);
        }

        return reader.read().then(processChunk);
      })
      .catch(function (err) {
        console.error("Chat error:", err);
        var raw =
          err && err.message
            ? err.message
            : "Something went wrong. Please try again.";
        if (
          /Failed to fetch|NetworkError|load failed/i.test(String(raw)) ||
          (err && err.name === "TypeError")
        ) {
          if (bodyEl) {
            var netMsg =
              typeof location !== "undefined" &&
              location.hostname &&
              /\.github\.io$/i.test(location.hostname)
                ? "Could not reach the chat service. Try again in a moment or refresh the page."
                : 'Could not reach the server. Run <code>npm start</code> in the project folder, then open <strong>http://localhost:3000</strong>.';
            bodyEl.innerHTML = '<p class="chat-error">' + netMsg + "</p>";
          }
        } else {
          if (bodyEl) {
            bodyEl.innerHTML =
              '<p class="chat-error">' + escapeHtml(raw) + "</p>";
          }
        }
        finishStream();
      });

    function finishStream() {
      if (streamFinalized) return;
      streamFinalized = true;
      if (accumulated) {
        messages.push({ role: "assistant", content: accumulated });
        if (bodyEl) {
          wireFollowUpChips(bodyEl);
        }
      }
      persistMessages();
      isStreaming = false;
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  function init(rootEl, opts) {
    opts = opts || {};
    initOpts = opts;
    container = rootEl;
    container.innerHTML = "";
    container.className =
      (container.className || "").replace("chat-container", "") +
      " chat-container";

    messagesEl = document.createElement("div");
    messagesEl.className = "chat-messages";
    messagesEl.setAttribute("aria-live", "polite");
    messagesEl.setAttribute("aria-relevant", "additions");
    container.appendChild(messagesEl);

    clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "chat-clear";
    clearBtn.textContent = "Clear conversation";
    clearBtn.addEventListener("click", clearChat);

    var clearBtnContainer = document.createElement("div");
    clearBtnContainer.className = "chat-clear-container";
    clearBtnContainer.appendChild(clearBtn);

    suggestionsEl = document.createElement("div");
    suggestionsEl.className = "chat-suggestions";
    wireSuggestions();

    var stored = loadStoredMessages();
    if (stored && stored.length > 0) {
      messages = stored;
      stored.forEach(function (m) {
        var html =
          m.role === "user"
            ? escapeHtml(m.content)
            : renderMarkdown(m.content);
        var wrap = appendMessage(m.role, html);
        if (m.role === "assistant") {
          var b = wrap.querySelector(".chat-bubble__body");
          if (b) wireFollowUpChips(b);
        }
      });
      suggestionsEl.style.display = "none";
      messagesEl.appendChild(suggestionsEl);
      messagesEl.appendChild(clearBtnContainer);
    } else {
      messages = [];
      if (!opts.noEmptyState) {
        emptyStateEl = createEmptyState();
        messagesEl.appendChild(emptyStateEl);
      }
      if (!opts.noSuggestions) {
        messagesEl.appendChild(suggestionsEl);
      } else {
        suggestionsEl.style.display = "none";
        messagesEl.appendChild(suggestionsEl);
      }
      messagesEl.appendChild(clearBtnContainer);
    }

    updateClearVisibility();

    window.addEventListener("beforeunload", persistMessages);

    var inputBar = document.createElement("form");
    inputBar.className = "chat-input-bar";
    inputBar.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMessage(inputEl.value);
    });

    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.className = "chat-input";
    inputEl.placeholder = "Ask about fintech, leadership, case studies, or measurable wins\u2026";
    inputEl.autocomplete = "off";
    inputEl.maxLength = 500;

    sendBtn = document.createElement("button");
    sendBtn.type = "submit";
    sendBtn.className = "chat-send";
    sendBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 10H16.5M16.5 10L10.5 4M16.5 10L10.5 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    sendBtn.setAttribute("aria-label", "Send message");

    inputBar.appendChild(inputEl);
    inputBar.appendChild(sendBtn);
    container.appendChild(inputBar);
  }

  window.JamesCVBot = { init: init, wireSuggestions: wireSuggestionsToContainer };
})();
