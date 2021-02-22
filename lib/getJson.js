const http = require('http')

module.exports = async function(url) {
  return new Promise((resolve, reject) => {
    // copied from node docs https://nodejs.org/api/http.html#http_http_get_url_options_callback
    http.get(url, (res) => {
      const { statusCode } = res
      const contentType = res.headers['content-type']

      let error
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`)
      }
      if (error) {
        // Consume response data to free up memory
        res.resume()
        reject(error)
      }

      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', (chunk) => { rawData += chunk });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData)
          resolve(parsedData)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}
