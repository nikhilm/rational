var Rational = require('../lib/rational').Rational;

var p = new Rational(
'cp source destination\n'+
'cp <files...> destination\n'+
'--\n'+
'v,verbose Cause cp to be verbose, showing files as they are copied.\n'+
'n Do not overwrite an existing file.\n'
);

p.usage();
