let javadetect = require('grunt-html/lib/javadetect');
let jar = require('vnu-jar');
let portastic = require('portastic');

module.exports = function (grunt) {
    grunt.registerTask('vnuserver', 'Start the Nu Html Checker server.', function () {
        let opt = this.options({port: 8888, skippable: false, persist: false});
        let done = this.async();
        portastic.test(opt.port, function (open) {
            if (!open) {
                if (opt.skippable) {
                    grunt.log.debug('Port ' + opt.port + ' in use. Skipping server startup.');
                    done();
                } else {
                    done(Error('Port ' + opt.port + ' in use. To ignore, set skippable: false.'));
                }
                return;
            }

            let child;
            let cleanup = function () {
                let killing = grunt.log.write('Killing vnuserver...');
                child.kill('SIGKILL');
                killing.ok();
            };
            if (!opt.persist) {
                process.on('exit', cleanup);
                let exit = grunt.util.exit;
                grunt.util.exit = function () { // This seems to be the only reliable on-exit hook.
                    cleanup();
                    return exit.apply(grunt.util, arguments);
                };
            }

            javadetect(function(err, java) {
                if (err) {
                    throw err;
                }
                const [majorVersion, minorVersion] = java.version.split('.').map(Number);
                if ((majorVersion !== 1 && majorVersion < 8) || (majorVersion === 1 && minorVersion < 8)) {
                    throw new Error(`\nUnsupported Java version used: ${java.version}. Java 8 environment or up is required!`);
                }
                let args = [(java.arch === 'ia32' ? '-Xss512k' : ''), '-cp', jar, 'nu.validator.servlet.Main', opt.port].filter(x => x);
                let vnustartup = grunt.log.write('Starting vnuserver...');
                child = grunt.util.spawn({cmd: 'java', args: args}, function(error, stdout, stderr) {
                    if (error && (error.code !== 1 || error.killed || error.signal)) {
                        done(false);
                    }
                });
                child.stdout.on('data', function (chunk) {
                    if (chunk.toString().indexOf('Checker service started at') >= 0) {
                        vnustartup.ok();
                        done();
                    }
                });
                child.stdout.on('data', function (chunk) {
                    if (chunk.toString().indexOf('java.io.IOException: Failed to bind to') >= 0) {
                        vnustartup.error();
                        done(Error('Port ' + opt.port + ' in use. Shutting down.'));
                        cleanup();
                    }
                });
            });
        });
    });
};
