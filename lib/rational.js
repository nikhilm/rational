var sprintf = require('sprintf').sprintf;

function strip(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/*\
 * Rational
 [ class ]
 **
 * Creates a Rational parser which can parse a list of arguments (usually
 * `process.argv`).
 *
 > Parameters
 **
 - synopsis (string) Human readable usage message conforming to Rational requirements.
 = (object) Rational
 > Synopsis specification
 **
 * The specification must start with a list of possible invocations, each on
 * a separate line.
 * This *MUST* be followed by a line with `--`.
 *
 * This is followed by the options, each on one line, with the format:
 * [shortopts...,]longopt <description>
 * If There can be multiple shortopts. If only the longopt is present, and it
 * is a single character, it is treated as a shortopt.
 *
 > Groups
 * A line starting with a <b>space</b> and then a line of text, allows you to group
 * options. The groups have no internal meaning, they are only used for
 * formatting the usage message.
 **
\*/
exports.Rational = Rational = function(synopsis) {
    this._options = {};
    this._usageStr = this._buildUsage(synopsis);
}

/*\
 * Rational.usage
 [ method ]
 **
 * Print out usage message to standard error and exit.
\*/
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
            var form = forms.shift();
            this._options[form] = true;
            usageLine += '-' + strip(form) + ', ';
        }
        //long option
        var longOpt = forms.shift();
        this._options[longOpt] = true;
        usageLine += '-' + (longOpt.length > 1 && '-' || '') + strip(longOpt);

        //description
        var desc = strip(line.substr(switches.length));

        out.push(sprintf('  %-20s\t%s', usageLine, desc));
    }

    return out.join('\n');
}

/*\
 * Rational.parse
 [ method ]
 **
 * Parse the argument list and return results
 - args (array) #optional The parameter list (default is `process.argv`)
 = (object) { 'options': { ... }, 'flags': [...], 'extras': [...] }
 **
 > `options`
 * `options` is an (object) which has fields set to true or false
 * for boolean valued options, and having the value itself (or undefined) for
 * strings. The 'no-<option>' versions are also set for true long options.
 **
 > `flags`
 * `flags` is a array of pairs containing all the flags that were passed on
 * the command line. `[[k1, v1], [k2, v2], ...]`. Keys are always with the '-'
 * or '--' and values are empty strings for options not taking parameters.
 **
 > `extras`
 * `extras` are a list of remaining positional arguments in order.
 **
 # <strong>NOTE</strong>: option parsing stops after a '--' is encountered. All arguments
 # following that are placed in extras.
\*/
Rational.prototype.parse = function(args) {
    var options = {}, flags = [], extras = [];

    return {'options': options, 'flags': flags, 'extras': extras};
}
