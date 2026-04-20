# Vercel AI Gateway

`@ai-sdk/gateway` is a proxy layer that routes requests to multiple AI providers
(OpenAI, Anthropic, Google, xAI, GROQ) under a single API key.

```
Your app → Vercel AI Gateway (cloud proxy) → OpenAI / Anthropic / Google / xAI
```

Vercel hosts the proxy — you connect provider accounts in their dashboard.
On Vercel deployments: OIDC auto-auth, no key needed.
Locally: set `AI_GATEWAY_API_KEY`.

## Install
```shell
pnpm add @ai-sdk/gateway ai
```

## Basic usage
```typescript
import { gateway } from "@ai-sdk/gateway";

gateway.languageModel("google/gemini-2.5-flash-lite")
gateway.languageModel("anthropic/claude-haiku-4.5")
gateway.languageModel("openai/gpt-4o")
```
Model IDs follow `<provider>/<model-name>` format.

## Reasoning / thinking models
Apply `extractReasoningMiddleware` to models that emit `<thinking>` tags:

```typescript
import { gateway } from "@ai-sdk/gateway";
import { extractReasoningMiddleware, wrapLanguageModel } from "ai";

const THINKING_SUFFIX_REGEX = /-thinking$/;

export function getLanguageModel(modelId: string) {
  const isReasoning = modelId.includes("reasoning") || modelId.endsWith("-thinking");
  if (isReasoning) {
    return wrapLanguageModel({
      model: gateway.languageModel(modelId.replace(THINKING_SUFFIX_REGEX, "")),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }
  return gateway.languageModel(modelId);
}
```

## Test mock with customProvider
Swap real models for mocks via an env flag (e.g. `PLAYWRIGHT=True`):

```typescript
import { customProvider } from "ai";

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        "chat-model": mockChatModel,
        "title-model": mockTitleModel,
      },
    })
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) return myProvider.languageModel(modelId);
  return gateway.languageModel(modelId);
}
```

## Env
```env
AI_GATEWAY_API_KEY=    # not needed on Vercel (OIDC auto-auth)
```

## References
- food-tour-sg `lib/ai/providers.ts`: https://github.com/phucbm/food-tour-sg/blob/main/lib/ai/providers.ts
- Vercel AI SDK docs: https://ai-sdk.dev/docs/ai-sdk-core/providers-and-models
- `@ai-sdk/gateway` package: https://www.npmjs.com/package/@ai-sdk/gateway
