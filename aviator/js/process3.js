(function ($) {
    // Define the breakpoints
    var breakpoints = {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
        // Add more breakpoints here as needed
    };

    // Mapping of abbreviations to CSS properties
    var propertyMap = {
        'bg': 'background',
        'grid-cols': 'grid-template-columns',
        'd': 'display',
        //flex direction
        'dir': 'flex-direction',
        'fd': 'flex-direction',
        'jc': 'justify-content',
        'ai': 'align-items',
        'p': 'padding',
        'pt': 'padding-top',
        'pr': 'padding-right',
        'pb': 'padding-bottom',
        'pl': 'padding-left',
        'm': 'margin',
        'mt': 'margin-top',
        'mr': 'margin-right',
        'mb': 'margin-bottom',
        'ml': 'margin-left',
        'w': 'width',
        'h': 'height',
        'min-w': 'min-width',
        'min-h': 'min-height',
        'max-w': 'max-width',
        'max-h': 'max-height',

        'size': 'font-size',
        'weight': 'font-weight',
        'lh': 'line-height',
        'leading': 'line-height',
        'ls': 'letter-spacing',
        'tracking': 'letter-spacing',


        // Add more mappings here as needed
    };

    // Mapping of functions to CSS properties
    var functionMap = {
        'px': ['padding-left', 'padding-right'],
        'padding-x': ['padding-left', 'padding-right'],
        'py': ['padding-top', 'padding-bottom'],
        'padding-y': ['padding-top', 'padding-bottom'],
        'mx': ['margin-left', 'margin-right'],
        'margin-x': ['margin-left', 'margin-right'],
        'my': ['margin-top', 'margin-bottom'],
        'margin-y': ['margin-top', 'margin-bottom'],

        // Add more mappings here as needed
    };


    window.processSoulClasses = function (htmlString) {
        // Extract the classes from the HTML string
        var classes = extractClassesToObjects(htmlString);

        // Store the classes on window.soulclasses
        window.soulClassObjects = classes;

        // Log the result
        //console.log(window.soulClassObjects);

        // For each of the classes, process them with processSoulClass and collect the CSS rules
        var cssRules = window.soulClassObjects.map(processSoulClass).join('\n'); // Join the CSS rules with newlines

        // Beautify the CSS rules
        var beautifiedCssRules = css_beautify(cssRules);

        // Prepend the CSS rules to the HTML string inside a <style> tag
        var processedHTMLString = '<style>\n' + beautifiedCssRules + '\n</style>\n' + htmlString;

        // Return the processed HTML string
        return processedHTMLString;
    };

    //this function takes a soul class object and returns a css rule string
    function processSoulClass(soulClassObject) {
        // Get the class name
        var className = soulClassObject.className;

        // Escape the class name and store it on the object
        soulClassObject.escapedClassName = '.' + className.replace(/^--|[^a-zA-Z0-9-_]/g, function (match) {
            return '\\' + match;
        });

        // Initialize prepCSSRule
        soulClassObject.prepCSSRule = {
            selector: soulClassObject.escapedClassName,
            openingMediaQueryString: '',
            closingMediaQueryString: ''
        };

        //split the classname into values, properties, and modifiers
        splitClassIntoValuesPropertiesAndModifiers(className, soulClassObject);

        // Build the CSS rule and return it
        return buildCSSRule(soulClassObject);


    }

    function splitClassIntoValuesPropertiesAndModifiers(className, soulClassObject) {
        var lastColonIndex = className.lastIndexOf(':');
        var modProperty = className.substring(0, lastColonIndex);
        var value = className.substring(lastColonIndex + 1);

        // Send value and soulClassObject to processValues
        processValues(value, soulClassObject);

        // Send modProperty and soulClassObject to processModifiers
        processModProperty(modProperty, soulClassObject);
    }

    function processValues(value, soulClassObject) {
        // Replace underscores with spaces
        value = value.replace(/[_]/g, ' ');

        // If the value contains '--' followed by alphanumeric characters, add it as a CSS variable
        value = value.replace(/--[\w-]+/g, function (match) {
            return 'var(' + match + ')';
        });

        // If the value ends with '!', add '!important' to the value
        if (value.endsWith('!')) {
            value = value.slice(0, -1) + ' !important';
        }

        // If the value ends with ';', remove the semicolon
        if (value.endsWith(';')) {
            value = value.slice(0, -1);
        }

        // Set soulClassObject.valuesString to value
        soulClassObject.valuesString = value;
    }


    function processModProperty(modProperty, soulClassObject) {
        // Set soulClassObject.modPropertyString to modProperty
        soulClassObject.modPropertyString = modProperty;

        // Process the modProperty string. If it has no colons, send it to processProperty as it's either a verbatim CSS property or a shorthand like 'px.'
        // If it has colons, split it by its last colon; the rightmost string will be the property that we send to processProperties,
        // and the rest of the split will get sent to processModifiers.
        if (modProperty.indexOf(':') === -1) {
            processProperties(modProperty, soulClassObject);
        } else {
            var lastColonIndex = modProperty.lastIndexOf(':');
            var property = modProperty.substring(lastColonIndex + 1);
            var modifiers = modProperty.substring(0, lastColonIndex);
            processProperties(property, soulClassObject);
            processModifiers(modifiers, soulClassObject);
        }
    }

    function processProperties(property, soulClassObject) {
        // Initialize declarations array if it doesn't exist
        soulClassObject.declarations = soulClassObject.declarations || [];

        // Case 1: property is an abbreviation
        if (property in propertyMap) {
            soulClassObject.declarations.push({ property: propertyMap[property], value: soulClassObject.valuesString });
        }
        // Case 2: property is a CSS property
        else if (CSS.supports(property, "initial")) {
            soulClassObject.declarations.push({ property: property, value: soulClassObject.valuesString });
        }
        // Case 3: property is a function
        else if (property in functionMap) {
            functionMap[property].forEach(function (prop) {
                soulClassObject.declarations.push({ property: prop, value: soulClassObject.valuesString });
            });
        }

        // Set soulClassObject.propertyString to property
        soulClassObject.propertiesString = property;
    }

    function processModifiers(modifiers, soulClassObject) {
        // Split the modifiers string into an array and reverse it
        soulClassObject.modifiersArray = modifiers.split(':').reverse();

        // Populate prepCSSRule based on the modifiers
        soulClassObject.modifiersArray.forEach(function (modifier) {
            if (modifier === 'hover') {
                soulClassObject.prepCSSRule.selector += ':hover';
            } else if (modifier === 'before') {
                soulClassObject.prepCSSRule.selector += '::before';
            } else if (modifier === 'after') {
                soulClassObject.prepCSSRule.selector += '::after';
            } else if (breakpoints[modifier]) {
                soulClassObject.prepCSSRule.openingMediaQueryString = '@media(min-width:' + breakpoints[modifier] + '){';
                soulClassObject.prepCSSRule.closingMediaQueryString = '}';
            }
            // Add more modifiers here as needed
        });

        // Set soulClassObject.modifiersString to modifiers
        soulClassObject.modifiersString = modifiers;
    }


    function buildCSSRule(soulClassObject) {
        // Start with the opening media query string
        var cssRule = soulClassObject.prepCSSRule.openingMediaQueryString;

        // Add the selector and an opening curly brace
        cssRule += soulClassObject.prepCSSRule.selector + " {\n";

        // For each declaration, add a line with the property and value
        soulClassObject.declarations.forEach(function (declaration) {
            cssRule += "    " + declaration.property + ": " + declaration.value + ";\n";
        });

        // Add a closing curly brace and the closing media query string
        cssRule += "}\n" + soulClassObject.prepCSSRule.closingMediaQueryString;

        // Return the CSS rule
        return cssRule;
    }


    //this function extracts classes from the HTML string we pass it. We store these classes on window.soulclasses, then process them.
    function extractClassesToObjects(htmlString) {
        // Regular expression to match class attributes
        var regex = /class="([^"]*)"/gi;

        // Match the regular expression against the HTML string
        var matches = [], match;
        while (match = regex.exec(htmlString)) {
            matches.push(match[1]);
        }

        // Split the class names into individual classes
        var classList = matches.flatMap(function (className) {
            return className.split(' ');
        });

        // Remove duplicates and empty strings
        var uniqueClasses = [...new Set(classList)].filter(Boolean);

        // Filter to only keep classes that contain a colon
        var colonClasses = uniqueClasses.filter(function (className) {
            return className.includes(':');
        });

        // Convert the array of strings to an array of objects
        var classObjects = colonClasses.map(function (className) {
            return { className: className };
        });

        return classObjects;
    }

})(jQuery);
