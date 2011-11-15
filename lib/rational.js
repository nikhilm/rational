exports.Rational = Rational = function(synopsis) {
    this._usageStr = synopsis;
}

Rational.prototype.parse = function(args) {
    var options = {}, flags = [], extras = [];

    return {'options': options, 'flags': flags, 'extras': extras};
}
