(function () {
  "use strict";

  window.CASE_PAGE_META = {
    "nexoos-product-owner-inverted-loan-request-ux": {
      relatedCases: [
        "nexoos-head-of-product-data-investor-wallet",
        "nexoos-head-of-product-data-funding-channel-sorting-hat"
      ]
    },
    "nexoos-head-of-product-data-investor-wallet": {
      relatedCases: [
        "nexoos-head-of-product-data-funding-channel-sorting-hat",
        "nexoos-product-owner-inverted-loan-request-ux"
      ]
    },
    "nexoos-head-of-product-data-funding-channel-sorting-hat": {
      relatedCases: [
        "nexoos-head-of-product-data-investor-wallet",
        "nexoos-product-owner-inverted-loan-request-ux"
      ]
    },
    "quintoandar-product-manager-rental-liquidity-smartpricing": {
      relatedCases: [
        "quintoandar-product-manager-rental-liquidity-no-adm",
        "quintoandar-product-manager-rental-liquidity-irent",
        "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons"
      ]
    },
    "quintoandar-product-manager-rental-liquidity-irent": {
      relatedCases: [
        "quintoandar-product-manager-rental-liquidity-no-adm",
        "quintoandar-product-manager-rental-liquidity-smartpricing",
        "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons"
      ]
    },
    "quintoandar-product-manager-rental-liquidity-no-adm": {
      relatedCases: [
        "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons",
        "quintoandar-product-manager-rental-liquidity-irent",
        "quintoandar-product-manager-rental-liquidity-smartpricing"
      ],
      overrides: {
        reflection: "A product can be directionally right and still impossible to validate properly if the channel, segment, and economics are misaligned. Sometimes an experiment does not mainly validate a product—it validates the requirements for ever testing that product properly.\n\nJust as importantly, this work became the setup for the later [financial add-ons thesis](case.html#quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons): the exploration exposed exactly where the missing economics lived."
      }
    },
    "quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons": {
      relatedCases: [
        "quintoandar-product-manager-rental-liquidity-no-adm",
        "quintoandar-product-manager-rental-liquidity-smartpricing",
        "quintoandar-product-manager-rental-liquidity-irent"
      ],
      overrides: {
        context: "QuintoAndar had a large active rental base with hundreds of thousands of ongoing rentals. After earlier exploration in the [brokerage-only rental model](case.html#quintoandar-product-manager-rental-liquidity-no-adm) showed that segment expansion through lighter products was difficult, the question became: could we improve profitability inside the markets and customer base we already served? That led to the financial add-ons thesis—small, optional products that would be useful to a minority of users but very valuable for those who wanted them."
      }
    },
    "quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth": {
      relatedCases: [
        "quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality",
        "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision"
      ]
    },
    "quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality": {
      relatedCases: [
        "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision",
        "quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth"
      ],
      overrides: {
        reflection: "Search quality is never just about ranking. It is also about what signal the user gives you, how much friction the product introduces, whether the system understands geography the way people do, and whether top results feel trustworthy enough to keep exploration going. A great search experience asks for just enough to make relevance possible.\n\nThis work also became the foundation for the later [conversational search and LLM case](case.html#quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision): the AI layer only worked because the qualification and retrieval basics were already in place."
      }
    },
    "quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision": {
      relatedCases: [
        "quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality",
        "quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth"
      ]
    }
  };

  window.CASE_PAGE_SECTIONS = [
    { key: "context", label: "Context" },
    { key: "problem", label: "Problem" },
    { key: "insight", label: "Key insight", className: "case-section--insight" },
    { key: "solution", label: "What I changed" },
    { key: "results", label: "Outcome" },
    { key: "reflection", label: "What this proves", className: "case-section--reflection" }
  ];
})();
