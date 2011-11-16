var vows = require('vows')
var assert = require('assert')
var fs = require('fs')
var Rational = require(__dirname + '/../lib/rational').Rational;

var onlySynopsis = 'bup save [-tc] [-n name] <filenames...>';

vows.describe('rational')
.addBatch({
    'Usage builder with no options': {
        '_usageStr should give usage': {
            topic: new Rational('rational'),
            'usage should match': function (rat) {
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
                assert.equal(rat._usageStr, 'Usage: rational');
            }
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
