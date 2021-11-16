const Sink = require('@rdfjs/sink')
const ParserStream = require('./lib/ParserStream')

class Parser extends Sink {
  constructor (options) {
    super(ParserStream, options)
  }
}

module.exports = Parser
