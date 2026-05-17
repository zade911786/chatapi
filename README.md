# FreeAI Vercel API
**Owner:** @zade4everbot  
## Endpoints

```
GET  /api/cat?prompt=Hello&model=cat/agent-1
GET  /api/yng?prompt=Hello&model=yng/gpt-5
POST /api/cat   body: { "prompt": "Hello", "model": "cat/agent-1" }
POST /api/yng   body: { "prompt": "Hello", "model": "yng/gpt-5" }
```

> `model` param optional — defaults to `cat/agent-1` / `yng/agent-1`

## Response Shape

```json
{
  "ok": true,
  "owner": "@zade4everbot",
  "prefix": "cat",
  "model": "cat/agent-1",
  "prompt": "Hello",
  "response": "Hi! How can I help you?",
  "finish_reason": "stop",
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 9,
    "total_tokens": 14
  },
  "performance": {
    "time_took_ms": 843,
    "time_took_s": "0.84"
  },
  "timestamp": {
    "requested_at": "2026-05-17T10:00:00.000Z",
    "completed_at": "2026-05-17T10:00:00.843Z"
  },
  "meta": {
    "api_provider": "FreeTheAI (freetheai.xyz)",
    "api_base": "https://api.freetheai.xyz/v1",
    "valid_models": ["cat/agent-1", "cat/gpt-4.1", "..."],
    "upstream_id": "chatcmpl-xxx"
  }
}
```

## Valid Models (cat/*)

| Model | yng equivalent |
|-------|----------------|
| cat/agent-1 | yng/agent-1 |
| cat/gpt-4.1 | yng/gpt-4.1 |
| cat/gpt-4.1-mini | yng/gpt-4.1-mini |
| cat/gpt-5-mini | yng/gpt-5-mini |
| cat/gpt-5 | yng/gpt-5 |
| cat/gpt-5.1 | yng/gpt-5.1 |
| cat/gpt-5.2 | yng/gpt-5.2 |
| cat/gpt-5.4-mini | yng/gpt-5.4-mini |
| cat/gpt-5.4 | yng/gpt-5.4 |
| cat/claude-4-5-haiku | yng/claude-4-5-haiku |
| cat/claude-4-5-sonnet | yng/claude-4-5-sonnet |
| cat/claude-4-6-sonnet | yng/claude-4-6-sonnet |
| cat/gemini-2-5-flash | yng/gemini-2-5-flash |
| cat/gemini-3-flash | yng/gemini-3-flash |
| cat/gemini-3-1-pro | yng/gemini-3-1-pro |

## Deploy

```bash
npm i -g vercel
vercel
```
