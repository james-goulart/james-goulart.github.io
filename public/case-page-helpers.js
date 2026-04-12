(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uniqueStrings(values) {
    var seen = Object.create(null);
    return (values || []).filter(function (value) {
      var key = String(value || "").trim();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function data() {
    return (window.Portfolio && Portfolio.DATA) || { experiences: [] };
  }

  function caseById(caseId) {
    var experiences = data().experiences || [];
    for (var i = 0; i < experiences.length; i++) {
      var exp = experiences[i];
      if (!exp.cases) continue;
      for (var j = 0; j < exp.cases.length; j++) {
        if (exp.cases[j].id === caseId) {
          return { experience: exp, caseItem: exp.cases[j] };
        }
      }
    }
    return null;
  }

  /**
   * Twemoji PNG filenames (72×72) — same as portfolio.js so case pages match
   * experience pages (Windows often renders Unicode flag sequences as letters).
   */
  var CASE_FLAG_TWEMOJI_FILE = {
    BR: "1f1e7-1f1f7",
    PT: "1f1f5-1f1f9",
    IT: "1f1ee-1f1f9",
    RU: "1f1f7-1f1fa"
  };
  var CASE_TWEMOJI_FLAG_BASE =
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/";

  function isoCodeToFlagEmoji(code) {
    var c = String(code || "")
      .trim()
      .toUpperCase();
    if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return "";
    var base = 0x1f1e6;
    return String.fromCodePoint(base + c.charCodeAt(0) - 65, base + c.charCodeAt(1) - 65);
  }

  function locationFlagHtml(exp) {
    var code =
      exp && (exp.locationFlag || exp.navFlag)
        ? String(exp.locationFlag || exp.navFlag)
            .trim()
            .toUpperCase()
        : "";
    if (!code) return "";
    if (CASE_FLAG_TWEMOJI_FILE[code]) {
      var src = CASE_TWEMOJI_FLAG_BASE + CASE_FLAG_TWEMOJI_FILE[code] + ".png";
      return (
        '<img class="location-flag-img" src="' +
        escapeHtml(src) +
        '" alt="" width="16" height="16" loading="lazy" decoding="async" />'
      );
    }
    var emoji = isoCodeToFlagEmoji(code);
    if (emoji) {
      return (
        '<span class="location-flag-img location-flag-img--emoji" role="img" aria-label="' +
        escapeHtml(code) +
        '">' +
        emoji +
        "</span>"
      );
    }
    return '<span aria-hidden="true">' + escapeHtml(code) + "</span>";
  }

  function roleHtml(exp) {
    if (!exp || !exp.role) return "";
    return '<span class="page-head__role-text">' + escapeHtml(exp.role) + "</span>";
  }

  function companyWordmarkSrc(company) {
    var map = {
      Nexoos: "/assets/images/logos/Logo-Nexoos-1024x182.webp",
      QuintoAndar: "/assets/images/logos/quintoandar-logo.svg",
      AIESEC: "/assets/images/logos/aiesec-logo-full.png",
      Unicamp: "/assets/images/logos/UNICAMP_logo.png"
    };
    return map[company] || null;
  }

  function companyIconSrc(company) {
    var map = {
      Nexoos: "/assets/images/logos/nexoos-OO.webp",
      QuintoAndar: "/assets/images/logos/quintoandar-blue.svg",
      AIESEC: "/assets/images/logos/AIESEC-Human-Blue.jpg",
      Unicamp: "/assets/images/logos/unicamp-icon.png"
    };
    return map[company] || null;
  }

  function brandRow(exp) {
    var wm = companyWordmarkSrc(exp.company);
    var ic = companyIconSrc(exp.company);
    if (!wm && !ic) return "";
    return (
      '<p class="page-head__brand">' +
      (wm
        ? '<img class="page-head__co-logo" src="' + escapeHtml(wm) + '" alt="" />'
        : '<img class="page-head__co-logo page-head__co-logo--icon" src="' + escapeHtml(ic) + '" alt="" />') +
      "</p>"
    );
  }

  /** Full wordmark for related-case rows; icon fallback; text if no asset. */
  function relatedCaseCompanyMarkHtml(exp) {
    if (!exp || !exp.company) return "";
    var wm = companyWordmarkSrc(exp.company);
    var ic = companyIconSrc(exp.company);
    var src = wm || ic;
    if (!src) {
      return (
        '<span class="case-related-company-fallback">' +
        escapeHtml(exp.company) +
        "</span>"
      );
    }
    var cls = "case-related-wordmark";
    if (!wm && ic) cls += " case-related-wordmark--icon";
    return (
      '<img class="' +
      cls +
      '" src="' +
      escapeHtml(src) +
      '" alt="' +
      escapeHtml(exp.company) +
      '" loading="lazy" />'
    );
  }

  function applyInlineMarkdown(text) {
    var source = String(text == null ? "" : text);
    var output = "";
    var linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    var lastIndex = 0;
    var match;

    function applyEmphasis(segment) {
      return escapeHtml(segment)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
    }

    while ((match = linkRegex.exec(source)) !== null) {
      output += applyEmphasis(source.slice(lastIndex, match.index));
      output +=
        '<a class="case-inline-link" href="' +
        escapeHtml(match[2]) +
        '">' +
        applyEmphasis(match[1]) +
        "</a>";
      lastIndex = match.index + match[0].length;
    }

    output += applyEmphasis(source.slice(lastIndex));
    return output;
  }

  /**
   * Consecutive blocks that are each a single numbered line were split by blank
   * lines in source; each became its own <ol> and showed "1." — merge into one block.
   */
  function mergeAdjacentSingleNumberedBlocks(blocks) {
    var out = [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var lines = b.split("\n").map(function (l) {
        return l.trim();
      }).filter(Boolean);
      if (lines.length === 1 && /^\d+\.\s/.test(lines[0])) {
        var merged = [lines[0]];
        while (i + 1 < blocks.length) {
          var nextLines = blocks[i + 1]
            .split("\n")
            .map(function (l) {
              return l.trim();
            })
            .filter(Boolean);
          if (nextLines.length === 1 && /^\d+\.\s/.test(nextLines[0])) {
            merged.push(nextLines[0]);
            i++;
          } else {
            break;
          }
        }
        out.push(merged.join("\n"));
      } else {
        out.push(b);
      }
    }
    return out;
  }

  function renderRichText(text) {
    if (!text) return "";
    var paragraphs = mergeAdjacentSingleNumberedBlocks(
      String(text)
        .trim()
        .split(/\n\s*\n/)
        .map(function (block) {
          return block.trim();
        })
        .filter(Boolean)
    );

    return paragraphs
      .map(function (block) {
        var lines = block
          .split("\n")
          .map(function (line) {
            return line.trim();
          })
          .filter(Boolean);

        if (!lines.length) return "";

        if (lines.every(function (line) { return /^\d+\.\s/.test(line); })) {
          return (
            '<ol class="case-ol">' +
            lines.map(function (line) {
              return "<li>" + applyInlineMarkdown(line.replace(/^\d+\.\s*/, "")) + "</li>";
            }).join("") +
            "</ol>"
          );
        }

        if (lines.every(function (line) { return /^[-•*]\s/.test(line); })) {
          return (
            '<ul class="case-ul">' +
            lines.map(function (line) {
              return "<li>" + applyInlineMarkdown(line.replace(/^[-•*]\s*/, "")) + "</li>";
            }).join("") +
            "</ul>"
          );
        }

        return "<p>" + applyInlineMarkdown(lines.join("<br />")) + "</p>";
      })
      .join("");
  }

  function normalizeNewlines(t) {
    return String(t || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  }

  /**
   * Numbered lists after a title ending in ":" — supports 1./2./3. separated by
   * single OR double newlines (some cases use only \n between items).
   */
  function parseNumberedExecutiveBlocks(text) {
    var raw = normalizeNewlines(text).trim();
    if (!raw) return null;
    var blocks = raw
      .split(/\n\s*\n/)
      .map(function (b) {
        return b.trim();
      })
      .filter(Boolean);
    if (blocks.length < 2) return null;
    var head = blocks[0];
    if (!/:\s*$/.test(head)) return null;
    var tail = blocks.slice(1).join("\n");
    var parts = tail
      .split(/\n\s*(?=\d{1,2}\.\s)/)
      .map(function (p) {
        return p.trim();
      })
      .filter(Boolean);
    var items = [];
    for (var pi = 0; pi < parts.length; pi++) {
      var m = parts[pi].match(/^\d{1,2}\.\s+([\s\S]+)/);
      if (m) items.push(m[1].trim());
    }
    return items.length >= 2 ? items : null;
  }

  function parseUnnumberedInsightParagraphs(text) {
    var raw = normalizeNewlines(text).trim();
    if (!raw) return null;
    var blocks = raw
      .split(/\n\s*\n/)
      .map(function (b) {
        return b.trim();
      })
      .filter(Boolean);
    if (blocks.length < 2) return null;
    if (blocks.some(function (b) {
      return /^\d{1,2}\.\s/.test(b);
    })) {
      return null;
    }
    return blocks;
  }

  function stripLeadingEnumeration(s) {
    return String(s || "")
      .replace(/^\s*\d{1,2}\.\s+/, "")
      .trim();
  }

  /**
   * Tight executive-summary line per insight bullet (1–2 short sentences).
   */
  function insightBulletExecutiveSummary(body) {
    var b = String(body || "").trim();
    if (!b) return "";
    var em = b.indexOf("\u2014");
    if (em < 0) em = b.indexOf("—");
    if (em > 18 && em < 280) {
      var lead = b.slice(0, em).trim();
      if (lead.length >= 22 && lead.length <= 210) {
        return stripLeadingEnumeration(/[.!?]$/.test(lead) ? lead : lead + ".");
      }
    }
    var s1 = firstNSentencesSmart(b, 1);
    if (s1.length > 260) {
      var cut = s1.slice(0, 257);
      var sp = cut.lastIndexOf(" ");
      return stripLeadingEnumeration((sp > 170 ? cut.slice(0, sp) : cut).trim() + "\u2026");
    }
    if (s1.length < 88) {
      var s2 = firstNSentencesSmart(b, 2);
      if (s2.length <= 300) return stripLeadingEnumeration(s2);
      var c2 = s2.slice(0, 297);
      var sp2 = c2.lastIndexOf(" ");
      return stripLeadingEnumeration((sp2 > 200 ? c2.slice(0, sp2) : c2).trim() + "\u2026");
    }
    return stripLeadingEnumeration(s1);
  }

  function isSentenceBoundary(s, i) {
    var ch = s.charAt(i);
    if (ch !== "." && ch !== "!" && ch !== "?") return false;
    if (ch === ".") {
      var j = i - 1;
      while (j >= 0 && /\d/.test(s.charAt(j))) j--;
      var num = s.slice(j + 1, i);
      if (/^\d{1,2}$/.test(num)) {
        var prev = j < 0 ? "" : s.charAt(j);
        if (!prev || /[\s:\n(]/.test(prev)) return false;
      }
      var windowStart = Math.max(0, i - 10);
      var beforeDot = s.slice(windowStart, i + 1).toLowerCase();
      if (/\be\.g\.$/.test(beforeDot) || /\bi\.e\.$/.test(beforeDot)) return false;
    }
    return true;
  }

  function firstSentenceSmart(text) {
    var s = String(text || "").trim();
    if (!s) return "";
    var i = 0;
    while (i < s.length) {
      var ch = s.charAt(i);
      if ((ch === "." || ch === "!" || ch === "?") && isSentenceBoundary(s, i)) {
        return s.slice(0, i + 1).trim();
      }
      i++;
    }
    return s;
  }

  /** Up to maxN sentences per segment (same boundary rules as firstSentenceSmart). */
  function firstNSentencesSmart(text, maxN) {
    var n = Math.max(1, Number(maxN) > 0 ? Number(maxN) : 2);
    var s = String(text || "").trim();
    if (!s) return "";
    var parts = [];
    var segStart = 0;
    var i = 0;
    while (i < s.length && parts.length < n) {
      var ch = s.charAt(i);
      if ((ch === "." || ch === "!" || ch === "?") && isSentenceBoundary(s, i)) {
        parts.push(s.slice(segStart, i + 1).trim());
        segStart = i + 1;
        while (segStart < s.length && /\s/.test(s.charAt(segStart))) segStart++;
        i = segStart;
        continue;
      }
      i++;
    }
    if (parts.length < n && segStart < s.length) {
      var tail = s.slice(segStart).trim();
      if (tail) parts.push(tail);
    }
    return parts.join(" ");
  }

  function summaryFieldValue(text, fieldLabel) {
    var numbered = parseNumberedExecutiveBlocks(text);
    if (numbered && numbered.length) {
      var bodies = numbered;
      if (fieldLabel === "Insight") {
        bodies = numbered.map(function (body) {
          return insightBulletExecutiveSummary(body);
        });
        return {
          html:
            '<div class="case-summary-insights">' +
            bodies
              .map(function (body) {
                return (
                  '<div class="case-summary-insights__item">' +
                  applyInlineMarkdown(body) +
                  "</div>"
                );
              })
              .join("") +
            "</div>"
        };
      }
      return {
        html:
          '<ul class="case-summary-points">' +
          bodies
            .map(function (body) {
              return "<li>" + applyInlineMarkdown(body) + "</li>";
            })
            .join("") +
          "</ul>"
      };
    }
    if (fieldLabel === "Insight") {
      var paras = parseUnnumberedInsightParagraphs(text);
      if (paras && paras.length >= 2) {
        var pb = paras.map(function (p) {
          return insightBulletExecutiveSummary(p);
        });
        return {
          html:
            '<div class="case-summary-insights">' +
            pb
              .map(function (body) {
                return (
                  '<div class="case-summary-insights__item">' +
                  applyInlineMarkdown(body) +
                  "</div>"
                );
              })
              .join("") +
            "</div>"
        };
      }
      var ib = insightBulletExecutiveSummary(text);
      return ib ? { text: ib } : null;
    }
    var t = firstSentenceSmart(text);
    return t ? { text: t } : null;
  }

  function buildSummaryItems(content) {
    var rows = [
      { label: "Problem", value: summaryFieldValue(content.problem, "Problem") },
      { label: "Insight", value: summaryFieldValue(content.insight, "Insight") },
      { label: "Move", value: summaryFieldValue(content.solution, "Move") },
      { label: "Result", value: summaryFieldValue(content.results, "Result") }
    ];
    return rows
      .filter(function (r) {
        return r.value;
      })
      .map(function (r) {
        var v = r.value;
        if (v.html) return { label: r.label, html: v.html };
        return { label: r.label, text: v.text };
      });
  }

  function renderSummaryCard(content, dek) {
    var items = buildSummaryItems(content);
    var dekHtml = dek
      ? '<div class="case-summary-card__dek">' + applyInlineMarkdown(String(dek).trim()) + "</div>"
      : "";
    if (!items.length && !dekHtml) return "";
    return (
      '<section class="case-summary-card" aria-labelledby="case-summary-heading">' +
      '<div class="case-summary-card__inner">' +
      '<h2 id="case-summary-heading" class="case-summary-card__label">Executive summary</h2>' +
      dekHtml +
      (items.length
        ? '<ul class="case-summary-list">' +
          items
            .map(function (item) {
              var body =
                item.html != null
                  ? item.html
                  : applyInlineMarkdown(item.text);
              return (
                "<li>" +
                '<span class="case-summary-list__label">' +
                escapeHtml(item.label) +
                "</span>" +
                '<span class="case-summary-list__text">' +
                body +
                "</span>" +
                "</li>"
              );
            })
            .join("") +
          "</ul>"
        : "") +
      "</div></section>"
    );
  }

  function renderMetrics(metrics) {
    if (!metrics || !metrics.length) return "";
    return (
      '<section class="case-metrics" aria-label="Key outcomes">' +
      metrics.map(function (metric) {
        var values = "";
        if (metric.before) values += '<span class="metric-pill__before">' + escapeHtml(metric.before) + "</span>";
        if (metric.before && metric.after) values += '<span class="metric-pill__arrow" aria-hidden="true">→</span>';
        if (metric.after) values += '<span class="metric-pill__after">' + escapeHtml(metric.after) + "</span>";
        return (
          '<article class="metric-pill">' +
          '<span class="metric-pill__label">' + escapeHtml(metric.label) + "</span>" +
          '<div class="metric-pill__values">' + values + "</div>" +
          "</article>"
        );
      }).join("") +
      "</section>"
    );
  }

  function relatedNewsLabel(url) {
    if (window.Portfolio && Portfolio.relatedNewsTitleEn) {
      var title = Portfolio.relatedNewsTitleEn(url);
      if (title) return title;
    }
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (err) {
      return url;
    }
  }

  function relatedNewsHost(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (err) {
      return "link";
    }
  }

  function renderRelatedNewsLinks(urls, titleTag, sectionClassExtra) {
    if (!urls.length) return "";
    var headingTag = titleTag || "h2";
    var extra = sectionClassExtra ? " " + sectionClassExtra : "";
    return (
      '<section class="case-aside__section' + extra + '">' +
      "<" + headingTag + ">Related news</" + headingTag + ">" +
      '<ul class="case-aside__links">' +
      urls.map(function (url) {
        return (
          "<li>" +
          '<a class="case-aside__link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="case-aside__eyebrow">' + escapeHtml(relatedNewsHost(url)) + "</span>" +
          '<span class="case-aside__title">' + escapeHtml(relatedNewsLabel(url)) + "</span>" +
          "</a></li>"
        );
      }).join("") +
      "</ul></section>"
    );
  }

  function renderRelatedCases(ids) {
    var related = (ids || []).map(caseById).filter(Boolean);
    if (!related.length) return "";
    return (
      '<section class="case-related-cases" aria-labelledby="case-related-cases-heading">' +
      '<div class="case-related-cases__head">' +
      '<h2 id="case-related-cases-heading">Related cases</h2>' +
      '<a class="case-related-cases__browse" href="cases.html">Browse all cases</a>' +
      "</div>" +
      '<div class="case-related-cases__grid">' +
      related.map(function (item) {
        return (
          '<a class="case-related-card" href="case.html#' + encodeURIComponent(item.caseItem.id) + '">' +
          '<span class="case-related-card__eyebrow case-related-card__eyebrow--related-co">' +
          relatedCaseCompanyMarkHtml(item.experience) +
          "</span>" +
          '<span class="case-related-card__role">' +
          escapeHtml(item.experience.role) +
          "</span>" +
          '<span class="case-related-card__title">' + escapeHtml(item.caseItem.name) + "</span>" +
          '<span class="case-related-card__meta">' + escapeHtml(item.caseItem.narrative || "") + "</span>" +
          "</a>"
        );
      }).join("") +
      "</div></section>"
    );
  }

  function renderAsideRelatedCases(ids) {
    var related = (ids || []).map(caseById).filter(Boolean);
    if (!related.length) return "";
    return (
      '<section class="case-aside__section case-aside__section--related">' +
      "<h2>Related cases</h2>" +
      '<ul class="case-aside__links">' +
      related.map(function (item) {
        return (
          "<li>" +
          '<a class="case-aside__link" href="case.html#' + encodeURIComponent(item.caseItem.id) + '">' +
          '<span class="case-aside__eyebrow case-aside__eyebrow--related-co">' +
          relatedCaseCompanyMarkHtml(item.experience) +
          "</span>" +
          '<span class="case-aside__title">' + escapeHtml(item.caseItem.name) + "</span>" +
          "</a></li>"
        );
      }).join("") +
      "</ul></section>"
    );
  }

  window.CasePageHelpers = {
    escapeHtml: escapeHtml,
    uniqueStrings: uniqueStrings,
    caseById: caseById,
    locationFlagHtml: locationFlagHtml,
    roleHtml: roleHtml,
    brandRow: brandRow,
    renderRichText: renderRichText,
    renderSummaryCard: renderSummaryCard,
    renderMetrics: renderMetrics,
    renderRelatedNewsLinks: renderRelatedNewsLinks,
    renderRelatedCases: renderRelatedCases,
    renderAsideRelatedCases: renderAsideRelatedCases,
    applyInlineMarkdown: applyInlineMarkdown
  };
})();
