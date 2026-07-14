import { readFile } from "node:fs/promises";

export interface ScipOccurrence {
  symbolString: string;
  kind: string;
  isDefinition: boolean;
  referenceKind: ScipReferenceKind;
  referenceContext: ScipReferenceContext;
  rangeStart: [number, number];
  rangeEnd: [number, number];
}

export type ScipReferenceKind =
  | "definition"
  | "import"
  | "reexport"
  | "call"
  | "construct"
  | "read"
  | "unknown";

export type ScipReferenceContext = "production" | "test" | "unknown";

export interface ScipDocument {
  relativePath: string;
  symbols: ScipOccurrence[];
  references: ScipOccurrence[];
}

interface ScipOccurrenceMessage {
  range: number[];
  symbol: string;
  symbol_roles: number;
}

interface ScipSymbolInformationMessage {
  symbol: string;
  kind: number;
}

interface ScipDocumentMessage {
  relative_path: string;
  occurrences: ScipOccurrenceMessage[];
  symbols: ScipSymbolInformationMessage[];
}

interface ScipIndexMessage {
  documents: ScipDocumentMessage[];
  external_symbols: ScipSymbolInformationMessage[];
}

interface ScipProtobufRuntime {
  Index: {
    deserializeBinary(bytes: Uint8Array): ScipIndexMessage;
  };
  SymbolInformation: {
    Kind: Record<number, string>;
  };
  SymbolRole: {
    Definition: number;
  };
}

const { scip } = require("@sourcegraph/scip-typescript/dist/src/scip") as {
  scip: ScipProtobufRuntime;
};

function parseRange(range: number[]): {
  rangeStart: [number, number];
  rangeEnd: [number, number];
} | null {
  const startLine = range[0];
  const startCharacter = range[1];
  if (startLine === undefined || startCharacter === undefined) {
    return null;
  }

  if (range.length === 3) {
    const endCharacter = range[2];
    return endCharacter === undefined
      ? null
      : {
          rangeStart: [startLine, startCharacter],
          rangeEnd: [startLine, endCharacter],
        };
  }

  if (range.length === 4) {
    const endLine = range[2];
    const endCharacter = range[3];
    return endLine === undefined || endCharacter === undefined
      ? null
      : {
          rangeStart: [startLine, startCharacter],
          rangeEnd: [endLine, endCharacter],
        };
  }

  return null;
}

function kindName(kind: number | undefined): string {
  if (kind === undefined || kind === 0) {
    return "unspecified";
  }

  const enumName = scip.SymbolInformation.Kind[kind];
  return enumName
    ? enumName.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()
    : `unknown_${kind}`;
}

export async function parseScipIndex(scipFilePath: string): Promise<ScipDocument[]> {
  const bytes = await readFile(scipFilePath);
  const index = scip.Index.deserializeBinary(bytes);
  const externalSymbolKinds = new Map(
    index.external_symbols.map((symbol) => [symbol.symbol, symbol.kind]),
  );

  return index.documents.map((document): ScipDocument => {
    const symbolKinds = new Map(externalSymbolKinds);
    for (const symbol of document.symbols) {
      symbolKinds.set(symbol.symbol, symbol.kind);
    }

    const symbols: ScipDocument["symbols"] = [];
    const references: ScipDocument["references"] = [];
    for (const occurrence of document.occurrences) {
      const isDefinition = (occurrence.symbol_roles & scip.SymbolRole.Definition) !== 0;
      const parsedRange = parseRange(occurrence.range);
      if (!parsedRange) {
        console.warn(
          `Skipping SCIP occurrence with invalid range in ${document.relative_path}: ${occurrence.symbol}`,
        );
        continue;
      }

      const parsedOccurrence: ScipOccurrence = {
        symbolString: occurrence.symbol,
        kind: kindName(symbolKinds.get(occurrence.symbol)),
        isDefinition,
        referenceKind: isDefinition ? "definition" : "unknown",
        referenceContext: "unknown",
        ...parsedRange,
      };
      if (isDefinition) {
        symbols.push(parsedOccurrence);
      } else {
        references.push(parsedOccurrence);
      }
    }

    return {
      relativePath: document.relative_path,
      symbols,
      references,
    };
  });
}
