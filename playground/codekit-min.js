// hijinx.js
var hijinx = {
    whens: [],
    // Updated processTargets function using Arrive.js
    processTargets: function (selector, callback) {
        // Set up Arrive.js on the document for the given selector
        jQuery(document).arrive(selector, { existing: true }, function () {
            // Call the callback function passing the newly arrived or existing element
            callback(jQuery(this));
        });
    },
    refresh: function () {
        // Clear the current state
        this.whens = [];

        // Unbind any existing Arrive.js listeners to prevent duplicates
        jQuery(document).unbindArrive();

        // Process <when> tags again
        this.init();
    },
    init: function () { // the init function will now only be responsible for initializing the when processing
        // You will need to invoke the process when you defined in the init.js
        // Assuming processWhen is a method defined elsewhere and attached to hijinx
        jQuery('when').each((index, element) => {
            this.processWhen(jQuery(element), index);
        });
    }
};

// Expose the hijinx object to the global scope
window.hijinx = hijinx;


// processWhen.js
(function ($) {
    console.log('Setting up processWhen function.');

    // Attach processWhen to the hijinx object
    hijinx.processWhen = function (whenTag, index) {
        console.log('Processing <when> tag at index:', index);

        var event = whenTag.attr('event');
        console.log('Event type found:', event);

        // Initialize the selectAlls array inside the when object
        var whenObject = {
            index: index,
            event: event,
            element: whenTag,
            selectAlls: [] // This will store the select-all details for this when tag
        };

        this.whens.push(whenObject);

        console.log('Current state of hijinx.whens:', this.whens);

        // Return the when object for further processing
        return whenObject;
    };

})(jQuery);

console.log('processWhen function ready.');


// processSelectAll.js
(function ($) {
    console.log('Setting up processSelectAll function.');

    hijinx.processSelectAll = function (selectAllTag, whenObject) {
        console.log('Processing <select-all> tag.');

        var targetsTag = selectAllTag.find('targets');
        var selector;
        var $elements;

        // If targets attribute exists, use it as the selector
        if (selectAllTag.attr('targets')) {
            selector = selectAllTag.attr('targets');
            $elements = $(selector);
        }
        // If targets tag exists
        else if (targetsTag.length > 0) {
            // If targets tag has children, process them
            if (targetsTag.children().length > 0) {
                $elements = this.processTargets(targetsTag);
            }
            // If targets tag has no children, use its text as the selector
            else {
                selector = targetsTag.text();
                $elements = $(selector);
            }
        }

        console.log('Selector found:', selector);

        // Create an object to represent this <select-all> and its targets
        var selectAllObject = {
            selector: selector,
            targets: $elements, // This will now be the jQuery object for the arrived or existing elements
            element: selectAllTag
        };

        // Process the children (jQuery methods) of the <select-all> tag
        hijinx.processChildren(selectAllObject);

        // Store the selectAllObject in the whenObject's selectAlls array
        whenObject.selectAlls.push(selectAllObject);
        console.log('Processed <select-all> with selector:', selector);
    };

    hijinx.processTargets = function (targetsTag) {
        console.log('Processing children of <targets> tag:', targetsTag);

        var $elements;

        // If select-all attribute exists, use it as the initial selector
        if (targetsTag.attr('select-all')) {
            $elements = $(targetsTag.attr('select-all'));
        } else {
            $elements = $(targetsTag.text());
        }

        // Loop through the children of the <targets> element
        targetsTag.children().each(function () {
            var $child = $(this);
            var method = $child.prop('tagName').toLowerCase(); // Get the method name
            var args = $child.text(); // Get the argument

            // Now apply the jQuery method to the targets
            switch (method) {
                case 'prev':
                    $elements = $elements.prev(args);
                    console.log('Applied prev to elements:', args);
                    break;
                // Add more cases for other jQuery methods as needed
                default:
                    console.log('Unknown method:', method);
                    break;
            }
        });

        return $elements;
    };

})(jQuery);

console.log('processSelectAll function ready.');


// processChildren.js
(function ($) {
    console.log('Setting up processChildren function.');

    hijinx.processChildren = function (selectAllObject) {
        console.log('Processing children of <select-all> tag:', selectAllObject.element);

        // Loop through the children of the <select-all> element
        selectAllObject.element.children().each(function () {
            var $child = $(this);
            var method = $child.prop('tagName').toLowerCase(); // Get the method name
            var args = {};

            // Loop through the children of this method element and form the arguments object
            $child.children().each(function () {
                var argName = $(this).prop('tagName').toLowerCase();
                var argValue = $(this).text();
                args[argName] = argValue;
            });

            // Now apply the jQuery method to the targets
            // We need to handle different jQuery methods accordingly
            switch (method) {
                case 'css':
                    let cssString = "";
                    $.each(args, function (prop, value) {
                        cssString += `${prop}: ${value};`;
                    });
                    selectAllObject.targets.attr({
                        "x-data": `{ style: "${cssString}" }`,
                        "x-bind:style": "style"
                    });
                    console.log('Applied CSS to elements:', cssString);
                    break;
                case 'attr':
                    // Assuming each child of <attr> represents an attribute
                    $.each(args, function (name, value) {
                        selectAllObject.targets.attr(name, value);
                    });
                    console.log('Applied attributes to elements:', args);
                    break;
                case 'add-class':
                    var className = $child.text();
                    selectAllObject.targets.attr({
                        "x-data": `{ addClass: "${className}" }`,
                        "x-bind:class": "addClass"
                    });
                    console.log('Added class to elements:', className);
                    break;
                // Add more cases for other jQuery methods as needed
                default:
                    console.log('Unknown method:', method);
                    break;
            }
        });
    };

})(jQuery);

console.log('processChildren function ready.');


// init.js
(function ($) {
    console.log('Attaching init method to hijinx.');

    // Extend hijinx.init to process select-all tags inside whens
    hijinx.init = function () {
        console.log('Initializing hijinx.');

        var self = this;
        // Process each 'when' tag in the DOM
        $('when').each(function (whenIndex) {
            console.log('Found <when> tag:', this);

            // Process the when tag and get the whenObject for further processing
            var whenObject = self.processWhen($(this), whenIndex);

            // Process each 'select-all' tag within this 'when' tag
            $(this).find('select-all').each(function () {
                console.log('Found <select-all> tag:', this);

                // Pass the whenObject to the processSelectAll function
                self.processSelectAll($(this), whenObject);
            });
        });

        console.log('hijinx initialization complete.');
    };

    // Document ready
    $(document).ready(function () {
        console.log('Document is ready. Starting hijinx.init().');
        hijinx.init();
    });

})(jQuery);

console.log('init.js loaded and ready to initialize hijinx when document is ready.');


// @codekit-prepend "hijinx.js";
// @codekit-prepend "processWhen.js";
// @codekit-prepend "processSelectAll.js";
// @codekit-prepend "processChildren.js";
// @codekit-prepend "init.js";
