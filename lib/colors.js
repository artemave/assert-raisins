import { WriteStream } from 'tty'

// copied from https://github.com/volument/barecolor/blob/master/index.js
const colors = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90
}

class Colors {
  constructor({ stdout = { write() {} } } = {}) {
    this.stdout = stdout
  }
}

for (let name in colors ) {
  const color = colors[name]

  Colors.prototype[name] = function(msg) {
    if (WriteStream.prototype.hasColors()) {
      msg = `\u001b[${color}m${msg}\u001b[39m`
    }

    this.stdout.write(msg)
  }

  Colors.prototype[name + 'ln'] = function(str) {
    this[name](str + '\n')
  }
}

export default Colors
