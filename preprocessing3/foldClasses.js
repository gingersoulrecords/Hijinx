// Toggle hide-strings class on CodeMirror instances
function toggleClassMarker(codeMirrorInstance, codeMirrorElement) {
    var text = codeMirrorInstance.getValue();
    var regex = /class="[^"]*"/g;
    var match;

    codeMirrorElement.toggleClass('hide-strings');

    if (codeMirrorElement.hasClass('hide-strings')) {
        while ((match = regex.exec(text)) !== null) {
            var from = codeMirrorInstance.posFromIndex(match.index);
            var to = codeMirrorInstance.posFromIndex(match.index + match[0].length);
            var marker = document.createElement('span');
            marker.className = 'class-marker';
            marker.textContent = '⋅';
            var mark = codeMirrorInstance.markText(from, to, { className: 'hidden', replacedWith: marker });

            // Store the class content
            var classContent = text.slice(match.index, match.index + match[0].length);

            // Add click event listener to the marker
            (function (mark, classContent) {
                marker.addEventListener('click', function () {
                    console.log(classContent); // Log the class content
                    mark.clear();
                });
            })(mark, classContent);
        }
    } else {
        codeMirrorInstance.getAllMarks().forEach(function (mark) {
            if (mark.className === 'hidden') {
                mark.clear();
            }
        });
    }

    codeMirrorInstance.refresh();
}
