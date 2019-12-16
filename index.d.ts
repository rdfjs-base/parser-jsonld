import * as Sink from '@rdfjs/sink';
import { EventEmitter } from 'events';
import { Context } from 'jsonld/jsonld-spec';
import { DataFactory, Stream } from 'rdf-js';

interface ParserOptions {
  baseIRI?: string;
  context?: Context;
  factory?: DataFactory;
}

declare class Parser extends Sink {
  constructor(options?: ParserOptions);

  import(stream: Stream, options?: ParserOptions): EventEmitter;
}

export = Parser
