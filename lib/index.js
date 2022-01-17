const sassLib = require('sass')
const debug = require('debug')('@metalsmith/sass')
const path = require('path')
const { EOL } = require('os')
/**
 * @typedef {import('sass').Options} Options
 */

/** @type {Options} */
const defaults = {
  // not supported yet, is much slower according to https://sass-lang.com/documentation/js-api/modules#compileAsync
  async: false,
  style: process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
  sourceMap: process.env.NODE_ENV === 'development',
  entries: {}
}

/**
 * Normalize plugin options
 * @param {Options} [options]
 * @returns {Object}
 */
function normalizeOptions(options) {
  return Object.assign({}, defaults, options || {})
}

/**
 * A Metalsmith plugin to serve as a boilerplate for other core plugins
 *
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
function initSass(options) {
  options = normalizeOptions(options)
  const { entries } = options
  debug('Running with options %o', options)

  return function sass(files, metalsmith, done) {
    const errors = []
    Object.entries(entries).forEach(([src, dest]) => {
      try {
        const compiled = sassLib.compile(metalsmith.path(src), options)
        let css = compiled.css

        if (options.sourceMap) {
          const sourceMapPath = `${dest}.map`
          // relative source map paths are the safest as the build folder could be served from a subpath
          const sourceMapRelPath = path.relative(path.dirname(dest), sourceMapPath)
          files[sourceMapPath] = {
            contents: Buffer.from(JSON.stringify(compiled.sourceMap))
          }
          css += `${EOL}/*# sourceMappingURL=${sourceMapRelPath} */`
        }

        files[dest] = {
          contents: Buffer.from(css)
        }

        // if the sass entry is inside Metalsmith.source, delete it
        const srcRelPath = path.relative(metalsmith.source(), metalsmith.path(src))
        if (files[srcRelPath]) {
          delete files[srcRelPath]
          // log a useful warning to avoid RAM overhead
          debug(
            'Removed %s from the build. For better performance, move your SASS source files out of Metalsmith.source',
            srcRelPath
          )
        }

        debug('Finished compiling %s to %s', src, dest)
      } catch (err) {
        // we don't call done(err) so we can log multiple sass errors at once for multiple entrypoints
        // this is more convenient than having to re-run the build on each subsequent error
        errors.push(err)
      }
    })

    errors.forEach((err) => debug('Sass compilation error: %s', err.message))
    done(errors[0])
  }
}

module.exports = initSass
