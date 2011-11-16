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
            rat.usage();
            var lines = rat._usageStr.split('\n');
            assert.equal(lines[0], 'Usage: wget [OPTION...] [URL...]');
            assert.isNotNull(lines[3].match('  -V, --version       \tdisplay the version of Wget and exit'));
            assert.isNotNull(lines[4].match('  -h, --help          \tprint this help'));
            assert.isNotNull(lines[5].match('  -b, --background    \tgo to background after startup'));
            assert.isNotNull(lines[6].match('  --retry-connrefused \tretry even if connection is refused'));
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
    }
}).export(module);
