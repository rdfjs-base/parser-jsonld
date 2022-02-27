const { Readable } = require('readable-stream')

function toReadable (data) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data)
  }

  return new Readable({
    read: function () {
      setTimeout(() => {
        this.push(data)
        this.push(null)
      }, 1)
    }
  })
}

module.exports = toReadable
