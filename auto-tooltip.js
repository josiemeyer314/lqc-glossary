(function () {

    //////////////////////////////////////////////////////
    // CONFIG
    //////////////////////////////////////////////////////

    const TERM_SELECTOR =
        ".qise-term,.qise-custom-tooltip";

    //////////////////////////////////////////////////////
    // HTML ESCAPING
    //////////////////////////////////////////////////////

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    //////////////////////////////////////////////////////
    // TOOLTIP POSITIONING
    //////////////////////////////////////////////////////

    function positionTooltip(target, tooltip) {

        if (window.innerWidth <
            tooltip.offsetWidth * 1.5) {

            tooltip.style.maxWidth =
                (window.innerWidth / 2) + "px";

        } else {

            tooltip.style.maxWidth = "340px";

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

        tooltip.style.left = posLeft + "px";
        tooltip.style.top = posTop + "px";
    }

    //////////////////////////////////////////////////////
    // TOOLTIP CREATION
    //////////////////////////////////////////////////////

    function showTooltip(target, content) {

        if (target._qiseTooltip) {
            return;
        }

        const tooltip =
            document.createElement("div");

        tooltip.className = "qise-tooltip";

        tooltip.innerHTML = content;

        document.body.appendChild(tooltip);

        target._qiseTooltip = tooltip;

        positionTooltip(target, tooltip);

        const reposition = () =>
            positionTooltip(target, tooltip);

        target._repositionHandler = reposition;

        window.addEventListener(
            "resize",
            reposition
        );
    }

    function hideTooltip(target) {

        if (!target._qiseTooltip) {
            return;
        }

        window.removeEventListener(
            "resize",
            target._repositionHandler
        );

        target._qiseTooltip.remove();

        delete target._qiseTooltip;
        delete target._repositionHandler;
    }

    //////////////////////////////////////////////////////
    // MARKUP GENERATORS
    //////////////////////////////////////////////////////

    function glossaryMarkup(term) {

        if (
            !window.QISEGlossary ||
            !window.QISEGlossary[term]
        ) {
            return term;
        }

        return (
            '<span class="qise-term" data-tooltip="' +
            escapeHtml(
                window.QISEGlossary[term]
                    .definition
            ) +
            '">' +
            escapeHtml(term) +
            '</span>'
        );
    }

    function customMarkup(
        label,
        tooltipText
    ) {

        return (
            '<span class="qise-custom-tooltip" data-tooltip="' +
            escapeHtml(tooltipText) +
            '">' +
            escapeHtml(label) +
            '</span>'
        );
    }

    //////////////////////////////////////////////////////
    // PARSER
    //////////////////////////////////////////////////////

    function processMarkup(html) {

        return html.replace(
            /\[\[(.*?)\]\]/gs,
            function (_, content) {

                content =
                    content.trim();

                if (
                    content.includes("::")
                ) {

                    const index =
                        content.indexOf("::");

                    const label =
                        content
                            .slice(0, index)
                            .trim();

                    const tooltip =
                        content
                            .slice(
                                index + 2
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

    //////////////////////////////////////////////////////
    // QUESTION PROCESSING
    //////////////////////////////////////////////////////

    function processQuestion(question) {

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
            .qiseProcessed = "true";
    }

    function processAllQuestions() {

        document
            .querySelectorAll(
                ".QuestionText"
            )
            .forEach(
                processQuestion
            );
    }

    //////////////////////////////////////////////////////
    // EVENTS
    //////////////////////////////////////////////////////

    document.addEventListener(
        "mouseenter",
        function (event) {

            const trigger =
                event.target.closest(
                    TERM_SELECTOR
                );

            if (!trigger) {
                return;
            }

            const content =
                trigger.dataset
                    .tooltip;

            if (!content) {
                return;
            }

            showTooltip(
                trigger,
                content
            );

        },
        true
    );

    document.addEventListener(
        "mouseleave",
        function (event) {

            const trigger =
                event.target.closest(
                    TERM_SELECTOR
                );

            if (!trigger) {
                return;
            }

            hideTooltip(trigger);

        },
        true
    );

    //////////////////////////////////////////////////////
    // INITIALIZATION
    //////////////////////////////////////////////////////

    function initialize() {

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
