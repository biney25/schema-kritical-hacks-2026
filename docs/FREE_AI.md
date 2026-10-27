# Free memory assistant

The standalone Kritical app uses **GPT-OSS 120B on GroqCloud's Free plan**. The model is from OpenAI, but the API service and key are Groq's. An OpenAI Platform account or paid OpenAI API key is not involved.

This is a practical choice for the current text-only prototype: a production-listed reasoning model, a direct API, free access with fixed limits, and an optional Zero Data Retention setting available to all customers. It is not a claim that one model wins every benchmark. On 27 October 2026, live synthetic-page checks verified a correct cited companion answer and a refusal to invent a missing ticket price. A disallowed page was excluded. These provider checks do not exercise hosted authentication or the real account database. The account owner also supplied a screenshot confirming Global Zero Data Retention was enabled.

## Setup

1. Sign in at [GroqCloud](https://console.groq.com/keys) and stay on the Free plan. Do not add payment details or upgrade.
2. Create a key for Schema. Put it in the ignored local `.env.local` or the hosting provider's sensitive environment store, never in chat, source code or a browser bundle.
3. In Groq's Data Controls, enable Zero Data Retention. Ordinary inference does not retain request content by default, but reliability and abuse investigations may otherwise retain it for up to 30 days.
4. Set `AI_PROVIDER=groq`, `AI_ENABLED=true`, and the approved account emails in `AI_ALLOWED_EMAILS`. Redeploy after changing hosted settings.
5. Enable AI memory access inside Schema and permit individual journal pages. Check an answer against those pages and check that a disallowed page cannot contribute.

## Limits and behaviour

As checked on 27 October 2026, Groq lists GPT-OSS 120B at **30 requests/minute, 1,000 requests/day, 8,000 tokens/minute and 200,000 tokens/day** for the free tier. These are shared across the provider organization. The account's Limits page is authoritative and may show exceptions. Token limits can be reached before request limits.

Schema separately keeps its existing account allowance: 10 AI questions per month on the current free account. A question with no matching permitted memory does not call Groq. Each live attempt reserves one allowance slot, including a failed provider attempt.

Only the question and bounded text snippets from permitted pages leave the app. Photos, recordings and unrelated pages are excluded. The serialized user prompt is limited to 5,000 UTF-8 bytes, output is capped at 1,500 tokens including reasoning, and requests time out after 25 seconds. Only final answer text is returned to the browser. Schema does not save the conversation. There are no automatic retries or fallbacks to a paid provider. A provider limit returns a clear retry-later message.

Free access is suitable for a small prototype. Availability and free allowances can change; it is not a promise of unlimited free service at public-app scale.

## Alternatives considered

| Option | Why it was considered | Decision for Schema |
| --- | --- | --- |
| Groq Free / GPT-OSS 120B | Direct API, production model and retention controls | Selected; live provider checks passed |
| Gemini unpaid API | Capable models and a free allowance | Its unpaid-service terms permit product improvement and human review and advise against sensitive or personal input; unsuitable for this journal deployment |
| Cloudflare Workers AI | 10,000 free Neurons/day and no training on customer content | A useful alternative, but requires a separate inference integration; its smaller shared allowance is unnecessary while a direct Groq integration fits |

Sources: [Groq models](https://console.groq.com/docs/models), [rate limits](https://console.groq.com/docs/rate-limits), [Free plan charges FAQ](https://community.groq.com/t/do-i-get-charged-for-anything-on-the-groq-free-plan/832), [data controls](https://console.groq.com/docs/your-data), [reasoning parameters](https://console.groq.com/docs/reasoning), [Gemini terms](https://ai.google.dev/gemini-api/terms), [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/).
