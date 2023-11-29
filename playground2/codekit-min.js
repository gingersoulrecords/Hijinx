//Notes

//for dynamic selectors, you have to loop through the elements and apply the selector to each one. That's why we have to use the 'each' method.

//for simple selectors, you can just use the selector as is and leverage jQuery's ability to apply the selector to all elements that match it.

//use the index as your selector guide in situations where a target doesn't have children.

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
                        child.text = $(statementElement).find(child.tag).text().trim(); // Trim the text here
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
                'add-class': this.processAddClassStatement.bind(this),
                'append-to': this.processAppendToStatement.bind(this),
                'attr': this.processAttrStatement.bind(this),
                'css': this.processCssStatement.bind(this),
                'hide': this.processHideStatement.bind(this),
                'insert-after': this.processInsertAfterStatement.bind(this),
                //'insert-before': this.processInsertBeforeStatement.bind(this),
                'match-height': this.processMatchHeightStatement.bind(this),
                'on-click': this.processOnClickStatement.bind(this),
                'show': this.processShowStatement.bind(this),
                'store': this.processStoreStatement.bind(this),
                'if': this.processIfStatement.bind(this),

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
                } else if (statement.tag === 'store') {
                    // Get the handler for the 'store' tag
                    var handler = this.tagHandlers[statement.tag];
                    if (handler) {
                        // Call the handler with the necessary arguments
                        handler(statement, [], whenIndex);
                    }
                } else if (statement.tag === 'if') {
                    // Get the handler for the 'if' tag
                    var handler = this.tagHandlers[statement.tag];
                    if (handler) {
                        // Call the handler with the necessary arguments
                        handler(statement, [], whenIndex);
                    }
                }
                // ... handle other statement types ...
            });
        },
        processAddClassStatement: function (statement, targets) {
            var className = statement.text;
            targets.addClass(className);
        },
        processAppendToStatement: function (statement, targets) {
            var appendToTargets;
            if (statement.children.length > 0) {
                appendToTargets = statement.children.find(child => child.tag === 'select-all').targets;
            } else {
                appendToTargets = $(statement.text);
            }
            targets.forEach(target => {
                appendToTargets.forEach(appendToTarget => {
                    $(target).appendTo(appendToTarget);
                });
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
        // processCssStatement: function (statement, targets) {
        //     console.log('targets ', targets);

        //     var cssProperties = {};
        //     statement.children.forEach(child => {
        //         cssProperties[child.tag] = child.text;
        //     });
        //     targets.forEach(target => {
        //         $(target).css(cssProperties);
        //     });
        // },
        processCssStatement: function (statement, targets) {
            console.log('targets ', targets);

            var cssProperties = {};
            statement.children.forEach(child => {
                cssProperties[child.tag] = child.text;
            });
            targets.css(cssProperties);
        },
        processHideStatement: function (statement, targets) {
            targets.forEach(target => {
                $(target).hide();
            });
        },
        processIfStatement: function (statement, targets, whenIndex) {
            // Get the value to compare it to
            var value = statement.attributes.find(attr => attr.name === 'value').value;
            console.log('Value to compare:', value);
            // Check if the condition is true
            var condition = false;
            var storeAttr = statement.attributes.find(attr => attr.name === 'store');
            var setAttr = statement.attributes.find(attr => attr.name === 'set');
            if (storeAttr) {
                console.log('Checking store:', storeAttr.value);
                condition = store.get(storeAttr.value) === value;
                console.log('Store condition:', condition);
            } else if (setAttr) {
                console.log('Checking set:', setAttr.value);
                condition = this.sets[setAttr.value] === value;
                console.log('Set condition:', condition);
            }
            if (condition) {
                console.log('Condition is true, processing children...');
                // If the condition is true, process the children of the 'if' tag
                this.processStatements(statement.children, whenIndex);
            } else {
                console.log('Condition is false, not processing children.');
            }
        },
        processInsertAfterStatement: function (statement, targets) {
            console.log('targets', targets);
            console.log('statement', statement);
            console.log('statement.children', statement.children);
            var insertAfterTargets;
            if (statement.children && statement.children.length > 0) {
                insertAfterTargets = statement.children.find(child => child.tag === 'select-all').targets;
            } else {
                insertAfterTargets = $(statement.text);
            }
            targets.forEach(target => {
                insertAfterTargets.forEach(insertAfterTarget => {
                    $(target).insertAfter(insertAfterTarget);
                });
            });
        },

        // processInsertAfterStatement: function (statement, targets) {
        //     var insertAfterTargets;
        //     if (statement.children && statement.children.length > 0) {
        //         var selectAllChild = statement.children.find(child => child.tag === 'select-all');
        //         insertAfterTargets = selectAllChild.targets || $(selectAllChild.attributes.find(attr => attr.name === 'targets').value).toArray();
        //     } else {
        //         insertAfterTargets = $(statement.text).toArray();
        //     }
        //     targets.forEach(target => {
        //         insertAfterTargets.forEach(insertAfterTarget => {
        //             $(target).clone().insertAfter(insertAfterTarget);
        //         });
        //     });
        // },
        // processInsertBeforeStatement: function (statement, targets) {
        //     var insertBeforeTargets;
        //     if (statement.children && statement.children.length > 0) {
        //         var selectAllChild = statement.children.find(child => child.tag === 'select-all');
        //         insertBeforeTargets = selectAllChild.targets || $(selectAllChild.attributes.find(attr => attr.name === 'targets').value).toArray();
        //     } else {
        //         insertBeforeTargets = $(statement.text).toArray();
        //     }
        //     targets.forEach(target => {
        //         insertBeforeTargets.forEach(insertBeforeTarget => {
        //             $(target).clone().insertBefore(insertBeforeTarget);
        //         });
        //     });
        // },



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
        processStoreStatement: function (statement, targets) {
            statement.children.forEach(child => {
                var key = child.tag;
                var value = child.text;
                store.set(key, value);
            });
        },

        // processTargets: function (statement, statementElement) {
        //     var targets = [];
        //     // Case 1: 'targets' attribute on a <select-all> tag
        //     var targetsAttr = statement.attributes.find(attr => attr.name === 'targets');
        //     if (targetsAttr) {
        //         $(targetsAttr.value).each((_, element) => {
        //             targets.push($(element));
        //         });
        //         statement.targetsSelector = targetsAttr.value;
        //         statement.children.forEach(child => {
        //             child.targetsSelector = targetsAttr.value;
        //         });
        //     }
        //     // Case 2: innertext value of a <targets> child of a <select-all> tag
        //     var targetsChild = statement.children.find(child => child.tag === 'targets');
        //     if (targetsChild && (!targetsChild.children || !targetsChild.children.length)) {
        //         targets.push($(statementElement.children('targets').text()));
        //     }
        //     // Case 3: jQuery product of a <targets> child's 'foreach' attribute
        //     if (targetsChild && targetsChild.attributes) {
        //         var eachAttr = targetsChild.attributes.find(attr => attr.name === 'each');
        //         if (eachAttr) {
        //             $(eachAttr.value).each((_, element) => {
        //                 var target = $(element);
        //                 targetsChild.children.forEach(child => {
        //                     target = target[child.tag](child.text);
        //                 });
        //                 targets.push(target);
        //             });
        //         }
        //     }

        //     // If the statement is a 'set' tag, store the targets in hijinx.sets
        //     if (statement.tag === 'set') {
        //         var selectAllChild = statement.children.find(child => child.tag === 'select-all');
        //         if (selectAllChild) {
        //             targets = this.processTargets(selectAllChild, $(selectAllChild.children));
        //         }
        //         var setName = statement.attributes.find(attr => attr.name === 'name').value;
        //         this.sets[setName] = targets;
        //     }
        //     return targets;
        // },
        processTargets: function (statement, statementElement) {
            var targets = $();
            var targetsAttr = statement.attributes.find(attr => attr.name === 'targets');
            if (targetsAttr) {
                $(targetsAttr.value).each((_, element) => {
                    targets = targets.add($(element));
                });
                statement.targetsSelector = targetsAttr.value;
                statement.children.forEach(child => {
                    child.targetsSelector = targetsAttr.value;
                });
            }
            var targetsChild = statement.children.find(child => child.tag === 'targets');
            if (targetsChild && (!targetsChild.children || !targetsChild.children.length)) {
                targets = targets.add($(statementElement.children('targets').text()));
            }
            if (targetsChild && targetsChild.attributes) {
                var eachAttr = targetsChild.attributes.find(attr => attr.name === 'each');
                if (eachAttr) {
                    $(eachAttr.value).each((_, element) => {
                        var target = $(element);
                        targetsChild.children.forEach(child => {
                            target = target[child.tag](child.text);
                        });
                        targets = targets.add(target);
                    });
                }
            }
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
            //console.time("Processing time");

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
                //console.log('indexWhens and processWhens have finished processing');
                //console.timeEnd("Processing time");
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
