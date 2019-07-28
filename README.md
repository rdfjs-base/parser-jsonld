# @rdfjs/parser-jsonld

[![Build Status](https://travis-ci.org/rdfjs/parser-jsonld.svg?branch=master)](https://travis-ci.org/rdfjs/parser-jsonld)

[![npm version](https://img.shields.io/npm/v/@rdfjs/parser-jsonld.svg)](https://www.npmjs.com/package/@rdfjs/parser-jsonld)

JSON-LD parser that implements the [RDFJS Sink interface](http://rdf.js.org/) using [jsonld.js](https://github.com/digitalbazaar/jsonld.js).

## Usage

The package exports the parser as a class, so an instance must be created before it can be used.
The `.import` method, as defined in the [RDFJS specification](http://rdf.js.org/#sink-interface), must be called to do the actual parsing.
It expects a JSON string stream or a stream which emits a single object.
The method will return a stream which emits the parsed quads.

The constructor accepts an `options` object with the following optional keys:

- `baseIRI`: Allows passing the base IRI manually to the `jsonld.js` library.
- `context`: Allows passing a JSON-LD context manually to the `jsonld.js` library.
- `factory`: Use an alternative RDFJS data factory.
  By default the [reference implementation](https://github.com/rdfjs-base/data-model/) us used.

It's also possible to pass options as second argument to the `.import` method.
The options from the constructor and the `.import` method will be merged together.

### Example

This example shows how to create a parser instance and how to feed it with a stream from a string.
The parsed quads are written to the console.

```javascript
const ParserJsonld = require('@rdfjs/parser-jsonld')
const Readable = require('stream').Readable

const parserJsonld = new ParserJsonld()

const input = new Readable({
  read: () => {
    input.push(`{
      "@context": "http://schema.org/",
      "@type": "Person",
      "name": "Jane Doe",
      "jobTitle": "Professor",
      "telephone": "(425) 123-4567",
      "url": "http://www.janedoe.com"
    }`)
    input.push(null)
  }
})

const output = parserJsonld.import(input)

output.on('data', quad => {
  console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`)
})
```
