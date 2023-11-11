(function ($) {
    var hijinx = {
        whens: [],
        sets: [],
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
                if (statement.tag === 'select-all' || statement.tag === 'set') {
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
        processStatements: function (statements) {
            // Process the statements and return the result
            // This function needs to be implemented
        },
        processTargets: function (statement, statementElement) {
            var targets = [];
            // Case 1: 'targets' attribute on a <select-all> tag
            var targetsAttr = statement.attributes.find(attr => attr.name === 'targets');
            if (targetsAttr) {
                $(targetsAttr.value).each((_, element) => {
                    targets.push(this.processStatements($(element).children()));
                });
            }
            // Case 2: innertext value of a <targets> child of a <select-all> tag
            var targetsChild = statement.children.find(child => child.tag === 'targets');
            if (targetsChild && (!targetsChild.children || !targetsChild.children.length)) {
                targets.push($(statementElement.find('targets').text()));
            }
            // Case 3: jQuery product of a <targets> child's 'foreach' attribute
            if (targetsChild && targetsChild.attributes) {
                var foreachAttr = targetsChild.attributes.find(attr => attr.name === 'for-each');
                if (foreachAttr) {
                    $(foreachAttr.value).each((_, element) => {
                        var target = $(element);
                        targetsChild.children.forEach(child => {
                            target = target[child.tag](child.text);
                        });
                        targets.push(target);
                    });
                }
            }

            // If the statement is a 'set' tag, store the targets in hijinx.sets
            if (statement.tag === 'set') {
                var selectAllChild = statement.children.find(child => child.tag === 'select-all');
                if (selectAllChild) {
                    targets = this.processTargets(selectAllChild, $(selectAllChild.children));
                }
                var setName = statement.attributes.find(attr => attr.name === 'name').value;
                this.sets[setName] = targets;
            }
            return targets;
        }
    };

    window.hijinx = hijinx;

    // Call the indexWhens method when the window has loaded
    $(window).on('load', function () {
        hijinx.indexWhens();
        //hijinx.processSets();
        console.log('hijinx:', hijinx);
    });
})(jQuery);


// @codekit-prepend "hijinx.js";
