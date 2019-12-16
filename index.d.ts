import * as Sink from '@rdfjs/sink';
import { Context } from 'jsonld/jsonld-spec';
import { DataFactory, Quad } from 'rdf-js';

interface ParserOptions {
  baseIRI?: string;
  context?: Context;
  factory?: DataFactory;
}

declare class Parser extends Sink<Quad> {
  constructor(options?: ParserOptions);
}

export = Parser
