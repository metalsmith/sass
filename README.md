---
Note: This is a template repository
Usage: 
  - step1: Click "Use this template", see also https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template, fill in new plugin details
  - step2: Search and replace all `core-plugin` `CorePlugin` and `corePlugin` matches with the name of the plugin
  - step3: Delete the front-matter in this file
---
# @metalsmith/~core-plugin~

A metalsmith plugin to...

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

\[Optional\] An extended description of the core plugin

## Installation

NPM:
```
npm install @metalsmith/~core-plugin~
```
Yarn:
```
yarn add @metalsmith/~core-plugin~
```

## Usage

Pass `@metalsmith/~core-plugin~` to `metalsmith.use` :

```js
const ~corePlugin~ = require('@metalsmith/~core-plugin~')

metalsmith.use(~corePlugin~()) // defaults
metalsmith.use(~corePlugin~({  // explicit defaults
  ...
}))
```

### Options (optional)

Optional section with list or table of options, if the plugin has a lot of options

### Specific usage example

Document a first specific usage example

### Specific usage example

Document a second specific usage example

### Debug

To enable debug logs, set the `DEBUG` environment variable to `@metalsmith/~core-plugin~`:

Linux/Mac:
```
DEBUG=@metalsmith/~core-plugin~
```
Windows:
```
set "DEBUG=@metalsmith/~core-plugin~"
```

Alternatively you can set `DEBUG` to `@metalsmith/*` to debug all Metalsmith core plugins.

### CLI usage

To use this plugin with the Metalsmith CLI, add `@metalsmith/~core-plugin~` to the `plugins` key in your `metalsmith.json` file:

```json
{
  "plugins": [
    {
      "@metalsmith/~core-plugin~": {}
    }
  ]
}
```

## Credits (optional)

Special thanks to ... for ...

## License

[MIT](LICENSE)

[npm-badge]: https://img.shields.io/npm/v/@metalsmith/~core-plugin~.svg
[npm-url]: https://www.npmjs.com/package/@metalsmith/~core-plugin~
[ci-badge]: https://app.travis-ci.com/metalsmith/~core-plugin~.svg?branch=master
[ci-url]: https://app.travis-ci.com/github/metalsmith/~core-plugin~
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-core_plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[codecov-badge]: https://img.shields.io/coveralls/github/metalsmith/~core-plugin~
[codecov-url]: https://coveralls.io/github/metalsmith/~core-plugin~
[license-badge]: https://img.shields.io/github/license/metalsmith/~core-plugin~
[license-url]: LICENSE
