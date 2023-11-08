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
