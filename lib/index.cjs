'use strict';

var sassLib = require('sass');
var path = require('path');
var os = require('os');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return n;
}

var sassLib__namespace = /*#__PURE__*/_interopNamespace(sassLib);

/**
 * @typedef {import('sass').Options<'sync'>} Options
 */

/**
 * @param {boolean} isDev
 * @returns {Options}
 * */
function defaults(isDev) {
  return {
    style: isDev ? 'expanded' : 'compressed',
    sourceMap: isDev,
    sourceMapIncludeSources: isDev,
    loadPaths: ['node_modules'],
    entries: {}
  };
}

/**
 * Normalize plugin options
 * @param {Options} [options]
 * @returns {Object}
 */
function normalizeOptions(options = {}, isDev) {
  // make sure entries are not added to defaults on repeat runs
  const entries = Object.assign({}, options.entries || {});
  // force async:false, is much slower according to https://sass-lang.com/documentation/js-api/modules#compileAsync
  // only benefit is being able to use async plugins
  // local perf tests on bootstrap 5 SCSS have revealed 3x slower build
  return Object.assign({}, defaults(isDev), options, {
    async: false,
    entries
  });
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
    const dest = path.join(parentDir, key);
    const filename = path.basename(key, path.extname(key));
    result[dest] = path.join(path.dirname(key), `${filename}.css`);
    return result;
  }, {});
}

/**
 * A Metalsmith plugin to compile SASS/SCSS files
 *
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 * @example
 * const isDev = metalsmith.env('NODE_ENV') === 'development'
 *
 * // compile all scss/sass files in metalsmith.source()
 * metalsmith.use(sass()) // defaults
 *
 * metalsmith.use(sass({  // explicit defaults
 *   style:  isDev ? 'expanded' : 'compressed',
 *   sourceMap: isDev,
 *   sourceMapIncludeSources: isDev,
 *   loadPaths: ['node_modules']
 *   entries: {
 *     // add scss entry points from
 *     'lib/outside-source.scss': 'relative/to/dest.css'
 *   }
 * }))
 */
function sass(options) {
  return function sass(files, metalsmith, done) {
    options = normalizeOptions(options, metalsmith.env('NODE_ENV') === 'development');
    const debug = metalsmith.debug('@metalsmith/sass');
    function relPath(path$1, root) {
      return path.relative(root || metalsmith.directory(), metalsmith.path(path$1));
    }
    const srcPath = relPath(metalsmith.source());

    // assume all .scss files under metalsmith.source are sources
    const implicitEntries = metalsmith.match('**/!(_)*.s{c,a}ss').filter(entry => !Object.keys(options.entries).find(key => relPath(key, metalsmith.source()) === entry));
    if (implicitEntries.length) {
      Object.assign(options.entries, inferEntries(srcPath, implicitEntries));
    }
    debug('Running with options %O', options);
    const errors = [];
    Object.entries(options.entries).forEach(([entryKey, dest]) => {
      const srcRelPath = relPath(entryKey, metalsmith.source());
      const isInSrcDir = Object.prototype.hasOwnProperty.call(files, srcRelPath);
      dest = path.normalize(dest);
      try {
        let compiled;
        if (isInSrcDir) {
          // if the sass file is inside src, it could contain front-matter or templating
          // therefore it is unsafe/error-prone to (re-)read it from disk.
          // SASS doesn't know the file path of the source file (=required for relative imports)
          // so we need to add it & it should be relative to process.cwd (='.')
          const compileOptions = Object.assign({}, options, {
            loadPaths: [].concat(options.loadPaths, [path.dirname(relPath(entryKey, '.'))])
          });
          compiled = sassLib__namespace.compileString(files[srcRelPath].contents.toString(), compileOptions);
        } else {
          compiled = sassLib__namespace.compile(metalsmith.path(entryKey), options);
        }
        let css = compiled.css;
        if (options.sourceMap) {
          const sourceMapPath = `${dest}.map`;
          // relative source map paths are the safest as the build folder could be served from a subpath
          const sourceMapRelPath = relPath(sourceMapPath, path.dirname(dest));
          files[sourceMapPath] = {
            contents: Buffer.from(JSON.stringify(compiled.sourceMap))
          };
          css += `${os.EOL}/*# sourceMappingURL=${sourceMapRelPath} */`;
        }

        // if the sass entry is inside Metalsmith.source...
        if (isInSrcDir) {
          // ...reuse its file metadata
          files[dest] = files[srcRelPath];
          // ...then delete the source
          delete files[srcRelPath];
        } else {
          files[dest] = {};
        }

        // finally (over)write its contents
        files[dest].contents = Buffer.from(css);
        debug('Finished compiling %s to %s', entryKey, dest);
      } catch (err) {
        // we don't call done(err) so we can log multiple sass errors at once for multiple entrypoints
        // this is more convenient than having to re-run the build on each subsequent error
        errors.push(err);
      }
    });

    // cleanup sass partials
    const sassPartials = metalsmith.match('**/_*.s{c,a}ss', Object.keys(files));
    if (sassPartials.length) {
      sassPartials.forEach(path => {
        delete files[path];
      });
      // sass partials are read into memory by the SASS lib,
      // keeping them inside metalsmith.source() creates read overhead
      debug.warn('Removed %s partials from the build. For better performance, move your SASS partials out of "%s"', sassPartials.length, metalsmith.source());
    }
    errors.forEach(err => debug.error('Sass compilation error: %s', err.message));
    done(errors[0]);
  };
}

module.exports = sass;
//# sourceMappingURL=index.cjs.map
