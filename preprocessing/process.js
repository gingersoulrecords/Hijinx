function escapeClassName(className) {
    return className
        .replace(/:/g, "\\:")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]");
}

// function processHTML(htmlString) {
//     let styleTagContent = "";
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(htmlString, "text/html");

//     const sizeModifiers = {
//         "md:": "768px",
//         "lg:": "1024px",
//         "xl:": "1366px"
//     };

//     // Iterate through the elements of the isolated DOM object
//     doc.body.querySelectorAll("*").forEach((elem) => {
//         const classList = elem.className.split(/\s+/);
//         classList.forEach((className) => {
//             const match = className.match(/([a-z0-9\-:]+)-\[(.+)\]/i); // Changed regex here
//             if (match) {
//                 const prefix = match[1] || "";
//                 let value = match[2].replace(/_/g, " ");
//                 const escapedClassName = escapeClassName(className);
//                 let ruleAdded = false;

//                 if (value.startsWith("--")) {
//                     value = `var(${value})`;
//                 }

//                 for (const [modifier, minWidth] of Object.entries(sizeModifiers)) {
//                     if (prefix.startsWith(modifier)) {
//                         styleTagContent += `@media (min-width: ${minWidth}) {
//                             .${escapedClassName} {
//                                 ${prefix.slice(modifier.length)}: ${value};
//                             }
//                         }\n`;
//                         ruleAdded = true;
//                         break;
//                     }
//                 }

//                 if (!ruleAdded) {
//                     styleTagContent += `.${escapedClassName} {
//                         ${prefix}: ${value};
//                     }\n`;
//                 }
//             }
//         });
//     });

//     return `<style>\n${css_beautify(styleTagContent)}\n</style>\n\n${htmlString}`;
// }

function processHTML(htmlString) {
    let styleTagContent = "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const sizeModifiers = {
        "md:": "768px",
        "lg:": "1024px",
        "xl:": "1366px"
    };

    // Iterate through the elements of the isolated DOM object
    doc.body.querySelectorAll("*").forEach((elem) => {
        const classList = elem.className.split(/\s+/);
        classList.forEach((className) => {
            const match = className.match(/([a-z0-9\-:]+)-\[(.+)\]/i);
            if (match) {
                const prefix = match[1] || "";
                let value = match[2].replace(/_/g, " ");
                const escapedClassName = escapeClassName(className);
                let ruleAdded = false;

                if (value.startsWith("--")) {
                    value = `var(${value})`;
                }

                if (prefix.startsWith("hover:")) {
                    styleTagContent += `@media (hover: hover) and (pointer: fine) {
                        .${escapedClassName}:hover {
                            ${prefix.slice(6)}: ${value};
                        }
                    }\n`;
                    ruleAdded = true;
                }

                for (const [modifier, minWidth] of Object.entries(sizeModifiers)) {
                    if (!ruleAdded && prefix.startsWith(modifier)) {
                        styleTagContent += `@media (min-width: ${minWidth}) {
                            .${escapedClassName} {
                                ${prefix.slice(modifier.length)}: ${value};
                            }
                        }\n`;
                        ruleAdded = true;
                        break;
                    }
                }

                if (!ruleAdded) {
                    styleTagContent += `.${escapedClassName} {
                        ${prefix}: ${value};
                    }\n`;
                }
            }
        });
    });

    return `<style>\n${css_beautify(styleTagContent)}\n</style>\n\n${htmlString}`;
}
