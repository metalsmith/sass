const assert = require('assert')
const equals = require('assert-dir-equal')
const { describe, it } = require('mocha')
const Metalsmith = require('metalsmith')
const { name } = require('../package.json')
const plugin = require('..')

function fixture(p) {
  return require('path').resolve(__dirname, 'fixtures', p)
}

describe('@metalsmith/sass', function () {
  it('should export a named plugin function matching package.json name', function () {
    const namechars = name.split('/')[1]
    const camelCased = namechars.split('').reduce((str, char, i) => {
      str += namechars[i - 1] === '-' ? char.toUpperCase() : char === '-' ? '' : char
      return str
    }, '')
    assert.strictEqual(plugin().name, camelCased)
  })
  it('should not crash the metalsmith build when using default options', function (done) {
    // this test also tests whether the defaults work as expected: style: compressed, sourceMap: false
    Metalsmith(fixture('default'))
      .clean(true)
      .use(
        plugin({
          entries: {
            'lib/main.scss': 'css/styles.css'
          }
        })
      )
      .build((err) => {
        assert.strictEqual(err, null)
        equals(fixture('default/build'), fixture('default/expected'))
        done()
      })
  })

  it('should allow generating sourceMaps', function (done) {
    // this test fails on Windows due to EOL being \n in fixture/expected
    Metalsmith(fixture('sass-options'))
      .clean(true)
      .use(
        plugin({
          style: 'expanded',
          sourceMap: true,
          sourceMapIncludeSources: true,
          entries: {
            'lib/main.scss': 'css/styles.css'
          }
        })
      )
      .process((err, files) => {
        assert.strictEqual(err, null)
        // unfortunately the dir-equals assertion cannot be used as the SASS map output is not always exactly the same
        assert.deepStrictEqual(Object.keys(files).sort(), ['css/styles.css', 'css/styles.css.map', 'index.html'])
        done()
      })
  })

  it('should support importing node_modules relative paths out of the box', function (done) {
    Metalsmith(fixture('loading_nodemodule'))
      .clean(true)
      .use(
        plugin({
          entries: {
            'lib/main.scss': 'css/styles.css'
          }
        })
      )
      .build((err) => {
        assert.strictEqual(err, null)
        equals(fixture('loading_nodemodule/build'), fixture('loading_nodemodule/expected'))
        done()
      })
  })

  // the test scss file contains YAML front-matter: when SCSS files are read from source dir,
  // @metalsmith/sass should use sass.compileString to continue processing the in-memory buffer instead of reading from disk
  it('should remove scss source files if they are inside metalsmith.source', function (done) {
    Metalsmith(fixture('inside-source-dir'))
      .clean(true)
      .use(
        plugin({
          entries: {
            'src/main.scss': 'styles.css'
          }
        })
      )
      .build((err) => {
        assert.strictEqual(err, null)
        equals(fixture('inside-source-dir/build'), fixture('inside-source-dir/expected'))
        done()
      })
  })

  it('should throw on invalid scss', function (done) {
    Metalsmith(fixture('invalid-scss'))
      .clean(true)
      .use(
        plugin({
          entries: {
            'lib/main.scss': 'css/styles.css',
            'lib/invalid.scss': 'css/invalid.css'
          }
        })
      )
      .build((err) => {
        assert.strictEqual(err instanceof Error, true)
        done()
      })
  })

  it('should throw on invalid entry paths', function (done) {
    Metalsmith(fixture('invalid-scss'))
      .clean(true)
      .use(
        plugin({
          entries: {
            'lib/inexistant.scss': 'css/inexistant.css'
          }
        })
      )
      .build((err) => {
        assert.strictEqual(err instanceof Error, true)
        assert.strictEqual(
          err.message,
          require('path').join('test', 'fixtures', 'invalid-scss', 'lib', 'inexistant.scss') +
            ': no such file or directory'
        )
        done()
      })
  })
})
