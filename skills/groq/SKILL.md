---
name: groq
description: Integrate GROQ LLM streaming into a project. Use when the user wants to add GROQ, set up GROQ streaming, or use a GROQ model in their app.
allowed-tools: Read Write Edit Bash
---

1. Read [`@/knowledge/groq/streaming-integration.md`](/knowledge/groq/streaming-integration.md)
2. Apply the pattern to the current project's stack and existing code structure
3. Ask the user which model to use if not specified (default: `llama-3.3-70b-versatile`)
4. Copy the `.env` block as a template — remind the user to fill in `GROQ_API_KEY`
