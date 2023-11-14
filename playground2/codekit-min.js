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
                                //console.log(`When element ${index + 1} has been processed.`);
                                this.processStatements(when.statements, index);
                            },
                            unmatch: () => {
                                //console.log(`When element ${index + 1} has been unprocessed.`);
                                $(`.when-${index}`).off('click.hijinx').removeClass(`when-${index}`);
                            }
                        });
                    } else {
                        //console.log(`When element ${index + 1} has been processed.`);
                        this.processStatements(when.statements, index);
                    }
                });
                resolve();
            });
        },
        init: function () {
            this.tagHandlers = {
                'css': this.processCssStatement.bind(this),
                'attr': this.processAttrStatement.bind(this),
                'add-class': this.processAddClassStatement.bind(this),
                'on-click': this.processOnClickStatement.bind(this),
                'insert-after': this.processInsertAfterStatement.bind(this),
                'match-height': this.processMatchHeightStatement.bind(this),
                'show': this.processShowStatement.bind(this),
                'hide': this.processHideStatement.bind(this),

                // ... add handlers for other tags here ...
            };
        },

        processStatements: function (statements, whenIndex) {
            statements.forEach(statement => {
                if (statement.tag === 'select-all') {
                    var targets = statement.targets;
                    statement.children.forEach(child => {
                        // Get the handler for the current tag
                        var handler = this.tagHandlers[child.tag];
                        if (handler) {
                            // Call the handler with the necessary arguments
                            handler(child, targets, whenIndex);
                        }
                    });
                }
                // ... handle other statement types ...
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
        processInsertAfterStatement: function (statement, targets) {
            var insertAfterTargets = statement.children.find(child => child.tag === 'select-all').targets;
            targets.forEach(target => {
                insertAfterTargets.forEach(insertAfterTarget => {
                    $(target).insertAfter(insertAfterTarget);
                });
            });
        },
        processMatchHeightStatement: function (statement, targets, whenIndex) {
            if (statement.targetsSelector) {
                $(statement.targetsSelector).matchHeight();
            }
        },
        processOnClickStatement: function (statement, targets, whenIndex) {
            targets.forEach(target => {
                $(target).addClass(`when-${whenIndex}`).on('click.hijinx', () => {
                    console.log('Element clicked');
                    console.log(statement.children);

                    this.processStatements(statement.children, whenIndex);
                });
            });
        },
        processShowStatement: function (statement, targets) {
            targets.forEach(target => {
                $(target).show();
            });
        },

        processHideStatement: function (statement, targets) {
            targets.forEach(target => {
                $(target).hide();
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
                statement.targetsSelector = targetsAttr.value;
                statement.children.forEach(child => {
                    child.targetsSelector = targetsAttr.value;
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
        refresh: function () {
            console.time("Processing time");

            // Initialize tagHandlers
            this.init();

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
                console.timeEnd("Processing time");
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
