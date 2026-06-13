export const OPENROUTER_MODEL = 'openai/gpt-oss-120b:free';
export const OPENROUTER_MODEL_URL =
  'https://openrouter.ai/openai/gpt-oss-120b:free';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterStreamChunk {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
  error?: { message?: string; code?: number };
}

export async function* fetchAiInsights(
  apiKey: string,
  prompt: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Finance Mortgage Simulation',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      stream: true,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const parsed = JSON.parse(errorText) as { error?: { message?: string } };
      message = parsed.error?.message ?? errorText;
    } catch {
      // use raw text
    }
    throw new Error(`שגיאת OpenRouter (${response.status}): ${message}`);
  }

  if (!response.body) {
    throw new Error('לא התקבלה תגובה מהשרת');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      try {
        const chunk = JSON.parse(data) as OpenRouterStreamChunk;
        if (chunk.error?.message) {
          throw new Error(chunk.error.message);
        }
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch (err) {
        if (err instanceof Error && !err.message.includes('JSON')) {
          throw err;
        }
      }
    }
  }
}
