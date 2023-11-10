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
                    tag: statementElement.tagName.toLowerCase(),
                    attributes: Array.from(statementElement.attributes).map(attr => ({ name: attr.name, value: attr.value })),
                    children: this.indexStatements($(statementElement))
                };
                if (statement.tag === 'select-all') {
                    statement.targets = this.processTargets(statement, $(statementElement));
                }
                if (statement.children.length === 0) {
                    delete statement.children;
                } else {
                    statement.children = statement.children.map(child => {
                        child.text = $(statementElement).find(child.tag).text();
                        return child;
                    });
                }
                statements.push(statement);
            });
            return statements;
        },

        processTargets: function (statement, statementElement) {
            var targets;
            // Case 1: 'targets' attribute on a <select-all> tag
            var targetsAttr = statement.attributes.find(attr => attr.name === 'targets');
            if (targetsAttr) {
                targets = $(targetsAttr.value);
            }
            // Case 2: innertext value of a <targets> child of a <select-all> tag
            var targetsChild = statement.children.find(child => child.tag === 'targets');
            if (targetsChild) {
                targets = $(targetsChild.text);
            }
            // Case 3: jQuery product of a <targets> child's 'select-all' attribute
            if (targetsChild && targetsChild.attributes) {
                var selectAllAttr = targetsChild.attributes.find(attr => attr.name === 'select-all');
                if (selectAllAttr) {
                    targets = $(selectAllAttr.value);
                    targetsChild.children.forEach(child => {
                        targets = targets[child.tag](child.text);
                    });
                }
            }
            return targets;
        }
    };

    // Call the indexWhens method when the window has loaded
    $(window).on('load', function () {
        hijinx.indexWhens();
        console.log('hijinx:', hijinx);
    });
})(jQuery);
