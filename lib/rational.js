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
 # This <strong>MUST</strong> be followed by a line with `--`.
 *
 * This is followed by the options, each on one line, with the format:
 * [shortopts...,]longopt <description>
 * If There can be multiple shortopts. If only the longopt is present, and it
 * is a single character, it is treated as a shortopt.
 *
 > Groups
 * A line starting with a `space` and then a line of text, allows you to group
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
 * Print out usage message to standard error.
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

        //long option
        var longOpt = forms.pop();
        this._options[longOpt] = true;

        while (forms.length > 0) {
            // short options
            var form = forms.shift();
            this._options[form] = longOpt;
            usageLine += '-' + strip(form) + ', ';
        }

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
 = (object|exception) { 'options': { ... }, 'flags': [...], 'extras': [...] }
 **
 > `options`
 * `options` is an (object) which has fields set to 1 (true) or 0 (false)
 * for boolean valued options, and having the value itself (or undefined) for
 * strings. The 'no-<option>' versions are also set for true long options.
 *
 * If a boolean option is passed multiple times, the field is set to the count.
 * So `--verbose -v` will set `options.v` to 2, and `-vvvv` will set it to 4.
 **
 > `flags`
 * `flags` is a array of pairs containing all the flags that were passed on
 * the command line. `[[k1, v1], [k2, v2], ...]`. Keys are always with the '-'
 * or '--' and values are empty strings for options not taking parameters.
 **
 > `extras`
 * `extras` are a list of remaining positional arguments in order.
 *
 > Errors
 * An exception is thrown if a option is given an invalid value or an option
 * not declared in the synopsis is passed.
 **
 # <strong>NOTE</strong>: option parsing stops after a '--' is encountered. All arguments
 # following that are placed in extras.
 * This method does not modify the passed array.
 **
 > Usage
 | try {
 |     var options = (new Rational(synopsis)).parse(process.argv).options;
 |     verbose = options.verbose
 |     loglevel = options.loglevel || 3;
 | } catch (e) {
 |     console.usage();
 |     console.error(e.message);
 |     process.exit(1);
 | }
\*/
Rational.prototype.parse = function(args) {
    var options = {}, flags = [], extras = [];

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg == '--') {
            extras = extras.concat(args.slice(i+1));
            break;
        }

        if (arg[0] == '-') {
            var option = arg.substr(1).replace(/^\-/, '');
            // always set the canonical (long option) here
            if (this._options.hasOwnProperty(option)) {
                if (typeof(this._options[option]) == 'string') {
                    option = this._options[option];
                }
                options[option] = options[option] && options[option]+1 || 1;
            }
            else {
                throw { 'name': 'ArgumentError',
                        'message': 'unexpected option ' + arg };
            }
        }
        else {
            extras.push(arg);
        }
    }

    var self = this;
    Object.keys(this._options).forEach(function(key) {
        var alias = key;
        if (typeof(self._options[key]) == 'string')
            alias = self._options[key];

        if (options[key] == undefined)
            options[key] = options[alias] || false;
    });

    return {'options': options, 'flags': flags, 'extras': extras};
}
