const {execSync} = require('child_process')
const {it, run} = require('../..')

let n = 0

it('works', function() {
  execSync(`touch ${process.cwd()}/test/results/someTest${n++}`)
})

run()
