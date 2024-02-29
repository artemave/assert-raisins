import {execSync} from 'child_process'
import {test} from '../../../index.js'

test('also works', () => {
  execSync(`touch ${process.cwd()}/test/results/otherTest`)
})

test('really "really" works', () => {
  execSync(`touch ${process.cwd()}/test/results/otherTest2`)
})
