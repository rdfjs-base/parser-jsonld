const ParserStream = require('./lib/ParserStream')
const Sink = require('@rdfjs/sink')

class Parser extends Sink {
  constructor (options) {
    super(ParserStream, options)
  }
}

module.exports = Parser
