function getConfiguredKeys() {
  const entries = [];
  const MAX_FALLBACK_KEYS = 6;

  const sanitizeKey = (raw) => {
    if (typeof raw !== 'string') return '';
    return raw.split('#')[0].trim();
  };

  const primary = sanitizeKey(process.env.GEMINI_API_KEY);
  if (primary) {
    entries.push({ name: 'GEMINI_API_KEY', value: primary });
  }

  for (let i = 1; i <= MAX_FALLBACK_KEYS; i += 1) {
    const keyName = `GEMINI_API_KEY_${i}`;
    const value = sanitizeKey(process.env[keyName]);
    if (value) {
      entries.push({ name: keyName, value });
    }
  }

  return entries;
}

function getRotationSettings(totalKeys) {
  const rawIndex = Number.parseInt(String(process.env.GEMINI_ACTIVE_KEY_INDEX ?? '0'), 10);
  const activeIndex = Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < totalKeys ? rawIndex : 0;

  const rawFailover = String(process.env.GEMINI_ENABLE_KEY_FAILOVER ?? 'true').toLowerCase();
  const failoverEnabled = rawFailover === '1' || rawFailover === 'true' || rawFailover === 'yes';

  return { activeIndex, failoverEnabled };
}

function buildKeyOrder(keys, activeIndex, failoverEnabled) {
  if (!keys.length) return [];
  if (!failoverEnabled) return [keys[activeIndex]];

  return keys
    .slice(activeIndex)
    .concat(keys.slice(0, activeIndex));
}

function shouldTryNextKey(statusCode) {
  return [401, 403, 408, 409, 429, 500, 502, 503, 504].includes(statusCode);
}

function attachResponseHelpers(res) {
  if (typeof res.status !== 'function') {
    res.status = function status(code) {
      this.statusCode = code;
      return this;
    };
  }

  if (typeof res.json !== 'function') {
    res.json = function json(payload) {
      if (!this.headersSent) {
        this.setHeader('Content-Type', 'application/json');
      }
      this.end(JSON.stringify(payload));
      return this;
    };
  }
}

async function callGemini({ apiKey, message, temperature, maxTokens }) {
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topK: 40,
          topP: 0.95,
        },
      }),
    }
  );

  const data = await upstream.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  return {
    ok: upstream.ok && !data?.error,
    status: upstream.status,
    error: data?.error?.message || 'Upstream AI request failed.',
    reply,
  };
}

export default async function handler(req, res) {
  attachResponseHelpers(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keys = getConfiguredKeys();
  if (!keys.length) {
    return res.status(500).json({ error: 'No server-side Gemini API keys are configured.' });
  }

  const { activeIndex, failoverEnabled } = getRotationSettings(keys.length);
  const keyOrder = buildKeyOrder(keys, activeIndex, failoverEnabled);

  let body = req.body || {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body || '{}');
    } catch {
      return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }
  }
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return res.status(400).json({ error: 'Request body must include a non-empty message.' });
  }

  const requestedTemperature = Number(body?.options?.temperature);
  const requestedMaxOutputTokens = Number(body?.options?.maxOutputTokens);

  const temperature = Number.isFinite(requestedTemperature)
    ? Math.min(Math.max(requestedTemperature, 0), 2)
    : 0.7;

  const maxTokens = Number.isFinite(requestedMaxOutputTokens)
    ? Math.min(Math.max(Math.floor(requestedMaxOutputTokens), 32), 1200)
    : 220;

  let lastUpstreamError = null;

  for (let i = 0; i < keyOrder.length; i += 1) {
    const currentKey = keyOrder[i];

    try {
      const result = await callGemini({ apiKey: currentKey.value, message, temperature, maxTokens });

      if (!result.ok) {
        lastUpstreamError = {
          status: result.status,
          message: result.error,
        };

        const hasNextKey = i < keyOrder.length - 1;
        if (hasNextKey && shouldTryNextKey(result.status)) {
          continue;
        }

        return res.status(result.status).json({
          error: lastUpstreamError.message,
          keyUsed: currentKey.name,
        });
      }

      const reply = result.reply;
      if (!reply) {
        lastUpstreamError = {
          status: 502,
          message: 'AI response did not include message content.',
        };

        const hasNextKey = i < keyOrder.length - 1;
        if (hasNextKey) {
          continue;
        }

        return res.status(502).json({ error: lastUpstreamError.message, keyUsed: currentKey.name });
      }

      return res.status(200).json({
        reply,
        keyUsed: currentKey.name,
        activeKeyIndex: activeIndex,
        failoverEnabled,
      });
    } catch (error) {
      lastUpstreamError = {
        status: 500,
        message: error?.message || 'Internal server error.',
      };

      const hasNextKey = i < keyOrder.length - 1;
      if (hasNextKey) {
        continue;
      }

      return res.status(500).json({ error: lastUpstreamError.message, keyUsed: currentKey.name });
    }
  }

  return res.status(lastUpstreamError?.status || 500).json({
    error: lastUpstreamError?.message || 'Unable to complete AI request.',
  });
}
