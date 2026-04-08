(function () {
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) {
    console.error("Missing PORTFOLIO_DATA — load data.js first.");
    return;
  }

  /** Optional — set your public profile URLs (shown as icon buttons in the header). */
  const SOCIAL_LINKS = [
    {
      href: "https://www.linkedin.com/in/jamesgoulart/",
      label: "LinkedIn",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    },
  ];

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
      "nexoos-head-of-product-data-investor-wallet",
      "quintoandar-product-manager-rental-liquidity-smartpricing",
      "quintoandar-product-manager-rental-liquidity-no-adm",
    ],
  };

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findCaseById(caseId) {
    for (const exp of DATA.experiences) {
      const c = exp.cases.find(function (x) {
        return x.id === caseId;
      });
      if (c) return { experience: exp, caseItem: c };
    }
    return null;
  }

  /** Most recent experience first; cases listed in sheet order within each role. */
  function getAllCases() {
    const list = [];
    for (let i = DATA.experiences.length - 1; i >= 0; i--) {
      const exp = DATA.experiences[i];
      for (let j = 0; j < exp.cases.length; j++) {
        list.push({ experience: exp, caseItem: exp.cases[j] });
      }
    }
    return list;
  }

  function tenureLabel(t) {
    if (t == null || t === "") return "";
    const n = parseFloat(t, 10);
    if (isNaN(n)) return escapeHtml(t);
    const y = n === 1 ? "year" : "years";
    return escapeHtml(String(n)) + " " + y;
  }

  function brandName() {
    return escapeHtml(String(DATA.name || "").toLowerCase()) + ".";
  }

  function firstNameLower() {
    const parts = String(DATA.name || "").trim().split(/\s+/);
    return escapeHtml((parts[0] || DATA.name || "").toLowerCase());
  }

  function nameInitials() {
    const parts = String(DATA.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length >= 2) {
      return escapeHtml(
        (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      );
    }
    return escapeHtml((parts[0] || "?").slice(0, 2).toUpperCase());
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

  const CV_HREF =
    "https://drive.google.com/file/d/16QbQk8KQL5xrE3bTa-pk7iuZinO51s0F/view?usp=sharing";

  /** Experience nav — subtitle under company name. */
  const COMPANY_NAV_TAGLINE = {
    QuintoAndar: "Latam's Biggest Proptech ($5B)",
    Nexoos: "Brazilian P2P Lending",
    AIESEC: "UN-backed Youth NGO",
    Unicamp: "State University of Campinas",
  };

  /**
   * Twemoji PNG filenames (72×72) — Windows often shows Unicode flag sequences as
   * plain letters (PT, BR) instead of glyphs; images render the same everywhere.
   */
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

  function locationFlagHtml(exp) {
    var code = exp.locationFlag || exp.navFlag;
    if (!code || !FLAG_TWEMOJI_FILE[code]) return "";
    var src = TWEMOJI_FLAG_BASE + FLAG_TWEMOJI_FILE[code] + ".png";
    return (
      '<img class="location-flag-img" src="' +
      escapeHtml(src) +
      '" alt="" width="16" height="16" loading="lazy" decoding="async" />'
    );
  }

  function locationLineHtml(exp) {
    if (!exp.location) return "";
    return (
      '<span class="page-head__location">' +
      locationFlagHtml(exp) +
      escapeHtml(exp.location) +
      "</span>"
    );
  }

  function renderOrgScope(orgScope) {
    if (!orgScope || !String(orgScope).trim()) return "";
    var lines = String(orgScope).split("\n").filter(function (l) { return l.trim(); });
    var items = lines.map(function (line) {
      var trimmed = line.trim();
      var isDirect = /\(R\)/i.test(trimmed);
      var cls = isDirect ? "org-line org-line--direct" : "org-line";
      return (
        '<li class="' + cls + '">' +
        escapeHtml(trimmed) +
        "</li>"
      );
    });
    return '<ul class="org-scope-list">' + items.join("") + "</ul>";
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

  /** Role: bold segment before first " - " (e.g. "Product Manager" in "Product Manager - Rental …"). */
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
              '<li><a href="experience.html#' +
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

  /** Icons for case category dropdown (AI, Search, Real Estate, Fintech, UX, All). */
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
          '<li><a href="case.html#' +
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
        ids = allCases.map(function (x) {
          return x.caseItem.id;
        });
      } else {
        ids = CASE_IDS_BY_GROUP[label] || [];
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

  /** Navbar, case nav, latest work strip — small mark only. */
  function companyIconSrc(company) {
    if (company === "Nexoos") return "./nexoos-OO.webp";
    if (company === "QuintoAndar") return "./quintoandar-blue.svg";
    if (company === "AIESEC") return "./AIESEC-Human-Blue.jpg";
    if (company === "Unicamp") return "./unicamp-icon.png";
    return "";
  }

  /** “Where I’ve worked” cards + case page subtitle — full wordmark where available. */
  function companyWordmarkSrc(company) {
    if (company === "Nexoos") return "./Logo-Nexoos-1024x182.webp";
    if (company === "QuintoAndar") return "./quintoandar-logo.svg";
    if (company === "AIESEC") return "./aiesec-logo-full.png";
    if (company === "Unicamp") return "./UNICAMP_logo.png";
    return "";
  }

  /** Experience cards: full wordmark for all companies. */
  function companyCardLogoSrc(e) {
    return companyWordmarkSrc(e.company);
  }

  /** Case page subtitle: logo or icon + role (Nexoos includes “3rd employee”). */
  function casePageRoleLineHtml(exp) {
    var logoSrc = companyWordmarkSrc(exp.company);
    var brand = "";
    if (logoSrc) {
      brand =
        '<img class="page-head__co-logo" src="' +
        escapeHtml(logoSrc) +
        '" alt="' +
        escapeHtml(exp.company) +
        '" />';
    } else {
      var iconSrc = companyIconSrc(exp.company);
      brand = iconSrc
        ? '<img class="page-head__co-logo page-head__co-logo--icon" src="' +
          escapeHtml(iconSrc) +
          '" alt="' +
          escapeHtml(exp.company) +
          '" />'
        : '<span class="page-head__co-fallback">' +
          escapeHtml(exp.company) +
          "</span>";
    }
    var roleText =
      exp.id === "nexoos-product-owner"
        ? logoSrc
          ? escapeHtml(exp.role) +
            '<br /><span class="page-head__employee-note">3rd employee</span>'
          : "<strong>Nexoos</strong><br />" +
            escapeHtml(exp.role) +
            '<br /><span class="page-head__employee-note">3rd employee</span>'
        : escapeHtml(exp.role);
    return (
      brand + '<span class="page-head__role-text">' + roleText + "</span>"
    );
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

  function workCardIconHtml(company) {
    const src = companyIconSrc(company);
    if (!src) return "";
    return (
      '<img class="work-card__co-icon" src="' +
      escapeHtml(src) +
      '" alt="" width="22" height="22" loading="lazy" />'
    );
  }

  function stripDuplicateHeadline(narrative, headline) {
    if (!narrative || !String(narrative).trim()) return narrative;
    const h = String(headline).trim();
    const lines = String(narrative).replace(/\r\n/g, "\n").split("\n");
    const first = lines.length ? lines[0].trim() : "";
    if (first === h) {
      var i = 1;
      while (i < lines.length && lines[i].trim() === "") i++;
      return lines.slice(i).join("\n");
    }
    return narrative;
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

  /** Curated English headlines for related-news cards (fills when fetch fails). */
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
    if (isExameNewsHost(host)) return "./exame-logo-0.png";
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
        '<a href="case.html#' + encodeURIComponent(relatedCase.id) + '" class="news-card__related-title">' + escapeHtml(relatedCase.name) + '</a>' +
        '</div>';
    }

    return (
      '<div class="news-card" data-news-url="' +
      escapeHtml(u) +
      '">' +
      '<a href="' + escapeHtml(u) + '" target="_blank" rel="noopener noreferrer" class="news-card__thumb-link">' +
      thumbInner +
      '</a>' +
      '<div class="news-card__body">' +
      '<span class="news-card__host">' +
      escapeHtml(host || "Link") +
      "</span>" +
      '<a href="' + escapeHtml(u) + '" target="_blank" rel="noopener noreferrer" class="news-card__title news-card__title--primary">' +
      escapeHtml(presetEn || truncateUrlDisplay(u, 72)) +
      "</a>" +
      '<a href="' + escapeHtml(u) + '" target="_blank" rel="noopener noreferrer" class="news-card__action">' +
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

  function injectNav(container, active) {
    if (!container) return;
    active = active || "home";
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
      '<a class="nav-brand" href="index.html">' +
      brandName() +
      "</a>" +
      '<div class="nav-center-wrap">' +
      '<ul id="nav-menu" class="nav-menu">' +
      '<li><a href="index.html"' +
      (active === "home" ? ' class="is-active"' : "") +
      ">copilot</a></li>" +
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

  function setHomePageMode(main, isHome) {
    if (!main || !main.classList) return;
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

  function renderExperience(main) {
    setHomePageMode(main, false);
    const id = decodeURIComponent((location.hash || "#").slice(1));
    const exp = DATA.experiences.find(function (e) {
      return e.id === id;
    });
    if (!exp) {
      main.innerHTML =
        '<p class="empty">Experience not found. <a href="index.html">Back home</a>.</p>';
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
      exp.id === "nexoos-product-owner"
        ? '<p class="page-head__role"><span class="page-head__role-text">' +
          escapeHtml(exp.role) +
          '<br /><span class="page-head__employee-note">3rd employee</span></span></p>'
        : '<p class="page-head__role">' + escapeHtml(exp.role) + "</p>";

    const legacyBlock =
      exp.legacySummary && String(exp.legacySummary).trim()
        ? '<section class="legacy-summary"><div class="narrative">' +
          formatNarrative(exp.legacySummary) +
          "</div></section>"
        : "";

    const casesHtml = exp.cases
      .map(function (c) {
        const narr = stripDuplicateHeadline(c.narrative, c.name);
        const body =
          narr && narr.trim()
            ? '<div class="narrative">' + formatNarrative(narr) + "</div>"
            : '<p class="muted">Full narrative in the dedicated case page.</p>';
        const relatedNewsCards =
          c.relatedNews && c.relatedNews.length
            ? c.relatedNews.map(function (u) {
                return newsLinkCardHtml(u);
              }).join("")
            : "";
        const relatedNewsBlock = relatedNewsCards
          ? '<section class="case-card__news"><h3>Related news</h3><div class="news-cards news-cards--grid news-cards--inverted">' +
            relatedNewsCards +
            "</div></section>"
          : "";
        return (
          '<article class="case-block" id="' +
          escapeHtml(c.id) +
          '">' +
          "<h2>" +
          escapeHtml(c.name) +
          "</h2>" +
          body +
          relatedNewsBlock +
          '<p class="case-more"><a class="btn btn--small" href="case.html#' +
          encodeURIComponent(c.id) +
          '">Open case page (news &amp; links)</a></p>' +
          "</article>"
        );
      })
      .join("");

    const orgBlock = exp.orgScope
      ? '<section class="meta-block"><h2>Org Scope</h2>' +
        renderOrgScope(exp.orgScope) +
        "</section>"
      : "";
    const academicBlock =
      exp.id === "unicamp-bsc-electrical-engineering"
        ? '<section class="meta-block"><h2>Term paper</h2><p><a href="https://drive.google.com/file/d/12Nh6eFgCoI2W56X9sVIkH80rgE5B-ufb/view?usp=sharing" target="_blank" rel="noopener noreferrer">Read the Unicamp term paper</a></p></section>'
        : "";

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
      orgBlock +
      academicBlock +
      (casesHtml
        ? '<section class="cases-section"><h2 class="sr-only">Cases</h2>' +
          casesHtml +
          "</section>"
        : legacyBlock
          ? legacyBlock
          : '<p class="muted">No separate case rows for this role in the spreadsheet yet.</p>');
  }

  function formatNarrative(text) {
    var escaped = escapeHtml(text);
    var blocks = escaped.split(/\n\n+/);
    return blocks.map(function (block) {
      block = block.trim();
      if (!block) return "";
      var lines = block.split("\n");
      var isNumberedList = lines.length > 1 && lines.every(function (l) {
        return /^\d+\.\s/.test(l.trim()) || !l.trim();
      });
      if (isNumberedList) {
        var items = lines.filter(function (l) { return l.trim(); }).map(function (l) {
          return "<li>" + l.trim().replace(/^\d+\.\s*/, "") + "</li>";
        }).join("");
        return '<ol class="case-ol">' + items + "</ol>";
      }
      return "<p>" + block.replace(/\n/g, "<br />") + "</p>";
    }).join("");
  }

  /** Allow only same-site relative links in case narratives. */
  function isAllowedCaseInternalLink(href) {
    var h = String(href || "").trim();
    if (!h || h.length > 400) return false;
    if (/[\s<>"'`]/.test(h)) return false;
    if (/^https?:\/\//i.test(h)) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return false;
    if (h.indexOf("..") !== -1) return false;
    if (h.indexOf("//") !== -1) return false;
    return (
      /^case\.html#[a-zA-Z0-9_-]+$/.test(h) ||
      /^experience\.html#[a-zA-Z0-9_-]+$/.test(h)
    );
  }

  /**
   * Like formatNarrative but supports [label](case.html#id) internal links.
   * Invalid or off-site links are left as plain escaped text.
   */
  function formatCaseNarrative(text) {
    var raw = String(text);
    var store = [];
    var idx = 0;
    var processed = raw.replace(/\[([^\]]*)\]\(([^)]*)\)/g, function (full, label, href) {
      var h = String(href || "").trim();
      if (!isAllowedCaseInternalLink(h)) {
        return full;
      }
      var ph = "{{CASELINK_" + idx + "}}";
      store.push({ label: label, href: h });
      idx++;
      return ph;
    });
    var html = formatNarrative(processed);
    for (var j = 0; j < store.length; j++) {
      var a =
        '<a class="case-inline-link" href="' +
        escapeHtml(store[j].href) +
        '">' +
        escapeHtml(store[j].label) +
        "</a>";
      html = html.split("{{CASELINK_" + j + "}}").join(a);
    }
    return html;
  }

  function renderCaseSection(label, sectionClass, content) {
    if (!content || !content.trim()) return "";
    return '<section class="case-section case-section--' + sectionClass + '">' +
      '<h2 class="case-section__heading">' + escapeHtml(label) + '</h2>' +
      '<div class="case-section__body">' + formatCaseNarrative(content) + '</div>' +
      '</section>';
  }

  function renderMetricPills(metrics) {
    if (!metrics || !metrics.length) return "";
    var pills = metrics.map(function (m) {
      var row = '<div class="metric-pill__values">';
      if (m.before) {
        row +=
          '<span class="metric-pill__before">' +
          escapeHtml(m.before) +
          '</span><span class="metric-pill__arrow" aria-hidden="true">\u2192</span>';
      }
      row +=
        '<span class="metric-pill__after">' + escapeHtml(m.after) + "</span></div>";
      return (
        '<div class="metric-pill">' +
        '<span class="metric-pill__label">' +
        escapeHtml(m.label) +
        "</span>" +
        row +
        "</div>"
      );
    }).join("");
    return '<div class="case-metrics">' + pills + "</div>";
  }

  function renderCase(main) {
    setHomePageMode(main, false);
    const id = decodeURIComponent((location.hash || "#").slice(1));
    const found = findCaseById(id);
    if (!found) {
      main.innerHTML =
        '<p class="empty">Case not found. <a href="cases.html">All cases</a> or <a href="index.html">home</a>.</p>';
      return;
    }

    const c = found.caseItem;
    const exp = found.experience;
    const rich = window.CASES_CONTENT && window.CASES_CONTENT[c.id];

    const rawUrls = (c.relatedNews || []).map(function (u) {
      return String(u).trim();
    }).filter(Boolean);

    const newsAside =
      rawUrls.length > 0
        ? '<aside class="case-aside" aria-label="Related news and links">' +
          "<h2>Related news &amp; links</h2>" +
          '<div class="news-cards">' +
          rawUrls.map(function(u) { return newsLinkCardHtml(u); }).join("") +
          "</div></aside>"
        : "";

    const roleSubtitle = casePageRoleLineHtml(exp);
    var bodyHtml = "";

    if (rich) {
      var tldrBlock = rich.tldr
        ? '<div class="case-tldr">' + formatCaseNarrative(rich.tldr) + "</div>"
        : "";

      bodyHtml =
        tldrBlock +
        renderMetricPills(rich.metrics) +
        renderCaseSection("Context", "context", rich.context) +
        renderCaseSection("Problem", "problem", rich.problem) +
        renderCaseSection("Insight", "insight", rich.insight) +
        renderCaseSection("Solution", "solution", rich.solution) +
        renderCaseSection("Results", "results", rich.results) +
        renderCaseSection("Reflection", "reflection", rich.reflection);
    } else {
      const narr = stripDuplicateHeadline(c.narrative, c.name);
      bodyHtml =
        narr && narr.trim()
          ? '<div class="narrative">' + formatNarrative(narr) + "</div>"
          : '<p class="muted">Detailed narrative coming soon.</p>';
    }

    main.innerHTML =
      '<header class="page-head">' +
      "<h1>" +
      escapeHtml(c.name) +
      "</h1>" +
      '<p class="page-head__role">' +
      roleSubtitle +
      "</p></header>" +
      '<div class="case-layout">' +
      '<div class="case-layout__main">' +
      bodyHtml +
      "</div>" +
      newsAside +
      "</div>";

    requestAnimationFrame(function () {
      enhanceNewsCardTitles(main);
    });
  }

  function renderCasesIndex(main) {
    setHomePageMode(main, false);
    const items = getAllCases();
    const cards = items
      .map(function (x) {
        return (
          '<a class="card card--case" href="case.html#' +
          encodeURIComponent(x.caseItem.id) +
          '">' +
          '<span class="card__company">' +
          escapeHtml(x.caseItem.name) +
          "</span>" +
          '<span class="card__role card__role--with-icon">' +
          workCardIconHtml(x.experience.company) +
          '<span class="card__role-inline">' +
          escapeHtml(x.experience.company) +
          " — " +
          escapeHtml(x.experience.role) +
          "</span></span>" +
          (x.caseItem.relatedNews && x.caseItem.relatedNews.length
            ? '<span class="card__meta">' +
              x.caseItem.relatedNews.length +
              " link" +
              (x.caseItem.relatedNews.length === 1 ? "" : "s") +
              "</span>"
            : "") +
          "</a>"
        );
      })
      .join("");

    main.innerHTML =
      '<header class="page-head">' +
      "<h1>Cases</h1>" +
      "<p>Every case from the portfolio, with narratives and related news links.</p>" +
      "</header>" +
      '<section class="grid-actions" aria-label="Case list">' +
      cards +
      "</section>";
  }

  function renderExperiencesIndex(main) {
    setHomePageMode(main, false);
    function buildCardsByFilter(filterFn) {
      return DATA.experiences
        .filter(filterFn)
        .slice()
        .reverse()
        .map(function (e) {
          var cardLogo = companyCardLogoSrc(e);
          var logoHtml = cardLogo
            ? '<img class="card__logo" src="' +
              escapeHtml(cardLogo) +
              '" alt="" width="120" height="32" loading="lazy" />'
            : "";
          var scopeHtml =
            e.orgScope && String(e.orgScope).trim()
              ? '<span class="card__scope">Org Scope: ' + escapeHtml(e.orgScope) + "</span>"
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
            escapeHtml(e.role) +
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
            scopeHtml +
            "</a>"
          );
        })
        .join("");
    }

    var professionalCards = buildCardsByFilter(function (e) {
      return e.track !== "Volunteering" && e.track !== "Degree";
    });
    var volunteeringCards = buildCardsByFilter(function (e) {
      return e.track === "Volunteering";
    });
    var academicCards = buildCardsByFilter(function (e) {
      return e.track === "Degree";
    });

    main.innerHTML =
      '<header class="page-head">' +
      "<h1>Experiences</h1>" +
      "<p>Professional, volunteering, and academic chapters from James's background.</p>" +
      "</header>" +
      '<section class="experience-band" aria-label="Professional experiences">' +
      "<h2>Professional experiences</h2>" +
      '<div class="grid-actions">' +
      professionalCards +
      "</div></section>" +
      '<section class="experience-band" aria-label="Volunteering experiences">' +
      "<h2>Volunteering experiences</h2>" +
      '<div class="grid-actions">' +
      volunteeringCards +
      "</div></section>" +
      '<section class="experience-band" aria-label="Academic experiences">' +
      "<h2>Academic experiences</h2>" +
      '<div class="grid-actions">' +
      academicCards +
      "</div></section>";
  }

  function renderNewsIndex(main) {
    setHomePageMode(main, false);
    const items = getAllCases();
    let newsItems = [];
    
    items.forEach(function (x) {
      if (x.caseItem.relatedNews && x.caseItem.relatedNews.length) {
        x.caseItem.relatedNews.forEach(function(url) {
          newsItems.push({
            url: url,
            caseItem: x.caseItem,
            experience: x.experience
          });
        });
      }
    });

    const seenUrls = {};
    const uniqueNews = [];
    newsItems.forEach(function(item) {
      if (!seenUrls[item.url]) {
        seenUrls[item.url] = true;
        uniqueNews.push(item);
      }
    });

    const cards = uniqueNews
      .map(function (item) {
        return newsLinkCardHtml(item.url, item.caseItem);
      })
      .join("");

    main.innerHTML =
      '<header class="page-head">' +
      "<h1>News &amp; Mentions</h1>" +
      "<p>Articles, videos, and media mentions related to cases in the portfolio.</p>" +
      "</header>" +
      '<section class="news-cards news-cards--grid" aria-label="News list">' +
      cards +
      "</section>";

    requestAnimationFrame(function () {
      enhanceNewsCardTitles(main);
    });
  }

  window.Portfolio = {
    injectNav: injectNav,
    renderHome: renderHome,
    renderExperiencesIndex: renderExperiencesIndex,
    renderExperience: renderExperience,
    renderCase: renderCase,
    renderCasesIndex: renderCasesIndex,
    renderNewsIndex: renderNewsIndex,
    DATA: DATA,
    relatedNewsTitleEn: relatedNewsTitleEn,
  };
})();
