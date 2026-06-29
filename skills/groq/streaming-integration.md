# GROQ Streaming Integration

GROQ provides fast LLM inference via an OpenAI-compatible API — drop-in replacement
for OpenAI, just swap the base URL and key.

## Endpoint
POST `https://api.groq.com/openai/v1/chat/completions`

## .env setup
```env
# Groq — enable by setting GROQ_API_KEY
GROQ_API_KEY=
GROQ_MODELS=llama-3.3-70b-versatile,llama-3.1-8b-instant

# LLM temperature (0 = deterministic, good for structured extraction)
LLM_TEMPERATURE=0
```

## Request body
```json
{
  "model": "llama-3.3-70b-versatile",
  "stream": true,
  "temperature": 0,
  "max_tokens": 16384,
  "messages": [{ "role": "user", "content": "your prompt here" }]
}
```

## Headers
```
Content-Type: application/json
Authorization: Bearer <GROQ_API_KEY>
```

## Parsing the SSE stream
Response is Server-Sent Events. For each line:
1. Skip lines not starting with `data: `
2. Strip the `data: ` prefix
3. Skip `[DONE]`
4. Parse JSON → extract `choices[0].delta.content`

```ts
parseLine: line => {
    if (!line.startsWith('data: ')) return null;
    const data = line.slice(6).trim();
    if (!data || data === '[DONE]') return null;
    try {
        const obj = JSON.parse(data);
        return obj.choices?.[0]?.delta?.content || null;
    } catch { return null; }
}
```

## Error handling
Check for non-2xx HTTP status before reading the stream. For stream errors,
same SSE format applies — `obj.error?.message` on each parsed line.

## Source
Observed in `phucbm/openwalletvn/api` — `admin/routes/extract.ts`.
Part of a multi-provider LLM streaming abstraction (Ollama, Gemini, GROQ).
