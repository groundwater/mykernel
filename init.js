var serial = require('./serial.js')
var Screen = require('./screen')
var map = require('./keymap.js')

var start = 0xB8000;
var bytes = 2;
var cols  = 80;
var rows  = 25;
var size  = cols * rows * bytes;

var tick = 0;

// initialize display based on frame buffer
var display = new Uint16Array(buff(start, size));
var screen  = new Screen(display);
serial.init()
serial.write('> ')

var line = []

while (true) {
  var y,
      sig
  if (sig = poll())
  if (sig === 4) {
    screen.write('>')
    readSerial()
  } else if (sig === 1) {
    inb(0x60)
    screen.write(String(sig))
  }
  else screen.write(String(sig))
}

function readSerial() {
  var x = serial.read();
  if (x > 0) {
    var c = String.fromCharCode(x)
    if (c==='\n') {
      screen.newline()
      try {
        var o = eval(line.join(''))
        serial.write(String(o))
      } catch (e) {
        serial.write(e.message)
      }
      serial.write('\n> ')
      line = []
    } else {
      line.push(c)
    }
  }
}
