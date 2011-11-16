exports.Rational = Rational = function(synopsis) {
    this._usageStr = this._buildUsage(synopsis);
}

Rational.prototype._buildUsage = function(synopsis) {
    var lines = synopsis.split('\n').reverse();
    var out = [];
    var firstLine = true;

    while (lines.length > 0) {
        var line = lines.pop();
        if (line == '--')
            break;
        out.push((firstLine && 'Usage:' || '    or') + ' ' + line);
        firstLine = false;
    }

    return out.join('\n');
}

Rational.prototype.parse = function(args) {
    var options = {}, flags = [], extras = [];

    return {'options': options, 'flags': flags, 'extras': extras};
}
