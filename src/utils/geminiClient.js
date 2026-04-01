/**
 * Gemini 2.5 Flash Lite client for generating AI chart explanations
 */

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat';

function toNum(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatValue(value) {
  if (value == null) return 'n/a';
  return Math.abs(value) >= 100 ? value.toFixed(1) : value.toFixed(3);
}

function summarizeSeries(seriesData = []) {
  if (!Array.isArray(seriesData) || seriesData.length < 2) return null;

  const years = seriesData.map((row) => row?.year).filter((y) => typeof y === 'number');
  const startYear = years.length ? Math.min(...years) : null;
  const endYear = years.length ? Math.max(...years) : null;

  const metricKeys = Object.keys(seriesData[0] || {}).filter((k) => k !== 'year');
  const metricSummary = metricKeys
    .map((key) => {
      const points = seriesData
        .map((row) => toNum(row?.[key]))
        .filter((value) => value != null);

      if (points.length < 2) return null;

      const start = points[0];
      const end = points[points.length - 1];
      const min = Math.min(...points);
      const max = Math.max(...points);
      const deltaPct = start !== 0 ? ((end - start) / start) * 100 : null;

      return `${key}: start ${formatValue(start)}, end ${formatValue(end)}, change ${deltaPct == null ? 'n/a' : `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`}, range [${formatValue(min)} to ${formatValue(max)}]`;
    })
    .filter(Boolean)
    .slice(0, 6)
    .join('; ');

  if (!metricSummary) return null;

  return {
    startYear,
    endYear,
    points: seriesData.length,
    metricSummary,
  };
}

export function formatAiTextForDisplay(text) {
  if (!text) return '';

  return text
    .replace(/\r/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanLine(line) {
  return String(line || '')
    .replace(/^\s*[•\-*]\s*/, '')
    .trim();
}

function normalizeDashboardReply(rawText, queryType) {
  const fallback = [
    `Classification: ${queryType}`,
    'Answer: I could not format the response cleanly, but here is the key takeaway: Brazil\'s emissions outcomes are strongly influenced by land-use, energy mix, and policy enforcement.',
    'Key points:',
    '• Land-use change and deforestation remain critical drivers.',
    '• Policy and enforcement determine whether trends improve.',
    '• Comparisons should use per-capita and sector context together.',
    'Why it matters: Better policy and land-use governance can materially shift Brazil\'s climate trajectory.',
  ].join('\n');

  const cleaned = formatAiTextForDisplay(rawText);
  if (!cleaned) return fallback;

  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let answer = '';
  const keyPoints = [];
  let whyItMatters = '';

  for (const line of lines) {
    if (/^classification\s*:/i.test(line)) continue;
    if (/^answer\s*:/i.test(line)) {
      answer = line.replace(/^answer\s*:/i, '').trim();
      continue;
    }
    if (/^why\s+it\s+matters\s*:/i.test(line)) {
      whyItMatters = line.replace(/^why\s+it\s+matters\s*:/i, '').trim();
      continue;
    }
    if (/^key\s*points\s*:/i.test(line)) continue;
    if (/^[•\-*]\s+/.test(line)) {
      keyPoints.push(cleanLine(line));
      continue;
    }
    if (!answer) {
      answer = line;
      continue;
    }
    if (keyPoints.length < 3) {
      keyPoints.push(cleanLine(line));
      continue;
    }
    if (!whyItMatters) {
      whyItMatters = line;
    }
  }

  if (!answer) {
    answer = 'Brazil\'s climate outcome depends on interactions among land-use change, sector emissions, and policy implementation.';
  }

  const points = keyPoints.slice(0, 3);
  while (points.length < 3) {
    points.push('Additional evidence is limited by available in-dashboard context.');
  }

  if (!whyItMatters) {
    whyItMatters = 'Clear, evidence-based interpretation supports better climate decisions and accountability.';
  }

  return [
    `Classification: ${queryType}`,
    `Answer: ${answer}`,
    'Key points:',
    `• ${points[0]}`,
    `• ${points[1]}`,
    `• ${points[2]}`,
    `Why it matters: ${whyItMatters}`,
  ].join('\n');
}

async function requestGemini(prompt, config = {}) {
  let response;

  try {
    response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        options: {
          temperature: 0.7,
          maxOutputTokens: 220,
          ...config,
        },
      }),
    });
  } catch (error) {
    throw new Error(`Chat API request failed: ${error?.message || 'network error'}`);
  }

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const isJson = contentType.includes('application/json');
  const rawText = await response.text();

  let data = null;
  try {
    data = isJson ? JSON.parse(rawText || '{}') : null;
  } catch (error) {
    throw new Error(`Chat API response parsing failed: ${error?.message || 'invalid JSON response'}`);
  }

  if (!response.ok) {
    const backendError = data?.error || (rawText ? rawText.slice(0, 200) : 'Unknown API error');
    const keyInfo = data?.keyUsed ? ` [${data.keyUsed}]` : '';
    const attemptInfo = Number.isFinite(data?.triedKeys) && Number.isFinite(data?.totalKeys)
      ? ` (${data.triedKeys}/${data.totalKeys} keys attempted)`
      : '';
    throw new Error(`Chat API error (${response.status}): ${backendError}${keyInfo}${attemptInfo}`);
  }

  const text = typeof data?.reply === 'string' ? data.reply : null;
  if (!text) {
    throw new Error('Chat API did not return reply text.');
  }

  return text;
}

/**
 * Generate AI explanation for a chart based on context
 * @param {Object} params - Configuration object
 * @param {string} params.chartTitle - Name of the chart (e.g., "Total CO₂ Emissions")
 * @param {string} params.chartContext - What the chart shows (e.g., "Brazil's emissions from 2003-2022")
 * @param {number} params.year - Current year selected (snapshot charts)
 * @param {Object} params.currentData - Data point for the selected year
 * @param {Object} params.previousData - Data point for previous year (optional)
 * @param {'snapshot'|'trend'} params.contextMode - Prompt mode by chart type
 * @param {Array<Object>} params.seriesData - Full trend data context
 * @param {string} params.staticNote - The original static note for context
 * @returns {Promise<string>} AI-generated explanation
 */
export async function generateChartExplanation({
  chartTitle,
  chartContext,
  year,
  currentData,
  previousData,
  contextMode = 'snapshot',
  seriesData,
  staticNote,
}) {
  const isTrend = contextMode === 'trend';

  const snapshotData = Object.entries(currentData || {})
    .slice(0, 6)
    .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toFixed(3) : value}`)
    .join(', ');

  const trendSummary = summarizeSeries(seriesData);

  const trendContextBlock = trendSummary
    ? `Time-series coverage: ${trendSummary.startYear ?? 'n/a'} to ${trendSummary.endYear ?? 'n/a'} (${trendSummary.points} points).\nTrend summary: ${trendSummary.metricSummary}`
    : 'Time-series summary unavailable. Use chart context only.';

  const prompt = isTrend
    ? `You are an environmental analyst explaining a Brazil climate trend chart.

Chart: ${chartTitle}
Context: ${chartContext}
${trendContextBlock}

Original note for reference: "${staticNote}"

Generate a concise explanation (2-3 sentences) focused on multi-year dynamics across the full timeline. Do NOT frame the explanation around one selected year. Mention long-run direction, volatility, and one key implication for climate responsibility.`
    : `You are an environmental analyst explaining a climate data chart for Brazil.

Chart: ${chartTitle}
Context: ${chartContext}
Year: ${year}
Data: ${snapshotData}
${previousData ? `Previous year snapshot: ${JSON.stringify(previousData)}` : ''}

Original note for reference: "${staticNote}"

Generate a concise explanation (2-3 sentences max) of what this data shows for Brazil in ${year}.
Focus on current-year interpretation with concise context. Avoid repeating the static note verbatim.`;

  return requestGemini(prompt, { maxOutputTokens: 150 });
}

/**
 * Generate conversational dashboard support responses.
 * @param {Object} params
 * @param {'TREND'|'DRIVER'|'COMPARISON'|'POLICY'} params.queryType - Intent class.
 * @param {string} params.userQuery - Latest user query.
 * @param {string} params.systemContext - Dashboard context and rules.
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.history - Prior turns.
 * @returns {Promise<string|null>}
 */
export async function generateDashboardChatReply({ queryType, userQuery, systemContext = '', history = [] }) {
  const typeGuides = {
    TREND: 'Focus on multi-year dynamics, direction, and volatility over time in Brazil\'s emissions or climate.',
    DRIVER: 'Explain what causes or drives the emissions/climate outcome in Brazil. Focus on sector breakdown or root factors.',
    COMPARISON: 'Compare Brazil\'s performance to global benchmarks, other countries, or historical periods.',
    POLICY: 'Discuss policy alignment, climate commitments, climate action index, or pathway sufficiency.',
  };

  const turns = history
    .slice(-8)
    .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
    .join('\n');

  const prompt = `You are an expert environmental analyst answering a specific question about Brazil's climate and emissions data.

Context: Brazil dashboard showing emissions trends, sector breakdown, per-capita metrics, and climate policy alignment (CCPI, CAT scores).

User question: "${userQuery}"
Query type: ${queryType} — ${typeGuides[queryType] || typeGuides.DRIVER}
Conversation so far:
${turns || '(no prior turns)'}

${systemContext ? `Additional context: ${systemContext}` : ''}

Return a concise, structured plain-text reply with this exact shape:
Classification: ${queryType}
Answer: <1-2 sentences that directly answer the question>
Key points:
- <point 1>
- <point 2>
- <point 3>
Why it matters: <1 short sentence>

Rules:
- Be factual and specific.
- Ground claims in the provided data context; if a number is unknown, say so.
- Prefer causal explanation over generic description.
- Explain mechanism, not just trend labels.
- If relevant, include one policy or decision implication.
- For COMPARISON queries, explicitly state country values, ranking, and relative gap (e.g., x times higher/lower) using available context.
- Avoid generic statements like "the dashboard shows" or "this website indicates".
- Avoid repeating the user question.
- Do not output JSON.
- Do not use markdown headings.`;

  try {
    const response = await requestGemini(prompt, { maxOutputTokens: 320, temperature: 0.35 });
    return normalizeDashboardReply(response, queryType);
  } catch (error) {
    console.error('Failed to generate dashboard chat reply:', error);
    throw error;
  }
}

/**
 * Detect query intent to route to appropriate insight card type.
 * @param {string} query - User query
 * @returns {'TREND' | 'DRIVER' | 'COMPARISON' | 'POLICY'} Card type
 */
export function detectQueryIntent(query) {
  if (!query) return 'DRIVER';

  const q = query.toLowerCase();
  const countryMentions = [
    /\bindia\b/,
    /\bbrazil\b/,
    /\busa\b/,
    /\bu\.?s\.?a\.?\b/,
    /\bunited states\b/,
    /\bchina\b/,
    /\beu\b/,
    /\beurope\b/,
    /\bworld\b/,
    /\bglobal\b/,
  ].filter((rx) => rx.test(q)).length;

  if (/\b(compare|compared|comparing|comparison|versus|vs|relative|higher than|lower than)\b/.test(q)) {
    return 'COMPARISON';
  }

  // Catch common typos like "comapered" and country-to-country asks.
  if (/\bcom\w*par\w*\b/.test(q) || countryMentions >= 2) {
    return 'COMPARISON';
  }

  if (/increase|decrease|growing|declining|trend|over time|historically|rising|falling/.test(q)) {
    return 'TREND';
  }

  if (/policy|target|alignment|commitment|goal|pathway|1\.5|climate action|ccpi|cat/.test(q)) {
    return 'POLICY';
  }

  if (/why|cause|driver|driven|because|attribute|factor|responsible/.test(q)) {
    return 'DRIVER';
  }

  return 'DRIVER';
}

/**
 * Suggested follow-up questions for a card type.
 * @param {string} cardType
 * @returns {Array<string>}
 */
export function suggestedFollowUps(cardType) {
  const suggestions = {
    TREND: ['What caused the 2004 peak?', 'Has deforestation improved?', 'What does 2022 show?'],
    DRIVER: ['What about energy emissions?', 'How much is agriculture?', 'How to reduce land-use?'],
    COMPARISON: ['How vs. China?', 'Why per-capita metrics?', 'Historical emissions?'],
    POLICY: ['What is CCPI?', 'Is Brazil on track?', 'What policies needed?'],
  };
  return suggestions[cardType] || suggestions.DRIVER;
}
