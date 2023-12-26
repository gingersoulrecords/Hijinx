function sortClasses(htmlString) {
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

            let aIndex = classOrder.findIndex(order => aProperty === order);
            let bIndex = classOrder.findIndex(order => bProperty === order);

            // If a class does not contain a string from the classOrder array, sort it to the end
            if (aIndex === -1) aIndex = Infinity;
            if (bIndex === -1) bIndex = Infinity;

            return aIndex - bIndex;
        });

        // Join the classes back into a string, with classes without colons at the front
        return 'class="' + [...classesWithoutColons, ...classesWithColons].join(' ').replace(/  +/g, ' ').trim() + '"';
    });
}
