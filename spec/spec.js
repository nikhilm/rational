var vows = require('vows')
var assert = require('assert')
var fs = require('fs')
var Rational = require(__dirname + '/../lib/rational').Rational;

var onlySynopsis = 'bup save [-tc] [-n name] <filenames...>';

vows.describe('rational')
.addBatch({
    'Usage builder with no options': {
        topic: new Rational('rational'),
        'usage is a function': function(rat) {
            assert.isFunction(rat.usage);
        },

        '_usageStr should give usage': {
            topic: new Rational('rational'),
            'usage should match': function(rat) {
                assert.equal(rat._usageStr, 'Usage: rational');
            }
        },

        '_usageStr should give multiple invocations': {
            topic: new Rational('rational\nrational <filenames...>'),
            'usage should match': function(rat) {
                assert.equal(rat._usageStr, 'Usage: rational\n    or rational <filenames...>');
            }
        },

        'stop processing on --': {
            topic: new Rational('rational\n--\nrational <filenames...>'),
            'usage should only be rational': function(rat) {
                assert.isNotNull(rat._usageStr.match('Usage: rational\n\nOptions\n'));
            }
        }
    },

    'Usage builder with options (no groups)': {
        topic: new Rational('wget [OPTION...] [URL...]\n--\n'+
                            'V,version display the version of Wget and exit\n'+
                            'h,help print this help\n'+
                            'b,background go to background after startup\n'+
                            'retry-connrefused retry even if connection is refused'),
        '_usageStr should match': function(rat) {
            var lines = rat._usageStr.split('\n');
            assert.equal(lines[0], 'Usage: wget [OPTION...] [URL...]');
            assert.isNotNull(lines[3].match('  -V, --version       \tdisplay the version of Wget and exit'));
            assert.isNotNull(lines[4].match('  -h, --help          \tprint this help'));
            assert.isNotNull(lines[5].match('  -b, --background    \tgo to background after startup'));
            assert.isNotNull(lines[6].match('  --retry-connrefused \tretry even if connection is refused'));
        },
        '_options should have properties': function(rat) {
            ['V', 'version', 'h', 'help',
            'b', 'background', 'retry-connrefused'].forEach(function(elt) {
                assert.include(rat._options, elt);
            });
        }
    },

    'Usage builder with options and groups': {
        topic: new Rational('wget [OPTION...] [URL...]\n--\n'+
                            'V,version display the version of Wget and exit\n'+
                            'h,help print this help\n'+
                            '\n'+
                            ' Advanced\n'+
                            'b,background go to background after startup\n'+
                            'retry-connrefused retry even if connection is refused\n'+
                            ' Vertigo inducing\n'+
                            'g download at 1Gbps always\n'+
                            'd DDoS the host'),
        '_usageStr should match': function(rat) {
            var lines = rat._usageStr.split('\n');
            assert.equal(lines[6],  ' Advanced');
            assert.equal(lines[7],  '  -b, --background    \tgo to background after startup');
            assert.equal(lines[8],  '  --retry-connrefused \tretry even if connection is refused');
            assert.equal(lines[9], '');
            assert.equal(lines[10], ' Vertigo inducing');
            assert.equal(lines[11], '  -g                  \tdownload at 1Gbps always');
            assert.equal(lines[12], '  -d                  \tDDoS the host');
        },
        '_options should have properties': function(rat) {
            ['V', 'version', 'h', 'help',
            'b', 'background', 'retry-connrefused', 'g', 'd'].forEach(function(elt) {
                assert.include(rat._options, elt);
            });
        }
    },

    'Parse with no options': {
        topic: new Rational(onlySynopsis),
        'parse should succeed with just command': function(rat) {
            assert.ok(rat.parse(['bup']));

            var ret = rat.parse(['bup']);
            assert.equal(Object.keys(ret).length, 3);
            assert.include(ret, 'options');
            assert.include(ret, 'flags');
            assert.include(ret, 'extras');
        },
        'parse output should have no options': function(rat) {
            var ret = rat.parse(['bup']);
            assert.isObject(ret.options);
            assert.isArray(ret.flags);
            assert.isArray(ret.extras);
        },
        'invocation with options should fail': function(rat) {
            assert.throws(function() {rat.parse(['bup', '-v'])});
        },
        'parse output extras should be filled': function(rat) {
            var extras = rat.parse(['bup', 'fn1', 'fn2']).extras;
            assert.include(extras, 'bup');
            assert.include(extras, 'fn1');
            assert.include(extras, 'fn2');
        },
        'parse should skip options after --': function(rat) {
            var fn = function() { return rat.parse(['bup', 'fn1', '--', 'fn2', '-v', '--help']); };
            assert.doesNotThrow(fn);

            var extras = fn().extras;
            assert.deepEqual(extras, ['bup', 'fn1', 'fn2', '-v', '--help']);
        }
    },

    'Parse with options': {
        topic: new Rational('wget [OPTION...] [URL...]\n--\n'+
                            'V,v,version display the version of Wget and exit\n'+
                            'h,help print this help\n'+
                            '\n'+
                            ' Advanced\n'+
                            'b,background go to background after startup\n'+
                            'retry-connrefused retry even if connection is refused\n'+
                            ' Vertigo inducing\n'+
                            'g download at 1Gbps always\n'+
                            'd DDoS the host'),
        'parse should succeed with just command': function(ret) {
            var result = ret.parse(['wget']);
            assert.deepEqual(result.extras, ['wget']);
            assert.isEmpty(result.flags);
        },
        'parse should succeed with positional parameters': function(ret) {
            var result = ret.parse(['wget', 'http://www.google.com', 'http://nodejs.org']);
            assert.deepEqual(result.extras, ['wget', 'http://www.google.com', 'http://nodejs.org']);
            assert.isEmpty(result.flags);
        },
        'parse should succeed with specified options': function(ret) {
            var fn = function() {
                ret.parse(['wget', '-V']);
                ret.parse(['wget', '--version']);
                ret.parse(['wget', '-b', '-g', '-d', '--retry-connrefused']);
            }

            assert.doesNotThrow(fn);

            var result = ret.parse(['wget', '-b', '-g', '-d', '--retry-connrefused']);
            ['b', 'g', 'd', 'retry-connrefused'].forEach(function(option) {
                assert.equal(result.options[option], 1);
            });
            assert.deepEqual(result.flags, [['-b', ''], ['-g', ''], ['-d', ''], ['--retry-connrefused', '']]);

            ['V', 'version', 'h'].forEach(function(option) {
                assert.equal(result.options[option], 0);
            });
        },
        'parse should fail with unspecified options': function(ret) {
            var fnThrow = function(args) {
                assert.throws(function() {
                    return ret.parse(args);
                });
            };

            fnThrow(['wget', '-x']);
            fnThrow(['wget', '--mental']);
            fnThrow(['wget', '-V', '-b', '--background', '--expect']);
        },
        'all forms of an option should be set correctly': function(ret) {
            var options = ret.parse(['wget', '-V']).options;
            assert.equal(1, options.V);
            assert.equal(1, options.v);
            assert.equal(1, options.version);

            options = ret.parse(['wget', '--version']).options;
            assert.equal(1, options.V);
            assert.equal(1, options.v);
            assert.equal(1, options.version);

            options = ret.parse(['wget', '-v']).options;
            assert.equal(1, options.V);
            assert.equal(1, options.v);
            assert.equal(1, options.version);
        }
    },

    'Handle counts': {
        topic: new Rational('wget [OPTION...] [URL...]\n--\n'+
                            'V,v,version display the version of Wget and exit\n'+
                            'retry-connrefused retry even if connection is refused\n'),
        'version counts should match': function(rat) {
            var ret = rat.parse(['wget', '-v', '-v', 'doSomethingElse', '-v']);
            assert.equal(ret.options.v, 3);
            assert.deepEqual(ret.flags, [['-v', ''], ['-v', ''], ['-v', '']]);
            assert.deepEqual(ret.extras, ['wget', 'doSomethingElse']);

            ret = rat.parse(['wget', '-v', '-V']);
            assert.equal(ret.options.V, 2);
            assert.deepEqual(ret.flags, [['-v', ''], ['-V', '']]);

            ret = rat.parse(['wget', '-v', '--version', 'http://www.google.com', '--', '-V', 'http://www.nikhilmarathe.me']);
            assert.equal(ret.options.version, 2);
            assert.deepEqual(ret.flags, [['-v', ''], ['--version', '']]);
            assert.deepEqual(ret.extras, ['wget', 'http://www.google.com', '-V', 'http://www.nikhilmarathe.me']);

            ret = rat.parse(['wget', '--retry-connrefused', '--retry-connrefused']);
            assert.equal(ret.options['retry-connrefused'], 2);
            assert.deepEqual(ret.flags, [['--retry-connrefused', ''], ['--retry-connrefused', '']]);



        }
    }
}).export(module);
