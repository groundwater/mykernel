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


serial.init(screen, function (chr) {
  if (chr === 13)
    return screen.returnOrClear();

  screen.write(String.fromCharCode(chr));
});

serial.write('> ')

function prompt() {
  screen.newline()
  screen.write('> ')
}

prompt();

var sig;
var line = [];

while (true) {
  sig = poll();

  if (!sig) {
    continue;
  }

  switch(sig) {
    case 4: //COM1
      serial.handleInt();
      break;

    case 1: //keyboard
      var key = map(inb(0x60));

      if (key === '\n') {
        line.push('\n> ');
        serial.write(line.join(''));
        line.length = 0;
        screen.returnOrClear();
        prompt();
      } else if (key === '\b') {
        line.pop();
        screen.backspace();
      } else {
        if (key) {
          line.push(key);
          screen.writeChar(key);
        }
      }

      key = null;
      break;

      default: //Unhandled interrupt
        screen.write(String(sig));
  }
}