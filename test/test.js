const assert = require('assert')
const { describe, it } = require('mocha')
const sinkTest = require('@rdfjs/sink/test')
const stringToStream = require('string-to-stream')
const JSONLDParser = require('..')
const Readable = require('readable-stream')

function waitFor (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

describe('@rdfjs/parser-jsond', () => {
  sinkTest(JSONLDParser, { readable: true })

  it('should support Named Node subjects', () => {
    const example = {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].subject.termType, 'NamedNode')
      assert.strictEqual(output[0].subject.value, 'http://example.org/subject')
    })
  })

  it('should support empty Named Node subjects', () => {
    const example = {
      '@id': '',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].subject.termType, 'NamedNode')
      assert.strictEqual(output[0].subject.value, '')
    })
  })

  it('should support relative Named Node subjects', () => {
    const example = {
      '@id': 'relative',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].subject.termType, 'NamedNode')
      assert.strictEqual(output[0].subject.value, 'relative')
    })
  })

  it('should support Blank Node subjects', () => {
    const example = {
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].subject.termType, 'BlankNode')
    })
  })

  it('should parse the predicate', () => {
    const example = {
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].predicate.termType, 'NamedNode')
      assert.strictEqual(output[0].predicate.value, 'http://example.org/predicate')
    })
  })

  it('should parse a Named Node object', () => {
    const example = {
      'http://example.org/predicate': {
        '@id': 'http://example.org/object'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].object.termType, 'NamedNode')
      assert.strictEqual(output[0].object.value, 'http://example.org/object')
    })
  })

  it('should parse a Blank Node object', () => {
    const example = {
      'http://example.org/predicate': {}
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].object.termType, 'BlankNode')
      assert(!output[0].object.value.startsWith('_:'))
    })
  })

  it('should keep Blank Node object mapping', () => {
    const example = {
      'http://example.org/predicate1': { '@id': '_:b0' },
      'http://example.org/predicate2': { '@id': '_:b0' }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 2)
      assert.strictEqual(output[0].object.equals(output[1].object), true)
    })
  })

  it('should parse a Literal object', () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].object.termType, 'Literal')
      assert.strictEqual(output[0].object.value, 'object')
      assert.strictEqual(output[0].object.language, '')
      assert.strictEqual(output[0].object.datatype.value, 'http://www.w3.org/2001/XMLSchema#string')
    })
  })

  it('should parse the language of a Literal object', () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@language': 'en'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].object.termType, 'Literal')
      assert.strictEqual(output[0].object.value, 'object')
      assert.strictEqual(output[0].object.language, 'en')
      assert.strictEqual(output[0].object.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
    })
  })

  it('should parse the datatype of a Literal object', () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@type': 'http://example.org/datatype'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].object.termType, 'Literal')
      assert.strictEqual(output[0].object.value, 'object')
      assert.strictEqual(output[0].object.language, '')
      assert.strictEqual(output[0].object.datatype.value, 'http://example.org/datatype')
    })
  })

  it('should parse the datatype of a Literal object into a full featured Literal', () => {
    const example = {
      'http://example.org/predicate': {
        '@value': 'object',
        '@type': 'http://example.org/datatype'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(typeof output[0].object.datatype.equals, 'function')
    })
  })

  it('should use the default graph if none was given', () => {
    const example = {
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].graph.termType, 'DefaultGraph')
    })
  })

  it('should parse graph', () => {
    const example = {
      '@id': 'http://example.org/graph',
      '@graph': {
        'http://example.org/predicate': 'object'
      }
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].graph.termType, 'NamedNode')
      assert.strictEqual(output[0].graph.value, 'http://example.org/graph')
    })
  })

  it('should use baseIRI option', () => {
    const example = {
      '@id': 'subject',
      'http://example.org/predicate': 'object'
    }

    const parser = new JSONLDParser({ baseIRI: 'http://example.org/' })
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].subject.termType, 'NamedNode')
      assert.strictEqual(output[0].subject.value, 'http://example.org/subject')
    })
  })

  it('should use context option', () => {
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
    const stream = parser.import(stringToStream(JSON.stringify(example)))
    const output = []

    stream.on('data', (triple) => {
      output.push(triple)
    })

    return waitFor(stream).then(() => {
      assert.strictEqual(output.length, 1)
      assert.strictEqual(output[0].subject.termType, 'NamedNode')
      assert.strictEqual(output[0].subject.value, 'http://example.org/subject')
    })
  })

  it('should throw an error if JSON is invalid', () => {
    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream('{'))

    stream.resume()

    return new Promise((resolve, reject) => {
      waitFor(stream).then(reject).catch(resolve)
    })
  })

  it('should throw an error if JSON-LD is invalid', () => {
    const example = {
      '@context': 'object'
    }

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))

    stream.resume()

    return new Promise((resolve, reject) => {
      waitFor(stream).then(reject).catch(resolve)
    })
  })

  it('should emit a prefix event for each context entry', () => {
    const example = {
      '@context': {
        ex1: 'http://example.org/1',
        ex2: 'http://example.org/2'
      }
    }

    const prefixes = {}

    const parser = new JSONLDParser()
    const stream = parser.import(stringToStream(JSON.stringify(example)))

    stream.on('prefix', (prefix, namespace) => {
      prefixes[prefix] = namespace
    })

    stream.resume()

    return waitFor(stream).then(() => {
      assert.strictEqual(prefixes.ex1.value, 'http://example.org/1')
      assert.strictEqual(prefixes.ex2.value, 'http://example.org/2')
    })
  })

  it('should register the error handler only once', () => {
    let count = 0

    const input = new Readable({
      read: () => {}
    })

    input._on = input.on

    input.on = (event, param) => {
      if (event === 'error') {
        count++
      }

      input._on(event, param)
    }

    const parser = new JSONLDParser()
    const stream = parser.import(input)

    stream.resume()

    input.push('{')
    input.push('"http://example.org/predicateA": "0",')
    input.push('"http://example.org/predicateB": "0"')
    input.push('}')
    input.push(null)

    return waitFor(stream).then(() => {
      assert.strictEqual(count, 2) // +1 for waitFor
    })
  })

  it('should register the data handler only once', () => {
    let count = 0

    const input = new Readable({
      read: () => {}
    })

    input._on = input.on

    input.on = (event, param) => {
      if (event === 'data') {
        count++
      }

      input._on(event, param)
    }

    const parser = new JSONLDParser()
    const stream = parser.import(input)

    stream.resume()

    input.push('{')
    input.push('"http://example.org/predicateA": "0",')
    input.push('"http://example.org/predicateB": "0"')
    input.push('}')
    input.push(null)

    return waitFor(stream).then(() => {
      assert.strictEqual(count, 1)
    })
  })
})
