# grunt-vnuserver

[![Code Climate](https://img.shields.io/codeclimate/github/bennieswart/grunt-vnuserver.svg)](https://codeclimate.com/github/bennieswart/grunt-vnuserver)
[![Dependency Status](https://img.shields.io/david/bennieswart/grunt-vnuserver.svg)](https://david-dm.org/bennieswart/grunt-vnuserver)
[![devDependency Status](https://img.shields.io/david/dev/bennieswart/grunt-vnuserver.svg)](https://david-dm.org/bennieswart/grunt-vnuserver#info=devDependencies)

[Grunt][grunt] plugin for starting the [vnu.jar markup checker][vnujar] in server mode.
Plays well with [grunt-html][grunt-html] for faster HTML validation by only starting vnu.jar once, as startup can take a few seconds.

## Getting Started

Install this grunt plugin next to your project's [Gruntfile.js][getting_started] with:

```bash
npm install grunt-vnuserver --save-dev
```

Then add this line to your project's `Gruntfile.js`:

```js
grunt.loadNpmTasks('grunt-vnuserver');
```

## Options

### `port`

* Type: `Number`
* Default: 8888

The port on which to start the server.

```js
all: {
  options: {
      port: 8877
  },
}
```

### `skippable`

* Type: `Boolean`
* Default: `false`

Whether or not to skip server startup if port is already in use.
Task will fail if port is in use and skippable is false.

### `persist`

* Type: `Boolean`
* Default: `false`

Whether or not to keep the vnu server running even after grunt exists.
If false, vnu server is killed when grunt exists.

## Example

Consider the following configuration in Gruntfile.js in which the `watch` task is set to run `htmllint` every time the source file changes.
By starting the validator in server mode once using the `vnuserver` task, validations by `htmllint` can be performed much faster by simply connecting to this already-running server.

```js
module.exports = function (grunt) {
    grunt.initConfig({
        vnuserver: {
        },
        htmllint: {
            all: {
                options: {
                    // This option makes grunt-html connect to the vnu server instance.
                    server: {}
                },
                src: "app.html"
            }
        },
        watch: {
            all: {
                tasks: ['htmllint'],
                files: "app.html"
            }
        },
    });

    grunt.loadNpmTasks('grunt-vnuserver');
    grunt.loadNpmTasks('grunt-html');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['vnuserver', 'watch']);
};
```

## License

Copyright Bennie Swart.
Licensed under the MIT license.

[grunt]: http://gruntjs.com/
[grunt-html]: https://github.com/jzaefferer/grunt-html
[getting_started]: http://gruntjs.com/getting-started
[vnujar]: https://validator.github.io/validator/
