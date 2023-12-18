//in this file, we're going to be setting up a function to process an html string, extract special utility classes (that contain square brackets), and convert them into css rules that we will append to the html output via a style tag

//we're going to be using the DOMParser to parse the html string into a DOM object, and then we'll be using the DOM object to extract the utility classes that match our regex.

//we need to accommodate !important, modifiers (in the right order), css custom properties

//we'll be using the css-beautify library to format the css rules that we generate.

//lets start by understanding the outcome of what we're expecting to happen with a given html string.

//we're going to be taking an html string that looks like this:

//     <div class="bg-[red] [color:white]">Hello, world!</div>

//and converting it into this:

//     <style>
//         .bg-\[red\] {
//             background: red;
//         }
//         .\[color\:white\] {
//             color: white;
//         }
//     </style>
//     <div class="bg-[red] [color:white]">Hello, world!</div>

//so we're going to be extracting the utility classes from the html string, and then converting them into css rules that we'll append to the html output via a style tag.
//in order to do this, we're going to be using the DOMParser to parse the html string into a DOM object, and then we'll be using the DOM object to extract the utility classes that match our regex.
//in order to properly parse a class preview like 'bg' into a css rule like 'background', we're going to be using a mapping object that we'll call PROPERTY_MAPPING.

const PROPERTY_MAPPING = {
    "color": "color",
    "bg": "background-color",
    // Add more mappings as needed
};

// Function to create a DOMParser and parse the HTML string
function createDOM(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc;
}

// Function to get classes with colons
function getColonClasses(element) {
    const COLON_CLASS_NAME_REGEX = /[^ ]*:[^ ]*/g;
    const classList = element.className.split(/\s+/);
    const colonClasses = classList.filter(className => {
        COLON_CLASS_NAME_REGEX.lastIndex = 0;
        return COLON_CLASS_NAME_REGEX.test(className);
    });
    return colonClasses;
}

// // Function to process the string before the last colon
// function processStringBeforeLastColon(str, PROPERTY_MAPPING) {

//     console.log(str);

//     let cssProperty;

//     if (isCSSProperty(str)) {
//         cssProperty = str;
//     } else if (PROPERTY_MAPPING[str]) {
//         cssProperty = PROPERTY_MAPPING[str];
//     } else {
//         console.error(`Unsupported CSS property: ${str}`);
//         return '';
//     }

//     // Return the CSS selector with the colon escaped, and the CSS property
//     return [`.${str.replace(':', '\\:')}`, cssProperty];
// }

// Function to process the string before the last colon
function processStringBeforeLastColon(str, PROPERTY_MAPPING) {
    let cssProperty;

    if (isCSSProperty(str)) {
        cssProperty = str;
    } else if (PROPERTY_MAPPING[str]) {
        cssProperty = PROPERTY_MAPPING[str];
    } else {
        console.error(`Unsupported CSS property: ${str}`);
        return '';
    }

    // Return the CSS property
    return cssProperty;
}

// Function to process the string after the last colon
function processStringAfterLastColon(str) {
    // In this case, the string after the last colon is the CSS value
    return str;
}

// Function to convert a class name into a CSS rule
function convertClassToCSSRule(className, PROPERTY_MAPPING) {
    const lastColonIndex = className.lastIndexOf(':');
    const property = className.substring(0, lastColonIndex);
    const value = className.substring(lastColonIndex + 1);

    let cssProperty = processStringBeforeLastColon(property, PROPERTY_MAPPING);
    let cssValue = processStringAfterLastColon(value);

    if (!cssProperty || !cssValue) {
        return '';
    }

    // Use the entire initially found class as the CSS selector
    const cssSelector = `.${className.replace(':', '\\:')}`;

    return `${cssSelector}{ ${cssProperty}: ${cssValue}; }`;
}

// Check if the property is supported, using a dummy value
function isCSSProperty(property) {
    return CSS.supports(property, "initial");
}

// The main function
function processHTML(htmlString, PROPERTY_MAPPING) {
    let styleTagContent = "";
    const doc = createDOM(htmlString);

    doc.body.querySelectorAll("*").forEach((elem) => {
        const colonClasses = getColonClasses(elem);
        colonClasses.forEach((className) => {
            const cssRule = convertClassToCSSRule(className, PROPERTY_MAPPING);
            styleTagContent += cssRule;
        });
    });

    // Use css_beautify to format the CSS
    const beautifiedCSS = css_beautify(styleTagContent);

    return `<style>\n${beautifiedCSS}\n</style>\n\n${htmlString}`;
}
