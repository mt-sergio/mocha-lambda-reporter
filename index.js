/**
 * Module dependencies.
 */

var Base = require('mocha/lib/reporters/base');
var inherits = require('mocha/lib/utils').inherits;
var color = Base.color;
var cursor = Base.cursor;
var Table = require('cli-table');

/**
 * Expose `Spec`.
 */

exports = module.exports = Spec;

/**
 * Initialize a new `Spec` test reporter.
 *
 * @api public
 * @param {Runner} runner
 */
function Spec(runner) {
  Base.call(this, runner);

  var self = this;
  var indents = 0;
  var n = 0;

  function indent() {
    return Array(indents).join('  ');
  }

  runner.on('start', function() {
    console.log();
  });

  runner.on('suite', function(suite) {
    mySuite = suite;
    ++indents;
    console.log(color('suite', '%s%s'), indent(),
      (suite.myConfig && suite.myConfig.functionName) ? 'λ(' + suite.title + ') ' : suite.title);
  });

  runner.on('suite end', function() {
    --indents;
    if (indents === 1) {
      printTable();
      console.log();
    }
  });

  runner.on('pending', function(test) {
    var fmt = indent() + color('pending', '  - %s');
    console.log(fmt, test.title);
  });

  var mySuite;
  var myTable;
  var old_test_title;

  function printTable() {
    if (myTable) {
      // colors ??

      console.log(myTable.toString());
      myTable = null;
    }
  }

  runner.on('pass', function(test) {
    if (!test.lambdaInvokeTime) {
      var fmt;
      if (test.speed === 'fast') {
        fmt = indent()
          + color('checkmark', '  ' + Base.symbols.ok)
          + color('pass', ' %s');
        cursor.CR();
        console.log(fmt, test.title);
      } else {
        fmt = indent()
          + color('checkmark', '  ' + Base.symbols.ok)
          + color('pass', ' %s')
          + color(test.speed, ' (%dms)');
        cursor.CR();
        console.log(fmt, test.title, test.duration);
      }
    } else {
      if (old_test_title != test.title) {
        printTable();
        cursor.CR();
        console.log(indent(), test.title);

        myTable = new Table({
          head: [color('checkmark', '' + Base.symbols.ok)].concat(mySuite.myConfig.memoryArray),
          style: {head: ['bold'], border: ['grey']}
        });

        for (var i = 0; i < mySuite.myConfig.count; i++) {
          var arr = [i+1];
          for (var j = 0; j < mySuite.myConfig.memoryArray.length; j++) {
            arr.push('');
          }
          myTable.push(arr);
        }
      }

      myTable[test.lambdaNumberId][test.lambdaMemoryId + 1] = test.lambdaInvokeTime;
    }

    old_test_title = test.title;
  });

  runner.on('fail', function(test) {
    cursor.CR();
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
  });

  runner.on('end', self.epilogue.bind(self));
}

/**
 * Inherit from `Base.prototype`.
 */
inherits(Spec, Base);
