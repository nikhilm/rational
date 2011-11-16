var sprintf = require('sprintf').sprintf;

function strip(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

exports.Rational = Rational = function(synopsis) {
    this._usageStr = this._buildUsage(synopsis);
    this._options = {};
}

Rational.prototype.usage = function() {
    console.error(this._usageStr);
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

    if (lines.length > 0)
        out.push('\nOptions');

    // parse options
    while (lines.length > 0) {
        var line = lines.pop();
        if (line.length == 0)
            continue;

        if (line[0] == ' ') {
            out.push('\n ' + strip(line));
            continue;
        }

        var switches = line.split(' ', 1)[0];

        var usageLine = '';
        // build usage string
        var forms = switches.split(',');
        while (forms.length > 1) {
            // short options
            usageLine += '-' + strip(forms.shift()) + ', ';
        }
        //long option
        var longOpt = forms.shift();
        usageLine += '-' + (longOpt.length > 1 && '-' || '') + strip(longOpt);

        //description
        var desc = strip(line.substr(switches.length));

        out.push(sprintf('  %-20s\t%s', usageLine, desc));
    }

    return out.join('\n');
}

Rational.prototype.parse = function(args) {
    var options = {}, flags = [], extras = [];

    return {'options': options, 'flags': flags, 'extras': extras};
}
