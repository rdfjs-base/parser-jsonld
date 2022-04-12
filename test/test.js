const { rejects, strictEqual } = require('assert')
const sinkTest = require('@rdfjs/sink/test')
const { describe, it } = require('mocha')
const { Readable } = require('readable-stream')
const JSONLDParser = require('..')
const toReadable = require('./support/toReadable')
const waitFor = require('./support/waitFor')

describe('@rdfjs/parser-jsond', () => {
  sinkTest(JSONLDParser, { readable: true })

  it('should support Named Node subjects', async () => {
    const example = {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'http://example.org/subject')
  })

  it('should support empty Named Node subjects', async () => {
    const example = {
      '@id': '',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, '')
    strictEqual(output[0].predicate.termType, 'NamedNode')
    strictEqual(output[0].predicate.value, 'http://example.org/predicate')
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
  })

  it('should support relative Named Node subjects', async () => {
    const example = {
      '@id': 'relative',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'relative')
  })

  it('should support Blank Node subjects', async () => {
    const example = {
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'BlankNode')
  })

  it('should parse the predicate', async () => {
    const example = {
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].predicate.termType, 'NamedNode')
    strictEqual(output[0].predicate.value, 'http://example.org/predicate')
  })

  it('should parse a Named Node object', async () => {
    const example = {
      'http://example.org/predicate': {
        '@id': 'http://example.org/object'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'NamedNode')
    strictEqual(output[0].object.value, 'http://example.org/object')
  })

  it('should parse a Blank Node object', async () => {
    const example = {
      'http://example.org/predicate': {}
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'BlankNode')
    strictEqual(output[0].object.value.startsWith('_:'), false)
  })

  it('should keep Blank Node object mapping', async () => {
    const example = {
      'http://example.org/predicate1': { '@id': '_:b0' },
      'http://example.org/predicate2': { '@id': '_:b0' }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 2)
    strictEqual(output[0].object.equals(output[1].object), true)
  })

  it('should parse a Literal object', async () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
    strictEqual(output[0].object.language, '')
    strictEqual(output[0].object.datatype.value, 'http://www.w3.org/2001/XMLSchema#string')
  })

  it('should parse the language of a Literal object', async () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@language': 'en'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
    strictEqual(output[0].object.language, 'en')
    strictEqual(output[0].object.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
  })

  it('should parse the datatype of a Literal object', async () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@type': 'http://example.org/datatype'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
    strictEqual(output[0].object.language, '')
    strictEqual(output[0].object.datatype.value, 'http://example.org/datatype')
  })

  it('should parse the datatype of a Literal object into a full featured Literal', async () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@type': 'http://example.org/datatype'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(typeof output[0].object.datatype.equals, 'function')
  })

  it('should use the default graph if none was given', async () => {
    const example = {
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].graph.termType, 'DefaultGraph')
  })

  it('should parse graph', async () => {
    const example = {
      '@id': 'http://example.org/graph',
      '@graph': {
        'http://example.org/predicate': 'object'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].graph.termType, 'NamedNode')
    strictEqual(output[0].graph.value, 'http://example.org/graph')
  })

  it('should use baseIRI option', async () => {
    const example = {
      '@id': 'subject',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser({ baseIRI: 'http://example.org/' })
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'http://example.org/subject')
  })

  it('should use context option', async () => {
    const example = {
      '@id': 'subject',
      predicate: 'object'
    }

    const context = {
      '@vocab': 'http://example.org/'
    }

    const parser = new JSONLDParser({
      baseIRI: 'http://example.org/',
      context: context
    })
    const stream = parser.import(toReadable(example))
    const output = []

    stream.on('data', triple => {
      output.push(triple)
    })

    await waitFor(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'http://example.org/subject')
  })

  it('should forward errors from the input stream', async () => {
    const input = new Readable({
      read: () => {
        setTimeout(() => {
          input.destroy(new Error('test'))
        }, 0)
      }
    })
    const parser = new JSONLDParser()
    const stream = parser.import(input)

    await rejects(waitFor(stream, true))
  })

  it('should throw an error if JSON is invalid', async () => {
    const parser = new JSONLDParser()
    const stream = parser.import(toReadable('{'))

    await rejects(waitFor(stream, true))
  })

  it('should throw an error if JSON-LD is invalid', async () => {
    const example = {
      '@context': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))

    await rejects(waitFor(stream, true))
  })

  it('should emit a prefix event for each context entry', async () => {
    const example = {
      '@context': {
        ex1: 'http://example.org/1',
        ex2: 'http://example.org/2'
      }
    }

    const prefixes = {}

    const parser = new JSONLDParser()
    const stream = parser.import(toReadable(example))

    stream.on('prefix', (prefix, namespace) => {
      prefixes[prefix] = namespace
    })

    await waitFor(stream, true)

    strictEqual(prefixes.ex1.value, 'http://example.org/1')
    strictEqual(prefixes.ex2.value, 'http://example.org/2')
  })
})
