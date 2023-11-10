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
