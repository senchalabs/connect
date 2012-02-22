
require.paths.unshift('spec', './spec/lib', 'lib')
require('jspec')
require('unit/spec.helper')
koala = require('koala')

JSpec
  .exec('spec/unit/spec.js')
  .exec('spec/unit/lexer.spec.js')
  .exec('spec/unit/formatter.spec.js')
  .exec('spec/unit/formatter.html.spec.js')
  .exec('spec/unit/grammars.javascript.spec.js')
  .exec('spec/unit/grammars.ruby.spec.js')
  .exec('spec/unit/grammars.c.spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
