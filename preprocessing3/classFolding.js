(function ($) {
    $(document).ready(function () {
        var codeMirrorElement = $('#input .CodeMirror');
        var codeMirrorInstance = codeMirrorElement[0].CodeMirror;
        var marks = {}; // store the marks
        var longPressTimeout; // store the timeout

        function toggleMark(position, text, setMark) {
            console.log('toggleMark called with:', position, text, setMark); // log the arguments

            if (text !== 'class') return; // only work on .cm-attribute elements with the text of 'class'

            var line = codeMirrorInstance.getLine(position.line);
            var startQuoteIndex = line.indexOf('"', line.indexOf(text) + text.length);
            var endQuoteIndex = line.indexOf('"', startQuoteIndex + 1);
            var start = { line: position.line, ch: startQuoteIndex + 1 }; // +1 to exclude the quote itself
            var end = { line: position.line, ch: endQuoteIndex }; // end at the second quote

            var key = position.line + ':' + text; // create a unique key for the mark based on the line number and the text of the line

            if (marks[key]) { // if there's an existing mark
                if (!setMark) { // and we're not setting the mark, clear it
                    marks[key].clear();
                    delete marks[key];
                }
            } else if (setMark) { // otherwise, if we're setting the mark, create a new mark
                var replacedWith = document.createElement('span');
                replacedWith.className = 'mark'; // assign the 'mark' class to the replacedWith element
                replacedWith.innerText = '⋅'; // or any other text or element you want to replace with
                // replacedWith.addEventListener('mousedown', function () {
                //     marks[key].clear();
                //     delete marks[key];
                // });

                marks[key] = codeMirrorInstance.markText(start, end, { replacedWith: replacedWith });
            }
        }

        codeMirrorElement.on('mousedown', '.cm-attribute', function (event) {
            longPressTimeout = setTimeout(function () {

                var position = codeMirrorInstance.coordsChar({ left: event.clientX, top: event.clientY });
                var text = event.target.innerText;
                var key = position.line + ':' + text; // create the key the same way as in toggleMark
                //console.log('Key:', key); // log the key

                var setMark = !marks[key]; // we're setting the mark if there's no existing mark

                //console.log('mousedown on .cm-attribute:', position, text, key, setMark); // log the variables


                // Check if any text is selected
                var selectedRange = codeMirrorInstance.getSelection();
                var linesToMark = [];
                if (selectedRange) {
                    // Check if the selected range contains any other .cm-attribute elements with the text of 'class'
                    var regex = new RegExp('\\bclass\\b', 'g');
                    if (regex.test(selectedRange)) {
                        // If it does, store their positions to mark them later
                        var start = codeMirrorInstance.getCursor("start");
                        var end = codeMirrorInstance.getCursor("end");
                        console.log('===============');
                        // Log the start and end points
                        console.log('Start:', start);
                        console.log('End:', end);

                        for (var line = start.line; line <= end.line; line++) {
                            var lineText = codeMirrorInstance.getLine(line);
                            var match;
                            var lineRegex = new RegExp(regex.source, regex.flags); // create a new RegExp object for each line
                            while ((match = lineRegex.exec(lineText)) !== null) {
                                linesToMark.push({ line: line, ch: match.index });
                            }
                        }
                    }
                }

                // Now, toggle the mark for the clicked element and the stored lines
                toggleMark(position, text, setMark);
                linesToMark.forEach(function (pos) {
                    toggleMark(pos, 'class', setMark);
                });
            }, 250); // 250ms = 1s
        });

        codeMirrorElement.on('mouseup', '.cm-attribute', function () {
            clearTimeout(longPressTimeout); // clear the timeout on mouseup
        });
    });
})(jQuery);
