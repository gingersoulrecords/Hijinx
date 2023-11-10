(function ($) {
    var hijinx = {
        whens: [],
        indexWhens: function () {
            var whenElements = $('when');
            whenElements.each((_, whenElement) => {
                var when = {
                    event: $(whenElement).attr('event'),
                    media: $(whenElement).attr('media'),
                    statements: this.indexStatements($(whenElement))
                };
                hijinx.whens.push(when);
            });
        },
        indexStatements: function (parentElement) {
            var statements = [];
            parentElement.children().each((_, statementElement) => {
                var statement = {
                    type: statementElement.tagName.toLowerCase()
                };
                statements.push(statement);
            });
            return statements;
        }
    };

    // Call the indexWhens method when the window has loaded
    $(window).on('load', function () {
        hijinx.indexWhens();
        console.log('hijinx:', hijinx);
    });
})(jQuery);


// @codekit-prepend "hijinx.js";
