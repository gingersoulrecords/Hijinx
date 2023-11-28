const CLASS_NAME_REGEX = /([a-z0-9\-:]+)-\[(.+)\]/i;
const SIZE_MODIFIERS = {
    "md:": "768px",
    "lg:": "1024px",
    "xl:": "1366px"
};

function escapeClassName(className) {
    return className
        .replace(/:/g, "\\:")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]");
}

function addCSSRule(selector, property, value) {
    return `${selector} {
        ${property}: ${value};
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
                const escapedClassName = escapeClassName(className);
                let ruleAdded = false;

                if (value.startsWith("--")) {
                    value = `var(${value})`;
                }

                if (prefix.startsWith("hover:")) {
                    styleTagContent += addCSSRule(`.${escapedClassName}:hover`, prefix.slice(6), value);
                    ruleAdded = true;
                }

                for (const [modifier, minWidth] of Object.entries(SIZE_MODIFIERS)) {
                    if (!ruleAdded && prefix.startsWith(modifier)) {
                        styleTagContent += `@media (min-width: ${minWidth}) {
                            ${addCSSRule(`.${escapedClassName}`, prefix.slice(modifier.length), value)}
                        }\n`;
                        ruleAdded = true;
                        break;
                    }
                }

                if (!ruleAdded) {
                    styleTagContent += addCSSRule(`.${escapedClassName}`, prefix, value);
                }
            }
        });
    });

    return `<style>\n${css_beautify(styleTagContent)}\n</style>\n\n${htmlString}`;
}
