import { run } from './index.js'

const args = process.argv.reduce((result, arg) => {
  let [key, ...rest] = arg.split('=')
  const value = rest.join('=')

  key = key.replace('--', '')
  result[key] = value

  return result
}, {})

run(args).then(success => {
  process.exit(success ? 0 : 1)
}).catch(e => {
  console.error(e)
  process.exit(1)
})
