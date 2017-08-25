const concat = require('concat-stream')
const jsonld = require('jsonld')
const rdf = require('rdf-data-model')
const Readable = require('readable-stream')

class ParserStream extends Readable {
  constructor (input, options) {
    super({
      objectMode: true,
      read: () => {}
    })

    options = options || {}

    this.baseIRI = options.baseIRI || ''
    this.context = options.context
    this.factory = options.factory || rdf
    this.blankNodes = {}

    const concatStream = concat({encoding: 'string'}, (data) => {
      if (!data) {
        this.push(null)

        return
      }

      this.parse(data).then(() => {
        this.push(null)
      }).catch((err) => {
        this.emit('error', err)
      })
    })

    input.pipe(concatStream)

    input.on('error', (err) => {
      this.emit('error', err)
    })
  }

  term (options) {
    if (options.type === 'IRI') {
      return this.factory.namedNode(options.value)
    }

    if (options.type === 'blank node') {
      if (!(options.value in this.blankNodes)) {
        this.blankNodes[options.value] = this.factory.blankNode()
      }

      return this.blankNodes[options.value]
    }

    return this.factory.literal(options.value, options.language || options.datatype)
  }

  parse (data) {
    return ParserStream.toJson(data).then((json) => {
      // forward context as prefixes if available
      if ('@context' in json) {
        Object.keys(json['@context']).forEach((prefix) => {
          this.emit('prefix', prefix, this.factory.namedNode(json['@context'][prefix]))
        })
      }

      const toRdfOptions = {base: this.baseIRI}

      // use context from options if given
      if (this.context) {
        toRdfOptions.expandContext = this.context
      }

      return jsonld.promises().toRDF(json, toRdfOptions)
    }).then((rawGraph) => {
      Object.keys(rawGraph).forEach((graphIri) => {
        const graph = graphIri !== '@default' ? this.factory.namedNode(graphIri) : null

        rawGraph[graphIri].forEach((triple) => {
          this.push(this.factory.quad(
            this.term(triple.subject),
            this.term(triple.predicate),
            this.term(triple.object),
            graph))
        })
      })
    })
  }

  static toJson (data) {
    if (typeof data === 'string') {
      return new Promise((resolve, reject) => {
        try {
          resolve(JSON.parse(data))
        } catch (err) {
          reject(err)
        }
      })
    } else if (typeof data === 'object') {
      return Promise.resolve(data)
    } else {
      return Promise.reject(new Error('unknown type'))
    }
  }
}

module.exports = ParserStream
