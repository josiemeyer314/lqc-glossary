const LQC_GLOSSARY_VERSION = "0.2.0";

console.log(
  `%cLQC Glossary ${LQC_GLOSSARY_VERSION} loaded`,
  "color: green; font-weight: bold;"
);

(function () {

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

    glossary = await
