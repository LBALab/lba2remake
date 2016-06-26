var constants = require('./constants');

module.exports = function(content) {
    this.cacheable && this.cacheable();
    this.value = content;
    var constantValues = '';
    for (var key in constants) {
        if (constants.hasOwnProperty(key)) {
            var value = constants[key] / 255.0;
            if (value == 0) {
                value = '0.0';
            } else {
                value = value.toString();
            }
            constantValues += 'const float ' + key + ' = ' + value + ';\n';
        }
    }
    return "module.exports = " + JSON.stringify(content.replace('#pragma require("constants");', constantValues));
};

module.exports.seperable = true;
