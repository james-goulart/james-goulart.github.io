(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function data() {
    return (window.Portfolio && Portfolio.DATA) || { experiences: [] };
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

  function experienceById(expId) {
    var experiences = data().experiences || [];
    for (var i = 0; i < experiences.length; i++) {
      if (experiences[i].id === expId) return experiences[i];
    }
    return null;
  }

  function caseById(caseId) {
    var experiences = data().experiences || [];
    for (var i = 0; i < experiences.length; i++) {
      var exp = experiences[i];
      var cases = exp.cases || [];
      for (var j = 0; j < cases.length; j++) {
        if (cases[j].id === caseId) return { experience: exp, caseItem: cases[j] };
      }
    }
    return null;
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

  /** Compact logo for experience flagship / related cards (~ eyebrow text height). */
  function experienceCardLogoHtml(exp) {
    var wm = companyWordmarkSrc(exp.company);
    var ic = companyIconSrc(exp.company);
    var src = wm || ic;
    if (!src) return "";
    var cls =
      "experience-card-logo" +
      (wm ? " experience-card-logo--wordmark" : " experience-card-logo--icon");
    return (
      '<img class="' +
      cls +
      '" src="' +
      escapeHtml(src) +
      '" alt="" loading="lazy" decoding="async" />'
    );
  }

  /** Split "Lead part — tail" for related-experience titles (second line, normal weight). */
  function splitComposedRoleTitle(text) {
    var s = String(text || "").trim();
    var idx = s.search(/\s[-–—]\s/);
    if (idx !== -1) {
      return {
        first: s.slice(0, idx).trim(),
        second: s.slice(idx).replace(/^\s*[-–—]\s*/, "").trim()
      };
    }
    idx = s.search(/[–—]/);
    if (idx > 0) {
      return {
        first: s.slice(0, idx).trim(),
        second: s.slice(idx + 1).trim()
      };
    }
    return { first: s, second: "" };
  }

  function pressSourceLabel(url) {
    try {
      var u = new URL(String(url || "").trim());
      var host = u.hostname.replace(/^www\./i, "");
      if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com")) {
        return "YouTube";
      }
      return host || "Press";
    } catch (e) {
      return "Press";
    }
  }

  function brandRow(exp) {
    var wm = companyWordmarkSrc(exp.company);
    var ic = companyIconSrc(exp.company);
    if (!wm && !ic) return "";
    return '<p class="page-head__brand">' +
      (wm
        ? '<img class="page-head__co-logo" src="' + escapeHtml(wm) + '" alt="" />'
        : '<img class="page-head__co-logo page-head__co-logo--icon" src="' + escapeHtml(ic) + '" alt="" />') +
      '</p>';
  }

  var FLAG_TWEMOJI_FILE = { BR: '1f1e7-1f1f7', PT: '1f1f5-1f1f9', IT: '1f1ee-1f1f9', RU: '1f1f7-1f1fa' };
  var TWEMOJI_FLAG_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/';

  function locationFlagHtml(exp) {
    var file = FLAG_TWEMOJI_FILE[exp.locationFlag] || FLAG_TWEMOJI_FILE[exp.navFlag];
    if (!file) return '';
    return '<img class="location-flag-img" src="' + escapeHtml(TWEMOJI_FLAG_BASE + file + '.png') + '" alt="" width="16" height="16" loading="lazy" decoding="async" /> ';
  }

  function locationLineHtml(exp) {
    if (!exp.location) return '';
    return '<p class="page-head__location">' + locationFlagHtml(exp) + escapeHtml(exp.location) + '</p>';
  }

  function tenureLabel(tenure) {
    if (tenure == null || tenure === '') return '—';
    var n = parseFloat(String(tenure).replace(',', '.'));
    if (isNaN(n)) return String(tenure);
    if (n < 1) {
      var months = Math.round(n * 12);
      return months + (months === 1 ? ' month' : ' months');
    }
    var rounded = Math.round(n * 10) / 10;
    return String(rounded % 1 === 0 ? Math.round(rounded) : rounded) + (rounded === 1 ? ' year' : ' years');
  }

  function roleHtml(exp) {
    return '<span class="page-head__role-text">' + escapeHtml(exp.role || 'Role') + '</span>';
  }

  function renderInlineMarkdown(text) {
    return escapeHtml(String(text == null ? '' : text))
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a class="case-inline-link" href="$2">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function renderRichText(text) {
    if (!text) return '';
    return String(text).trim().split(/\n\s*\n/).map(function (block) {
      var lines = block.split('\n').map(function (line) { return line.trim(); }).filter(Boolean);
      if (!lines.length) return '';
      if (lines.every(function (line) { return /^\d+\.\s/.test(line); })) {
        return '<ol class="case-ol">' + lines.map(function (line) { return '<li>' + renderInlineMarkdown(line.replace(/^\d+\.\s*/, '')) + '</li>'; }).join('') + '</ol>';
      }
      if (lines.every(function (line) { return /^[-•*]\s/.test(line); })) {
        return '<ul class="case-ul">' + lines.map(function (line) { return '<li>' + renderInlineMarkdown(line.replace(/^[-•*]\s*/, '')) + '</li>'; }).join('') + '</ul>';
      }
      return '<p>' + renderInlineMarkdown(lines.join('<br />')) + '</p>';
    }).join('');
  }

  function renderMetrics(metrics) {
    if (!metrics || !metrics.length) return '';
    return '<section class="case-metrics" aria-label="Key outcomes">' + metrics.map(function (metric) {
      return '<article class="metric-pill"><span class="metric-pill__label">' + escapeHtml(metric.label) + '</span><div class="metric-pill__values"><span class="metric-pill__after">' + escapeHtml(metric.value || metric.after || '') + '</span></div></article>';
    }).join('') + '</section>';
  }

  function renderSummary(summaryBullets) {
    if (!summaryBullets || !summaryBullets.length) return '';
    return '<section class="case-summary-card" aria-labelledby="experience-summary-heading"><div class="case-summary-card__inner"><h2 id="experience-summary-heading" class="case-summary-card__label">Executive summary</h2><ul class="experience-summary-list">' + summaryBullets.map(function (item) {
      return '<li><span class="experience-summary-list__label">' + escapeHtml(item.label) + '</span><span class="experience-summary-list__text">' + renderInlineMarkdown(item.text) + '</span></li>';
    }).join('') + '</ul></div></section>';
  }

  function renderOwned(owned) {
    if (!owned) return '';
    var panes = [];
    [["Product surface", owned.productSurface], ["Business problem", owned.businessProblems], ["Operating responsibility", owned.operatingResponsibilities]].forEach(function (pair) {
      if (!pair[1] || !pair[1].length) return;
      panes.push('<article class="experience-ownership__pane"><h3>' + escapeHtml(pair[0]) + '</h3><ul>' + pair[1].map(function (line) { return '<li>' + renderInlineMarkdown(line) + '</li>'; }).join('') + '</ul></article>');
    });
    if (!panes.length) return '';
    return '<section class="experience-ownership" aria-labelledby="experience-owned-heading"><h2 id="experience-owned-heading" class="case-section__heading">What I owned</h2><div class="experience-ownership__grid">' + panes.join('') + '</div></section>';
  }

  function renderSections(sections) {
    if (!sections || !sections.length) return '';
    return sections.map(function (section) {
      return '<section class="case-section' + (section.className ? ' ' + section.className : '') + '"><h2 class="case-section__heading">' + escapeHtml(section.title) + '</h2><div class="case-section__body">' + renderRichText(section.body) + '</div></section>';
    }).join('');
  }

  function renderHighlights(highlights) {
    if (!highlights || !highlights.length) return '';
    return '<ul class="highlights-list">' + highlights.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
  }

  function renderOrgScope(orgScope) {
    var lines = String(orgScope || '').trim().split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean);
    if (!lines.length) return '';
    return '<ul class="org-scope-list">' + lines.map(function (line) { return '<li class="org-line">' + escapeHtml(line) + '</li>'; }).join('') + '</ul>';
  }

  function orgAboutText(exp) {
    var about = window.ORG_ABOUT || {};
    if (exp.track === 'Degree' && about.Unicamp) return about.Unicamp;
    return about[exp.company] || '';
  }

  function relatedNewsTitleEn(url) {
    return window.Portfolio && Portfolio.relatedNewsTitleEn ? (Portfolio.relatedNewsTitleEn(url) || '') : '';
  }

  function renderPressLinks(urls) {
    urls = uniqueStrings(urls);
    if (!urls.length) return '';
    return '<section class="experience-aside__section"><h2>Related press</h2><ul class="experience-aside__links">' + urls.map(function (url) {
      var source = pressSourceLabel(url);
      return '<li><a class="experience-aside__link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer"><span class="experience-aside__source">' + escapeHtml(source) + '</span><span class="experience-aside__title">' + escapeHtml(relatedNewsTitleEn(url) || url) + '</span></a></li>';
    }).join('') + '</ul></section>';
  }

  function renderFlagshipCases(caseIds) {
    var rows = (caseIds || []).map(caseById).filter(Boolean);
    if (!rows.length) return '';
    return '<section class="experience-flagship" aria-labelledby="experience-flagship-heading"><div class="experience-flagship__head"><h2 id="experience-flagship-heading">Flagship work</h2><a class="experience-flagship__browse" href="cases.html">Browse all cases</a></div><div class="experience-flagship__grid">' + rows.map(function (row) {
      var narrative = row.caseItem.narrative || '';
      var shortMetric = narrative.length > 110 ? narrative.slice(0, 107).trim() + '…' : narrative;
      var logo = experienceCardLogoHtml(row.experience);
      var brand =
        logo ||
        '<span class="experience-flagship-card__company-fallback">' +
          escapeHtml(row.experience.company) +
          "</span>";
      return (
        '<a class="experience-flagship-card" href="case.html#' +
        encodeURIComponent(row.caseItem.id) +
        '"><span class="experience-flagship-card__brand">' +
        brand +
        '</span><span class="experience-flagship-card__role">' +
        escapeHtml(row.experience.role) +
        '</span><span class="experience-flagship-card__title">' +
        escapeHtml(row.caseItem.name) +
        '</span><span class="experience-flagship-card__meta">' +
        escapeHtml(shortMetric) +
        "</span></a>"
      );
    }).join('') + '</div></section>';
  }

  function renderRelatedExperiences(expIds) {
    var rows = (expIds || []).map(experienceById).filter(Boolean);
    if (!rows.length) return '';
    return '<section class="experience-related-experiences" aria-labelledby="related-experiences-heading"><h2 id="related-experiences-heading">Related experiences</h2><div class="experience-related-experiences__grid">' + rows.map(function (exp) {
      var supporting = (exp.highlights && exp.highlights[0]) || (exp.legacySummary || '');
      var logo = experienceCardLogoHtml(exp);
      var brand =
        logo ||
        '<span class="experience-related-card__company-fallback">' +
          escapeHtml(exp.company) +
          "</span>";
      var parts = splitComposedRoleTitle(exp.role);
      var titleHtml =
        parts.second
          ? '<span class="experience-related-card__title experience-related-card__title--split"><span class="experience-related-card__title-strong">' +
            escapeHtml(parts.first) +
            '</span><span class="experience-related-card__title-rest">' +
            escapeHtml(parts.second) +
            "</span></span>"
          : '<span class="experience-related-card__title">' + escapeHtml(parts.first) + "</span>";
      return (
        '<a class="experience-related-card" href="experience.html#' +
        encodeURIComponent(exp.id) +
        '"><span class="experience-related-card__brand">' +
        brand +
        "</span>" +
        titleHtml +
        '<span class="experience-related-card__meta">' +
        escapeHtml(supporting) +
        "</span></a>"
      );
    }).join('') + '</div></section>';
  }

  function renderProof(proof) {
    if (!proof || !proof.length) return '';
    return '<section class="experience-proof" aria-labelledby="experience-proof-heading"><h2 id="experience-proof-heading">What this chapter proves</h2><ul class="experience-proof-list">' + proof.map(function (line) { return '<li>' + renderInlineMarkdown(line) + '</li>'; }).join('') + '</ul></section>';
  }

  window.ExperiencePageHelpers = {
    escapeHtml: escapeHtml,
    uniqueStrings: uniqueStrings,
    experienceById: experienceById,
    caseById: caseById,
    brandRow: brandRow,
    locationLineHtml: locationLineHtml,
    roleHtml: roleHtml,
    tenureLabel: tenureLabel,
    renderMetrics: renderMetrics,
    renderSummary: renderSummary,
    renderOwned: renderOwned,
    renderSections: renderSections,
    renderHighlights: renderHighlights,
    renderOrgScope: renderOrgScope,
    orgAboutText: orgAboutText,
    renderPressLinks: renderPressLinks,
    renderFlagshipCases: renderFlagshipCases,
    renderRelatedExperiences: renderRelatedExperiences,
    renderProof: renderProof
  };
})();
