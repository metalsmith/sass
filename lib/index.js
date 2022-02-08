const sassLib = require('sass')
const debug = require('debug')('@metalsmith/sass')
const { relative, dirname, extname, basename, join } = require('path')
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
 * Infer entries from Metalsmith.source() file paths
 *
 * @param {string} parentDir
 * @param {string[]} filepaths
 * @returns {Object.<string,string>}
 */
function inferEntries(parentDir, filepaths) {
  return filepaths.reduce((result, key) => {
    const dest = join(parentDir, key)
    const filename = basename(key, extname(key))
    result[dest] = join(dirname(key), `${filename}.css`)
    return result
  }, {})
}

/**
 * A Metalsmith plugin to compile SASS/SCSS files
 *
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
function initSass(options) {
  options = normalizeOptions(options)

  return function sass(files, metalsmith, done) {
    function relPath(path, root) {
      return relative(root || metalsmith.directory(), metalsmith.path(path))
    }
    const srcPath = relPath(metalsmith.source())

    // assume all .scss files under metalsmith.source are sources
    const implicitEntries = metalsmith
      .match('**/!(_)*.s{c,a}ss')
      .filter((entry) => !Object.keys(options.entries).find((key) => relPath(key, metalsmith.source()) === entry))

    if (implicitEntries) {
      Object.assign(options.entries, inferEntries(srcPath, implicitEntries))
    }

    debug('Running with options %o', options)

    const errors = []
    Object.entries(options.entries).forEach(([entryKey, dest]) => {
      const srcRelPath = relPath(entryKey, metalsmith.source())
      const isInSrcDir = Object.prototype.hasOwnProperty.call(files, srcRelPath)

      try {
        let compiled

        if (isInSrcDir) {
          // if the sass file is inside src, it could contain front-matter or templating
          // therefore it is unsafe/error-prone to (re-)read it from disk.
          // SASS doesn't know the file path of the source file (=required for relative imports)
          // so we need to add it & it should be relative to process.cwd (='.')
          const compileOptions = {
            ...options,
            loadPaths: [...options.loadPaths, dirname(relPath(entryKey, '.'))]
          }
          compiled = sassLib.compileString(files[srcRelPath].contents.toString(), compileOptions)
        } else {
          compiled = sassLib.compile(metalsmith.path(entryKey), options)
        }

        let css = compiled.css

        if (options.sourceMap) {
          const sourceMapPath = `${dest}.map`
          // relative source map paths are the safest as the build folder could be served from a subpath
          const sourceMapRelPath = relPath(sourceMapPath, dirname(dest))
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
        } else {
          files[dest] = {}
        }

        // finally (over)write its contents
        files[dest].contents = Buffer.from(css)

        debug('Finished compiling %s to %s', entryKey, dest)
      } catch (err) {
        // we don't call done(err) so we can log multiple sass errors at once for multiple entrypoints
        // this is more convenient than having to re-run the build on each subsequent error
        errors.push(err)
      }
    })

    // cleanup sass partials
    const sassPartials = metalsmith.match('**/_*.s{c,a}ss')
    if (sassPartials.length) {
      sassPartials.forEach((path) => {
        delete files[path]
      })
      // sass partials are read into memory by the SASS lib,
      // keeping them inside metalsmith.source() creates read overhead
      debug(
        'Removed %s partials from the build. For better performance, move your SASS partials out of "%s"',
        sassPartials.length,
        metalsmith.source()
      )
    }

    errors.forEach((err) => debug('Sass compilation error: %s', err.message))
    done(errors[0])
  }
}

module.exports = initSass
