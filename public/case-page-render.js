(function () {
  "use strict";

  if (!window.Portfolio || !window.CASES_CONTENT || !window.CasePageHelpers) return;

  var originalRenderCase = Portfolio.renderCase;
  var helpers = window.CasePageHelpers;
  var sections = window.CASE_PAGE_SECTIONS || [];
  var metaMap = window.CASE_PAGE_META || {};

  function renderSections(content) {
    return sections.map(function (section) {
      if (!content[section.key]) return "";
      var className = "case-section" + (section.className ? " " + section.className : "");
      return (
        '<section class="' + className + '">' +
        '<h2 class="case-section__heading">' + helpers.escapeHtml(section.label) + "</h2>" +
        '<div class="case-section__body">' + helpers.renderRichText(content[section.key]) + "</div>" +
        "</section>"
      );
    }).join("");
  }

  Portfolio.renderCase = function renderStructuredCase(main) {
    var id = decodeURIComponent((window.location.hash || "#").slice(1));
    var found = helpers.caseById(id);

    if (!found) {
      originalRenderCase(main);
      return;
    }

    var meta = metaMap[id] || {};
    var content = Object.assign({}, window.CASES_CONTENT[id] || {}, meta.overrides || {});

    if (!content.tldr && !content.context && !content.problem) {
      originalRenderCase(main);
      return;
    }

    var exp = found.experience;
    var caseItem = found.caseItem;
    var relatedNews = helpers.uniqueStrings(caseItem.relatedNews || []);
    var dek = caseItem.narrative || content.tldr || "";

    var mobileNews = relatedNews.length
      ? '<section id="case-related-news" class="case-related-news-mobile" aria-label="Related news">' +
        helpers.renderRelatedNewsLinks(relatedNews, "h3") +
        "</section>"
      : "";

    var aside = relatedNews.length || (meta.relatedCases && meta.relatedCases.length)
      ? '<aside id="case-related-news-desktop" class="case-aside case-aside--news" aria-label="Case links">' +
        (relatedNews.length ? helpers.renderRelatedNewsLinks(relatedNews, "h2") : "") +
        helpers.renderAsideRelatedCases(meta.relatedCases || []) +
        "</aside>"
      : "";

    main.innerHTML =
      '<header class="page-head case-header">' +
      helpers.brandRow(exp) +
      "<h1>" + helpers.escapeHtml(caseItem.name) + "</h1>" +
      '<p class="page-head__role page-head__role--case">' + helpers.roleHtml(exp) + "</p>" +
      (exp.location
        ? '<p class="page-head__location">' + helpers.locationFlagHtml(exp) + helpers.escapeHtml(exp.location) + "</p>"
        : "") +
      '<p class="case-header__dek">' + helpers.applyInlineMarkdown(dek) + "</p>" +
      "</header>" +
      '<div class="case-layout' + (aside ? " case-layout--with-aside" : "") + '">' +
      '<div class="case-layout__main">' +
      mobileNews +
      helpers.renderSummaryCard(content) +
      helpers.renderMetrics(content.metrics || []) +
      '<div class="case-structured">' + renderSections(content) + "</div>" +
      helpers.renderRelatedCases(meta.relatedCases || []) +
      "</div>" +
      aside +
      "</div>";
  };
})();
