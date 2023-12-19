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


window.aviator = {
    propertyMap: {
        "color": "color",
        "bg": "background",
        "px": (value) => `padding-left: ${value}; padding-right: ${value};`,
        // Add more mappings as needed
    },
}

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

// Function to process the string before the last colon
function processSelectorComponents(str) {
    console.log(str);
    let cssProperty;
    if (isCSSProperty(str)) {
        cssProperty = str;
    } else if (typeof window.aviator.propertyMap[str] === 'function') {
        cssProperty = window.aviator.propertyMap[str];
    } else if (window.aviator.propertyMap[str]) {
        cssProperty = window.aviator.propertyMap[str];
    } else {
        console.error(`Unsupported CSS property: ${str}`);
        return '';
    }
    // Return the CSS property
    return cssProperty;
}

// Function to convert a class name into a CSS rule
function convertClassToCSSRule(className) {
    //split the selector components off from the value
    const lastColonIndex = className.lastIndexOf(':');
    let selectorComponents = className.substring(0, lastColonIndex);
    const value = className.substring(lastColonIndex + 1);

    // Process any modifiers in the selector components
    selectorComponents = processModifiers(selectorComponents);

    let cssSelectorComponents = processSelectorComponents(selectorComponents);
    let cssValue = processStringAfterLastColon(value);

    if (!cssSelectorComponents || !cssValue) {
        return '';
    }

    // Use the entire initially found class as the CSS selector
    const cssSelector = `.${className.replace(':', '\\:')}`;

    // If cssSelectorComponents is a function, call it with cssValue as the argument
    if (typeof cssSelectorComponents === 'function') {
        return `${cssSelector}{ ${cssSelectorComponents(cssValue)} }`;
    }

    return `${cssSelector}{ ${cssSelectorComponents}: ${cssValue}; }`;
}

// Function to process media and feature queries
function processMediaAndFeatureQueries(selectorComponents) {
    console.log('Processing media and feature queries:', selectorComponents);
    // TODO: Add code here to process media and feature queries
    return selectorComponents;
}

// Function to process pseudo-classes
function processPseudoClasses(selectorComponents) {
    console.log('Processing pseudo-classes:', selectorComponents);
    // TODO: Add code here to process pseudo-classes
    return selectorComponents;
}

// Function to process pseudo elements
function processPseudoElements(selectorComponents) {
    console.log('Processing pseudo elements:', selectorComponents);
    // TODO: Add code here to process pseudo elements
    return selectorComponents;
}

// Function to process attribute selectors
function processAttributeSelectors(selectorComponents) {
    console.log('Processing attribute selectors:', selectorComponents);
    // TODO: Add code here to process attribute selectors
    return selectorComponents;
}

// Function to process all modifiers
function processModifiers(selectorComponents) {
    console.log('Processing modifiers:', selectorComponents);
    selectorComponents = processMediaAndFeatureQueries(selectorComponents);
    selectorComponents = processPseudoClasses(selectorComponents);
    selectorComponents = processPseudoElements(selectorComponents);
    selectorComponents = processAttributeSelectors(selectorComponents);
    return selectorComponents;
}


// Function to process the string after the last colon
function processStringAfterLastColon(str) {
    // Replace underscores with spaces
    let cssValue = str.replace(/_/g, ' ');

    // Return the CSS value
    return cssValue;
}



// Check if the property is supported, using a dummy value
function isCSSProperty(property) {
    return CSS.supports(property, "initial");
}

// The main function
function processHTML(htmlString) {
    let styleTagContent = "";
    const doc = createDOM(htmlString);

    doc.body.querySelectorAll("*").forEach((elem) => {
        const colonClasses = getColonClasses(elem);
        colonClasses.forEach((className) => {
            const cssRule = convertClassToCSSRule(className);
            styleTagContent += cssRule;
        });
    });

    // Use css_beautify to format the CSS
    const beautifiedCSS = css_beautify(styleTagContent);

    return `<style>\n${beautifiedCSS}\n</style>\n\n${htmlString}`;
}
