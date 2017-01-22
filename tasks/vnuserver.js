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
                if (java.version[0] !== '1' || (java.version[0] === '1' && java.version[2] < '8')) {
                    throw new Error('\nUnsupported Java version used: ' + java.version + '. v1.8 is required!');
                }
                let args = [(java.arch === 'ia32' ? '-Xss512k' : ''), '-cp', jar, 'nu.validator.servlet.Main', opt.port].filter(x => x);
                let vnustartup = grunt.log.write('Starting vnuserver...');
                child = grunt.util.spawn({cmd: 'java', args: args}, function(error, stdout, stderr) {
                    if (error && (error.code !== 1 || error.killed || error.signal)) {
                        done(false);
                    }
                });
                child.stderr.on('data', function (chunk) {
                    if (chunk.toString().indexOf('INFO:oejs.Server:main: Started') >= 0) {
                        vnustartup.ok();
                        done();
                    }
                    if (chunk.toString().indexOf('java.net.BindException: Address already in use') >= 0) {
                        vnustartup.error();
                        done(Error('Port ' + opt.port + ' in use. Shutting down.'));
                        cleanup();
                    }
                });
            });
        });
    });
};
