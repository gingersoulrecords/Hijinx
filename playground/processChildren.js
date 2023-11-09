// processChildren.js
(function ($) {
    hijinx.processChildren = function (selectAllObject) {
        return new Promise(function (resolve) {
            selectAllObject.element.children().each(function () {
                var $child = $(this);
                var method = $child.prop('tagName').toLowerCase();
                var args = {};

                $child.children().each(function () {
                    var argName = $(this).prop('tagName').toLowerCase();
                    var argValue = $(this).text();
                    args[argName] = argValue;
                });

                switch (method) {
                    case 'css':
                        let cssString = "";
                        $.each(args, function (prop, value) {
                            cssString += `${prop}: ${value};`;
                        });
                        selectAllObject.targets.attr({
                            "x-data": `{ style: "${cssString}" }`,
                            "x-bind:style": "style"
                        });
                        console.log('Applied CSS to elements:', cssString);
                        resolve();
                        break;
                    case 'attr':
                        $.each(args, function (name, value) {
                            selectAllObject.targets.attr(name, value);
                        });
                        console.log('Applied attributes to elements:', args);
                        resolve();
                        break;
                    case 'add-class':
                        var className = $child.text();
                        selectAllObject.targets.attr({
                            "x-data": `{ addClass: "${className}" }`,
                            "x-bind:class": "addClass"
                        });
                        console.log('Added class to elements:', className);
                        resolve();
                        break;
                    default:
                        console.log('Unknown method:', method);
                        break;
                }
            });
        });
    };
})(jQuery);
