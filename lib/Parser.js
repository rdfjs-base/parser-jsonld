'use strict'

const ParserStream = require('./ParserStream')

class Parser {
  constructor (options) {
    this.options = options
  }

  import (input) {
    return new ParserStream(input, this.options)
  }

  static import (input, options) {
    return new ParserStream(input, options)
  }
}

module.exports = Parser
