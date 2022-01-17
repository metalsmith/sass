# @metalsmith/sass

A Metalsmith plugin to compile SASS/SCSS files

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

Compile SASS/SCSS source files to CSS using [dart-sass](https://sass-lang.com/dart-sass). Specify `'lib/style.scss': 'style.css'` key-value pairs in the `entries` object for all root stylesheets. Provides SCSS sourcemaps and access to all advanced [sass options](https://sass-lang.com/documentation/js-api/interfaces/Options)

## Installation

NPM:
```
npm install @metalsmith/sass
```
Yarn:
```
yarn add @metalsmith/sass
```

## Usage

Pass `@metalsmith/sass` to `metalsmith.use` :

```js
const sass = require('@metalsmith/sass')

metalsmith.use(sass({ entries: {
    // 'src.scss': 'destination.css'
}})) // defaults
metalsmith.use(sass({  // explicit defaults
  style: process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
  sourceMap: process.env.NODE_ENV === 'development',
  entries: {
    // 'src.scss': 'destination.css'
  }
}))
```

If `process.env.NODE_ENV` is *explicitly* set to development,`@metalsmith/sass` will automatically generate sourcemaps and will not minify the output.

### Example
If you had a blog project with 2 SCSS stylesheets, `main.scss` to be loaded everywhere, and `blogpost.scss` only on blog post pages:

```plaintext
my-blog
├── lib
│   ├── blogpost.scss
│   └── main.scss
└── src
    ├── blog.html
    └── index.html
```
...you would specify the following config:

```js
metalsmith.use(sass({
  entries: {
    'lib/blogpost.scss': 'css/blogpost.css',
    'lib/main.scss': 'css/main.css'
  }
}))
```
**Important**: the keys in the `entries` option are *relative to `Metalsmith.directory`*, while the values are *relative to `Metalsmith.source`*.
With this setup metalsmith will generate the following build:

```plaintext
build
  ├── css
  │   ├── blogpost.css
  │   └── main.css
  ├── blog.html
  └── index.html
```
You could also put the SCSS source files inside `Metalsmith.source` if you prefer (they will be converted and the source .scss files removed), but note that this will make metalsmith read all the SCSS files in memory and is only interesting if you need to read metadata from/ apply other plugins to the files before `@metalsmith/sass` runs.

### Debug

To enable debug logs, set the `DEBUG` environment variable to `@metalsmith/sass`:

Linux/Mac:
```
DEBUG=@metalsmith/sass
```
Windows:
```
set "DEBUG=@metalsmith/sass"
```

Alternatively you can set `DEBUG` to `@metalsmith/*` to debug all Metalsmith core plugins.

### CLI usage

To use this plugin with the Metalsmith CLI, add `@metalsmith/sass` to the `plugins` key in your `metalsmith.json` file:

```json
{
  "plugins": [
    {
      "@metalsmith/sass": {
        "style": "compressed",
        "sourceMap": false,
        "entries": {
          "lib/scss/main.scss": "assets/styles.css"
        }
      }
    }
  ]
}
```

## Node compatibility

This plugin runs on Node >= 10. If you need to compile sass/scss on earier Node versions, use the [metalsmith-sass](https://github.com/stevenschobert/metalsmith-sass) which uses the (no longer canonical) lib-sass.

## License

[LGPL-3.0](LICENSE)

[npm-badge]: https://img.shields.io/npm/v/@metalsmith/sass.svg
[npm-url]: https://www.npmjs.com/package/@metalsmith/sass
[ci-badge]: https://app.travis-ci.com/metalsmith/sass.svg?branch=master
[ci-url]: https://app.travis-ci.com/github/metalsmith/sass
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-core_plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[codecov-badge]: https://img.shields.io/coveralls/github/metalsmith/sass
[codecov-url]: https://coveralls.io/github/metalsmith/sass
[license-badge]: https://img.shields.io/github/license/metalsmith/sass
[license-url]: LICENSE
