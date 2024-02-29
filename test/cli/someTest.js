import { execSync } from 'child_process'
import { it, run } from '../../index.js'

let n = 0

it('works', function() {
  execSync(`touch ${process.cwd()}/test/results/someTest${n++}`)
})

run()
