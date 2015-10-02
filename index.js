var jsonld = require('jsonld')
var rdf = require('rdf-ext')
var util = require('util')
var AbstractParser = require('rdf-parser-abstract')

var JsonLdParser = function (options) {
  AbstractParser.call(this, rdf)

  options = options || {}

  if (!('importPrefixMap' in options)) {
    options.importPrefixMap = true
  }

  var expandAndFlatten = function (data, base, callback) {
    jsonld.expand(data, {'base': base}, function (error, expanded) {
      if (error) {
        return callback(error)
      }

      jsonld.flatten(expanded, {}, function (error, flattened) {
        if (error) {
          return callback(error)
        }

        if (!('@graph' in flattened)) {
          return callback(new Error('no @graph property in flattened JSON-LD'))
        }

        callback(null, flattened['@graph'])
      })
    })
  }

  var toArray = function (object) {
    object = object || []

    if (Array.isArray(object)) {
      return object
    }

    return [object]
  }

  this.process = function (data, callback, base, filter, done) {
    return new Promise(function (resolve, reject) {
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }

      base = base || ''
      filter = filter || function () { return true }
      done = done || function () {}

      var getLiteral = function (jsonNode) {
        var type = null
        var lang = null

        if ('@type' in jsonNode) {
          type = getNode(jsonNode['@type'])
        }

        if ('@language' in jsonNode) {
          lang = jsonNode['@language']
        }

        return rdf.createLiteral(jsonNode['@value'], lang, type)
      }

      var nodeCache = {}

      var getNode = function (jsonNode) {
        // is there already a node?
        if (jsonNode in nodeCache) {
          return nodeCache[jsonNode]
        }

        // is it a blank node?
        if (!jsonNode) {
          return rdf.createBlankNode()
        }

        if (jsonNode.indexOf('_:') === 0) {
          return (nodeCache[jsonNode] = rdf.createBlankNode())
        }

        // if not it's a named node
        return (nodeCache[jsonNode] = rdf.createNamedNode(jsonNode))
      }

      var pushTriple = function (subject, predicate, object) {
        var triple = rdf.createTriple(subject, predicate, object)

        if (filter(triple)) {
          callback(triple)
        }
      }

      var processSubject = function (jsonSubject) {
        var subject = jsonSubject['@id']
        var types = toArray(jsonSubject['@type'])

        // add type triples
        types.forEach(function (type) {
          pushTriple(
            getNode(subject),
            getNode(rdf.ns.type),
            getNode(type))
        })

        // other triples
        for (var predicate in jsonSubject) {
          // ignore JSON-LD properties
          if (predicate.indexOf('@') === 0) {
            continue
          }

          processPredicate(subject, predicate, toArray(jsonSubject[predicate]))
        }
      }

      var processPredicate = function (subject, predicate, jsonObjects) {
        jsonObjects.forEach(function (jsonObject) {
          pushTriple(
            getNode(subject),
            getNode(predicate),
            processObject(jsonObject))
        })
      }

      var processObject = function (jsonObject) {
        // is it a simple literal?
        if (typeof jsonObject === 'string') {
          return rdf.createLiteral(jsonObject)
        }

        // or blank node / named node
        if ('@id' in jsonObject) {
          return getNode(jsonObject['@id'])
        }

        if ('@list' in jsonObject) {
          return processList(jsonObject['@list'])
        }

        // or complex literal
        return getLiteral(jsonObject)
      }

      var processList = function (jsonList) {
        var entry = getNode()
        var subject = entry
        var rest

        jsonList.forEach(function (jItem, index) {
          if (index !== jsonList.length - 1) {
            rest = getNode()
          } else {
            rest = getNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
          }

          pushTriple(
            subject,
            getNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
            getNode(jItem['@id']))

          pushTriple(
            subject,
            getNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
            rest)

          subject = rest
        })

        return entry
      }

      if (options.importPrefixMap && '@context' in data && typeof data['@context'] === 'object') {
        var context = data['@context']

        Object.keys(context).forEach(function (key) {
          if (key.slice(0, 1) !== '@' && typeof context[key] === 'string') {
            rdf.prefixes[key] = context[key]
          }
        })
      }

      expandAndFlatten(data, base, function (error, jsonGraph) {
        if (error) {
          if (done) {
            done(error)
          }

          return reject(error)
        }

        if (jsonGraph) {
          jsonGraph.forEach(function (jsonSubject) {
            processSubject(jsonSubject)
          })
        }

        if (done) {
          done()
        }

        resolve()
      })
    })
  }
}

util.inherits(JsonLdParser, AbstractParser)

// add singleton methods to class
var instance = new JsonLdParser()

for (var property in instance) {
  JsonLdParser[property] = instance[property]
}

module.exports = JsonLdParser
