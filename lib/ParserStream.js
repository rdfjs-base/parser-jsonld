const concat = require('concat-stream')
const jsonld = require('jsonld')
const rdf = require('rdf-data-model')
const Source = require('rdf-source')

function term (factory, options, blankNodes) {
  if (options.type === 'IRI') {
    return factory.namedNode(options.value)
  }

  if (options.type === 'blank node') {
    if (!(options.value in blankNodes)) {
      blankNodes[options.value] = factory.blankNode()
    }

    return blankNodes[options.value]
  }

  return factory.literal(options.value, options.language || options.datatype)
}

class ParserStream extends Source {
  constructor (input, options) {
    super()

    options = options || {}

    let baseIRI = options.baseIRI || ''
    let factory = options.factory || rdf

    this._read = () => {
      let concatStream = concat({encoding: 'string'}, (data) => {
        if (!data) {
          return
        }

        let json = null

        try {
          json = JSON.parse(data)
        } catch (err) {
          return this.emit('error', err)
        }

        jsonld.toRDF(json, {base: baseIRI}, (err, rawGraph) => {
          if (err) {
            return this.emit('error', err)
          }

          let blankNodes = {}

          Object.keys(rawGraph).forEach((graphIri) => {
            let graph = graphIri !== '@default' ? factory.namedNode(graphIri) : null

            rawGraph[graphIri].forEach((triple) => {
              let quad = factory.quad(
                term(factory, triple.subject, blankNodes),
                term(factory, triple.predicate, blankNodes),
                term(factory, triple.object, blankNodes),
                graph)

              this.push(quad)
            })
          })

          this.push(null)
        })
      })

      input.on('error', (err) => {
        this.emit('error', err)
      })

      input.pipe(concatStream)
    }
  }
}

module.exports = ParserStream
