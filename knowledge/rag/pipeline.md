# RAG Pipeline

RAG (Retrieval-Augmented Generation) gives an AI model access to a custom knowledge
base by retrieving relevant chunks at inference and injecting them into the prompt.

## Concepts

**Embedding model** — a small, specialized model (separate from the chat LLM) that converts
text into a list of numbers (a vector) capturing semantic meaning. Similar text produces
similar vectors. Called via OpenAI, Gemini, etc. embedding APIs — not the chat model.

**Vector DB** — a search index, not an answering engine. Stores vectors + original text as
metadata. At query time, returns the top-K most semantically similar text chunks. The chat
LLM never reads the vector DB directly.

**Chat LLM** — generates the final answer. It only sees plain text: the system prompt,
injected chunks, and the user question. RAG just gives it better context.

## Ingest (run once, re-run when data changes)

| Step | Action | API token? |
|------|--------|------------|
| 1 | Read files (CSV, MD) and split into text chunks with metadata | No |
| 2 | Call **embedding model** — convert each chunk to a vector | **Yes** (embedding API) |
| 3 | Upsert vectors + original text into vector DB | No |

## Query (every user message)

| Step | Action | API token? |
|------|--------|------------|
| 1 | Receive user question | No |
| 2 | Call **embedding model** — convert question to a vector | **Yes** (embedding API) |
| 3 | Search vector DB — return top-K matching text chunks (not answers) | No |
| 4 | Inject chunks into system prompt as plain text | No |
| 5 | Call **chat LLM** — read system prompt + question, generate answer | **Yes** (chat API) |
| 6 | Stream response to UI | No |

> Embedding and chat use separate API calls — often different providers. Re-ingesting is
> expensive at scale (step 2 × every chunk). Query costs 2 API calls per message minimum.

Key decision: inject RAG context **at prompt level**, not as a tool call.
Keeps retrieval invisible to the model's reasoning, avoids tool overhead.

## Chunk type
```typescript
type Chunk = {
  id: string;       // stable, unique — used as vector DB record ID
  text: string;     // content to embed and return at query time
  metadata: {
    source: string;
    [key: string]: string | string[] | number;
  };
};
```

## Ingest script pattern
```typescript
for (const file of dataFiles) {
  const chunks = file.endsWith(".csv")
    ? chunkCSV(filePath, source)
    : chunkMarkdown(filePath, source);
  const embeddings = await generateEmbeddings(chunks.map(c => c.text));
  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: chunk.metadata,
  }));
  await upsertVectors(vectors, NAMESPACE); // batch in groups of 100
}
```

## Switchable embedding provider
```typescript
// EMBEDDING_PROVIDER=gemini (default) | openai
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const provider = process.env.EMBEDDING_PROVIDER || "gemini";
  if (provider === "openai") return embedWithOpenAI(texts);
  return embedWithGemini(texts);
}
```

## Inject into system prompt
```typescript
const ragContext = await queryVectors(embed(userMessage), topK);
const systemPrompt = ragContext.length > 0
  ? `${basePrompt}\n\n## Relevant Information\n${ragContext.map(r => r.metadata.text).join("\n\n")}`
  : basePrompt;
```

## RAG_TOP_K tuning
- `RAG_TOP_K=5` — default, pure semantic search
- `RAG_TOP_K_FILTERED=10–30` — use higher K when metadata filters active (filtering reduces recall before ranking)

## Auto-ingest via GitHub Actions
```yaml
on:
  push:
    branches: [main]
    paths: ["data/**"]
```
Triggers ingestion automatically when data files change — no manual `pnpm ingest` needed on deploy.

## References
- food-tour-sg `scripts/ingest.ts`: https://github.com/phucbm/food-tour-sg/blob/main/scripts/ingest.ts
- food-tour-sg `lib/rag/embeddings.ts`: https://github.com/phucbm/food-tour-sg/blob/main/lib/rag/embeddings.ts
- food-tour-sg `lib/ai/prompts.ts`: https://github.com/phucbm/food-tour-sg/blob/main/lib/ai/prompts.ts
- Vector DB implementation: knowledge/pinecone/setup.md
