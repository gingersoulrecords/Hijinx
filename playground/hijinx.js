// hijinx.js
var hijinx = {
    whens: [],
    // Updated processTargets function using Arrive.js
    processTargets: function (selector, callback) {
        console.log('Setting up Arrive.js for selector:', selector);

        // Set up Arrive.js on the document for the given selector
        jQuery(document).arrive(selector, { existing: true }, function () {
            console.log('Element arrived or already exists in the DOM:', this);

            // Call the callback function passing the newly arrived or existing element
            callback(jQuery(this));
        });
    },
    refresh: function () {
        console.log('Refreshing hijinx.');

        // Clear the current state
        this.whens = [];

        // Unbind any existing Arrive.js listeners to prevent duplicates
        jQuery(document).unbindArrive();

        // Process <when> tags again
        this.init();
    },
    init: function () { // the init function will now only be responsible for initializing the when processing
        console.log('Initializing hijinx.');

        // You will need to invoke the process when you defined in the init.js
        // Assuming processWhen is a method defined elsewhere and attached to hijinx
        jQuery('when').each((index, element) => {
            this.processWhen(jQuery(element), index);
        });
    }
};

// Expose the hijinx object to the global scope
window.hijinx = hijinx;

console.log('hijinx core loaded.');
