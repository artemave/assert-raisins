const {execSync} = require('child_process')
const {it} = require('../..')

it('works', function() {
  execSync(`touch ${process.cwd()}/test/results/someTest`)
})
