import { useState, useEffect } from 'react';
import { formatAiTextForDisplay, generateChartExplanation } from '../../utils/geminiClient';

/**
 * Hybrid component showing static + AI-generated chart explanations
 * @param {Object} props
 * @param {string} props.staticNote - The original static/curated explanation
 * @param {string} props.chartTitle - Chart name
 * @param {string} props.chartContext - What the chart displays
 * @param {number} props.year - Selected year
 * @param {Object} props.currentData - Data for current year
 * @param {Object} props.previousData - Data for previous year
 * @param {'snapshot'|'trend'} props.contextMode - Prompt mode
 * @param {Array<Object>} props.seriesData - Time-series context for trend charts
 * @returns {JSX.Element}
 */
export default function AIExplanation({
  staticNote,
  chartTitle,
  chartContext,
  year,
  currentData,
  previousData,
  contextMode = 'snapshot',
  seriesData,
}) {
  const [aiNote, setAiNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [error, setError] = useState(null);

  // Generate AI explanation when component mounts or key props change
  useEffect(() => {
    let isMounted = true;

    const fetchExplanation = async () => {
      if (!showAI || !chartTitle) return;

      setIsLoading(true);
      setError(null);
      setAiNote(null);

      try {
        const explanation = await generateChartExplanation({
          chartTitle,
          chartContext,
          year,
          currentData,
          previousData,
          contextMode,
          seriesData,
          staticNote,
        });

        if (isMounted) {
          if (explanation) {
            setAiNote(formatAiTextForDisplay(explanation));
          } else {
            setError('Could not generate explanation.');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setAiNote(null);
          setError(err?.message || 'Could not generate explanation.');
          setIsLoading(false);
        }
      }
    };

    if (showAI) {
      fetchExplanation();
    }

    return () => {
      isMounted = false;
    };
  }, [showAI, year, chartTitle, chartContext, currentData, previousData, contextMode, seriesData, staticNote]);

  return (
    <div>
      {/* Static curated note */}
      <p className="chart-note">
        {staticNote}
      </p>

      {/* AI toggle + explanation */}
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <button
          onClick={() => setShowAI(!showAI)}
          style={{
            background: 'none',
            border: 'none',
            color: showAI ? '#2fcd76' : '#7A746C',
            cursor: 'pointer',
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: 0,
            transition: 'color 200ms ease',
          }}
          title="Toggle AI explanation"
        >
          {showAI ? '✓ AI Context' : '+ AI Context'}
        </button>
      </div>

      {/* AI explanation content */}
      {showAI && (
        <div
          style={{
            marginTop: 6,
            padding: '6px 8px',
            background: 'rgba(47, 205, 118, 0.06)',
            borderLeft: '2px solid #2fcd76',
            borderRadius: 2,
          }}
        >
          {isLoading && (
            <p style={{ fontSize: '0.62rem', color: '#7A746C', fontStyle: 'italic' }}>
              Generating insight...
            </p>
          )}
          {error && (
            <p style={{ fontSize: '0.62rem', color: '#B5282B' }}>
              {error}
            </p>
          )}
          {aiNote && !isLoading && (
            <p style={{ fontSize: '0.62rem', color: '#27361A', lineHeight: 1.5 }}>
              <strong style={{ color: '#2fcd76' }}>AI:</strong> {aiNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
