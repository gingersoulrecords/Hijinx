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
