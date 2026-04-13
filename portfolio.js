/** Portfolio data and rendering utilities */
const Portfolio = (function () {
  "use strict";

  const DATA = window.PORTFOLIO_DATA || { experiences: [], social: [] };

  const TYPE_ORDER = [
    "executive-summary",
    "cv",
    "recruiter-brief",
    "cover-letter",
  ];
  const TYPE_LABEL = {
    "executive-summary": "Executive summary",
    cv: "CV",
    "recruiter-brief": "Recruiter brief",
    "cover-letter": "Cover letter",
  };

  /** @param {string} str */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Fix UTF-8 text that was mis-decoded (e.g. â€™ → apostrophe). */
  function fixUtf8Mojibake(str) {
    if (!str || typeof str !== "string") return str;
    return str
      .replace(/â€™|â€˜/g, "'")
      .replace(/â€œ/g, "\u201c")
      .replace(/â€/g, "\u201d")
      .replace(/â€"|â€"/g, "\u2014")
      .replace(/â€“/g, "\u2013")
      .replace(/â€¦/g, "\u2026")
      .replace(/â€¢/g, "\u2022")
      .replace(/Ã¡/g, "á")
      .replace(/Ã©/g, "é")
      .replace(/Ã­/g, "í")
      .replace(/Ã³/g, "ó")
      .replace(/Ãº/g, "ú")
      .replace(/Ã£/g, "ã")
      .replace(/Ã§/g, "ç")
      .replace(/Ãª/g, "ê")
      .replace(/Ãµ/g, "õ")
      .replace(/Ã\u00a0/g, "à")
      .replace(/Ã±/g, "ñ");
  }

  /** @param {string} role */
  function splitExperienceRole(role) {
    const dashIndex = role.indexOf(" - ");
    if (dashIndex === -1) return { main: role, subtitle: "" };
    return {
      main: role.slice(0, dashIndex).trim(),
      subtitle: role.slice(dashIndex + 3).trim(),
    };
  }

  /**
   * Build HTML for an experience role with optional subtitle handling.
   * @param {{role?: string}} exp
   * @param {string} textClass - class for the role text span
   * @returns {string} HTML string
   */
  function roleHtmlWithSubtitle(exp, textClass) {
    const r = escapeHtml(exp.role || "Role");
    const parts = splitExperienceRole(r);
    if (!parts.subtitle) {
      return '<span class="' + textClass + '">' + parts.main + "</span>";
    }
    // Handle special case for vertical alignment in cards
    const subtitleHtml =
      '<span class="role-subtitle">' + parts.subtitle + "</span>";
    return (
      '<span class="' +
      textClass +
      '">' +
      parts.main +
      "</span><br>" +
      subtitleHtml
    );
  }

  /** @param {{type?: string, url?: string, name?: string}[]} downloads */
  function downloadsListHtml(downloads) {
    if (!downloads || !downloads.length) return "";
    const items = downloads
      .slice()
      .sort(
        (a, b) =>
          TYPE_ORDER.indexOf(a.type || "") - TYPE_ORDER.indexOf(b.type || "")
      )
      .map(function (d) {
        const label = TYPE_LABEL[d.type] || d.type || "Document";
        const url = d.url ? " href=\"" + escapeHtml(String(d.url)) + "\"" : "";
        const target = d.url ? ' target="_blank" rel="noopener noreferrer"' : "";
        return (
          "<li><a" +
          url +
          target +
          ">" +
          escapeHtml(label) +
          "</a> — " +
          escapeHtml(d.name || "") +
          "</li>"
        );
      })
      .join("");
    return "<ul>" + items + "</ul>";
  }

  const SOCIAL_LINKS = [
    {
      href: "https://www.linkedin.com/in/jamesgoulart/",
      label: "LinkedIn",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    },
    {
      href: "https://github.com/james-goulart",
      label: "GitHub",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.72-4.04-1.6-4.04-1.6-.55-1.38-1.33-1.75-1.33-1.75-1.1-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.84 2.83 1.3 3.52.98.1-.78.42-1.3.76-1.6-2.66-.3-5.46-1.34-5.46-5.95 0-1.3.47-2.36 1.24-3.2-.12-.3-.54-1.52.12-3.17 0 0 1-.33 3.3 1.22a11.45 11.45 0 0 1 6 0c2.3-1.55 3.3-1.22 3.3-1.22.66 1.65.24 2.87.12 3.17.77.84 1.24 1.9 1.24 3.2 0 4.62-2.8 5.65-5.47 5.95.43.37.82 1.1.82 2.22 0 1.6-.01 2.9-.01 3.3 0 .32.22.68.82.57A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>',
    },
  ];

  const CV_HREF =
    "https://drive.google.com/file/d/16QbQk8KQL5xrE3bTa-pk7iuZinO51s0F/view?usp=sharing";

  function brandName() {
    return escapeHtml(String(DATA.name || "").toLowerCase()) + ".";
  }

  function socialNavHtml() {
    return SOCIAL_LINKS.map(function (item) {
      return (
        '<a href="' +
        escapeHtml(item.href) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' +
        escapeHtml(item.label) +
        '">' +
        item.svg +
        "</a>"
      );
    }).join("");
  }

  /** Experience nav — subtitle under company name. */
  const COMPANY_NAV_TAGLINE = {
    QuintoAndar: "Latam's Biggest Proptech ($5B)",
    Nexoos: "Brazilian P2P Lending",
    AIESEC: "UN-backed Youth NGO",
    Unicamp: "State University of Campinas",
  };

  const FLAG_TWEMOJI_FILE = {
    BR: "1f1e7-1f1f7",
    PT: "1f1f5-1f1f9",
    IT: "1f1ee-1f1f9",
    RU: "1f1f7-1f1fa",
  };

  const TWEMOJI_FLAG_BASE =
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/";

  function companyNavTagline(company) {
    return COMPANY_NAV_TAGLINE[company] || "";
  }

  function expNavFlagTwemojiFile(exp) {
    if (exp.navFlag && FLAG_TWEMOJI_FILE[exp.navFlag]) {
      return FLAG_TWEMOJI_FILE[exp.navFlag];
    }
    if (exp.id === "quintoandar-sr-head-of-product-search-recs-app-comms-ai") {
      return FLAG_TWEMOJI_FILE.PT;
    }
    return FLAG_TWEMOJI_FILE.BR;
  }

  function expNavFlagHtml(exp) {
    var file = expNavFlagTwemojiFile(exp);
    var src = TWEMOJI_FLAG_BASE + file + ".png";
    return (
      '<img class="nav-exp-flag-img" src="' +
      escapeHtml(src) +
      '" alt="" width="18" height="18" loading="lazy" decoding="async" />'
    );
  }

  /** 2nd-level experience links: flag + role (+ optional subtitle line). */
  function experienceRoleNavInnerHtml(exp) {
    var flag =
      '<span class="nav-exp-flag" aria-hidden="true">' +
      expNavFlagHtml(exp) +
      "</span>";
    var employeeNote =
      exp.id === "nexoos-product-owner"
        ? '<span class="nav-exp-role__employee-note">3rd employee</span>'
        : "";
    var words;
    if (exp.navRoleSubtitle) {
      words =
        '<strong class="nav-emphasis">' + escapeHtml(exp.role) + "</strong>";
    } else if (exp.company === "Nexoos") {
      words =
        '<strong class="nav-emphasis">' + escapeHtml(exp.role) + "</strong>";
    } else {
      words = roleNavHtml(exp.role);
    }
    if (employeeNote) {
      words = words + "<br />" + employeeNote;
    }
    var top =
      '<span class="nav-exp-role__top">' +
      flag +
      '<span class="nav-exp-role__words">' +
      words +
      "</span></span>";
    var stacked = exp.navRoleSubtitle
      ? '<span class="nav-exp-role__line2">' +
        escapeHtml(exp.navRoleSubtitle) +
        "</span>"
      : "";
    return (
      '<span class="nav-exp-role__text' +
      (exp.navRoleSubtitle ? " nav-exp-role__text--stacked" : "") +
      '">' +
      top +
      stacked +
      "</span>"
    );
  }

  /** Role: bold segment before first " - " */
  function roleNavHtml(role) {
    var s = String(role);
    var idx = s.indexOf(" - ");
    if (idx === -1) {
      return escapeHtml(s);
    }
    return (
      '<strong class="nav-emphasis">' +
      escapeHtml(s.slice(0, idx)) +
      "</strong>" +
      escapeHtml(s.slice(idx))
    );
  }

  /** Case title: bold segment before first ":" */
  function caseNameNavHtml(name) {
    var s = String(name);
    var idx = s.indexOf(":");
    if (idx === -1) {
      return escapeHtml(s);
    }
    return (
      '<strong class="nav-emphasis">' +
      escapeHtml(s.slice(0, idx)) +
      "</strong>" +
      escapeHtml(s.slice(idx))
    );
  }

  /** Most recent experience first; cases in sheet order within each role. */
  function getAllCases() {
    const list = [];
    for (let i = DATA.experiences.length - 1; i >= 0; i--) {
      const exp = DATA.experiences[i];
      if (!exp.cases) continue;
      for (let j = 0; j < exp.cases.length; j++) {
        list.push({ experience: exp, caseItem: exp.cases[j] });
      }
    }
    return list;
  }

  function experiencesByCompany() {
    const map = {};
    DATA.experiences.forEach(function (e, idx) {
      const c = e.company;
      if (!map[c]) map[c] = [];
      map[c].push({ exp: e, idx: idx });
    });
    Object.keys(map).forEach(function (c) {
      map[c].sort(function (a, b) {
        if (c === "AIESEC") return a.idx - b.idx;
        return b.idx - a.idx;
      });
    });
    const companies = Object.keys(map).sort(function (a, b) {
      const maxA = Math.max.apply(
        null,
        map[a].map(function (x) {
          return x.idx;
        })
      );
      const maxB = Math.max.apply(
        null,
        map[b].map(function (x) {
          return x.idx;
        })
      );
      return maxB - maxA;
    });
    const rest = companies.filter(function (c) {
      return c !== "AIESEC" && c !== "Unicamp";
    });
    const tail = [];
    if (companies.indexOf("AIESEC") !== -1) tail.push("AIESEC");
    if (companies.indexOf("Unicamp") !== -1) tail.push("Unicamp");
    return { companies: rest.concat(tail), map: map };
  }

  function buildExperiencesNavHtml(active) {
    const g = experiencesByCompany();
    var allExperiencesRow =
      '<li class="nav-exp-all"><a href="experience.html"' +
      (active === "experiences"
        ? ' class="nav-exp-all__link nav-nav-line nav-nav-line--cat is-active"'
        : ' class="nav-exp-all__link nav-nav-line nav-nav-line--cat"') +
      ">" +
      '<span class="nav-case-cat__icon-cell" aria-hidden="true">' +
      navCaseCategoryIconSvg("All") +
      "</span>" +
      '<span class="nav-case-cat__label nav-case-cat__label--all">All experiences</span>' +
      '<span class="nav-exp-arrow-inline" aria-hidden="true">\u2192</span>' +
      "</a></li>";
    return (
      g.companies
        .map(function (company) {
          const rows = g.map[company]
            .map(function (x) {
              const e = x.exp;
              const cls =
                active === "exp-" + e.id ? ' class="is-active"' : "";
              return (
                "<li><a href=\"experience.html#" +
                encodeURIComponent(e.id) +
                '"' +
                cls +
                ">" +
                experienceRoleNavInnerHtml(e) +
                "</a></li>"
              );
            })
            .join("");
          const icon = companyNavIconHtml(company);
          const tag = companyNavTagline(company);
          var titleBlock =
            '<span class="nav-exp-company__title">' +
            escapeHtml(company) +
            "</span>";
          const labelInner =
            titleBlock +
            (tag
              ? '<span class="nav-exp-company__tagline">' +
                escapeHtml(tag) +
                "</span>"
              : "");
          return (
            '<li class="nav-exp-company">' +
            '<span class="nav-exp-company__name nav-nav-line">' +
            '<span class="nav-exp-company__icon-cell">' +
            icon +
            "</span>" +
            '<span class="nav-exp-company__label">' +
            labelInner +
            "</span>" +
            '<span class="nav-exp-arrow-inline" aria-hidden="true">\u2192</span>' +
            "</span>" +
            '<ul class="nav-exp-roles">' +
            rows +
            "</ul></li>"
          );
        })
        .join("") +
      allExperiencesRow
    );
  }

  function navCaseCategoryIconSvg(label) {
    var base =
      '<svg class="nav-case-cat__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    if (label === "AI") {
      return (
        base +
        '<rect x="5" y="9" width="14" height="10" rx="2"/>' +
        '<circle cx="9.5" cy="14" r="1" fill="currentColor" stroke="none"/>' +
        '<circle cx="14.5" cy="14" r="1" fill="currentColor" stroke="none"/>' +
        '<path d="M9 18h6"/>' +
        '<path d="M12 5v2M9 4h6"/>' +
        "</svg>"
      );
    }
    if (label === "Search") {
      return (
        base +
        '<circle cx="11" cy="11" r="8"/>' +
        '<path d="m21 21-4.3-4.3"/>' +
        "</svg>"
      );
    }
    if (label === "Real Estate") {
      return (
        base +
        '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
        '<polyline points="9 22 9 12 15 12 15 22"/>' +
        "</svg>"
      );
    }
    if (label === "Fintech") {
      return (
        base +
        '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' +
        "</svg>"
      );
    }
    if (label === "UX") {
      return (
        base +
        '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
        '<circle cx="12" cy="7" r="4"/>' +
        "</svg>"
      );
    }
    return (
      base +
      '<rect x="3" y="3" width="7" height="7"/>' +
      '<rect x="14" y="3" width="7" height="7"/>' +
      '<rect x="14" y="14" width="7" height="7"/>' +
      '<rect x="3" y="14" width="7" height="7"/>' +
      "</svg>"
    );
  }

  function buildCasesNavHtml(active) {
    const allCases = getAllCases();
    const byId = {};
    allCases.forEach(function (x) {
      byId[x.caseItem.id] = x;
    });

    function linksForIds(idList) {
      const seen = {};
      const parts = [];
      idList.forEach(function (id) {
        if (seen[id]) return;
        seen[id] = true;
        const x = byId[id];
        if (!x) return;
        const isCaseActive = active === "case-" + id;
        const cls = isCaseActive ? ' class="is-active"' : "";
        const ico = companyNavIconHtml(x.experience.company);
        parts.push(
          "<li><a href=\"case.html#" +
          encodeURIComponent(id) +
          '"' +
          cls +
          ">" +
          ico +
          '<span class="nav-case-link__text">' +
          caseNameNavHtml(x.caseItem.name) +
          "</span></a></li>"
        );
      });
      return parts.join("");
    }

    return CASE_NAV_ORDER.map(function (label) {
      var ids;
      if (label === "All") {
        var seenAll = Object.create(null);
        ids = [];
        CASE_DISPLAY_ORDER.forEach(function (id) {
          if (byId[id]) {
            ids.push(id);
            seenAll[id] = true;
          }
        });
        allCases.forEach(function (x) {
          var cid = x.caseItem.id;
          if (!seenAll[cid]) {
            seenAll[cid] = true;
            ids.push(cid);
          }
        });
      } else {
        ids = sortIdsByDisplayOrder(CASE_IDS_BY_GROUP[label] || []);
      }
      const rows = linksForIds(ids);
      if (!rows) return "";
      var labelClass =
        "nav-case-cat__label" +
        (label === "All" ? " nav-case-cat__label--all" : "");
      return (
        '<li class="nav-case-cat">' +
        '<span class="nav-case-cat__name nav-nav-line nav-nav-line--cat">' +
        '<span class="nav-case-cat__icon-cell" aria-hidden="true">' +
        navCaseCategoryIconSvg(label) +
        "</span>" +
        '<span class="' +
        labelClass +
        '">' +
        escapeHtml(label) +
        "</span>" +
        '<span class="nav-exp-arrow-inline" aria-hidden="true">\u2192</span>' +
        "</span>" +
        '<ul class="nav-case-links">' +
        rows +
        "</ul></li>"
      );
    }).join("");
  }

  function injectNav(container, active) {
    if (!container) return;
    active = active || "overview";
    const expMenu = buildExperiencesNavHtml(active);
    const casesMenu = buildCasesNavHtml(active);
    const casesParentActive =
      active === "cases" ||
      (typeof active === "string" && active.indexOf("case-") === 0);
    const expSectionActive =
      active === "experiences" ||
      (typeof active === "string" && active.indexOf("exp-") === 0);

    container.innerHTML =
      '<div class="nav-inner">' +
      '<a class="nav-brand' +
      (active === "overview" ? " is-active" : "") +
      '" href="overview.html">' +
      brandName() +
      "</a>" +
      '<div class="nav-center-wrap">' +
      '<ul id="nav-menu" class="nav-menu">' +
      '<li><a href="copilot.html" class="nav-copilot' +
      (active === "copilot" ? " is-active" : "") +
      '"><svg class="copilot-ai-icon copilot-ai-icon--nav" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path class="copilot-ai-icon__bubble" d="M7 10a2.5 2.5 0 0 1 2.5-2.5h5A2.5 2.5 0 0 1 17 10v3a2.5 2.5 0 0 1-2.5 2.5h-1.8l-2.2 2.1V15.5H9.5A2.5 2.5 0 0 1 7 13v-3Z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/><g class="copilot-ai-icon__sparkles" fill="currentColor"><circle class="copilot-ai-icon__pulse" cx="18.35" cy="5.85" r="1.55"/><circle class="copilot-ai-icon__pulse copilot-ai-icon__pulse--delay" cx="21.4" cy="10.15" r="1.05"/><circle class="copilot-ai-icon__pulse copilot-ai-icon__pulse--delay-b" cx="19.15" cy="12.85" r="0.72"/></g></svg> copilot</a></li>' +
      '<li class="nav-has-sub nav-has-sub--exp">' +
      '<a href="experience.html" class="nav-label' +
      (expSectionActive ? " nav-label--active" : "") +
      '">experiences</a>' +
      '<ul class="nav-sub nav-sub--exp">' +
      expMenu +
      "</ul></li>" +
      '<li class="nav-has-sub nav-has-sub--cases">' +
      '<a href="cases.html"' +
      (casesParentActive ? ' class="is-active"' : "") +
      ">cases</a>" +
      '<ul class="nav-sub nav-sub--cases nav-sub--cases-grouped">' +
      casesMenu +
      "</ul></li>" +
      '<li><a href="news.html"' +
      (active === "news" ? ' class="is-active"' : "") +
      ">news</a></li>" +
      '<li><a class="nav-cv" href="' +
      CV_HREF +
      '" target="_blank" rel="noopener noreferrer">download cv</a></li>' +
      "</ul></div>" +
      '<div class="nav-actions">' +
      '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">Menu</button>' +
      '<div class="nav-social">' +
      socialNavHtml() +
      "</div></div></div>";

    const btn = container.querySelector(".nav-toggle");
    const menu = container.querySelector("#nav-menu");
    if (btn && menu) {
      btn.addEventListener("click", function () {
        const open = menu.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  function formatNarrative(text) {
    const fullFixed = fixUtf8Mojibake(String(text || ""));
    const paragraphs = fullFixed
      .split(/\n{2,}/)
      .map(function (p) { return p.trim(); })
      .filter(function (p) { return p.length > 0; });

    const knownHeadings = [
      "short summary", "context", "the problem", "key insight",
      "my role", "constraints", "the solution", "solution", "solution / exploration", "outcome",
      "why this worked", "why this didn't scale", "what i learned"
    ];

    const skipLines = [
      "that's excellent portfolio material.",
      "that is very strong.",
      "this is the most important section in a failed-case writeup.",
      "that is actually quite a strong ending.",
      "that is strong product judgment.",
      "that is a subtle but important lesson.",
      "that is the elegant version.",
      "that is a strong strategic outcome.",
      "that is a massive business result.",
      "that is the true context.",
      "that is a very mature product pattern:"
    ];

    let html = "";
    var seenBlocks = {};
    var summaryBuffer = null;

    function appendCaseHtml(fragment) {
      if (summaryBuffer !== null) summaryBuffer.push(fragment);
      else html += fragment;
    }


    function flushSummarySection() {
      if (!summaryBuffer || summaryBuffer.length === 0) {
        summaryBuffer = null;
        return;
      }
      html +=
        '<section class="case-summary-card" aria-labelledby="case-summary-heading">' +
        '<div class="case-summary-card__inner">' +
        '<h2 id="case-summary-heading" class="case-summary-card__label">Short summary</h2>' +
        '<div class="case-summary-card__body">' +
        summaryBuffer.join("") +
        "</div></div></section>";
      summaryBuffer = null;
    }

    paragraphs.forEach(function (p, i) {
      const lower = p.toLowerCase().replace(/[\u2018\u2019]/g, "'");
      if (seenBlocks[lower]) return;
      seenBlocks[lower] = true;

      if (skipLines.indexOf(lower) !== -1) return;
      if (/^that is (clean|strong|excellent|a subtle|a very|the elegant)/.test(lower)) return;

      if (knownHeadings.indexOf(lower) !== -1) {
        if (lower === "short summary") {
          flushSummarySection();
          summaryBuffer = [];
          return;
        }
        flushSummarySection();
        var headingClass = "case-section-heading";
        if (lower.indexOf("insight") !== -1) headingClass += " case-section-heading--insight";
        if (lower.indexOf("constraint") !== -1) headingClass += " case-section-heading--constraint";
        if (lower.indexOf("problem") !== -1 || lower.indexOf("solution") !== -1) headingClass += " case-section-heading--concept";
        appendCaseHtml('<h2 class="' + headingClass + '">' + escapeHtml(p) + "</h2>");
        return;
      }

      if (i === 0 && p.length < 200 && p.indexOf("\n") === -1 && lower.indexOf("short summary") === -1) {
        appendCaseHtml('<p class="case-lede">' + escapeHtml(p) + "</p>");
        return;
      }

      var lines = p.split("\n");
      // First block in long narratives is often "title + subtitle"; the page already has H1.
      // Keep only the subtitle as lede, never as bullets.
      if (i === 0 && lines.length === 2) {
        appendCaseHtml('<p class="case-lede">' + escapeHtml(lines[1].trim()) + "</p>");
        return;
      }
      var isNumberedList = lines.length > 1 && lines.every(function (l) {
        return /^\d+\.\s/.test(l.trim()) || !l.trim();
      });

      if (isNumberedList) {
        var items = lines.filter(function (l) { return l.trim(); }).map(function (l) {
          var txt = l.trim().replace(/^\d+\.\s*/, "");
          var parts = txt.split(/:\s+/);
          if (parts.length > 1 && parts[0].length < 80) {
            return '<li><span class="case-step-title">' + escapeHtml(parts[0]) + ':</span> ' + escapeHtml(parts.slice(1).join(": ")) + "</li>";
          }
          return "<li>" + escapeHtml(txt) + "</li>";
        }).join("");
        appendCaseHtml('<ol class="case-ol">' + items + "</ol>");
        return;
      }

      if (lines.length > 1) {
        var compareHeadings = lines.filter(function (l) { return /^in [^:]+:$/i.test(l.trim()); });
        if (compareHeadings.length === 2) {
          var cols = [];
          var cur = null;
          lines.forEach(function (l) {
            var t = l.trim();
            if (!t) return;
            if (/^in [^:]+:$/i.test(t)) {
              if (cur) cols.push(cur);
              cur = { title: t.replace(/:$/, ""), items: [] };
            } else if (cur) {
              cur.items.push(t);
            }
          });
          if (cur) cols.push(cur);
          if (cols.length === 2) {
            appendCaseHtml(
              '<div class="case-compare-grid">' +
                cols.map(function (c) {
                  return '<section class="case-compare-col"><h4>' + escapeHtml(c.title) + '</h4><ul class="case-ul">' +
                    c.items.map(function (it) { return "<li>" + escapeHtml(it) + "</li>"; }).join("") +
                    "</ul></section>";
                }).join("") +
              "</div>"
            );
            return;
          }
        }
        if (lines.length === 2 && (
          lines[0].trim().endsWith(":") ||
          lines[0].trim().endsWith(",") ||
          (lines[0].trim().endsWith(".") && lines[1].trim().endsWith(".") && lines[0].length > 40)
        )) {
          const escaped = escapeHtml(p);
          const strong = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          const em = strong.replace(/\*(.+?)\*/g, "<em>$1</em>");
          appendCaseHtml("<p>" + em.replace(/\n/g, "<br />") + "</p>");
          return;
        }

        var listHtml = "";
        var inList = false;

        lines.forEach(function (l) {
          var lt = l.trim();
          if (!lt) return;

          var isSubheader = (/^[A-Z]/.test(lt) && !/[.,;!?]$/.test(lt) && lt.length < 60) || /:$/.test(lt);

          if (isSubheader) {
            if (inList) { listHtml += "</ul>"; inList = false; }
            listHtml += '<h4 class="case-subpoint">' + escapeHtml(lt.replace(/:$/, "")) + "</h4>";
          } else {
            if (!inList) { listHtml += '<ul class="case-ul">'; inList = true; }
            const escaped = escapeHtml(lt.replace(/^[-*•]\s*/, ""));
            const strong = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
            const em = strong.replace(/\*(.+?)\*/g, "<em>$1</em>");
            listHtml += "<li>" + em + "</li>";
          }
        });

        if (inList) { listHtml += "</ul>"; }
        appendCaseHtml(listHtml);
        return;
      }

      const escaped = escapeHtml(p);
      const strong = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      const em = strong.replace(/\*(.+?)\*/g, "<em>$1</em>");
      appendCaseHtml("<p>" + em.replace(/\n/g, "<br />") + "</p>");
    });

    flushSummarySection();
    return html;
  }

  function tenureLabel(tenure) {
    if (tenure == null || tenure === "") return "—";
    if (typeof tenure === "object") {
      const start = tenure.start || "";
      const end = tenure.end || "Present";
      return start + " — " + end;
    }
    var s = String(tenure).trim();
    if (s === "") return "—";
    var n = parseFloat(s.replace(",", "."));
    if (isNaN(n)) return s;
    if (n < 1) {
      var months = Math.round(n * 12);
      if (months <= 0) return "—";
      return months + (months === 1 ? " month" : " months");
    }
    var rounded = Math.round(n * 10) / 10;
    var yearsStr =
      rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
    return yearsStr + (rounded === 1 ? " year" : " years");
  }

  function locationFlagHtml(exp) {
    var file = expNavFlagTwemojiFile(exp);
    if (!file) return "";
    var src = TWEMOJI_FLAG_BASE + file + ".png";
    return (
      '<img class="location-flag-img" src="' +
      escapeHtml(src) +
      '" alt="" width="16" height="16" loading="lazy" decoding="async" /> '
    );
  }

  /** @returns {string|null} company wordmark src (match james-goulart.github.io) */
  function companyWordmarkSrc(company) {
    if (!company) return null;
    const map = {
      Nexoos: "/assets/images/logos/Logo-Nexoos-1024x182.webp",
      QuintoAndar: "/assets/images/logos/quintoandar-logo.svg",
      AIESEC: "/assets/images/logos/aiesec-logo-full.png",
      Unicamp: "/assets/images/logos/UNICAMP_logo.png",
    };
    return map[company] || null;
  }

  /** @returns {string|null} navbar mini mark — same files as production site root */
  function companyIconSrc(company) {
    if (!company) return null;
    const map = {
      Nexoos: "/assets/images/logos/nexoos-OO.webp",
      QuintoAndar: "/assets/images/logos/quintoandar-blue.svg",
      AIESEC: "/assets/images/logos/AIESEC-Human-Blue.jpg",
      Unicamp: "/assets/images/logos/unicamp-icon.png",
    };
    return map[company] || null;
  }

  function companyNavIconHtml(company) {
    const src = companyIconSrc(company);
    if (!src) return "";
    return (
      '<img class="nav-company-icon" src="' +
      escapeHtml(src) +
      '" alt="" width="22" height="22" loading="lazy" />'
    );
  }

  /** @returns {string|null} card logo src for experiences */
  function companyCardLogoSrc(exp) {
    // Use wordmark if available
    const wm = companyWordmarkSrc(exp.company);
    if (wm) return wm;
    // Fallback to icon with larger presentation
    return companyIconSrc(exp.company);
  }

  function caseIdByTitleFallback(title) {
    // naive kebab-case mapping for case ids
    const slug = String(title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return "case--" + slug;
  }

  /** @param {string} orgScope multiline string */
  function renderOrgScope(orgScope) {
    const lines = String(orgScope || "")
      .trim()
      .split(/\n/)
      .filter(function (line) {
        return line.trim().length > 0;
      });
    if (!lines.length) return "";
    return "<ul>" + lines.map(function (line) {
      return "<li>" + escapeHtml(line.trim()) + "</li>";
    }).join("") + "</ul>";
  }

  /** @param {string[]} highlights */
  function renderHighlights(highlights) {
    if (!highlights || !highlights.length) return "";
    return "<ul>" + highlights.map(function (h) {
      return "<li>" + escapeHtml(h) + "</li>";
    }).join("") + "</ul>";
  }

  /** @param {string[]} lines */
  function renderCardBullets(lines) {
    if (!lines || !lines.length) return "";
    return "<ul class=\"card-bullets\">" +
      lines.map(function (line) {
        return "<li>" + escapeHtml(line) + "</li>";
      }).join("") +
      "</ul>";
  }

  function orgAboutText(exp) {
    const about = window.ORG_ABOUT || {};
    if (exp.track === "Degree" && about["Unicamp"]) return about["Unicamp"];
    return about[exp.company] || "";
  }

  function linkHostname(url) {
    try {
      var u = new URL(String(url).trim());
      return u.hostname.replace(/^www\./, "");
    } catch (e) {
      return String(url).slice(0, 48);
    }
  }

  function youtubeVideoId(url) {
    try {
      var u = new URL(String(url).trim());
      var host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        var id = u.pathname.replace(/^\//, "").split("/")[0];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
        if (u.pathname === "/watch" || u.pathname.indexOf("/watch") === 0) {
          var v = u.searchParams.get("v");
          if (v && /^[\w-]{11}$/.test(v)) return v;
        }
        var embed = u.pathname.match(/^\/embed\/([\w-]{11})/);
        if (embed) return embed[1];
        var shorts = u.pathname.match(/^\/shorts\/([\w-]{11})/);
        if (shorts) return shorts[1];
      }
    } catch (e) {}
    return null;
  }

  function truncateUrlDisplay(url, max) {
    var s = String(url).trim();
    if (s.length <= max) return s;
    var half = Math.floor((max - 1) / 2);
    return s.slice(0, half) + "\u2026" + s.slice(-half);
  }

  /** Curated English headlines (fills when fetch fails). Merged with window.RELATED_NEWS_TITLES. */
  const RELATED_NEWS_TITLE_EN = {
    "https://www.infomoney.com.br/minhas-financas/plataforma-de-p2p-nexoos-lanca-conta-digital-para-investidores/":
      "Nexoos P2P platform launches digital account for investors",
    "https://valorinveste.globo.com/mercados/renda-variavel/empresas/noticia/2019/07/10/fintech-nexoos-emite-r-25-milhoes-em-debentures-para-atrair-investidores.ghtml":
      "Fintech Nexoos issues R$25 million in debentures to attract investors",
    "https://www.valorinveste.globo.com/mercados/renda-variavel/empresas/noticia/2019/07/10/fintech-nexoos-emite-r-25-milhoes-em-debentures-para-atrair-investidores.ghtml":
      "Fintech Nexoos issues R$25 million in debentures to attract investors",
    "https://forbes.com.br/forbes-tech/2020/09/quintoandar-anuncia-precificacao-inteligente/":
      "QuintoAndar announces intelligent pricing",
    "https://www.inman.com/2021/05/31/from-ibuying-to-irenting-innovation-in-residential-real-estate/":
      "From iBuying to iRenting: Innovation in residential real estate",
    "https://www.youtube.com/watch?v=JE7mwTJjTb8":
      "Nexoos: peer-to-peer lending and the SME borrower experience",
    "https://www.youtube.com/watch?v=DqPXqC59cCQ":
      "QuintoAndar: conversational AI search for buying and renting homes",
    "https://exame.com/mercado-imobiliario/quintoandar-lanca-contrato-de-aluguel-sem-administracao-entenda/":
      "QuintoAndar launches rental contract without administration fee — overview",
    "https://forbes.com.br/forbes-money/2020/11/quintoandar-amplia-antecipacao-de-recebiveis-para-proprietarios-de-imoveis/":
      "QuintoAndar expands receivables anticipation for property owners",
    "https://exame.com/invest/minhas-financas/quintoandar-aceitara-pagamento-do-aluguel-no-cartao-de-credito/":
      "QuintoAndar to accept rent payment by credit card (Exame)",
    "https://forbes.com.br/forbes-tech/2021/03/quintoandar-compra-imobiliaria-casa-mineira-e-aposta-em-belo-horizonte/":
      "QuintoAndar acquires Casa Mineira brokerage, expands in Belo Horizonte",
    "https://forbes.com.br/negocios/2021/11/com-hub-em-portugal-quintoandar-recrutara-talentos-de-tecnologia-pelo-mundo/":
      "With a hub in Portugal, QuintoAndar will recruit tech talent worldwide",
    "https://exame.com/mercado-imobiliario/quintoandar-ia-generativa-experiencia-mercado-imobiliario/":
      "QuintoAndar and generative AI: reshaping the real estate experience (Exame)",
    "https://www.exame.com/mercado-imobiliario/quintoandar-ia-generativa-experiencia-mercado-imobiliario/":
      "QuintoAndar and generative AI: reshaping the real estate experience (Exame)",
  };

  function relatedNewsTitleEn(url) {
    var w = window.RELATED_NEWS_TITLES || {};
    if (w[url]) return w[url];
    var u = String(url).trim();
    if (RELATED_NEWS_TITLE_EN[u]) return RELATED_NEWS_TITLE_EN[u];
    var nos = u.replace(/\/$/, "");
    if (RELATED_NEWS_TITLE_EN[nos]) return RELATED_NEWS_TITLE_EN[nos];
    try {
      var parsed = new URL(u);
      var norm =
        parsed.protocol +
        "//" +
        parsed.hostname.replace(/^www\./, "") +
        parsed.pathname.replace(/\/$/, "");
      for (var key in RELATED_NEWS_TITLE_EN) {
        if (!Object.prototype.hasOwnProperty.call(RELATED_NEWS_TITLE_EN, key))
          continue;
        try {
          var k = new URL(key);
          var kn =
            k.protocol +
            "//" +
            k.hostname.replace(/^www\./, "") +
            k.pathname.replace(/\/$/, "");
          if (kn === norm) return RELATED_NEWS_TITLE_EN[key];
        } catch (e) {}
      }
    } catch (e) {}
    return "";
  }

  function extractHtmlTitle(html) {
    if (!html) return "";
    var m =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:title["']/i
      ) ||
      html.match(
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:title["']/i
      ) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!m || !m[1]) return "";
    return String(m[1])
      .replace(/\s+/g, " ")
      .trim();
  }

  function isExameNewsHost(host) {
    if (!host) return false;
    var h = String(host).toLowerCase().replace(/^www\./, "");
    return h === "exame.com";
  }

  function newsSiteThumbSrc(host) {
    if (isExameNewsHost(host)) return "/assets/images/exame-logo-0.png";
    if (!host) return "";
    return (
      "https://www.google.com/s2/favicons?sz=128&domain=" +
      encodeURIComponent(host)
    );
  }

  function newsLinkCardHtml(url, relatedCase) {
    var u = String(url).trim();
    var presetEn = relatedNewsTitleEn(u);
    var ytId = youtubeVideoId(u);
    var host = linkHostname(u);
    var thumbInner;
    if (ytId) {
      var thumbSrc = "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg";
      thumbInner =
        '<div class="news-card__thumb news-card__thumb--video">' +
        '<img src="' +
        escapeHtml(thumbSrc) +
        '" alt="" loading="lazy" decoding="async" />' +
        '<span class="news-card__play" aria-hidden="true"><svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle opacity="0.85" cx="28" cy="28" r="28" fill="black"/><path d="M22 17L40 28L22 39V17Z" fill="white"/></svg></span></div>';
    } else {
      var siteThumb = newsSiteThumbSrc(host);
      var imgClass = isExameNewsHost(host)
        ? "news-card__favicon news-card__favicon--exame"
        : "news-card__favicon";
      thumbInner =
        '<div class="news-card__thumb news-card__thumb--site">' +
        (siteThumb
          ? '<img class="' +
            imgClass +
            '" src="' +
            escapeHtml(siteThumb) +
            '" alt="" loading="lazy" />'
          : "") +
        "</div>";
    }

    var relatedHtml = "";
    if (relatedCase && typeof relatedCase === "object") {
      relatedHtml =
        '<div class="news-card__related">' +
        '<span class="news-card__related-label">Related case</span>' +
        '<a href="case.html#' +
        encodeURIComponent(relatedCase.id) +
        '" class="news-card__related-title">' +
        escapeHtml(relatedCase.name) +
        "</a>" +
        "</div>";
    }

    return (
      '<div class="news-card" data-news-url="' +
      escapeHtml(u) +
      '">' +
      '<a href="' +
      escapeHtml(u) +
      '" target="_blank" rel="noopener noreferrer" class="news-card__thumb-link">' +
      thumbInner +
      "</a>" +
      '<div class="news-card__body">' +
      '<span class="news-card__host">' +
      escapeHtml(host || "Link") +
      "</span>" +
      '<a href="' +
      escapeHtml(u) +
      '" target="_blank" rel="noopener noreferrer" class="news-card__title news-card__title--primary">' +
      escapeHtml(presetEn || truncateUrlDisplay(u, 72)) +
      "</a>" +
      '<a href="' +
      escapeHtml(u) +
      '" target="_blank" rel="noopener noreferrer" class="news-card__action">' +
      (ytId ? "Watch on YouTube" : "Open link") +
      " \u2192</a>" +
      relatedHtml +
      "</div></div>"
    );
  }

  /** Prefer English curated title, then fetched title (YouTube oEmbed / HTML). */
  function enhanceNewsCardTitles(root) {
    if (!root) return;
    var cards = root.querySelectorAll(".news-card[data-news-url]");
    Array.prototype.forEach.call(cards, function (card) {
      var url = card.getAttribute("data-news-url");
      var titleEl = card.querySelector(".news-card__title");
      if (!titleEl || !url) return;
      var preset = relatedNewsTitleEn(url);
      if (preset) {
        titleEl.textContent = preset;
        return;
      }
      var ytId = youtubeVideoId(url);
      if (ytId) {
        fetch(
          "https://www.youtube.com/oembed?url=" +
            encodeURIComponent(url) +
            "&format=json"
        )
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            if (data && data.title) titleEl.textContent = data.title;
          })
          .catch(function () {});
      } else {
        function tryCorsProxy() {
          return fetch(
            "https://corsproxy.io/?" + encodeURIComponent(url)
          ).then(function (r) {
            return r.text();
          });
        }
        fetch(
          "https://api.allorigins.win/get?url=" + encodeURIComponent(url)
        )
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            var html = (data && data.contents) || "";
            var t = extractHtmlTitle(html);
            if (t) {
              titleEl.textContent = t;
              return;
            }
            return tryCorsProxy();
          })
          .then(function (secondHtml) {
            if (
              typeof secondHtml === "string" &&
              secondHtml.indexOf("<") !== -1
            ) {
              var t2 = extractHtmlTitle(secondHtml);
              if (t2) titleEl.textContent = t2;
            }
          })
          .catch(function () {
            return tryCorsProxy().then(function (html) {
              var t2 = extractHtmlTitle(html);
              if (t2) titleEl.textContent = t2;
            });
          })
          .catch(function () {});
      }
    });
  }

  /** When an experience has no cases in the sheet, link to this case id (cross-role). */
  const RELATED_CASE_FALLBACK = {};

  /** Cases nav: category → case ids (a case may appear in multiple categories). */
  const CASE_NAV_ORDER = ["AI", "Search", "Real Estate", "Fintech", "UX", "All"];
  const CASE_IDS_BY_GROUP = {
    AI: [
      "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision",
    ],
    Search: [
      "quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality",
      "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision",
    ],
    "Real Estate": [
      "quintoandar-product-manager-rental-liquidity-smartpricing",
      "quintoandar-product-manager-rental-liquidity-irent",
      "quintoandar-product-manager-rental-liquidity-no-adm",
      "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons",
      "quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth",
      "quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality",
      "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision",
    ],
    Fintech: [
      "nexoos-product-owner-inverted-loan-request-ux",
      "nexoos-head-of-product-data-investor-wallet",
      "nexoos-head-of-product-data-funding-channel-sorting-hat",
      "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons",
    ],
    UX: [
      "nexoos-product-owner-inverted-loan-request-ux",
      "quintoandar-product-manager-rental-liquidity-irent",
      "quintoandar-product-manager-rental-liquidity-smartpricing",
      "quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth",
      "quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality",
      "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision",
      "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons",
    ],
  };

  /**
   * Single canonical order: conversation → search quality → forsale → … → Nexoos.
   * Used for /cases, cases nav, and category sublists (by this order within each filter).
   */
  const CASE_DISPLAY_ORDER = [
    "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision",
    "quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality",
    "quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth",
    "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons",
    "quintoandar-product-manager-rental-liquidity-no-adm",
    "quintoandar-product-manager-rental-liquidity-irent",
    "quintoandar-product-manager-rental-liquidity-smartpricing",
    "nexoos-head-of-product-data-funding-channel-sorting-hat",
    "nexoos-head-of-product-data-investor-wallet",
    "nexoos-product-owner-inverted-loan-request-ux",
  ];

  function sortIdsByDisplayOrder(idList) {
    var idx = {};
    CASE_DISPLAY_ORDER.forEach(function (id, i) {
      idx[id] = i;
    });
    return idList.slice().sort(function (a, b) {
      return (idx[a] ?? 9999) - (idx[b] ?? 9999);
    });
  }

  function sortCasesLikeNav(items) {
    if (!items || items.length < 2) return;
    var idx = {};
    CASE_DISPLAY_ORDER.forEach(function (id, i) {
      idx[id] = i;
    });
    items.sort(function (a, b) {
      return (idx[a.caseItem.id] ?? 9999) - (idx[b.caseItem.id] ?? 9999);
    });
  }

  function caseCardHtml(exp, caseItem) {
    var companyLogo = companyCardLogoSrc(exp);
    var logoHtml = companyLogo
      ? '<img class="card__logo card__logo--case" src="' +
        escapeHtml(companyLogo) +
        '" alt="" width="120" height="32" loading="lazy" />'
      : '<span class="card__company">' + escapeHtml(exp.company) + "</span>";
    var relatedNewsHtml =
      caseItem.relatedNews && caseItem.relatedNews.length
        ? '<section class="case-card__news"><h3>Related News</h3><ul class="case-card__news-list">' +
          caseItem.relatedNews.map(function (u) {
            var raw = String(u || "").trim();
            return (
              '<li><a href="' +
              escapeHtml(raw) +
              '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(relatedNewsTitleEn(raw) || raw) +
              "</a></li>"
            );
          }).join("") +
          "</ul></section>"
        : "";
    return (
      '<article class="card card--case">' +
      logoHtml +
      '<a class="card__company card__company--case-link" href="case.html#' +
      encodeURIComponent(caseItem.id) +
      '">' +
      escapeHtml(caseItem.name) +
      "</a>" +
      '<span class="card__role">' +
      roleHtmlWithSubtitle(exp, "card__role-text") +
      "</span>" +
      relatedNewsHtml +
      "</article>"
    );
  }

  function caseIndexFromId(caseId) {
    if (!DATA.experiences) return -1;
    for (let i = 0; i < DATA.experiences.length; i++) {
      const exp = DATA.experiences[i];
      if (!exp.cases) continue;
      for (let j = 0; j < exp.cases.length; j++) {
        if (exp.cases[j].id === caseId) {
          return { expIndex: i, caseIndex: j, experience: exp, caseItem: exp.cases[j] };
        }
      }
    }
    return null;
  }

  function setHomePageMode(main, isHome) {
    if (!main) return;
    if (isHome) {
      main.classList.add("page--chat-home");
    } else {
      main.classList.remove("page--chat-home");
    }
  }

  function renderHome(main) {
    setHomePageMode(main, true);
    main.innerHTML =
      '<div id="chat-root" class="chat-root chat-root--home"></div>';
  }

  /** One-line teaser for experience page case rows; optional per-case `caseTeaser` overrides. */
  function caseTeaserText(caseItem) {
    if (caseItem.caseTeaser && String(caseItem.caseTeaser).trim()) {
      return String(caseItem.caseTeaser).trim();
    }
    var n = String(caseItem.narrative || "").trim();
    if (!n) return "";
    var dot = n.indexOf(". ");
    if (dot > 0 && dot < 280) return n.slice(0, dot + 1).trim();
    if (n.length <= 220) return n;
    return n.slice(0, 217).trim() + "\u2026";
  }

  /** Deduped related-news URLs across cases in display order. */
  function aggregatedPressBlock(caseRows) {
    var seen = {};
    var urls = [];
    caseRows.forEach(function (row) {
      (row.caseItem.relatedNews || []).forEach(function (u) {
        var s = String(u || "").trim();
        if (!s || seen[s]) return;
        seen[s] = true;
        urls.push(s);
      });
    });
    if (!urls.length) return "";
    var items = urls
      .map(function (u) {
        return (
          '<li><a href="' +
          escapeHtml(u) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(relatedNewsTitleEn(u) || u) +
          "</a></li>"
        );
      })
      .join("");
    return (
      '<section class="exp-press" aria-label="Press and media">' +
      "<h2>Press &amp; media</h2>" +
      '<ul class="exp-press__list">' +
      items +
      "</ul></section>"
    );
  }

  function renderExperience(main) {
    setHomePageMode(main, false);
    const id = decodeURIComponent((location.hash || "#").slice(1));
    const exp = DATA.experiences.find(function (e) {
      return e.id === id;
    });
    if (!exp) {
      main.innerHTML =
        '<p class="empty">Experience not found. <a href="overview.html">Back home</a>.</p>';
      return;
    }

    const wm = companyWordmarkSrc(exp.company);
    const ic = companyIconSrc(exp.company);
    const expBrandRow =
      wm || ic
        ? '<p class="page-head__brand">' +
          (wm
            ? '<img class="page-head__co-logo" src="' +
              escapeHtml(wm) +
              '" alt="" />'
            : '<img class="page-head__co-logo page-head__co-logo--icon" src="' +
              escapeHtml(ic) +
              '" alt="" />') +
          "</p>"
        : "";

    const roleLine =
      '<p class="page-head__role">' +
      roleHtmlWithSubtitle(exp, "page-head__role-text") +
      "</p>";

    const legacyBlock =
      exp.legacySummary && String(exp.legacySummary).trim()
        ? '<section class="legacy-summary"><div class="narrative">' +
          formatNarrative(exp.legacySummary) +
          "</div></section>"
        : "";

    const chapterBlock =
      exp.chapterSummary && String(exp.chapterSummary).trim()
        ? '<section class="exp-chapter" aria-label="Role overview">' +
          '<div class="exp-chapter__body narrative">' +
          formatNarrative(exp.chapterSummary) +
          "</div></section>"
        : "";

    var caseRows = [];
    (exp.cases || []).forEach(function (c) {
      caseRows.push({ experience: exp, caseItem: c });
    });
    sortCasesLikeNav(caseRows);

    const caseTeasersHtml = caseRows
      .map(function (row) {
        var c = row.caseItem;
        var teaser = caseTeaserText(c);
        var teaserEl = teaser
          ? '<p class="exp-case-teaser__lede">' + escapeHtml(teaser) + "</p>"
          : '<p class="muted exp-case-teaser__lede">Full write-up on the case page.</p>';
        return (
          '<article class="exp-case-teaser" id="' +
          escapeHtml(c.id) +
          '">' +
          '<h3 class="exp-case-teaser__title">' +
          '<a href="case.html#' +
          encodeURIComponent(c.id) +
          '">' +
          escapeHtml(c.name) +
          "</a></h3>" +
          teaserEl +
          '<a class="exp-case-teaser__cta" href="case.html#' +
          encodeURIComponent(c.id) +
          '">Read case study</a>' +
          "</article>"
        );
      })
      .join("");

    const casesSection =
      caseRows.length
        ? '<section class="exp-case-studies" aria-label="Case studies">' +
          "<h2>Case studies</h2>" +
          '<div class="exp-case-studies__list">' +
          caseTeasersHtml +
          "</div></section>"
        : "";

    const pressBlock =
      caseRows.length > 0 ? aggregatedPressBlock(caseRows) : "";

    const highlightsPane =
      exp.highlights && exp.highlights.length
        ? '<div class="exp-aside__section"><h3>Highlights</h3>' + renderHighlights(exp.highlights) + "</div>"
        : "";
    const scopePane = exp.orgScope
      ? '<div class="exp-aside__section"><h3>Org Scope</h3>' + renderOrgScope(exp.orgScope) + "</div>"
      : "";
    const aboutText = orgAboutText(exp);
    const aboutPane = aboutText
      ? '<div class="exp-aside__section"><h3>About ' + escapeHtml(exp.company) + '</h3><p>' + escapeHtml(aboutText) + "</p></div>"
      : "";

    const panelsInner = highlightsPane + scopePane + aboutPane;
    const panelsBlock = panelsInner ? '<div class="exp-panels">' + panelsInner + "</div>" : "";

    const academicBlock =
      exp.id === "unicamp-bsc-electrical-engineering"
        ? '<section class="exp-section"><h2>Term paper</h2><p><a href="https://drive.google.com/file/d/12Nh6eFgCoI2W56X9sVIkH80rgE5B-ufb/view?usp=sharing" target="_blank" rel="noopener noreferrer">Read the Unicamp term paper</a></p></section>'
        : "";

    var expPageParts = [];
    if (chapterBlock) expPageParts.push(chapterBlock);
    if (panelsBlock) expPageParts.push(panelsBlock);
    if (caseRows.length) {
      expPageParts.push(casesSection);
      if (pressBlock) expPageParts.push(pressBlock);
    } else if (legacyBlock) {
      expPageParts.push(legacyBlock);
    } else {
      expPageParts.push(
        '<p class="muted">No separate case rows for this role in the spreadsheet yet.</p>'
      );
    }
    if (academicBlock) expPageParts.push(academicBlock);

    main.innerHTML =
      '<header class="page-head">' +
      expBrandRow +
      (wm ? "" : "<h1>" + escapeHtml(exp.company) + "</h1>") +
      roleLine +
      locationLineHtml(exp) +
      '<ul class="facts">' +
      (exp.tenure
        ? "<li><strong>Tenure</strong> " + tenureLabel(exp.tenure) + "</li>"
        : "") +
      (exp.track ? "<li><strong>Track</strong> " + escapeHtml(exp.track) + "</li>" : "") +
      "</ul></header>" +
      '<div class="exp-page">' +
      expPageParts.join("") +
      "</div>";
  }

  function locationLineHtml(exp) {
    if (!exp.location) return "";
    return (
      '<p class="page-head__location">' +
      locationFlagHtml(exp) +
      escapeHtml(exp.location) +
      "</p>"
    );
  }

  function renderCase(main) {
    setHomePageMode(main, false);
    const id = decodeURIComponent((location.hash || "#").slice(1));
    const found = caseIndexFromId(id);
    if (!found) {
      main.innerHTML =
        '<p class="empty">Case not found. <a href="cases.html">All cases</a>.</p>';
      return;
    }
    const exp = found.experience;
    const c = found.caseItem;

    const wm = companyWordmarkSrc(exp.company);
    const ic = companyIconSrc(exp.company);
    const brandRow =
      wm || ic
        ? '<p class="page-head__brand">' +
          (wm
            ? '<img class="page-head__co-logo" src="' + escapeHtml(wm) + '" alt="" />'
            : '<img class="page-head__co-logo page-head__co-logo--icon" src="' +
              escapeHtml(ic) +
              '" alt="" />') +
          "</p>"
        : "";

    const dedupNews = (c.relatedNews || []).filter(function (u, idx, arr) {
      var s = String(u || "").trim();
      if (!s) return false;
      return arr.findIndex(function (x) { return String(x || "").trim() === s; }) === idx;
    });
    const hasNews = dedupNews.length > 0;
    const relatedMobile = hasNews
      ? '<section id="case-related-news" class="case-related-news-mobile" aria-label="Related news">' +
        "<h3>RELATED NEWS</h3>" +
        '<ul class="case-related-news-list">' +
        dedupNews
          .map(function (u) {
            return (
              '<li><a href="' +
              escapeHtml(u) +
              '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(relatedNewsTitleEn(u) || u) +
              "</a></li>"
            );
          })
          .join("") +
        "</ul>" +
        "</section>"
      : "";
    const relatedAside = hasNews
      ? '<aside id="case-related-news-desktop" class="case-aside case-aside--news" aria-label="Related news">' +
        "<h2>Related news</h2>" +
        '<div class="case-related-news--cards-only">' +
        dedupNews
          .map(function (u) {
            return newsLinkCardHtml(u, null);
          })
          .join("") +
        "</div>" +
        "</aside>"
      : "";

    const metaBlock =
      '<p class="page-head__role page-head__role--case">' +
      '<span class="page-head__role-text">' +
      escapeHtml(exp.role) +
      "</span></p>" +
      (c.tags && c.tags.length
        ? '<p class="page-head__tags">' +
          c.tags.map(function (t) {
            return '<span class="tag">' + escapeHtml(t) + "</span>";
          }).join("") +
          "</p>"
        : "");

    const rawNarrative =
      c.longNarrative && String(c.longNarrative).trim()
        ? c.longNarrative
        : c.narrative;
    const narrativeHtml = rawNarrative
      ? '<div class="narrative case-narrative">' + formatNarrative(rawNarrative) + "</div>"
      : '<p class="muted">No narrative yet.</p>';

    main.innerHTML =
      '<header class="page-head case-header">' +
      brandRow +
      "<h1>" +
      escapeHtml(fixUtf8Mojibake(c.name)) +
      "</h1>" +
      metaBlock +
      "</header>" +
      '<div class="case-layout' +
      (hasNews ? " case-layout--with-aside" : "") +
      '">' +
      '<div class="case-layout__main">' +
      relatedMobile +
      narrativeHtml +
      "</div>" +
      relatedAside +
      "</div>";

    requestAnimationFrame(function () {
      enhanceNewsCardTitles(main);
    });
  }

  function renderCasesIndex(main) {
    setHomePageMode(main, false);
    // Build flat list of cases with parent experience context
    const all = [];
    DATA.experiences.forEach(function (exp, expIdx) {
      if (!exp.cases) return;
      exp.cases.forEach(function (c, cIdx) {
        all.push({ expIndex: expIdx, caseIndex: cIdx, experience: exp, caseItem: c });
      });
    });

    // Read URL category filter
    let selected = "All";
    try {
      const url = new URL(window.location.href);
      selected = url.searchParams.get("cat") || "All";
    } catch (e) {}

    let filtered =
      selected === "All"
        ? all.slice()
        : all.filter(function (x) {
          return (CASE_IDS_BY_GROUP[selected] || []).indexOf(x.caseItem.id) !== -1;
        });
    sortCasesLikeNav(filtered);
    const cards = filtered
      .map(function (x) {
        return caseCardHtml(x.experience, x.caseItem);
      })
      .join("");

    const caseFilterOrder = ["All"].concat(CASE_NAV_ORDER.filter(function (x) { return x !== "All"; }));
    const filterButtons = caseFilterOrder.map(function (cat) {
      var label = cat === "All" ? "All" : cat;
      return '<button type="button" class="case-filter-btn' + (cat === selected ? " is-active" : "") + '" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(label) + "</button>";
    }).join("");

    main.innerHTML =
      '<header class="page-head">' +
      "<h1>Cases</h1>" +
      "<p>Every case from the portfolio, with narratives and related news links.</p>" +
      "</header>" +
      '<section class="cases-filters cases-filters--tight" aria-label="Filter by"><span class="cases-filters__label">Filter by:</span>' + filterButtons + "</section>" +
      '<section class="grid-actions cases-grid" aria-label="Case list">' +
      (cards || '<p class="muted">No cases in this filter yet.</p>') +
      "</section>";
    requestAnimationFrame(function () {
      enhanceNewsCardTitles(main);
    });
    main.querySelectorAll(".case-filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-cat") || "All";
        try {
          var url = new URL(window.location.href);
          url.searchParams.set("cat", cat);
          window.history.replaceState({}, "", url.toString());
        } catch (e) {}
        renderCasesIndex(main);
      });
    });
  }

  function renderExperiencesIndex(main) {
    setHomePageMode(main, false);
    function buildCardsByFilter(filterFn, reverseOrder) {
      var reverse = reverseOrder !== false;
      return DATA.experiences
        .filter(filterFn)
        .slice()
        [reverse ? "reverse" : "slice"]()
        .map(function (e) {
          var cardLogo = companyCardLogoSrc(e);
          var logoHtml = cardLogo
            ? '<img class="card__logo" src="' +
              escapeHtml(cardLogo) +
              '" alt="" width="120" height="32" loading="lazy" />'
            : "";
          var scopeLines =
            e.orgScope && String(e.orgScope).trim()
              ? String(e.orgScope).split("\n")
              : [];
          var highlightsLines =
            e.highlights && e.highlights.length
              ? e.highlights
              : [];
          var cardDetailsHtml =
            scopeLines.length || highlightsLines.length
              ? '<div class="card__details">' +
                '<div class="card__detail-block"><strong>Highlights</strong>' +
                renderCardBullets(highlightsLines) +
                "</div>" +
                '<div class="card__detail-block"><strong>Org Scope</strong>' +
                renderCardBullets(scopeLines) +
                "</div>" +
                "</div>"
              : "";
          var casesHtml =
            e.cases && e.cases.length
              ? '<div class="card__cases"><strong>Cases</strong><ul class="card-bullets card-bullets--cases">' +
                e.cases.map(function (c) {
                  return '<li><span class="card-inline-link" role="link" tabindex="0" data-case-href="case.html#' + encodeURIComponent(c.id) + '">' + escapeHtml(c.name) + "</span></li>";
                }).join("") +
                "</ul></div>"
              : "";
          return (
            '<a class="card card--exp' +
            (cardLogo ? " card--exp-with-logo" : "") +
            '" href="experience.html#' +
            encodeURIComponent(e.id) +
            '">' +
            logoHtml +
            (cardLogo
              ? ""
              : '<span class="card__company">' + escapeHtml(e.company) + "</span>") +
            '<span class="card__role">' +
            roleHtmlWithSubtitle(e, "card__role-text") +
            "</span>" +
            '<span class="card__meta">' +
            tenureLabel(e.tenure) +
            (e.track ? " · " + escapeHtml(e.track) : "") +
            "</span>" +
            (e.location
              ? '<span class="card__location">' +
                locationFlagHtml(e) +
                escapeHtml(e.location) +
                "</span>"
              : "") +
            cardDetailsHtml +
            casesHtml +
            "</a>"
          );
        })
        .join("");
    }
    var selected = "all";
    try {
      var q = new URLSearchParams(window.location.search);
      selected = (q.get("exp") || "all").toLowerCase();
    } catch (e) {}
    if (["all", "professional", "volunteering", "academic"].indexOf(selected) === -1) {
      selected = "all";
    }

    var filterMap = {
      all: function () { return true; },
      professional: function (e) { return e.track !== "Volunteering" && e.track !== "Degree"; },
      volunteering: function (e) { return e.track === "Volunteering"; },
      academic: function (e) { return e.track === "Degree"; }
    };
    var cards = "";
    if (selected === "all") {
      var professionalCards = buildCardsByFilter(filterMap.professional, true);
      var volunteeringCards = buildCardsByFilter(filterMap.volunteering, false);
      var academicCards = buildCardsByFilter(filterMap.academic, false);
      cards = professionalCards + volunteeringCards + academicCards;
    } else {
      var reverseOrder = selected !== "volunteering";
      cards = buildCardsByFilter(filterMap[selected], reverseOrder);
    }
    var filterButtons = [
      { id: "all", label: "All" },
      { id: "professional", label: "Professional" },
      { id: "volunteering", label: "Volunteering" },
      { id: "academic", label: "Academic" }
    ].map(function (f) {
      return '<button type="button" class="case-filter-btn' + (f.id === selected ? " is-active" : "") + '" data-exp-filter="' + f.id + '">' + f.label + "</button>";
    }).join("");

    main.innerHTML =
      '<header class="page-head">' +
      "<h1>Experiences</h1>" +
      "<p>Professional, volunteering, and academic chapters from James's background.</p>" +
      "</header>" +
      '<section class="cases-filters cases-filters--tight" aria-label="Filter experiences"><span class="cases-filters__label">Filter:</span>' + filterButtons + "</section>" +
      '<section class="grid-actions" aria-label="Experience list">' +
      (cards || '<p class="muted">No experiences match this filter.</p>') +
      "</section>";

    // Wire up case inline link clicks
    main.querySelectorAll('.card-inline-link').forEach(function(el) {
      el.addEventListener('click', function(e) {
        var href = el.getAttribute('data-case-href');
        if (href) {
          window.location.href = href;
        }
      });
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var href = el.getAttribute('data-case-href');
          if (href) {
            window.location.href = href;
          }
        }
      });
    });

    main.querySelectorAll("[data-exp-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-exp-filter") || "all";
        try {
          var url = new URL(window.location.href);
          url.searchParams.set("exp", f);
          window.history.replaceState({}, "", url.toString());
        } catch (e) {}
        renderExperiencesIndex(main);
      });
    });
  }

  function renderNewsIndex(main) {
    setHomePageMode(main, false);
    const items = getAllCases();
    var newsItems = [];

    items.forEach(function (x) {
      if (x.caseItem.relatedNews && x.caseItem.relatedNews.length) {
        x.caseItem.relatedNews.forEach(function (url) {
          newsItems.push({
            url: url,
            caseItem: x.caseItem,
            experience: x.experience,
          });
        });
      }
    });

    var seenUrls = {};
    var uniqueNews = [];
    newsItems.forEach(function (item) {
      if (!seenUrls[item.url]) {
        seenUrls[item.url] = true;
        uniqueNews.push(item);
      }
    });

    var cards = uniqueNews
      .map(function (item) {
        return newsLinkCardHtml(item.url, item.caseItem);
      })
      .join("");

    main.innerHTML =
      '<header class="page-head">' +
      "<h1>News &amp; Mentions</h1>" +
      "<p>Articles, videos, and media mentions related to cases in the portfolio.</p>" +
      "</header>" +
      '<section class="news-cards news-cards--grid news-cards--tight" aria-label="News list">' +
      cards +
      "</section>";

    requestAnimationFrame(function () {
      enhanceNewsCardTitles(main);
    });
  }

  return {
    injectNav: injectNav,
    renderHome: renderHome,
    renderExperiencesIndex: renderExperiencesIndex,
    renderExperience: renderExperience,
    renderCasesIndex: renderCasesIndex,
    renderCase: renderCase,
    renderNewsIndex: renderNewsIndex,
    DATA: DATA,
    relatedNewsTitleEn: relatedNewsTitleEn,
  };
})();

window.Portfolio = Portfolio;