const { finished } = require('readable-stream')

function waitFor (stream, resume = false) {
  const result = new Promise((resolve, reject) => {
    finished(stream, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

  if (resume) {
    stream.resume()
  }

  return result
}

module.exports = waitFor
