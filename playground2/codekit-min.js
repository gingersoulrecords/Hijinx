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
        processSets: function () {
            this.whens.forEach(when => {
                when.statements.forEach(statement => {
                    if (statement.tag === 'set') {
                        var setName = statement.attributes.find(attr => attr.name === 'name').value;
                        var setValue = this.processStatements($(statement.children));
                        this.sets.push({ name: setName, value: setValue });
                    }
                });
            });
        },
        processStatements: function (statements) {
            // Process the statements and return the result
            // This function needs to be implemented
        },
        processTargets: function (statement, statementElement) {
            var targets;
            // Case 1: 'targets' attribute on a <select-all> tag
            var targetsAttr = statement.attributes.find(attr => attr.name === 'targets');
            if (targetsAttr) {
                targets = $(targetsAttr.value);
                if (targets.length === 0) {
                    console.log(`Warning: No elements found for selector "${targetsAttr.value}" in <select-all> tag's "targets" attribute.`);
                } else {
                    console.log('case 1: targets =', targets);
                }
            }
            // Case 2: innertext value of a <targets> child of a <select-all> tag
            var targetsChild = statement.children.find(child => child.tag === 'targets');
            if (targetsChild && (!targetsChild.children || !targetsChild.children.length)) {
                targets = $(statementElement.find('targets').text());
                if (targets.length === 0) {
                    console.log(`Warning: No elements found for selector "${targetsChild.text}" in <targets> child tag.`);
                } else {
                    console.log('case 2: targets =', targets);
                }
            }
            // Case 3: jQuery product of a <targets> child's 'select-all' attribute
            if (targetsChild && targetsChild.attributes) {
                var selectAllAttr = targetsChild.attributes.find(attr => attr.name === 'select-all');
                if (selectAllAttr) {
                    targets = $(selectAllAttr.value);
                    targetsChild.children.forEach(child => {
                        targets = targets[child.tag](child.text);
                    });
                    if (targets.length === 0) {
                        console.log(`Warning: No elements found for selector "${selectAllAttr.value}" in <targets> child tag's "select-all" attribute.`);
                    } else {
                        console.log('case 3: targets =', targets);
                    }
                }
            }
            return targets;
        }
    };

    window.hijinx = hijinx;

    // Call the indexWhens method when the window has loaded
    $(window).on('load', function () {
        hijinx.indexWhens();
        hijinx.processSets();
        console.log('hijinx:', hijinx);
    });
})(jQuery);


// @codekit-prepend "hijinx.js";
