const CLASS_NAME_REGEX = /([a-z0-9\-:!]+)-\[(.+)\]/i;
const SIZE_MODIFIERS = {
    "md:": "768px",
    "lg:": "1024px",
    "xl:": "1366px"
};

function escapeClassName(className) {
    return className
        .replace(/!/g, "\\!")
        .replace(/:/g, "\\:")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]");
}

function addCSSRule(selector, property, value, important = false) {
    return `${selector} {
        ${property}: ${value}${important ? " !important" : ""};
    }\n`;
}


function processHTML(htmlString) {
    let styleTagContent = "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    doc.body.querySelectorAll("*").forEach((elem) => {
        const classList = elem.className.split(/\s+/);
        classList.forEach((className) => {
            const match = className.match(CLASS_NAME_REGEX);
            if (match) {
                const prefix = match[1] || "";
                let value = match[2].replace(/_/g, " ");
                let escapedClassName = escapeClassName(className);
                let ruleAdded = false;
                let important = false;
                let modifiedPrefix = prefix;

                if (value.startsWith("--")) {
                    value = `var(${value})`;
                }

                if (prefix.startsWith("!")) {
                    important = true;
                    modifiedPrefix = prefix.slice(1);
                    escapedClassName = escapeClassName(className);
                }

                if (modifiedPrefix.startsWith("hover:")) {
                    styleTagContent += addCSSRule(`.${escapedClassName}:hover`, modifiedPrefix.slice(6), value, important);
                    ruleAdded = true;
                }

                for (const [modifier, minWidth] of Object.entries(SIZE_MODIFIERS)) {
                    if (!ruleAdded && modifiedPrefix.startsWith(modifier)) {
                        styleTagContent += `@media (min-width: ${minWidth}) {
                            ${addCSSRule(`.${escapedClassName}`, modifiedPrefix.slice(modifier.length), value, important)}
                        }\n`;
                        ruleAdded = true;
                        break;
                    }
                }

                if (!ruleAdded) {
                    styleTagContent += addCSSRule(`.${escapedClassName}`, modifiedPrefix, value, important);
                }
            }
        });
    });

    return `<style>\n${css_beautify(styleTagContent)}\n</style>\n\n${htmlString}`;
}
