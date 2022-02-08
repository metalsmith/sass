const sassLib = require('sass')
const debug = require('debug')('@metalsmith/sass')
const { relative, dirname } = require('path')
const { EOL } = require('os')
const isDev = process.env.NODE_ENV === 'development'
/**
 * @typedef {import('sass').Options<'sync'>} Options
 */

/** @type {Options} */
const defaults = {
  // not supported yet, is much slower according to https://sass-lang.com/documentation/js-api/modules#compileAsync
  async: false,
  style: isDev ? 'expanded' : 'compressed',
  sourceMap: isDev,
  sourceMapIncludeSources: isDev,
  loadPaths: ['node_modules'],
  entries: {}
}

/**
 * Normalize plugin options
 * @param {Options} [options]
 * @returns {Object}
 */
function normalizeOptions(options) {
  // force async false, not supported yet
  return Object.assign({}, defaults, options || {}, { async: false })
}

/**
 * A Metalsmith plugin to compile SASS/SCSS files
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
      // path relative to metalsmith.source()
      const srcRelPath = relative(metalsmith.source(), metalsmith.path(src))
      const isInSrcDir = Object.prototype.hasOwnProperty.call(files, srcRelPath)

      try {
        let compiled

        if (isInSrcDir) {
          // if the sass file is inside src, it could contain front-matter or templating
          // therefore it is unsafe/error-prone to (re-)read it from disk
          compiled = sassLib.compileString(files[srcRelPath].contents.toString(), options)
        } else {
          compiled = sassLib.compile(metalsmith.path(src), options)
        }

        let css = compiled.css

        if (options.sourceMap) {
          const sourceMapPath = `${dest}.map`
          // relative source map paths are the safest as the build folder could be served from a subpath
          const sourceMapRelPath = relative(dirname(dest), sourceMapPath)
          files[sourceMapPath] = {
            contents: Buffer.from(JSON.stringify(compiled.sourceMap))
          }
          css += `${EOL}/*# sourceMappingURL=${sourceMapRelPath} */`
        }

        // if the sass entry is inside Metalsmith.source...
        if (isInSrcDir) {
          // ...reuse its file metadata
          files[dest] = files[srcRelPath]
          // ...then delete the source
          delete files[srcRelPath]
          // log a useful warning to avoid RAM overhead
          debug(
            'Removed %s from the build. For better performance, move your SASS source files out of Metalsmith.source',
            srcRelPath
          )
        } else {
          files[dest] = {}
        }

        // finally (over)write its contents
        files[dest].contents = Buffer.from(css)

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
