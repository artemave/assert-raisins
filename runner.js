const {run} = require('.')

!(async () => {
  const args = process.argv.reduce((result, arg) => {
    let [key, value] = arg.split('=')
    key = key.replace('--', '')
    result[key] = value

    return result
  }, {})

  const success = await run(args)
  process.exit(success ? 0 : 1)
})()
