'use strict'

const ParserStream = require('./ParserStream')

class Parser {
  constructor (options) {
    this.options = options
  }

  read (input) {
    return new ParserStream(input, this.options)
  }

  static read (input, options) {
    return new ParserStream(input, options)
  }
}

module.exports = Parser
