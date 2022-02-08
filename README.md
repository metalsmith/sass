# @metalsmith/sass

A Metalsmith plugin to compile SASS/SCSS files

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

Compile SASS/SCSS source & lib files to CSS using [dart-sass](https://sass-lang.com/dart-sass).

## Features

- Automatically compiles all .scss/.sass files in `Metalsmith.source()`.
- Automatically removes all `_partial.scss/sass` files from the build after compilation
- Add files from outside the source dir with the `entries` option. Specify `'relative/to/dir/style.scss': 'relative/to/destination/style.css'` key-value pairs in the `entries` object for all root stylesheets.
- Provides sourcemaps and access to all advanced [sass options](https://sass-lang.com/documentation/js-api/interfaces/Options) except async.
- Compatible with [metalsmith-postcss](https://github.com/webketje/metalsmith-postcss)

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
const isDev = process.env.NODE_ENV === 'development';

// compile all scss/sass files in metalsmith.source()
metalsmith.use(sass()) // defaults

metalsmith.use(sass({  // explicit defaults
  style:  isDev ? 'expanded' : 'compressed',
  sourceMap: isDev,
  sourceMapIncludeSources: isDev,
  loadPaths: ['node_modules']
  entries: {
    // add scss entry points from
    'lib/outside-source.scss': 'style/inside-source.css'
  }
}))
```

If `process.env.NODE_ENV` is _explicitly_ set to development,`@metalsmith/sass` will automatically generate sourcemaps and will not minify the output.

### Entries

If you had a blog project with 2 SCSS stylesheets, `index.scss` to be loaded everywhere, and `blogposts.scss` only on blog post pages:

```plaintext
my-blog
├── lib
|   ├── index.scss
│   └── _lib-partial.scss
└── src
    ├── blog.html
    ├── index.html
    └── css
        ├── _in-source-partial.scss
        └── blogposts.scss
```

...you could specify the following config:

```js
metalsmith.use(
  sass({
    entries: {
      'lib/index.scss': 'css/index.css'
    }
  })
)
```

_Note: the keys in the `entries` option are *relative to `Metalsmith.directory`*, while the values are *relative to `Metalsmith.destination`*._

With this setup metalsmith will generate the following build:

```plaintext
build
  ├── css
  │   ├── blogposts.css
  │   └── index.css
  ├── blog.html
  └── index.html
```

Partial `_in-source-partial.scss` is automatically removed from the build after compilation.
When not explicitly specified in the config, in-source `.scss/.sass` files are added as entries `'<source>/file.scss': <dest>/file.css`.
If you want to move or rename the in-source SCSS entries in the build, specify them explicitly in the `entries` config. For example let's write the `blogpost.scss` to `css/blog/index.css` instead, without touching our source dir structure:

```js
metalsmith.use(
  sass({
    entries: {
      'lib/index.scss': 'css/index.css',
      'src/blogposts.scss': 'css/blog/index.css'
    }
  })
)
```

The result:

```plaintext
build
  ├── css
  │   ├── index.css
  │   └── blog
  │       └── index.css
  ├── blog.html
  └── index.html
```

### @import/ @use partials

Sass partials are processed by [dart-sass](https://sass-lang.com/dart-sass). @metalsmith/sass will gracefully handle in-source partials, but they will be read into memory by Metalsmith. If you don't need to preprocess sass partials with any other metalsmith plugin it is _better to store partials outside the source directory_, eg:

```plaintext
my-blog
├── lib
│   ├── _partial1.scss
│   └── _partial2.scss
└── src
    └── css
        └── index.scss
```

### Passing metadata to SASS files

You can pass metadata to SASS files inside `Metalsmith.source()` through front-matter in the file or global metadata. For example, let's pass metalsmith `theme` metadata to SASS and pre-compile with [metalsmith-in-place](https://github.com.metalsmith/metalsmith-in-place) and [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars) (notice the final `.hbs` extension):

`index.scss.hbs`

```scss
---
fontfamily: 'Arial, sans-serif'
---
$color-primary: {{ theme.color.primary }};
$color-background: {{ theme.color.background }};

body {
  font-family: {{ fontfamily }};
  color: $color-primary;
  background-color: $color-background;
}
```

Just take care to run the in-place plugin before sass:

```js
const Metalsmith = require('metalsmith')
const inPlace = require('metalsmith-in-place')
const sass = require('@metalsmith/sass')

Metalsmith(__dirname)
  .metadata({
    theme: {
      color: {
        primary: '#333444',
        background: '#EEEFFF'
      }
    }
  })
  .use(inPlace())
  .use(sass())
  .build((err) => {
    if (err) throw err
    console.log('Success!')
  })
```

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
        "sourceMapIncludeSources": false,
        "loadPaths": ["node_modules"],
        "entries": {
          "lib/scss/index.scss": "assets/styles.css"
        }
      }
    }
  ]
}
```

## Node compatibility

This plugin runs on Node >= 12. If you need to compile sass/scss on earier Node versions, use the [metalsmith-sass](https://github.com/stevenschobert/metalsmith-sass) which uses the (no longer canonical) lib-sass.

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
