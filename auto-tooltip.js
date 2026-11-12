(function () {

    ////////////////////////////////////////////////////////////
    // CONFIG
    ////////////////////////////////////////////////////////////

    const GLOSSARY_URL =
        "https://josiemeyer314.github.io/lqc-glossary/glossary.json";

    const QUESTION_SELECTOR = ".QuestionText";

    let glossary = {};

    ////////////////////////////////////////////////////////////
    // LOAD GLOSSARY
    ////////////////////////////////////////////////////////////

    async function loadGlossary() {

        try {

            const response =
                await fetch(GLOSSARY_URL);

            glossary =
                await response.json();

        }
        catch (error) {

            console.error(
                "Failed to load glossary:",
                error
            );
        }
    }

    ////////////////////////////////////////////////////////////
    // ESCAPING
    ////////////////////////////////////////////////////////////

    function escapeHtml(str) {

        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    ////////////////////////////////////////////////////////////
    // TOOLTIP POSITIONING
    ////////////////////////////////////////////////////////////

    function positionTooltip(
        target,
        tooltip
    ) {

        if (
            window.innerWidth <
            tooltip.offsetWidth * 1.5
        ) {

            tooltip.style.maxWidth =
                (window.innerWidth / 2)
                + "px";

        } else {

            tooltip.style.maxWidth =
                "340px";
        }

        let posLeft =
            target.getBoundingClientRect().left +
            window.scrollX +
            target.offsetWidth / 2 -
            tooltip.offsetWidth / 2;

        let posTop =
            target.getBoundingClientRect().top +
            window.scrollY -
            tooltip.offsetHeight -
            20;

        tooltip.classList.remove(
            "left",
            "right",
            "top"
        );

        if (posLeft < 0) {

            posLeft =
                target.getBoundingClientRect().left +
                window.scrollX +
                target.offsetWidth / 2 -
                20;

            tooltip.classList.add("left");
        }

        if (
            posLeft + tooltip.offsetWidth >
            window.innerWidth
        ) {

            posLeft =
                target.getBoundingClientRect().left +
                window.scrollX -
                tooltip.offsetWidth +
                target.offsetWidth / 2 +
                20;

            tooltip.classList.add("right");
        }

        if (posTop < window.scrollY) {

            posTop =
                target.getBoundingClientRect().top +
                window.scrollY +
                target.offsetHeight +
                10;

            tooltip.classList.add("top");
        }

        tooltip.style.left =
            posLeft + "px";

        tooltip.style.top =
            posTop + "px";
    }

    ////////////////////////////////////////////////////////////
    // TOOLTIP MANAGEMENT
    ////////////////////////////////////////////////////////////

    function showTooltip(
        target,
        content
    ) {

        if (target._qiseTooltip) {
            return;
        }

        const tooltip =
            document.createElement("div");

        tooltip.className =
            "qise-tooltip";

        tooltip.innerHTML =
            content;

        document.body.appendChild(
            tooltip
        );

        target._qiseTooltip =
            tooltip;

        positionTooltip(
            target,
            tooltip
        );

        const reposition =
            () => positionTooltip(
                target,
                tooltip
            );

        target._qiseResize =
            reposition;

        window.addEventListener(
            "resize",
            reposition
        );
    }

    function hideTooltip(
        target
    ) {

        if (
            !target._qiseTooltip
        ) {
            return;
        }

        window.removeEventListener(
            "resize",
            target._qiseResize
        );

        target._qiseTooltip.remove();

        delete target._qiseTooltip;
        delete target._qiseResize;
    }

    ////////////////////////////////////////////////////////////
    // MARKUP HELPERS
    ////////////////////////////////////////////////////////////

    function glossaryMarkup(
        key
    ) {

        const entry =
            glossary[key];

        if (!entry) {
            return key;
        }

        return (
            '<span class="qise-term" ' +
            'data-tooltip="' +
            escapeHtml(
                entry.definition
            ) +
            '">' +
            escapeHtml(key) +
            '</span>'
        );
    }

    function customMarkup(
        label,
        tooltip
    ) {

        return (
            '<span class="qise-custom-tooltip" ' +
            'data-tooltip="' +
            escapeHtml(
                tooltip
            ) +
            '">' +
            escapeHtml(
                label
            ) +
            '</span>'
        );
    }

    ////////////////////////////////////////////////////////////
    // PARSER
    ////////////////////////////////////////////////////////////

    function processMarkup(
        html
    ) {

        return html.replace(
            /\[\[(.*?)\]\]/gs,
            function (
                match,
                content
            ) {

                content =
                    content.trim();

                const separator =
                    content.indexOf(
                        "::"
                    );

                if (
                    separator >= 0
                ) {

                    const label =
                        content
                        .slice(
                            0,
                            separator
                        )
                        .trim();

                    const tooltip =
                        content
                        .slice(
                            separator
                            + 2
                        )
                        .trim();

                    return customMarkup(
                        label,
                        tooltip
                    );
                }

                return glossaryMarkup(
                    content
                );
            }
        );
    }

    ////////////////////////////////////////////////////////////
    // QUESTION PROCESSING
    ////////////////////////////////////////////////////////////

    function processQuestion(
        question
    ) {

        if (
            question.dataset
                .qiseProcessed
        ) {
            return;
        }

        question.innerHTML =
            processMarkup(
                question.innerHTML
            );

        question.dataset
            .qiseProcessed =
            "true";
    }

    function processAllQuestions() {

        document
            .querySelectorAll(
                QUESTION_SELECTOR
            )
            .forEach(
                processQuestion
            );
    }

    ////////////////////////////////////////////////////////////
    // EVENTS
    ////////////////////////////////////////////////////////////

    document.addEventListener(
        "mouseenter",
        function (
            event
        ) {

            const trigger =
                event.target.closest(
                    ".qise-term,.qise-custom-tooltip"
                );

            if (
                !trigger
            ) {
                return;
            }

            showTooltip(
                trigger,
                trigger.dataset
                    .tooltip
            );

        },
        true
    );

    document.addEventListener(
        "mouseleave",
        function (
            event
        ) {

            const trigger =
                event.target.closest(
                    ".qise-term,.qise-custom-tooltip"
                );

            if (
                !trigger
            ) {
                return;
            }

            hideTooltip(
                trigger
            );

        },
        true
    );

    ////////////////////////////////////////////////////////////
    // STARTUP
    ////////////////////////////////////////////////////////////

    async function initialize() {

        await loadGlossary();

        processAllQuestions();

        const observer =
            new MutationObserver(
                processAllQuestions
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
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
