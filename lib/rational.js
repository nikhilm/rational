exports.Rational = Rational = function(synopsis) {
    this._usageStr = synopsis;
}

Rational.prototype.parse = function(args) {
    return {'options': undefined, 'flags': undefined, 'extras': undefined}
}
