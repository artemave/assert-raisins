import {execSync} from 'child_process'
import {test} from '../../../lib/api.js'

test('also works', () => {
  execSync(`touch ${process.cwd()}/test/results/otherTest`)
})

test('really "really" works', () => {
  execSync(`touch ${process.cwd()}/test/results/otherTest2`)
})
