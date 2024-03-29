import Metalsmith from 'metalsmith';
import { Options as SassOptions } from 'sass';

export default sass;
export type Options = SassOptions<'sync'> & {
  /** A dictionary of `'ms/dir/source.scss': 'ms/build/output.css ` definitions */
  entries: { [key:string]: string }
};
/**
 * A Metalsmith plugin to compile SASS/SCSS files
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
declare function sass(options: Options): Metalsmith.Plugin;