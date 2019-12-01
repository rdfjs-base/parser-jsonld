const concat = require('concat-stream')
const jsonld = require('jsonld')
const rdf = require('@rdfjs/data-model')
const Readable = require('readable-stream')

class ParserStream extends Readable {
  constructor (input, { baseIRI = '', context = null, factory = rdf } = {}) {
    super({
      objectMode: true,
      read: () => {}
    })

    this.baseIRI = baseIRI
    this.context = context
    this.factory = factory

    const concatStream = concat({ encoding: 'string' }, (data) => {
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
        if (plainTerm.value.startsWith('null:/')) {
          // remove null:/ workaround for relative IRIs
          return this.factory.namedNode(plainTerm.value.slice(6))
        }

        return this.factory.namedNode(plainTerm.value)
      case 'BlankNode':
        return this.factory.blankNode(plainTerm.value.substr(2))
      case 'Literal':
        return this.factory.literal(plainTerm.value, plainTerm.language || this.factory.namedNode(plainTerm.datatype.value))
      case 'DefaultGraph':
        return this.factory.defaultGraph()
      default:
        throw Error('unknown termType: ' + plainTerm.termType)
    }
  }

  parse (data) {
    return ParserStream.toPlainObject(data).then((object) => {
      // forward context as prefixes if available
      if (typeof object['@context'] === 'object') {
        Object.keys(object['@context']).forEach((prefix) => {
          this.emit('prefix', prefix, this.factory.namedNode(object['@context'][prefix]))
        })
      }

      // use null:/ as workaround for relative IRIs
      const toRdfOptions = { base: this.baseIRI || 'null:/' }

      // use context from options if given
      if (this.context) {
        toRdfOptions.expandContext = this.context
      }

      return jsonld.promises.toRDF(object, toRdfOptions)
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

  static toPlainObject (data) {
    if (typeof data === 'string') {
      return new Promise((resolve, reject) => {
        try {
          resolve(JSON.parse(data))
        } catch (err) {
          reject(err)
        }
      })
    }

    if (typeof data === 'object') {
      return Promise.resolve(data)
    }

    return Promise.reject(new Error('unknown type'))
  }
}

module.exports = ParserStream
