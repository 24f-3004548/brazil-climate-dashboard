import { useMemo, useRef, useState } from 'react';
import { BRAZIL } from '../data/brazil';
import { COMPARISON } from '../data/comparison';
import {
  generateDashboardChatReply,
  detectQueryIntent,
  suggestedFollowUps,
} from '../../utils/geminiClient';

const SECTORS = [
  { key: 'land_use', label: 'Land-use change' },
  { key: 'energy', label: 'Energy' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'industrial', label: 'Industrial' },
  { key: 'waste', label: 'Waste' },
];

const COUNTRY_ALIASES = {
  india: 'India',
  china: 'China',
  usa: 'United States',
  'u.s.a': 'United States',
  us: 'United States',
  'united states': 'United States',
  brazil: 'Brazil',
};

function parseStructuredAssistantContent(content = '', fallbackIntent = 'DRIVER') {
  const lines = String(content)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let classification = fallbackIntent;
  let answer = '';
  const keyPoints = [];
  let whyItMatters = '';

  for (const line of lines) {
    if (/^classification\s*:/i.test(line)) {
      classification = line.replace(/^classification\s*:/i, '').trim() || fallbackIntent;
      continue;
    }

    if (/^answer\s*:/i.test(line)) {
      answer = line.replace(/^answer\s*:/i, '').trim();
      continue;
    }

    if (/^key\s*points\s*:/i.test(line)) {
      continue;
    }

    if (/^why\s+it\s+matters\s*:/i.test(line)) {
      whyItMatters = line.replace(/^why\s+it\s+matters\s*:/i, '').trim();
      continue;
    }

    if (/^[•\-*]\s+/.test(line)) {
      keyPoints.push(line.replace(/^[•\-*]\s+/, '').trim());
      continue;
    }

    if (!answer) {
      answer = line;
      continue;
    }

    if (keyPoints.length < 3) {
      keyPoints.push(line);
      continue;
    }

    if (!whyItMatters) {
      whyItMatters = line;
    }
  }

  return {
    classification,
    answer,
    keyPoints,
    whyItMatters,
  };
}

function buildScopedContextPrompt({ year, query, intent }) {
  const current = BRAZIL.find((r) => r.year === year);
  const prev = BRAZIL.find((r) => r.year === year - 1);

  if (!current) {
    return `You are assisting with a Brazil climate dashboard discussion. Year ${year} is not available in the local data. Explain this clearly and ask the user to pick a year between 2003 and 2022.`;
  }

  const q = String(query || '').toLowerCase();

  const dominant = SECTORS
    .map((s) => ({ label: s.label, value: current[s.key] ?? 0 }))
    .sort((a, b) => b.value - a.value)[0];

  const compForYear = COMPARISON.filter((row) => row.year === year);

  const detectedCountries = Object.keys(COUNTRY_ALIASES)
    .filter((alias) => q.includes(alias))
    .map((alias) => COUNTRY_ALIASES[alias]);

  const uniqueCountries = Array.from(new Set(['Brazil', ...detectedCountries]));

  const comparisonRows = uniqueCountries
    .map((country) => {
      if (country === 'Brazil') {
        return `- Brazil: ${current.co2_pc.toFixed(2)} t/person`;
      }
      const row = compForYear.find((item) => item.country === country);
      return `- ${country}: ${row?.co2_pc == null ? 'n/a' : `${row.co2_pc.toFixed(2)} t/person`}`;
    })
    .join('\n');

  const yoy = (key) => {
    if (!prev || prev[key] == null || prev[key] === 0) return 'n/a';
    const delta = ((current[key] - prev[key]) / prev[key]) * 100;
    const arrow = delta >= 0 ? 'up' : 'down';
    return `${arrow} ${Math.abs(delta).toFixed(1)}%`;
  };

  const baseBlock = `Selected year: ${year}
- Brazil CO2 per capita: ${current.co2_pc.toFixed(2)} t/person
- Brazil total CO2: ${current.co2.toFixed(1)} MtCO2 (${yoy('co2')} YoY)`;

  const trendBlock = `Trend context (year-over-year)
- CO2 per capita: ${yoy('co2_pc')}
- Carbon intensity: ${yoy('co2_gdp')}
- Deforestation: ${yoy('deforestation')}
- Forest cover: ${yoy('forest_area')}`;

  const driverBlock = `Driver context (sector shares)
- Land-use change: ${(current.land_use * 100).toFixed(1)}%
- Agriculture: ${(current.agriculture * 100).toFixed(1)}%
- Energy: ${(current.energy * 100).toFixed(1)}%
- Industrial: ${(current.industrial * 100).toFixed(1)}%
- Waste: ${(current.waste * 100).toFixed(1)}%
- Dominant source: ${dominant.label} (${(dominant.value * 100).toFixed(1)}%)`;

  const comparisonBlock = `Comparison context (${year}, CO2 per capita)
${comparisonRows}`;

  const policyBlock = `Policy context
- CCPI 2026: score 58.2, rank 27/63
- CAT 2024: Insufficient (not aligned with 1.5C pathway)`;

  const blocks = [baseBlock];

  if (intent === 'COMPARISON') blocks.push(comparisonBlock);
  if (intent === 'DRIVER') blocks.push(driverBlock);
  if (intent === 'TREND') blocks.push(trendBlock);
  if (intent === 'POLICY') blocks.push(policyBlock);

  // Add targeted extras only when query hints at them.
  if (/deforest|forest|land\s*-?use/.test(q) && intent !== 'DRIVER') {
    blocks.push(`Land-use context\n- Deforestation: ${current.deforestation.toLocaleString()} km2 (${yoy('deforestation')} YoY)\n- Forest cover: ${current.forest_area.toFixed(2)}% (${yoy('forest_area')} YoY)`);
  }

  if (/ccpi|cat|policy|target|pathway|commitment/.test(q) && intent !== 'POLICY') {
    blocks.push(policyBlock);
  }

  return `You are a climate-data assistant for a Brazil emissions dashboard. Use only the relevant context below.\n\n${blocks.join('\n\n')}`;
}

export default function GeminiChatFab({ year }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastIntent, setLastIntent] = useState('DRIVER');
  const messagesRef = useRef(null);

  const suggestedPrompts = useMemo(() => {
    if (!messages.length) return ['What drives emissions?', 'How does Brazil compare globally?', 'What is the policy outlook?'];
    return suggestedFollowUps(lastIntent);
  }, [messages.length, lastIntent]);

  const scrollToBottom = () => {
    window.requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const intent = detectQueryIntent(text);
    const scopedContext = `${buildScopedContextPrompt({ year, query: text, intent })}

  You are an in-dashboard support assistant. Keep responses concise and practical. Use only the data provided in context for exact numeric references.`;
    const conversationHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setLastIntent(intent);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
    ]);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const reply = await generateDashboardChatReply({
        queryType: intent,
        userQuery: text,
        systemContext: scopedContext,
        history: conversationHistory,
      });

      if (reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reply, intent },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            intent,
            content:
              `Classification: ${intent}\n` +
              'Answer: I could not generate a live response right now.\n' +
              'Key points:\n' +
              '• Check that at least one VITE_GEMINI_API_KEY value is valid\n' +
              '• Reload after editing environment variables\n' +
              '• Check browser console for API errors\n' +
              'Why it matters: Without a valid API response, the assistant cannot produce tailored explanations.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          intent,
          content:
            `Classification: ${intent}\n` +
            `Answer: ${error?.message || 'An unexpected error occurred.'}\n` +
            'Key points:\n' +
            '• Request failed before completion\n' +
            '• Verify API key and network\n' +
            '• Retry your question\n' +
            'Why it matters: Reliable assistant output depends on a successful Gemini call.',
        },
      ]);
    }
    setIsLoading(false);
    scrollToBottom();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="gemini-fab-wrap">
      {isOpen && (
        <section className="gemini-chat-panel" role="dialog" aria-label="Dashboard insights">
          <header className="gemini-chat-header">
            <div>
              <strong>Insight Engine</strong>
              <p className="gemini-chat-subtitle">Ask questions, get structured insights · {year}</p>
            </div>
            <button
              type="button"
              className="gemini-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close insights"
            >
              ×
            </button>
          </header>

          <div className="gemini-chat-messages" ref={messagesRef}>
            {messages.map((message, index) => (
              <article
                key={index}
                className={`gemini-msg ${message.role === 'assistant' ? 'gemini-msg-assistant gemini-msg-intent-' + String(message.intent || '').toLowerCase() : 'gemini-msg-user'}`}
              >
                {message.role === 'assistant' ? (
                  (() => {
                    const parsed = parseStructuredAssistantContent(message.content, message.intent || 'DRIVER');
                    const displayIntent = String(parsed.classification || message.intent || 'DRIVER').toUpperCase();

                    return (
                      <>
                        <div className={`gemini-msg-tag gemini-tag-${String(displayIntent).toLowerCase()}`}>
                          {displayIntent}
                        </div>

                        {parsed.answer ? (
                          <div className="gemini-structured-block">
                            <div className="gemini-structured-label">Answer</div>
                            <p className="gemini-msg-text">{parsed.answer}</p>
                          </div>
                        ) : (
                          <p className="gemini-msg-text">{message.content}</p>
                        )}

                        {parsed.keyPoints.length > 0 && (
                          <div className="gemini-structured-block">
                            <div className="gemini-structured-label">Key points</div>
                            <ul className="gemini-keypoints-list">
                              {parsed.keyPoints.slice(0, 3).map((point, pointIndex) => (
                                <li key={pointIndex}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {parsed.whyItMatters && (
                          <div className="gemini-structured-block gemini-structured-impact">
                            <div className="gemini-structured-label">Why it matters</div>
                            <p className="gemini-msg-text">{parsed.whyItMatters}</p>
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <p className="gemini-msg-text">{message.content}</p>
                )}
              </article>
            ))}
            {isLoading && (
              <div className="insight-loading">
                <div className="insight-spinner" />
                <p>Thinking...</p>
              </div>
            )}
            {!messages.length && !isLoading && (
              <div className="insight-welcome">
                <p className="insight-welcome-title">Ask anything about Brazil climate data.</p>
                <p className="insight-welcome-hint">Replies will be conversational, classified, and structured.</p>
              </div>
            )}
          </div>

          <div className="gemini-suggestions">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => {
                  setInput(prompt);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="gemini-chat-input-wrap">
            <textarea
              className="gemini-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Ask a question..."
            />
            <button type="button" className="gemini-chat-send" onClick={handleSend} disabled={isLoading}>
              Send
            </button>
          </div>
        </section>
      )}

      <button type="button" className="gemini-fab" onClick={() => setIsOpen((open) => !open)} title="Ask AI for explanations">
        <svg className="gemini-fab-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2L15.09 8.26h6.79L17.66 12.7l2.43 6.26L12 15.44l-5.09 3.52 2.43-6.26-4.12-4.44h6.79L12 2z" />
        </svg>
        {isOpen ? 'Close' : 'Explain Data'}
      </button>
    </div>
  );
}
