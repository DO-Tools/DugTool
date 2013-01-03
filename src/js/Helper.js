// Helper functions
var formatNumber = function(nr) {
    var result = '';
    nr = nr.toString();
    while (nr.length > 3) {
        result = '.' + nr.substring(nr.length - 3) + result;
        nr = nr.slice(0, - 3);
    }
    return nr + result;
};

// Exports
exports.formatNumber = formatNumber;