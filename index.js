const ParserStream = require('./lib/ParserStream')
const Sink = require('rdf-sink')

class Parser extends Sink {
  constructor (options) {
    super(ParserStream, options)
  }

  static import (input, options) {
    return new ParserStream(input, options)
  }
}

module.exports = Parser
