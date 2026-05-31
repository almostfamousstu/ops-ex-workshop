LLM Mesh migration plan

Current state

All AI calls live in the backend only (no frontend Anthropic usage):







File



Role



Anthropic usage





[backend/src/services/evaluation.ts](ops-ex-workshop-master/backend/src/services/evaluation.ts)



Async gate grading



messages.create — system + user, max_tokens: 1024, model claude-haiku-4-5





[backend/src/services/scenarioService.ts](ops-ex-workshop-master/backend/src/services/scenarioService.ts)



Async 5-act finale



messages.stream — user-only prompt, max_tokens: 3000; buffer is only parsed after the stream ends (no incremental DB writes today)

Config today: [ANTHROPIC_API_KEY](ops-ex-workshop-master/.env.example) via [docker-compose.yml](ops-ex-workshop-master/docker-compose.yml) env_file: .env.

sequenceDiagram
  participant Team as Frontend
  participant API as Express backend
  participant DB as Postgres
  participant LLM as LLM provider

  Team->>API: POST gate submit
  API->>DB: save submission, advance gate
  API-->>Team: 202 evaluating
  API->>LLM: evaluateGate (async)
  LLM-->>API: JSON feedback
  API->>DB: update evaluation

  Team->>API: POST scenario/generate
  API->>DB: upsert scenario generating
  API->>LLM: generateScenario (async)
  LLM-->>API: JSON acts array
  API->>DB: append acts, complete

Target integration (from LLM Mesh docs)

Per LLM_Mesh_Docs.docx Provider Execution:





Endpoint (QA, your choice): POST https://analytics-qa.iriworldwide.com/llmadmin/api/llm/execution



Auth: Authorization: Bearer <api_secret> (API Secrets UI; you will add the key post-refactor)



Provider: Vanilla — ad-hoc prompts without pre-registering templates in LLM-Admin:

{
  "config": {
    "templateName": "ops-ex-workshop",
    "prompt": "<full prompt with optional directives>"
  },
  "model": "gpt-4o",
  "useCache": false,
  "asyncrun": false
}





System role: embed [[SYSTEM]] … [[/SYSTEM]] blocks in config.prompt (documented directive; maps to OpenAI-style system messages).



JSON output (evaluation): prepend [[response_format="{\"type\": \"json_object\"}"]] in the prompt.



Token limits: prepend [[max_tokens=1024]] / [[max_tokens=3000]] to match current caps.



Models list (optional startup check): GET …/providerModel/models



Response handling: treat code !== 1 as failure; extract text defensively from result (string), result.outcome (async poll shape), or nested message fields.

Streaming is not required for this app: scenario generation does not stream to clients or DB today, so both flows can use synchronous asyncrun: false calls.

Implementation steps

1. Add llmMeshClient module

Create [backend/src/services/llmMeshClient.ts](ops-ex-workshop-master/backend/src/services/llmMeshClient.ts):





Read env:





LLM_MESH_BASE_URL — default https://analytics-qa.iriworldwide.com/llmadmin/api (no trailing slash; normalize in client)



LLM_MESH_API_KEY — required at runtime for AI calls (fail fast with clear log if missing when evaluateGate / generateScenario run)



LLM_MESH_MODEL — default gpt-4o (align with models from /providerModel/models)



Export:





buildPrompt({ systemParts, userContent, directives? }) — assembles [[SYSTEM]], [[max_tokens=N]], [[response_format=…]], then user text



executeVanillaPrompt(prompt: string, options?: { useCache?: boolean }) — fetch POST to {baseUrl}/llm/execution, parse outcome string, throw on HTTP/Unauthorized/code !== 1



Use Node 20 native fetch (no new dependency).

2. Refactor evaluation.ts

In [backend/src/services/evaluation.ts](ops-ex-workshop-master/backend/src/services/evaluation.ts):





Remove @anthropic-ai/sdk import and client.



Build prompt via buildPrompt({ systemParts: [systemPrompt], userContent: userPrompt, directives: ['[[response_format="{\"type\": \"json_object\"}"]]', '[[max_tokens=1024]]'] }).



Call executeVanillaPrompt.



Keep existing JSON extraction (/\{[\s\S]*\}/) and DB update logic unchanged.

3. Refactor scenarioService.ts

In [backend/src/services/scenarioService.ts](ops-ex-workshop-master/backend/src/services/scenarioService.ts):





Remove Anthropic streaming loop.



Single executeVanillaPrompt with [[max_tokens=3000]] on the existing prompt string (already user-role content from mission YAML).



Parse buffer from returned text (same jsonMatch / appendScenarioAct flow).

Optional later: if scenario runs hit timeouts, switch to asyncrun: true + poll GET …/llm/execution?transactionId=… until result.completed; not needed for initial refactor.

4. Dependencies and config





Remove @anthropic-ai/sdk from [backend/package.json](ops-ex-workshop-master/backend/package.json); run npm install in backend/ to refresh lockfile.



Update [.env.example](ops-ex-workshop-master/.env.example):

# LLM Mesh (QA) — required for AI evaluation and scenario generation
LLM_MESH_BASE_URL=https://analytics-qa.iriworldwide.com/llmadmin/api
LLM_MESH_API_KEY=
LLM_MESH_MODEL=gpt-4o





Remove ANTHROPIC_API_KEY.



[docker-compose.yml](ops-ex-workshop-master/docker-compose.yml): no structural change (still env_file: .env); document new vars in README only.

5. Documentation

Update references in:





[README.md](ops-ex-workshop-master/README.md) — architecture bullet, env table, troubleshooting (401 Unauthorized → check Bearer key)



[PROJECT_BRIEF.md](ops-ex-workshop-master/PROJECT_BRIEF.md) — LLM line item

6. Verification (manual, post-implementation)





Set LLM_MESH_API_KEY in .env (Bearer secret from LLM-Admin API Secrets).



docker compose up --build (or local backend against QA if network allows).



Join cohort → submit Gate 1 artifact → poll evaluation until complete and feedback present.



Complete gates 2–4 → POST /api/scenario/generate → poll scenario until acts populated.



Confirm error path: unset key → evaluation/scenario status error with existing user-facing fallback strings.

Files touched (summary)







Action



Path





Add



backend/src/services/llmMeshClient.ts





Edit



backend/src/services/evaluation.ts, scenarioService.ts





Edit



backend/package.json, backend/package-lock.json





Edit



.env.example, README.md, PROJECT_BRIEF.md

Out of scope





LLM-Admin template registration (Vanilla prompt is sufficient).



Corpora / vector / namespace features.



Frontend changes.



Pre-creating your API key (you handle after merge).

Risk notes





Network: backend containers must reach analytics-qa.iriworldwide.com from your deployment network.



Response shape: docs emphasize async result.outcome; sync responses may return result as a plain string — client will handle both.



Model name: must match a model exposed by /providerModel/models for the GPT/Vanilla provider; default gpt-4o is documented in samples.

