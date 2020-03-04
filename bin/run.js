const {run} = require('..')

!(async () => {
  const args = process.argv.reduce((result, arg) => {
    let [key, value] = arg.split('=')
    key = key.replace('--', '')
    result[key] = value

    return result
  }, {})

  await run(args)
})()
