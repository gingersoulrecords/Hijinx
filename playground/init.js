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
