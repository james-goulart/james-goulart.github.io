(function () {
  "use strict";

  if (!window.Portfolio || !window.ExperiencePageHelpers || !window.EXPERIENCE_PAGE_META) return;

  var originalRenderExperience = Portfolio.renderExperience;
  var helpers = window.ExperiencePageHelpers;
  var metaMap = window.EXPERIENCE_PAGE_META;

  function collectPress(exp, meta) {
    var urls = [];
    (exp.cases || []).forEach(function (caseItem) {
      (caseItem.relatedNews || []).forEach(function (url) {
        urls.push(url);
      });
    });
    if (meta && meta.relatedPress) urls = urls.concat(meta.relatedPress);
    return helpers.uniqueStrings(urls);
  }

  Portfolio.renderExperience = function renderStructuredExperience(main) {
    var id = decodeURIComponent((window.location.hash || '#').slice(1));
    var exp = helpers.experienceById(id);
    var meta = metaMap[id];

    if (!exp || !meta) {
      originalRenderExperience(main);
      return;
    }

    var facts = [];
    if (exp.tenure) facts.push('<li><strong>Tenure</strong> ' + helpers.escapeHtml(helpers.tenureLabel(exp.tenure)) + '</li>');
    if (exp.track) facts.push('<li><strong>Track</strong> ' + helpers.escapeHtml(exp.track) + '</li>');

    var pressUrls = collectPress(exp, meta);

    var asideHtml = '<aside class="experience-aside" aria-label="Experience details">' +
      (exp.highlights && exp.highlights.length ? '<section class="experience-aside__section"><h2>Highlights</h2>' + helpers.renderHighlights(exp.highlights) + '</section>' : '') +
      (exp.orgScope ? '<section class="experience-aside__section"><h2>Org scope</h2>' + helpers.renderOrgScope(exp.orgScope) + '</section>' : '') +
      (helpers.orgAboutText(exp) ? '<section class="experience-aside__section"><h2>About ' + helpers.escapeHtml(exp.company) + '</h2><p>' + helpers.escapeHtml(helpers.orgAboutText(exp)) + '</p></section>' : '') +
      helpers.renderPressLinks(pressUrls) +
      '</aside>';

    main.innerHTML = '<header class="page-head experience-header">' +
      helpers.brandRow(exp) +
      '<h1>' + helpers.escapeHtml(exp.role) + '</h1>' +
      '<p class="page-head__role">' + helpers.roleHtml(exp) + '</p>' +
      helpers.locationLineHtml(exp) +
      '<p class="experience-header__chapter-title">' + helpers.escapeHtml(meta.chapterTitle || '') + '</p>' +
      '<p class="experience-header__dek">' + helpers.escapeHtml(meta.dek || '') + '</p>' +
      (facts.length ? '<ul class="facts">' + facts.join('') + '</ul>' : '') +
      '</header>' +
      helpers.renderMetrics(meta.impactPills || []) +
      '<div class="experience-page experience-page--with-aside">' +
      '<div class="experience-page__main">' +
      helpers.renderSummary(meta.summaryBullets || []) +
      helpers.renderOwned(meta.owned) +
      helpers.renderSections(meta.sections || []) +
      helpers.renderFlagshipCases(meta.flagshipCaseIds || []) +
      helpers.renderProof(meta.proof || []) +
      helpers.renderRelatedExperiences(meta.relatedExperienceIds || []) +
      (exp.id === 'unicamp-bsc-electrical-engineering' ? '<section class="exp-section"><h2>Term paper</h2><p><a href="https://drive.google.com/file/d/12Nh6eFgCoI2W56X9sVIkH80rgE5B-ufb/view?usp=sharing" target="_blank" rel="noopener noreferrer">Read the Unicamp term paper</a></p></section>' : '') +
      '</div>' +
      asideHtml +
      '</div>';
  };
})();
