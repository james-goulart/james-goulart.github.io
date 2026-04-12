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

  function locationFlagHtml(exp) {
    var flag = exp && exp.locationFlag ? escapeHtml(exp.locationFlag) : "";
    return flag ? '<span aria-hidden="true">' + flag + "</span>" : "";
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

  function renderRichText(text) {
    if (!text) return "";
    var paragraphs = String(text)
      .trim()
      .split(/\n\s*\n/)
      .map(function (block) {
        return block.trim();
      })
      .filter(Boolean);

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

  function firstSentence(text) {
    var compact = String(text || "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    if (!compact) return "";
    var match = compact.match(/^(.+?[.!?])(\s|$)/);
    return (match ? match[1] : compact).trim();
  }

  function buildSummaryItems(content) {
    return [
      { label: "Problem", text: firstSentence(content.problem) },
      { label: "Insight", text: firstSentence(content.insight) },
      { label: "Move", text: firstSentence(content.solution) },
      { label: "Result", text: firstSentence(content.results) }
    ].filter(function (item) { return item.text; });
  }

  function renderSummaryCard(content) {
    var items = buildSummaryItems(content);
    if (!items.length) return "";
    return (
      '<section class="case-summary-card" aria-labelledby="case-summary-heading">' +
      '<div class="case-summary-card__inner">' +
      '<h2 id="case-summary-heading" class="case-summary-card__label">Executive summary</h2>' +
      '<ul class="case-summary-list">' +
      items.map(function (item) {
        return (
          "<li>" +
          '<span class="case-summary-list__label">' + escapeHtml(item.label) + "</span>" +
          '<span class="case-summary-list__text">' + applyInlineMarkdown(item.text) + "</span>" +
          "</li>"
        );
      }).join("") +
      "</ul></div></section>"
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

  function renderRelatedNewsLinks(urls, titleTag) {
    if (!urls.length) return "";
    var headingTag = titleTag || "h2";
    return (
      '<section class="case-aside__section">' +
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
          '<span class="case-related-card__eyebrow">' + escapeHtml(item.experience.company) + " · " + escapeHtml(item.experience.role) + "</span>" +
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
          '<span class="case-aside__eyebrow">' + escapeHtml(item.experience.company) + "</span>" +
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
