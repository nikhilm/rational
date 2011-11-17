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
 * Options which take a value rather than a boolean/count should have a '='
 * suffix. The default value can be specified within `[...]` anywhere in the
 * description.
 **
 | new Rational('wget\n--\n'+
 |              'o,output-file= log all messages to log-file\n'+
 |              'd,debug debug output [Levels: info,error,debug]\n'+
 |              'progress= [bar] type of progress bar\n'+
 |              't,tries= Maximum number of tries before giving up [42]\n'+
 |              'r= display in roman numerals'),
 **
 * Output:
 **
 | Usage: wget
 | 
 | Options
 |   -o, --output-file=<...>       log all messages to log-file
 |   -d, --debug           debug output [crap]
 |   --progress=<...>      type of progress bar Default: bar
 |   -t, --tries=<...>     Maximum number of tries before giving up Default: 42
 |   -r <...>              display in roman numerals
 > Groups
 * A line starting with a `space` and then a line of text, allows you to group
 * options. The groups have no internal meaning, they are only used for
 * formatting the usage message.
\*/
exports.Rational = Rational = function(synopsis) {
    this._options = {};
    this._hasValue = {}; // options which take a value are stored here with
                         // canonical forms as keys, and default values as
                         // values
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
        if (longOpt[longOpt.length-1] == '=') {
            longOpt = longOpt.slice(0, -1);
            this._hasValue[longOpt] = true;
        }
        this._options[longOpt] = true;

        while (forms.length > 0) {
            // short options
            var form = forms.shift();
            this._options[form] = longOpt;
            usageLine += '-' + strip(form) + ', ';
        }

        usageLine += '-' + (longOpt.length > 1 && '-' || '') + strip(longOpt);
        if (this._hasValue[longOpt])
            usageLine += (longOpt.length > 1 && '=<...>' || ' <...>');
        //description
        var desc = strip(line.substr(switches.length));
        var match = desc.match(/\[(.+?)\]/);

        if (match && this._hasValue[longOpt]) {
            this._hasValue[longOpt] = match[1];
            desc = strip(desc.replace(match[0], ''));
            desc += ' Default: ' + match[1];
        }

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
            flags.push([arg, '']);

            var actual = [];
            var equalsPos = -1;
            // if longopt, it is the only one, otherwise split shortopts
            if (arg[1] == '-') {
                // remove any value if any
                equalsPos = arg.indexOf('=');
                actual.push(arg.substr(2, equalsPos == -1 ? undefined : equalsPos-2));
            }
            else
                actual = arg.substr(1).split('');

            while (option = actual.shift()) {
                // always set the canonical (long option) here
                var longopt = option;
                if (this._options.hasOwnProperty(option)) {
                    if (typeof(this._options[option]) == 'string') {
                        longopt = this._options[option];
                    }

                    // get the value if any, and if it is accepted
                    if (equalsPos != -1) {
                        if (this._hasValue.hasOwnProperty(longopt)) {
                            options[longopt] = arg.substr(equalsPos+1);
                            flags[flags.length-1][0] = flags[flags.length-1][0].substr(0, equalsPos);
                            flags[flags.length-1][1] = options[longopt];
                        }
                        else {
                            throw { 'name': 'ArgumentError',
                                'message': 'Argument ' + option + ' does not accept a value' };
                        }
                    }
                    else {
                        if (this._hasValue.hasOwnProperty(longopt)) {
                            if (i == args.length-1)
                                throw { 'name': 'ArgumentError',
                                    'message': 'Argument ' + option + ' expected value' };
                            options[longopt] = args[++i];
                            flags[flags.length-1][1] = options[longopt];
                        }
                        else {
                            options[longopt] = options[longopt] && options[longopt]+1 || 1;
                        }
                    }
                }
                else {
                    throw { 'name': 'ArgumentError',
                        'message': 'unexpected option ' + arg };
                }
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
            options[key] = options[alias] || self._hasValue[alias] || false;
    });

    return {'options': options, 'flags': flags, 'extras': extras};
}
