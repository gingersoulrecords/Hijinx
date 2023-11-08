// processSelectAll.js
(function ($) {
    console.log('Setting up processSelectAll function.');

    hijinx.processSelectAll = function (selectAllTag, whenObject) {
        console.log('Processing <select-all> tag.');

        // Find the selector for the current <select-all> tag
        var selector = selectAllTag.attr('targets') || selectAllTag.find('targets').text();
        console.log('Selector found:', selector);

        // Call processTargets and pass a callback function to handle the elements
        hijinx.processTargets(selector, function ($elements) {
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
        });
    };

})(jQuery);

console.log('processSelectAll function ready.');
