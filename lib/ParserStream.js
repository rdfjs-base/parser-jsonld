const concat = require('concat-stream')
const jsonld = require('jsonld')
const rdf = require('@rdfjs/data-model')
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

  term (plainTerm) {
    switch (plainTerm.termType) {
      case 'NamedNode':
        return this.factory.namedNode(plainTerm.value)
      case 'BlankNode':
        return this.factory.blankNode(plainTerm.value)
      case 'Literal':
        return this.factory.literal(plainTerm.value, plainTerm.language || this.factory.namedNode(plainTerm.datatype.value))
      case 'DefaultGraph':
        return this.factory.defaultGraph()
      default:
        throw Error('unknown termType: ' + plainTerm.termType)
    }
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

      return jsonld.promises.toRDF(json, toRdfOptions)
    }).then(plainQuads => {
      plainQuads.forEach(plainQuad => {
        this.push(this.factory.quad(
          this.term(plainQuad.subject),
          this.term(plainQuad.predicate),
          this.term(plainQuad.object),
          this.term(plainQuad.graph)))
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
    }

    return Promise.reject(new Error('unknown type'))
  }
}

module.exports = ParserStream
