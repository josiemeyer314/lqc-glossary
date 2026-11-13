

(function () {

const LQC_GLOSSARY_VERSION = "0.2.4";

console.log(
  `%cLQC Glossary ${LQC_GLOSSARY_VERSION} loaded`,
  "color: green; font-weight: bold;"
);

  //////////////////////////////////////////////////////
  // CONFIG
  //////////////////////////////////////////////////////

  const GLOSSARY_URL =
    "https://josiemeyer314.github.io/lqc-glossary/glossary.json";

  const CANVAS_SELECTOR = "#survey-canvas";

  let glossary = {};

  //////////////////////////////////////////////////////
  // LOAD GLOSSARY
  //////////////////////////////////////////////////////

  async function loadGlossary() {

    console.log("[LQC] Loading glossary...");

    const response = await fetch(GLOSSARY_URL);

    if (!response.ok) {
      throw new Error(
        `Glossary fetch failed: ${response.status}`
      );
    }

    glossary = await response.json();

    console.log(
      "glossary loaded"
      //`[LQC] Loaded ${Object.keys(glossary).length} glossary entries`
    );

    console.table(glossary);
  }

  //////////////////////////////////////////////////////
  // ESCAPING
  //////////////////////////////////////////////////////

  function escapeHtml(text) {

    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  //////////////////////////////////////////////////////
  // TOOLTIP DISPLAY
  //////////////////////////////////////////////////////

  function positionTooltip(target, tooltip) {

    tooltip.classList.remove(
      "left",
      "right",
      "top"
    );

    let left =
      target.getBoundingClientRect().left +
      window.scrollX +
      target.offsetWidth / 2 -
      tooltip.offsetWidth / 2;

    let top =
      target.getBoundingClientRect().top +
      window.scrollY -
      tooltip.offsetHeight -
      20;

    if (left < 0) {

      left =
        target.getBoundingClientRect().left +
        window.scrollX;

      tooltip.classList.add("left");
    }

    if (
      left + tooltip.offsetWidth >
      window.innerWidth
    ) {

      left =
        window.innerWidth -
        tooltip.offsetWidth -
        10;

      tooltip.classList.add("right");
    }

    if (top < window.scrollY) {

      top =
        target.getBoundingClientRect().bottom +
        window.scrollY +
        10;

      tooltip.classList.add("top");
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(target) {

    const content =
      target.dataset.tooltip;

    if (!content) {
      return;
    }

    hideTooltip(target);

    const tooltip =
      document.createElement("div");

    tooltip.className =
      "qise-tooltip";

    tooltip.innerHTML =
      content;

    document.body.appendChild(
      tooltip
    );

    positionTooltip(
      target,
      tooltip
    );

    target._lqcTooltip =
      tooltip;
  }

  function hideTooltip(target) {

    if (
      !target ||
      !target._lqcTooltip
    ) {
      return;
    }

    target._lqcTooltip.remove();

    delete target._lqcTooltip;
  }

  //////////////////////////////////////////////////////
  // MARKUP
  //////////////////////////////////////////////////////

  function glossaryMarkup(key) {

    const entry =
      glossary[key];

    if (!entry) {

      console.warn(
        `[LQC] Missing glossary entry: ${key}`
      );

      return key;
    }

    return (
      `<span class="qise-term" ` +
      `data-tooltip="${escapeHtml(entry.definition)}">` +
      `${escapeHtml(key)}` +
      `</span>`
    );
  }

  function customMarkup(
    label,
    tooltip
  ) {

    return (
      `<span class="qise-custom-tooltip" ` +
      `data-tooltip="${escapeHtml(tooltip)}">` +
      `${escapeHtml(label)}` +
      `</span>`
    );
  }

  //////////////////////////////////////////////////////
  // PARSER
  //////////////////////////////////////////////////////

  function processMarkup(html) {

    return html.replace(
      /\[\[(.*?)\]\]/gs,
      (_, content) => {

        content =
          content.trim();

        const separator =
          content.indexOf("::");

        if (separator >= 0) {

          return customMarkup(
            content
              .slice(0, separator)
              .trim(),

            content
              .slice(separator + 2)
              .trim()
          );
        }

        return glossaryMarkup(
          content
        );
      }
    );
  }

  //////////////////////////////////////////////////////
  // PROCESS SURVEY
  //////////////////////////////////////////////////////

function processSurveyCanvas() {

  const targets = document.querySelectorAll(
    ".question-display.rich-text"
  );

  if (!targets.length) {

    console.warn(
      "[LQC] No .question-display.rich-text elements found"
    );

    return;
  }

  let replacementCount = 0;

  targets.forEach((element) => {

    const original =
      element.innerHTML;

    if (!original.includes("[[")) {
      return;
    }

    const processed =
      processMarkup(original);

    if (processed !== original) {

      element.innerHTML =
        processed;

      replacementCount++;
    }
  });

  if (replacementCount > 0) {

    console.log(
      "[LQC] Tooltip replacements completed."
    );

    console.log(
      document.querySelectorAll(
        ".qise-term,.qise-custom-tooltip"
      ).length,
      "tooltip(s) inserted"
    );
  }
}

  //////////////////////////////////////////////////////
  // EVENTS
  //////////////////////////////////////////////////////

  document.addEventListener(
    "mouseover",
    (event) => {

      const term =
        event.target.closest(
          ".qise-term,.qise-custom-tooltip"
        );

      if (term) {
        showTooltip(term);
      }
    }
  );

  document.addEventListener(
    "mouseout",
    (event) => {

      const term =
        event.target.closest(
          ".qise-term,.qise-custom-tooltip"
        );

      if (term) {
        hideTooltip(term);
      }
    }
  );

  //////////////////////////////////////////////////////
  // STARTUP
  //////////////////////////////////////////////////////

  async function initialize() {

    try {

      await loadGlossary();

      processSurveyCanvas();
    /*
      const observer =
        new MutationObserver(
          processSurveyCanvas
        );

      observer.observe(
        document.body,
        {
          childList: true,
          subtree: true
        }
      );
      */

      console.log(
        "[LQC] Initialization complete"
      );

    } catch (error) {

      console.error(
        "[LQC] Initialization failed:",
        error
      );
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();
  }

})();
