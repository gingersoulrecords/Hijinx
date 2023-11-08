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
                    selectAllObject.targets.css(args);
                    console.log('Applied CSS to elements:', args);
                    break;
                case 'attr':
                    // Assuming each child of <attr> represents an attribute
                    $.each(args, function (name, value) {
                        selectAllObject.targets.attr(name, value);
                    });
                    console.log('Applied attributes to elements:', args);
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
