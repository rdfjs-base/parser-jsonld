/* global describe, it */
var assert = require('assert')
var rdf = require('rdf-ext')
var testData = require('rdf-test-data')
var testUtils = require('rdf-test-utils')
var JsonLdParser = require('../')

describe('JSON-LD parser', function () {
  describe('instance API', function () {
    describe('process', function () {
      it('should be supported', function (done) {
        var parser = new JsonLdParser()
        var counter = 0

        parser.process({
          '@id': 'http://example.org/subject',
          'http://example.org/predicate': 'object'
        }, function () {
          counter++
        }).then(function () {
          if (counter !== 1) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })

      it('should use base parameter', function (done) {
        var parser = new JsonLdParser()
        var counter = 0

        parser.process({
          '@id': 'subject',
          'http://example.org/predicate': 'object'
        }, function (triple) {
          if (triple.subject.toString() === 'http://example.org/subject') {
            counter++
          }
        }, 'http://example.org/').then(function () {
          if (counter !== 1) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })

      it('should use filter parameter', function (done) {
        var parser = new JsonLdParser()
        var counter = 1

        parser.process({
          '@id': 'http://example.org/subject',
          'http://example.org/predicate': 'object'
        }, function () {
          counter *= 2
        }, null, function () {
          counter *= 3

          return false
        }).then(function () {
          if (counter !== 3) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })

      it('should use done parameter', function (done) {
        var parser = new JsonLdParser()
        var counter = 0

        Promise.resolve(new Promise(function (resolve) {
          parser.process({
            '@id': 'http://example.org/subject',
            'http://example.org/predicate': 'object'
          }, function () {
            counter++
          }, null, null, function () {
            resolve()
          })
        })).then(function () {
          if (counter !== 1) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })
    })

    describe('callback', function () {
      it('should be supported', function (done) {
        var parser = new JsonLdParser()

        Promise.resolve(new Promise(function (resolve) {
          parser.parse({}, function () {
            resolve()
          })
        })).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })

      it('should forward errors', function (done) {
        var parser = new JsonLdParser()

        Promise.resolve(new Promise(function (resolve, reject) {
          parser.parse('{"@context": "urn:test"}', function (error) {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        })).then(function () {
          done('no error thrown')
        }).catch(function () {
          done()
        })
      })
    })

    describe('Promise', function () {
      it('should be supported', function (done) {
        var parser = new JsonLdParser()

        parser.parse({}).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })

      it('should forward error to Promise API', function (done) {
        var parser = new JsonLdParser()

        parser.parse('{"@context": "urn:test"}').then(function () {
          done('no error thrown')
        }).catch(function () {
          done()
        })
      })
    })

    describe('Stream', function () {
      it('should be supported', function (done) {
        var parser = new JsonLdParser()
        var counter = 0

        parser.stream({
          '@id': 'http://example.org/subject',
          'http://example.org/predicate': 'object'
        }).on('data', function () {
          counter++
        }).on('end', function () {
          if (counter !== 1) {
            done('no triple streamed')
          } else {
            done()
          }
        }).on('error', function (error) {
          done(error)
        })
      })
    })
  })

  describe('static API', function () {
    describe('process', function () {
      it('should be supported', function (done) {
        var counter = 0

        JsonLdParser.process({
          '@id': 'http://example.org/subject',
          'http://example.org/predicate': 'object'
        }, function () {
          counter++
        }).then(function () {
          if (counter !== 1) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })

      it('should use base parameter', function (done) {
        var counter = 0

        JsonLdParser.process({
          '@id': 'subject',
          'http://example.org/predicate': 'object'
        }, function (triple) {
          if (triple.subject.toString() === 'http://example.org/subject') {
            counter++
          }
        }, 'http://example.org/').then(function () {
          if (counter !== 1) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })

      it('should use filter parameter', function (done) {
        var counter = 1

        JsonLdParser.process({
          '@id': 'http://example.org/subject',
          'http://example.org/predicate': 'object'
        }, function () {
          counter *= 2
        }, null, function () {
          counter *= 3

          return false
        }).then(function () {
          if (counter !== 3) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })

      it('should use done parameter', function (done) {
        var counter = 0

        Promise.resolve(new Promise(function (resolve) {
          JsonLdParser.process({
            '@id': 'http://example.org/subject',
            'http://example.org/predicate': 'object'
          }, function () {
            counter++
          }, null, null, function () {
            resolve()
          })
        })).then(function () {
          if (counter !== 1) {
            done('no triple processed')
          } else {
            done()
          }
        }).catch(function (error) {
          done(error)
        })
      })
    })

    describe('callback', function () {
      it('should be supported', function (done) {
        Promise.resolve(new Promise(function (resolve) {
          JsonLdParser.parse({}, function () {
            resolve()
          })
        })).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })

      it('should forward errors', function (done) {
        Promise.resolve(new Promise(function (resolve, reject) {
          JsonLdParser.parse('{"@context": "urn:test"}', function (error) {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        })).then(function () {
          done('no error thrown')
        }).catch(function () {
          done()
        })
      })
    })

    describe('Promise', function () {
      it('should be supported', function (done) {
        JsonLdParser.parse({}).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })

      it('should forward error to Promise API', function (done) {
        JsonLdParser.parse('{"@context": "urn:test"}').then(function () {
          done('no error thrown')
        }).catch(function () {
          done()
        })
      })
    })

    describe('Stream', function () {
      it('should be supported', function (done) {
        var counter = 0

        JsonLdParser.stream({
          '@id': 'http://example.org/subject',
          'http://example.org/predicate': 'object'
        }).on('data', function () {
          counter++
        }).on('end', function () {
          if (counter !== 1) {
            done('no triple streamed')
          } else {
            done()
          }
        }).on('error', function (error) {
          done(error)
        })
      })
    })
  })

  describe('example data', function () {
    it('card.json should be parsed', function (done) {
      var parser = new JsonLdParser()

      testUtils.p.readFile('support/card.json', __dirname).then(function (card) {
        return parser.parse(card, null, 'https://www.example.com/john/card')
      }).then(function (graph) {
        return testUtils.p.assertGraphEqual(graph, testData.cardGraph)
      }).then(function () {
        done()
      }).catch(function (error) {
        done(error)
      })
    })

    it('card.json should feed prefix map', function (done) {
      var parser = new JsonLdParser()

      if (rdf.prefixes.cert) {
        delete rdf.prefixes.cert
      }

      if (rdf.prefixes.foaf) {
        delete rdf.prefixes.foaf
      }

      testUtils.p.readFile('support/card.json', __dirname).then(function (card) {
        return parser.parse(card, null, 'https://www.example.com/john/card')
      }).then(function () {
        assert.equal(rdf.prefixes.cert, 'http://www.w3.org/ns/auth/cert#')
        assert.equal(rdf.prefixes.foaf, 'http://xmlns.com/foaf/0.1/')
      }).then(function () {
        done()
      }).catch(function (error) {
        done(error)
      })
    })

    it('list.json should be parsed', function (done) {
      var parser = new JsonLdParser()

      testUtils.p.readFile('support/list.json', __dirname).then(function (list) {
        return parser.parse(list, null, 'https://www.example.com/list')
      }).then(function (graph) {
        return testUtils.p.assertGraphEqual(graph, testData.listGraph)
      }).then(function () {
        done()
      }).catch(function (error) {
        done(error)
      })
    })
  })
})

