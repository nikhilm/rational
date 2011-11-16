---
title: Rational
layout: wikistyle
---

<link rel="stylesheet" href="style.css" type="text/css"> </link>
<link rel="stylesheet" href="pygments.css" type="text/css"> </link>

Rational
========

Rational is (yet another) command line argument parser for node.js. It parses a human readable usage message and infers the arguments, thus making the documentation the direct basis for the code.

It is based on [bup's option
parser](https://github.com/apenwarr/bup/blob/master/lib/bup/options.py) and the
[corresponding blog post](http://apenwarr.ca/log/?m=201111#02).

## Install

    npm install rational

## Usage

[API reference](reference.html)

    {% highlight javascript %}
    var Rational = require('rational').Rational;
    // I swear this is cleaner in CoffeeScript :)
    var parser = new Rational('wget [OPTION...] [URL...]\n--\n'+
                            'V,version         display the version of Wget and exit\n'+
                            'h,help            print this help\n'+

                            ' Advanced\n'+
                            'b,background      go to background after startup\n'+
                            'retry-connrefused retry even if connection is refused\n'+

                            ' Vertigo inducing\n'+
                            'g                 download at 1Gbps always\n'+
                            'd                 DDoS the host');

    // invoked with wget --no-retry-connrefused -d
    var result = parser.parse(process.argv);

    background = result.options.background; // false
    ddos = result.options.d; // true
    retry = result.options['retry-connrefused']; // false

    // positional arguments
    var urls = result.extras;
    {% endhighlight %}

## Tests

Tests are written using [vows](http://www.vowsjs.org). To run all tests

    $ pwd
    /path/to/rational
    $ npm install . --dev # one time only
    $ make test

## License

Rational is licensed under the 3-clause Modified BSD License.

## Contributions

Fork and send a pull request :)

## Author

Rational is made by [Nikhil Marathe](https://github.com/nikhilm).
