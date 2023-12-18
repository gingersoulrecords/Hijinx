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

            // Add click event listener to the marker
            (function (mark) {
                marker.addEventListener('click', function () {
                    mark.clear();
                });
            })(mark);
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
