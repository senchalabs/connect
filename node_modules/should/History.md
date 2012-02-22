
0.4.2 / 2011-12-17 
==================

  * Fixed .header() for realzzz

0.4.1 / 2011-12-16 
==================

  * Fixed: chain .header() to retain negation

0.4.0 / 2011-12-16 
==================

  * Added `.should.throw()`
  * Added `.include()` support for strings
  * Added `.include()` support for arrays
  * Removed `keys()` `.include` modifier support
  * Removed `.object()`
  * Removed `.string()`
  * Removed `.contain()`
  * Removed `.respondTo()` rubyism
  * expresso -> mocha

0.3.2 / 2011-10-24 
==================

  * Fixed tests for 0.5.x
  * Fixed sys warning

0.3.1 / 2011-08-22 
==================

  * configurable

0.3.0 / 2011-08-20 
==================

  * Added assertion for inclusion of an object: `foo.should.include.object({ foo: 'bar' })`

0.2.1 / 2011-05-13 
==================

  * Fixed .status(code). Closes #18

0.2.0 / 2011-04-17 
==================

  * Added `res.should.have.status(code)` method
  * Added `res.should.have.header(field, val)` method

0.1.0 / 2011-04-06 
==================

  * Added `should.exist(obj)` [aseemk]
  * Added `should.not.exist(obj)` [aseemk]

0.0.4 / 2010-11-24 
==================

  * Added `.ok` to assert truthfulness
  * Added `.arguments`
  * Fixed double required bug. [thanks dominictarr]

0.0.3 / 2010-11-19 
==================

  * Added `true` / `false` assertions

0.0.2 / 2010-11-19 
==================

  * Added chaining support

0.0.1 / 2010-11-19 
==================

  * Initial release
