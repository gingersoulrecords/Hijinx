(function ($) {
    var hijinx = {
        whens: [],
        sets: [],
        indexWhens: function () {
            return new Promise((resolve, reject) => {
                var whenElements = $('when');
                whenElements.each((_, whenElement) => {
                    var when = {
                        event: $(whenElement).attr('event'),
                        media: $(whenElement).attr('media'),
                        statements: this.indexStatements($(whenElement))
                    };
                    hijinx.whens.push(when);
                });
                resolve();
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

        processWhens: function () {
            return new Promise((resolve, reject) => {
                this.whens.forEach((when, index) => {
                    if (when.media) {
                        enquire.register(when.media, {
                            match: () => {
                                console.log(`When element ${index + 1} has been processed.`);
                                this.processStatements(when.statements, index);
                            },
                            unmatch: () => {
                                console.log(`When element ${index + 1} has been unprocessed.`);
                                $(`.when-${index}`).off('click.hijinx').removeClass(`when-${index}`);
                            }
                        });
                    } else {
                        console.log(`When element ${index + 1} has been processed.`);
                        this.processStatements(when.statements, index);
                    }
                });
                resolve();
            });
        },
        // processStatements: function (statements, whenIndex) {
        //     statements.forEach(statement => {
        //         switch (statement.tag) {
        //             case 'select-all':
        //                 var targets = statement.targets;
        //                 statement.children.forEach(child => {
        //                     if (child.tag === 'css') {
        //                         this.processCssStatement(child, targets);
        //                     } else if (child.tag === 'attr') {
        //                         this.processAttrStatement(child, targets);
        //                     } else if (child.tag === 'add-class') {
        //                         this.processAddClassStatement(child, targets);
        //                     }
        //                     // ... handle other child statement types ...
        //                 });
        //                 break;
        //             // ... handle other statement types ...
        //         }
        //     });
        // },

        processStatements: function (statements, whenIndex) {
            statements.forEach(statement => {
                switch (statement.tag) {
                    case 'select-all':
                        var targets = statement.targets;
                        statement.children.forEach(child => {
                            if (child.tag === 'css') {
                                this.processCssStatement(child, targets);
                            } else if (child.tag === 'attr') {
                                this.processAttrStatement(child, targets);
                            } else if (child.tag === 'add-class') {
                                this.processAddClassStatement(child, targets);
                            } else if (child.tag === 'on-click') {
                                this.processOnClickStatement(child, targets, whenIndex);
                            }
                            // ... handle other child statement types ...
                        });
                        break;
                    // ... handle other statement types ...
                }
            });
        },

        processOnClickStatement: function (statement, targets, whenIndex) {
            targets.forEach(target => {
                $(target).addClass(`when-${whenIndex}`).on('click.hijinx', () => {
                    console.log('Element clicked');
                    this.processStatements(statement.children, whenIndex);
                });
            });
        },

        processAddClassStatement: function (statement, targets) {
            var className = statement.text;
            targets.forEach(target => {
                $(target).addClass(className);
            });
        },
        processAttrStatement: function (statement, targets) {
            var attrProperties = {};
            statement.children.forEach(child => {
                attrProperties[child.tag] = child.text;
            });
            targets.forEach(target => {
                for (var attr in attrProperties) {
                    $(target).attr(attr, attrProperties[attr]);
                }
            });
        },
        processCssStatement: function (statement, targets) {
            var cssProperties = {};
            statement.children.forEach(child => {
                cssProperties[child.tag] = child.text;
            });
            targets.forEach(target => {
                $(target).css(cssProperties);
            });
        },
        processTargets: function (statement, statementElement) {
            var targets = [];
            // Case 1: 'targets' attribute on a <select-all> tag
            var targetsAttr = statement.attributes.find(attr => attr.name === 'targets');
            if (targetsAttr) {
                $(targetsAttr.value).each((_, element) => {
                    targets.push($(element));
                });
            }
            // Case 2: innertext value of a <targets> child of a <select-all> tag
            var targetsChild = statement.children.find(child => child.tag === 'targets');
            if (targetsChild && (!targetsChild.children || !targetsChild.children.length)) {
                targets.push($(statementElement.children('targets').text()));
            }
            // Case 3: jQuery product of a <targets> child's 'foreach' attribute
            if (targetsChild && targetsChild.attributes) {
                var eachAttr = targetsChild.attributes.find(attr => attr.name === 'each');
                if (eachAttr) {
                    $(eachAttr.value).each((_, element) => {
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
        },
        // refresh: function () {
        //     Promise.all([this.indexWhens(), this.processWhens()]).then(() => {
        //         console.log('indexWhens and processWhens have finished processing');
        //     });
        // }
        refresh: function () {
            // Unbind all events that were bound by hijinx and remove the class
            $('[class^="when-"]').each(function () {
                $(this).off('click.hijinx').removeClass(function (index, className) {
                    return (className.match(/(^|\s)when-\S+/g) || []).join(' ');
                });
            });

            // Clear the whens array
            this.whens = [];

            // Re-bind the events per the HTML
            Promise.all([this.indexWhens(), this.processWhens()]).then(() => {
                console.log('indexWhens and processWhens have finished processing');
            });
        }
    };

    window.hijinx = hijinx;

    // Call the indexWhens method when the window has loaded
    $(window).on('load', function () {
        hijinx.refresh();
        console.log('hijinx:', hijinx);
    });
})(jQuery);


// @codekit-prepend "hijinx.js";
