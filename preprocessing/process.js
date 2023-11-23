function escapeClassName(className) {
    return className
        .replace(/:/g, "\\:")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]");
}

function processHTML(htmlString) {
    let styleTagContent = "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Iterate through the elements of the isolated DOM object
    doc.body.querySelectorAll("*").forEach((elem) => {
        const classList = elem.className.split(/\s+/);
        classList.forEach((className) => {
            const match = className.match(/([a-z0-9\-:]+)?-\[([^\]]+)\]/i);
            if (match) {
                const prefix = match[1] || "";
                const value = match[2];
                const escapedClassName = escapeClassName(className);
                if (prefix.startsWith("lg:")) {
                    styleTagContent += `@media (min-width: 1024px) {
                        .${escapedClassName} {
                            ${prefix.slice(3)}: ${value};
                        }
                    }\n`;
                } else if (prefix.startsWith("md:")) {
                    styleTagContent += `@media (min-width: 768px) {
                        .${escapedClassName} {
                            ${prefix.slice(3)}: ${value};
                        }
                    }\n`;
                } else if (prefix.startsWith("xl:")) {
                    styleTagContent += `@media (min-width: 1366px) {
                        .${escapedClassName} {
                            ${prefix.slice(3)}: ${value};
                        }
                    }\n`;
                } else {
                    styleTagContent += `.${escapedClassName} {
                        ${prefix}: ${value};
                    }\n`;
                }
            }
        });
    });

    return `<style>\n${css_beautify(styleTagContent)}\n</style>\n\n${htmlString}`;
}
