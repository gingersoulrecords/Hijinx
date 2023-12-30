//notes

//when folding classes, make the class attribute a toggle.



(function ($) {


    //use split js to split the panes
    Split(['#csspane', '#inputpane', '#processpane'], {
        sizes: [45, 45, 10],
        gutterSize: 20,
        cursor: 'grabbing',
        direction: 'vertical',
    });

    Split(['.blank-pane', '.inputs-pane'], {
        sizes: [67, 33],
        gutterSize: 20,
        cursor: 'grabbing',
        direction: 'horizontal',
    });


    // Ensure that the window.markupSnippets object exists
    if (window.markupSnippets) {
        // Add or update the 'foo' entry with the desired value
        window.markupSnippets['foo'] = 'div.foo.itworks';
    } else {
        // If window.markupSnippets doesn't exist, you might want to initialize it
        // or handle the error appropriately
        console.error('markupSnippets object does not exist!');
        // Optionally initialize it as an empty object and then add 'foo'
        // window.markupSnippets = { 'foo': 'div.foo.itworks' };
    }


    // Define the aviator object on the window
    window.aviator = {
        // Define the editors object to hold the CodeMirror instances
        editors: {
            css: null,
            input: null,
            processed: null
        },

        // Define the custom "Aviator" mode that tokenizes brackets and parentheses.
        aviatorOverlay: {
            token: function (stream) {
                var ch = stream.peek();

                // Tokenize curly braces
                if (ch === "{" || ch === "}") {
                    stream.next();
                    return "brace";
                }

                // Tokenize square braces
                if (ch === "[" || ch === "]") {
                    stream.next();
                    return "brace";
                }

                // Tokenize parentheses
                if (ch === "(" || ch === ")") {
                    stream.next();
                    return "parenthesis";
                }

                // Tokenize colons
                if (ch === ":") {
                    stream.next();
                    return "colon";
                }

                // Move the stream position if none of the above tokens match
                while (stream.next() != null &&
                    !["{", "}", "[", "]", "(", ":", ")"].includes(stream.peek())) { }

                return null;
            }
        },

        debounce: function (func, wait) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    func.apply(context, args);
                }, wait);
            };
        },

        // This method returns the configuration object for CodeMirror
        getCodeMirrorConfig: function (mode) {
            return {
                lineNumbers: true,
                mode: mode,
                theme: "material-palenight",
                lineWrapping: true,
                foldGutter: true,
                foldOptions: {
                    minFoldSize: 0
                },
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
                extraKeys: {
                    'Tab': function (cm) {
                        var cursor = cm.getCursor();
                        var line = cm.getLine(cursor.line);
                        var lineToCursor = line.substr(0, cursor.ch).trim();

                        // Use Emmet or insert a soft tab
                        if (lineToCursor.length > 0) {
                            cm.execCommand('emmetExpandAbbreviationAll');
                        } else {
                            cm.execCommand('insertSoftTab');
                        }
                    },
                    "Cmd-Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 100, 'up');
                    },
                    "Ctrl-Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 100, 'up');
                    },
                    "Cmd-Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 100, 'down');
                    },
                    "Ctrl-Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 100, 'down');
                    },
                    "Option-Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.1, 'up');
                    },
                    "Alt-Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.1, 'up');
                    },
                    "Shift-Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 10, 'up');
                    },
                    "Shift-Option-Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.01, 'up');
                    },
                    "Shift-Alt-Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.01, 'up');
                    },
                    "Up": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 1, 'up');
                    },
                    "Option-Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.1, 'down');
                    },
                    "Alt-Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.1, 'down');
                    },
                    "Shift-Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 10, 'down');
                    },
                    "Shift-Option-Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.01, 'down');
                    },
                    "Shift-Alt-Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 0.01, 'down');
                    },
                    "Down": function (cm) {
                        return aviator.adjustSelectedNumber(cm, 1, 'down');
                    },
                    "Shift-Ctrl-/": "emmetToggleComment",
                    "Shift-Cmd-/": "emmetToggleComment",

                    'Ctrl-/': function (cm) {
                        cm.execCommand('toggleComment');
                    },

                    'Cmd-/': function (cm) {
                        cm.execCommand('toggleComment');
                    },
                },
                viewportMargin: Infinity,


            };
        },

        adjustSelectedNumber: function (mirror, increment, direction) {
            let range = mirror.listSelections()[0];  // get the first range object of the selection

            // Check if selection spans more than one line
            if (range.anchor.line !== range.head.line) {
                return CodeMirror.Pass;
            }

            let sel = mirror.getSelection();
            let match = sel.match(/(.*?)(-?\d*\.?\d+)(.*)/);  // revised regex to correctly identify floating point numbers

            if (!match) return CodeMirror.Pass;

            let beforeNumber = match[1];
            let number = parseFloat(match[2]);
            let afterNumber = match[3];

            let adjustedNumber;
            if (direction === 'up') {
                adjustedNumber = number + Math.abs(increment);
            } else { // direction is 'down'
                adjustedNumber = number - Math.abs(increment);
                // when original number is zero and direction is down, make it negative
                if (number === 0) adjustedNumber = -Math.abs(increment);
            }

            // Remove unnecessary trailing zeros
            adjustedNumber = parseFloat(adjustedNumber.toFixed(2));

            let replacement = beforeNumber + adjustedNumber + afterNumber;

            // replace selection and keep the new text selected
            mirror.replaceSelection(replacement, "around");

            return true;
        },

        // This method initializes a CodeMirror instance on the textarea with the given ID
        initializeCodeMirror: function (editorKey, mode) {
            var editor = CodeMirror.fromTextArea(document.getElementById(editorKey), this.getCodeMirrorConfig(mode));
            this.editors[editorKey] = editor;

            // Check for the presence of editorsContent for this editor in local storage
            var editorsContent = JSON.parse(localStorage.getItem('editorsContent'));
            if (editorsContent && editorsContent[editorKey]) {
                // If something is there, clear the HTML and use that to populate the editor
                editor.setValue(editorsContent[editorKey]);
            }

            // If this is the input editor, add a change event listener that calls processHTMLInput
            if (editorKey === 'input') {
                var self = this; // Store a reference to the aviator object
                var debouncedChanges = self.debounce(function () {
                    self.processHTMLInput();
                    self.buildTagIndex(editor);
                    self.addMouseEnterHandler(editor);
                }, 100); // Debounce time in milliseconds

                editor.on('changes', debouncedChanges);

                var debouncedUpdate = self.debounce(function () {
                    self.processHTMLInput();
                    self.buildTagIndex(editor);
                    self.addMouseEnterHandler(editor);
                }, 400); // Debounce time in milliseconds

                editor.on('update', debouncedUpdate);


            }

            // If this is the css editor, add a change event listener that calls processCSSInput
            if (editorKey === 'css') {
                var self = this; // Store a reference to the aviator object
                editor.on('changes', function () {
                    self.processCSSInput();
                });
            }
        },


        // ====================
        // INSPECTING
        // ====================


        buildTagIndex: function (codeMirrorInstance) {
            // Initialize an object to store the .cm-tag elements
            this.cmTagElements = {};

            // Get the root element of the editor
            var rootElement = codeMirrorInstance.getWrapperElement();

            // Get all the .cm-tag elements within the root element and store them in the object
            $(rootElement).find('.cm-tag').each(function (index, element) {
                var tagElement = $(element);

                // Check if the previous element is a .cm-tag.cm-bracket with the text of '<'
                if (tagElement.prev().hasClass('cm-bracket') && tagElement.prev().text() === '<') {
                    var tag = tagElement.text();
                    if (!this.cmTagElements[tag]) {
                        this.cmTagElements[tag] = [];
                    }
                    this.cmTagElements[tag].push(index);
                }
            }.bind(this));

            // Log the cmTagElements object to the console
            //console.log(this.cmTagElements);
        },

        addRightClickHandler: function (codeMirrorInstance) {
            // Get the actual CodeMirror element
            var codeMirrorElement = $(codeMirrorInstance.getWrapperElement());
            var codeMirrorCodeElement = codeMirrorElement.find('.CodeMirror-code');

            // Set up right-click event handler for the .cm-attribute elements
            codeMirrorCodeElement.on('contextmenu', '.cm-attribute', function (event) {
                // Prevent the default context menu from showing up
                event.preventDefault();

                // Check if the text of the element is 'class'
                if ($(this).text() === 'class') {
                    // Alert a message
                    alert('You right-clicked on a .cm-attribute with the text of "class"');

                }
            });
        },

        addMouseEnterHandler: function (codeMirrorInstance) {
            // Get the actual CodeMirror element
            var codeMirrorElement = $(codeMirrorInstance.getWrapperElement());
            var codeMirrorCodeElement = codeMirrorElement.find('.CodeMirror-code');

            // Unbind existing events
            $('pre.CodeMirror-line').off('mouseover mouseout');

            //remove highlight class from all elements
            $('#output *').removeClass('highlight');

            var self = this; // Store a reference to the aviator object

            // Set up mouseover event handler for the .CodeMirror-line elements
            $('pre.CodeMirror-line').on('mouseover', function (event) {
                // Check if the command key is pressed
                if (!event.metaKey && !event.ctrlKey) {
                    return;
                }

                var targetElement = $(this).find('.cm-tag:not(.cm-bracket)').first();
                var tag = targetElement.text();

                // Check if the previous element is a .cm-tag.cm-bracket with the text of '<'
                if (targetElement.prev().hasClass('cm-bracket') && targetElement.prev().text() === '<') {
                    // Get the index of the .cm-tag element
                    var index = self.cmTagElements[tag].indexOf($('.cm-tag').index(targetElement));

                    //remove all highlight classes
                    $('#output *').removeClass('highlight');

                    // Toggle a class on the corresponding element in the #output element
                    $('#output ' + tag).eq(index).addClass('highlight');
                }
            });

            // Set up mouseout event handler for the .CodeMirror-line elements
            $('pre.CodeMirror-line').on('mouseout', function (event) {
                var targetElement = $(this).find('.cm-tag:not(.cm-bracket)').first();
                var tag = targetElement.text();

                // Check if the previous element is a .cm-tag.cm-bracket with the text of '<'
                if (targetElement.prev().hasClass('cm-bracket') && targetElement.prev().text() === '<') {
                    // Get the index of the .cm-tag element
                    var index = self.cmTagElements[tag].indexOf($('.cm-tag').index(targetElement));

                    // Remove the highlight class from the corresponding element in the #output element
                    $('#output ' + tag).eq(index).removeClass('highlight');
                }
            });
        },


        // ====================
        // BEAUTIFYING
        // ====================

        // This method beautifies the content of the given editor
        beautifyEditorContent: function (editor) {
            var mode = editor.getOption('mode');
            var content = editor.getValue().trim();

            if (mode === 'text/html') {
                content = html_beautify(content);
            } else if (mode === 'css') {
                content = css_beautify(content);
            }

            editor.setValue(content);
        },

        // This method beautifies the content of all editors
        // beautifyAllEditors: function () {
        //     for (var key in this.editors) {
        //         this.beautifyEditorContent(this.editors[key]);
        //     }
        // },

        beautifyAllEditors: function () {
            var editorsToBeautify = ['css', 'input'];
            for (var key in this.editors) {
                if (editorsToBeautify.includes(key)) {
                    this.beautifyEditorContent(this.editors[key]);
                }
            }
        },

        // This method processes the CSS in the css editor and appends it to the head of the document
        processCSSInput: function () {
            var cssContent = this.editors.css.getValue();

            // Check if the style element already exists
            var styleElement = document.getElementById('aviatorStyle');
            if (!styleElement) {
                // If it doesn't exist, create a new style element
                styleElement = document.createElement('style');
                styleElement.type = 'text/css';
                styleElement.id = 'aviatorStyle';

                // Append the style element to the head of the document
                document.head.appendChild(styleElement);
            }

            // Set the innerHTML of the style element to the CSS content
            styleElement.innerHTML = cssContent;
        },

        // This method processes the HTML in the input editor and sets the result in the processed editor
        processHTMLInput: function () {
            var inputHTML = this.editors.input.getValue();

            // Run the input HTML through window.processSoulClasses
            inputHTML = window.processSoulClasses(inputHTML);

            this.editors.processed.setValue(inputHTML);

            // Set the HTML of the output element to the processed HTML
            this.setOutput('output');
        },

        // This method sets the HTML of the element with the given ID to the processed HTML
        setOutput: function (elementId) {
            var processedHTML = this.editors.processed.getValue();
            document.getElementById(elementId).innerHTML = processedHTML;
        },

        // This method sorts the classes in the input editor
        sortClasses: function (htmlString) {
            var self = this; // Store a reference to this

            return htmlString.replace(/class="([^"]*)"/g, function (match, classString) {
                let classes = classString.split(' ');

                let classesWithColons = [];
                let classesWithoutColons = [];

                // Separate classes with colons from those without
                classes.forEach(function (classItem) {
                    if (classItem.includes(':')) {
                        classesWithColons.push(classItem);
                    } else {
                        classesWithoutColons.push(classItem);
                    }
                });

                // Sort only the classes with colons
                classesWithColons.sort(function (a, b) {
                    let aSplit = a.split(':');
                    let bSplit = b.split(':');

                    let aProperty = aSplit.length > 1 ? aSplit[aSplit.length - 2] : aSplit[0];
                    let bProperty = bSplit.length > 1 ? bSplit[bSplit.length - 2] : bSplit[0];

                    let aIndex = self.classOrder.findIndex(order => aProperty === order);
                    let bIndex = self.classOrder.findIndex(order => bProperty === order);

                    // If a class does not contain a string from the classOrder array, sort it to the end
                    if (aIndex === -1) aIndex = Infinity;
                    if (bIndex === -1) bIndex = Infinity;

                    return aIndex - bIndex;
                });

                // Join the classes back into a string, with classes without colons at the front
                return 'class="' + [...classesWithoutColons, ...classesWithColons].join(' ').replace(/  +/g, ' ').trim() + '"';
            });
        },

        saveEditorsContent: function () {
            // Get the content of the input editor
            var inputContent = this.editors.input.getValue();

            // Sort the classes in the input content
            var sortedInputContent = this.sortClasses(inputContent);

            // Set the sorted content in the input editor
            this.editors.input.setValue(sortedInputContent);

            this.beautifyAllEditors();


            var editorsContent = {};

            // Get the content of each editor and store it in the editorsContent object
            for (var key in this.editors) {
                editorsContent[key] = this.editors[key].getValue();
            }

            // Save the editorsContent object to local storage
            localStorage.setItem('editorsContent', JSON.stringify(editorsContent));

            // Show a toast using Toastify
            Toastify({
                text: "Saved!",
                duration: 1000,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            }).showToast();
        },

        // ====================
        // ELEMENT FOLDING
        // ====================

        handleLongPressOnTag: function (codeMirrorInstance) {
            var self = this; // Store a reference to this
            var longPressTimeout;

            // Get the actual CodeMirror element
            var codeMirrorElement = $(codeMirrorInstance.getWrapperElement());
            var codeMirrorCodeElement = codeMirrorElement.find('.CodeMirror-code');

            // Set up mousedown event handler
            codeMirrorCodeElement.on('mousedown', '.cm-tag', function (event) {
                longPressTimeout = setTimeout(function () {
                    var selection = codeMirrorInstance.getSelection();
                    if (selection) {
                        var fromLine = codeMirrorInstance.getCursor('start').line;
                        var toLine = codeMirrorInstance.getCursor('end').line;
                        for (var i = fromLine; i <= toLine; i++) {
                            codeMirrorInstance.foldCode(CodeMirror.Pos(i, 0));
                        }
                    } else {
                        var cursorLine = codeMirrorInstance.getCursor().line;
                        codeMirrorInstance.foldCode(CodeMirror.Pos(cursorLine, 0));
                    }
                }, 300);
            });

            // Set up mouseup event handler
            codeMirrorCodeElement.on('mouseup', function () {
                clearTimeout(longPressTimeout);
            });
        },


        // ====================
        // CLASS FOLDING
        // ====================


        // NEW


        handleLongPressOnClassAttribute: function (codeMirrorInstance) {
            var self = this; // Store a reference to this
            var longPressTimeout;

            // Get the actual CodeMirror element
            var codeMirrorElement = $(codeMirrorInstance.getWrapperElement());
            var codeMirrorCodeElement = codeMirrorElement.find('.CodeMirror-code');

            // Set up mousedown event handler
            codeMirrorCodeElement.on('mousedown', '.cm-attribute', function (event) {
                // Exclude right clicks
                if (event.button === 2) {
                    return;
                }

                var targetElement = $(event.target);
                if (targetElement.text() !== 'class') {
                    return;
                }

                longPressTimeout = setTimeout(() => {
                    // Check if a selection is present
                    if (codeMirrorInstance.somethingSelected()) {
                        // If a selection is present, fold all strings in the selection
                        self.foldAllStringsInSelection(codeMirrorInstance);
                    } else {
                        // If no selection is present, get the position of the mouse event in the CodeMirror document
                        var position = codeMirrorInstance.coordsChar({
                            left: event.pageX,
                            top: event.pageY
                        });

                        // Call the new method on a successful long press
                        self.selectTokenAtPosition(codeMirrorInstance, position);
                    }
                }, 250); // 250 ms = 1/4 second

                // Clear the timeout if the mouse is released before the long press duration
                $(document).on('mouseup', function () {
                    clearTimeout(longPressTimeout);
                });
            });
        },



        selectTokenAtPosition: function (codeMirrorInstance, position) {
            // Get the token at the position
            var token = codeMirrorInstance.getTokenAt(position);

            // Set the selection to the token
            var startPosition = { line: position.line, ch: token.start };
            var endPosition = { line: position.line, ch: token.end };
            codeMirrorInstance.setSelection(startPosition, endPosition);

            // Shift the selection to the next token
            this.shiftSelectionToClassTokenandFold(codeMirrorInstance);
        },

        shiftSelectionToClassTokenandFold: function (codeMirrorInstance) {
            // Get the current selection
            var selection = codeMirrorInstance.getSelection();

            // Get the position of the end of the selection
            var position = codeMirrorInstance.getCursor('end');

            // Move the position one character to the right
            position.ch += 2;

            // Get the token at the new position
            var token = codeMirrorInstance.getTokenAt(position);

            // Set the selection to the new token
            var startPosition = { line: position.line, ch: token.start };
            var endPosition = { line: position.line, ch: token.end };
            codeMirrorInstance.setSelection(startPosition, endPosition);

            // Log the start and end positions of the final selection
            console.log('Start position:', startPosition);
            console.log('End position:', endPosition);

            // Call toggleFoldForRange with the line and character positions of the start and end of the selection
            this.toggleFoldForRange(startPosition.line, startPosition.ch, endPosition.line, endPosition.ch);
        },

        foldSpecificRange: function (fromLine, fromCh, toLine, toCh) {
            var from = CodeMirror.Pos(fromLine, fromCh); // start position
            var to = CodeMirror.Pos(toLine, toCh); // end position

            // Use the existing foldCode function, but with a custom range
            this.editors.input.foldCode(from, {
                rangeFinder: function (cm, pos) {
                    // Return the specific range to fold
                    return { from: from, to: to };
                }
            }, "fold");
            this.addMouseEnterHandler(this.editors.input);

            this.buildTagIndex(this.editors.input);
        },

        toggleFoldForRange: function (fromLine, fromCh, toLine, toCh) {
            this.foldSpecificRange(fromLine, fromCh, toLine, toCh);

        },

        foldAllStringsInSelection: function (codeMirrorInstance) {
            // Get the start and end positions of the selection
            var from = codeMirrorInstance.getCursor('from');
            var to = codeMirrorInstance.getCursor('to');

            // Iterate over each line in the selection
            for (var line = from.line; line <= to.line; line++) {
                // Get the start and end characters for this line
                var startCh = line === from.line ? from.ch : 0;
                var endCh = line === to.line ? to.ch : null;

                // Get the tokens for this line
                var tokens = codeMirrorInstance.getLineTokens(line);

                // Iterate over each token in the line
                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i];

                    // Check if the token is a string and is within the selection
                    if (token.type === 'string' && token.start >= startCh && (endCh === null || token.end <= endCh)) {
                        // Fold the string
                        this.foldSpecificRange(line, token.start, line, token.end);
                    }
                }
            }
        },


        // ====================
        // INITIALIZATION
        // ====================

        // This method initializes the application
        init: function () {
            this.initializeCodeMirror('css', 'css');
            this.initializeCodeMirror('input', 'text/html');
            this.initializeCodeMirror('processed', 'text/html');

            this.beautifyAllEditors();

            // Process the inputs after initializing the editors
            this.processHTMLInput();
            this.processCSSInput();

            this.handleLongPressOnClassAttribute(this.editors.input);
            this.handleLongPressOnTag(this.editors.input);
            this.addMouseEnterHandler(this.editors.input);
            this.addRightClickHandler(this.editors.input);
            this.buildTagIndex(this.editors.input);


            //this.setupLongPressOnClassAttributes(this.editors.input, '.cm-attribute');




        }
    };

    // When the document is ready, initialize the application
    $(document).ready(function () {

        $(document).keydown(function (event) {
            if (event.which === 83 && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                window.aviator.saveEditorsContent();
            }
        });

        window.aviator.init();

    });
})(jQuery);
