(function ($) {
    function refresh() {
        console.clear();
        var input = document.getElementById('editor1').value;

        // Split the input into individual classes and trim each class
        var classes = input.split(' ').map(function (className) {
            return className.trim();
        });

        // Process each class
        var output = classes.map(function (className) {
            // Process the class and return the output
            return window.processSoulClass(className);
        }).join('\n'); // Join the output with newlines

        // Beautify the CSS
        var beautifiedOutput = css_beautify(output);

        document.getElementById('editor2').value = beautifiedOutput;
    }

    // Call refresh on page load
    refresh();

    // Call refresh whenever the first editor's content changes
    $('#editor1').on('input', refresh);
})(jQuery);
