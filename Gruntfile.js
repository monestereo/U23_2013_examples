var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
module.exports = function (grunt) {
  // kill cmds on Ctrl+C
  process.openStdin().on("keypress", function(chunk, key) {
    if(key && key.name === "c" && key.ctrl) {
      grunt.log.writeln('ctrl+c');
      kill();
      done();
    }
  });

  process.stdin.setRawMode();

  // default task
  grunt.registerTask(
    'default',
    [
      'upload',
      'openocd',
      'trace'
    ]
  );

  grunt.registerTask('list', 'list all available projects', function() {
    var done = this.async();
    exec('ls -d ./examples/*/', function(err, stdout, stderr) {
      if (stdout) {
        grunt.log.writeln('###### Examples ######');
        var examples = stdout.split(/\r\n|\r|\n/g);
        for (var exmpl in examples) {
          grunt.log.writeln(examples[exmpl].replace('./examples/', '').replace('/', ''));
        }
      }
      exec('ls -d ./apps/*/', function(err, stdout, stderr) {
        if (stdout) {
          grunt.log.writeln('###### Apps ######');
          var apps = stdout.split(/\r\n|\r|\n/g);
          for (var app in apps) {
            grunt.log.writeln(apps[app].replace('./apps/', '').replace('/', ''));
          }
        }
        done();
      });
    });
  });

  // upload script to board
  grunt.registerTask('upload', 'upload script', function() {
    var done = this.async();

    var cmd = 'make upload-fast';
    cmd += (this.args.length > 0) ? ' FIRMWARE=' + this.args[0] : '';
    
    exec(cmd, function(error, stdout, stderr) {
      //grunt.log.writeln(error);
      //grunt.log.writeln(stdout);
      if (stderr.indexOf('Flash written and verified!') >= 0) {
        done();
      } else {
        grunt.log.error('oups! upload didn\'t work! try again!');
        kill();
        done(false);
      }
    });
  });

  // start openocd debugger
  grunt.registerTask('openocd', 'run openocd', function() {
    var done = this.async();
    exec('killall openocd');
    
    var openocd = spawn('openocd', ['-f', 'interface/stlink-v2.cfg', '-f', 'target/stm32f4x_stlink.cfg']);
    openocd.stdout.on('data', function (data) {
      //grunt.log.writeln('openocd stdout: ' + data);
    });

    openocd.stderr.on('data', function (data) {
      //grunt.log.writeln('openocd stderr: ' + data);
    });

    openocd.on('close', function (code) {
      if (code) {
        grunt.log.writeln('openocd process exited with code ' + code);
        kill();
        done(false);

      }
    });

    var intervcount = 0;
    grunt.log.write('starting openocd');
    var interv = setInterval(function(){
      exec('pidof openocd', function(error, stdout, stderr){
        if (stdout) {
          var pid = parseInt(stdout, 10);
          grunt.log.writeln('openocd started');
          clearInterval(interv);
          done();
        } else {
          if (intervcount == 9) {
            clearInterval(interv);
            kill();
            done(false);
          }
        }
        intervcount++;
        grunt.log.write('.');
      });
    }, 1000);
  });

  // make trace
  grunt.registerTask('trace', 'make trace to get printf output', function(){
    var done = this.async();
    var trace = spawn('make', ['trace']);
    grunt.log.writeln('#################### DEBUG OUTPUT ####################');
    
    trace.stdout.on('data', function (data) {
      grunt.log.writeln(data);
    });

    trace.on('close', function (code) {
      if (code) {
        grunt.log.writeln('trace process exited with code ' + code);
        done();
      }
    });
  });

  function kill() {
    exec('killall openocd');
    exec('killall make');
    exec('killall stlink-trace');
    grunt.log.writeln('something went wrong. try unplugging and replugging the board.\n (sometimes waiting a few seconds helps also)');
  }
};