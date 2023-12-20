(function ($) {

    // Create an empty soulclasses array on the window object
    window.soulclass = {};

    //////////////////////////////////////////////////

    function processSoulClass(input) {

        //store the classname
        window.soulclass.className = input;

        //store the escaped classname
        window.soulclass.escapedClassName = '.' + input.replace(/[:]/g, '\\:');

        // Initialize prepCSSRule
        window.soulclass.prepCSSRule = {
            selector: window.soulclass.escapedClassName,
            openingMediaQueryString: '',
            closingMediaQueryString: ''
        };

        //split the classname into values, properties, and modifiers
        splitClassIntoValuesPropertiesAndModifiers(input);

        //log the window.soulclass to see its data
        console.log(JSON.stringify(window.soulclass, null, 4));

        // Build the CSS rule and return it
        return buildCSSRule();
    }


    //////////////////////////////////////////////////

    function splitClassIntoValuesPropertiesAndModifiers(className) {
        var lastColonIndex = className.lastIndexOf(':');
        var modProperty = className.substring(0, lastColonIndex);
        var value = className.substring(lastColonIndex + 1);

        //send value to processValues
        processValues(value);

        // send modProperty to  processModifiers
        processModProperty(modProperty);


    }

    function processModProperty(modProperty) {
        //set window.soulclass.modifiersString to modProperty
        window.soulclass.modPropertyString = modProperty;

        //processModProperty is a function that will look at the modProperty string. If it has no colons, send it to processProperty as it's either a verbatim CSS property or a shorthand like 'px.' If it has colons, split it by its last colon; the rightmost string will be the property that we send to processProperties, and the rest of the split will get sent to processModifiers.
        if (modProperty.indexOf(':') === -1) {
            processProperties(modProperty);
        } else {
            var lastColonIndex = modProperty.lastIndexOf(':');
            var property = modProperty.substring(lastColonIndex + 1);
            var modifiers = modProperty.substring(0, lastColonIndex);
            processProperties(property);
            processModifiers(modifiers);
        }

    }

    function processModifiers(modifiers) {
        // Split the modifiers string into an array and reverse it
        window.soulclass.modifiersArray = modifiers.split(':').reverse();

        // Populate prepCSSRule based on the modifiers
        window.soulclass.modifiersArray.forEach(function (modifier) {
            if (modifier === 'hover') {
                window.soulclass.prepCSSRule.selector += ':hover';
            } else if (modifier === 'md') {
                window.soulclass.prepCSSRule.openingMediaQueryString = '@media(min-width:768px){';
                window.soulclass.prepCSSRule.closingMediaQueryString = '}';
            }
            // Add more modifiers here as needed
        });

        //set window.soulclass.modifiersString to modifiers
        window.soulclass.modifiersString = modifiers;
    }

    // Mapping of abbreviations to CSS properties
    var propertyMap = {
        'bg': 'background',
        // Add more mappings here as needed
    };

    // Mapping of functions to CSS properties
    var functionMap = {
        'px': ['padding-left', 'padding-right'],
        // Add more mappings here as needed
    };

    function processProperties(property) {
        // Initialize declarations array if it doesn't exist
        window.soulclass.declarations = window.soulclass.declarations || [];

        // Case 1: property is a CSS property
        if (CSS.supports(property, "initial")) {
            window.soulclass.declarations.push({ property: property, value: window.soulclass.valuesString });
        }
        // Case 2: property is an abbreviation
        else if (property in propertyMap) {
            window.soulclass.declarations.push({ property: propertyMap[property], value: window.soulclass.valuesString });
        }
        // Case 3: property is a function
        else if (property in functionMap) {
            functionMap[property].forEach(function (prop) {
                window.soulclass.declarations.push({ property: prop, value: window.soulclass.valuesString });
            });
        }

        //set window.soulclass.propertyString to property
        window.soulclass.propertiesString = property;
    }

    function processValues(value) {

        //replace understores with spaces
        value = value.replace(/[_]/g, ' ');


        //set window.soulclass.valuesString to value
        window.soulclass.valuesString = value;
    }

    function buildCSSRule() {
        // Start with the escaped class name
        var cssRule = window.soulclass.escapedClassName;

        // For each modifier, add it to the class name
        window.soulclass.modifiersArray.forEach(function (modifier) {
            if (modifier === 'hover') {
                cssRule += ':hover';
            }
            // Add more modifiers here as needed
        });

        // Add an opening curly brace
        cssRule += " {\n";

        // For each declaration, add a line with the property and value
        window.soulclass.declarations.forEach(function (declaration) {
            cssRule += "    " + declaration.property + ": " + declaration.value + ";\n";
        });

        // Add a closing curly brace
        cssRule += "}\n";

        // If 'md' modifier is present, wrap the CSS rule in a media query
        window.soulclass.modifiersArray.forEach(function (modifier) {
            if (modifier === 'md') {
                cssRule = "@media(min-width:768px){\n" + cssRule + "}\n";
            }
            // Add more modifiers here as needed
        });

        // Return the CSS rule
        return cssRule;
    }

    function buildCSSRule() {
        // Start with the opening media query string
        var cssRule = window.soulclass.prepCSSRule.openingMediaQueryString;

        // Add the selector and an opening curly brace
        cssRule += window.soulclass.prepCSSRule.selector + " {\n";

        // For each declaration, add a line with the property and value
        window.soulclass.declarations.forEach(function (declaration) {
            cssRule += "    " + declaration.property + ": " + declaration.value + ";\n";
        });

        // Add a closing curly brace and the closing media query string
        cssRule += "}\n" + window.soulclass.prepCSSRule.closingMediaQueryString;

        // Return the CSS rule
        return cssRule;
    }





    //REFRESHING

    function refresh() {
        console.clear();
        window.soulclass = {};
        var input = $('#editor1').val();
        var output = processSoulClass(input);

        // Beautify the CSS
        var beautifiedOutput = css_beautify(output);

        $('#editor2').val(beautifiedOutput);
    }
    // Call refresh on page load
    refresh();

    // Call refresh whenever the first editor's content changes
    $('#editor1').on('input', refresh);


})(jQuery);
