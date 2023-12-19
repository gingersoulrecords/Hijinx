(function ($) {

    // Create an empty soulclasses array on the window object
    window.soulclass = {};


    function processSoulClass(input) {
        // Create a new object with the input and its escaped version
        var newSoulClass = {
            className: input,
            escapedClassName: input.replace(/[:]/g, '\\:')
        };

        // Store the new object in window.soulclass
        window.soulclass = newSoulClass;

        console.log(window.soulclass);

        // Return the input for now
        return input;
    }
    //REFRESHING

    function refresh() {
        var input = $('#editor1').val();
        var output = processSoulClass(input);
        $('#editor2').val(output);
    }
    // Call refresh on page load
    refresh();

    // Call refresh whenever the first editor's content changes
    $('#editor1').on('input', refresh);


})(jQuery);
