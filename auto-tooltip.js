window.LQCGlossary = {};

fetch("https://raw.githubusercontent.com/josiemeyer314/lqc-glossary.json")
    .then(r => r.json())
    .then(data => {
        window.LQCGlossary = data;
        applyGlossary();
    });

function applyGlossary() {

    document.querySelectorAll(".QuestionText").forEach(el => {

        let html = el.innerHTML;

        html = html.replace(
            /\[\[([^\]]+)\]\]/g,
            (match, term) => {

                term = term.trim();

                if(!window.LQCGlossary[term]) {
                    return term;
                }

                return `
                    <span
                        class="qise-term"
                        data-definition="${window.LQCGlossary[term]}"
                    >
                        ${term}
                    </span>
                `;
            }
        );

        el.innerHTML = html;
    });
}
