import wait from './wait.js'

export default async function retry(fn, retriesLeft = 10, interval = 100) {
  try {
    await fn()
  } catch (e) {
    if (retriesLeft <= 0) {
      throw e
    } else {
      await wait(interval)
      await retry(fn, retriesLeft - 1, interval)
    }
  }
}
