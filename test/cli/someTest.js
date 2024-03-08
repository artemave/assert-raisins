import fs from 'node:fs'
import assert from 'node:assert'
import { it, beforeEach, run } from '../../lib/api.js'

beforeEach(function() {
  fs.rmSync('./test/tmp', { recursive: true, force: true })
  fs.mkdirSync('./test/tmp', { recursive: true })
})

it('works', function() {
  fs.writeFileSync(`./test/tmp/someTest${Math.random()}`, 'balls')
  assert(true)
})

run()
