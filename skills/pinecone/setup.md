# Pinecone

Managed vector database. Used as the vector store in a RAG pipeline —
see knowledge/rag/pipeline.md for the full pipeline pattern.

## Install
```shell
pnpm add @pinecone-database/pinecone
```

## Env
```env
PINECONE_API_KEY=
PINECONE_INDEX_NAME=chatbot-knowledge
```

## Client
```typescript
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index(process.env.PINECONE_INDEX_NAME ?? "chatbot-knowledge");
```

## Batch upsert
```typescript
const BATCH_SIZE = 100;

export async function upsertVectors(vectors: VectorRecord[], namespace: string) {
  const ns = index.namespace(namespace);
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    await ns.upsert(vectors.slice(i, i + BATCH_SIZE));
  }
}
```

## Query
```typescript
export async function queryVectors(
  embedding: number[],
  topK: number,
  filter?: MetadataFilter,
) {
  const result = await index.namespace("default").query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
  });
  return result.matches;
}
```

## Metadata filter pattern
Store token arrays on each vector for flexible keyword matching:

```typescript
// On ingest
metadata: {
  tokens: ["com", "tam", "com tam"],
  district_tokens: ["quan 1", "quan binh thanh"],
}

// At query time
const filter = { tokens: { $in: tokenize(userQuery) } };
```

If no tokens match, return `{}` to fall through to pure semantic search (no filter applied).
Supported operators: `$in`, `$eq`, `$and`, `$or`.

Increase `topK` when filters are active — filtering reduces recall before ranking.
e.g. `RAG_TOP_K=5` unfiltered, `RAG_TOP_K_FILTERED=10–30` filtered.

## References
- food-tour-sg `lib/rag/pinecone.ts`: https://github.com/phucbm/food-tour-sg/blob/main/lib/rag/pinecone.ts
- food-tour-sg `lib/rag/filters.ts`: https://github.com/phucbm/food-tour-sg/blob/main/lib/rag/filters.ts
- food-tour-sg `lib/rag/normalize.ts`: https://github.com/phucbm/food-tour-sg/blob/main/lib/rag/normalize.ts
- Pinecone Node.js client docs: https://docs.pinecone.io/reference/node-sdk
- RAG pipeline pattern: knowledge/rag/pipeline.md
