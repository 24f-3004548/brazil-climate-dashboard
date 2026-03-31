import { BRAZIL } from '../data/brazil';

/* ── Trend arrow for data-driven cards ── */
function Trend({ curr, prev, invert = false }) {
  const up = curr > prev;
  const good = invert ? !up : up;
  return (
    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: good ? '#2D6A4F' : '#B5282B', marginLeft: 4 }}>
      {up ? '▲' : '▼'} {Math.abs(((curr - prev) / prev) * 100).toFixed(1)}%
    </span>
  );
}

/* ── Standard data KPI ── */
function KPI({ label, value, unit, sub, curr, prev, invert }) {
  return (
    <div className="card" style={{ padding: '1rem 1.1rem' }}>
      <p style={{ fontSize: '0.65rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink)', lineHeight: 1.1 }}>
        {value}
        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ink-3)', marginLeft: 3 }}>{unit}</span>
        {prev != null && <Trend curr={curr} prev={prev} invert={invert} />}
      </p>
      {sub && <p style={{ fontSize: '0.66rem', color: 'var(--ink-4)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

/* Color map for rating badges */
const BADGE_COLORS = {
  'High':               { bg: '#D4EDDA', text: '#1B4332', border: '#A8D5B5' },
  'Medium':             { bg: '#FFF3CD', text: '#7A5200', border: '#FFD97D' },
  'Low':                { bg: '#FAD7CC', text: '#7A1C0A', border: '#F4A58A' },
  'Insufficient':       { bg: '#FAD7CC', text: '#7A1C0A', border: '#F4A58A' },
  'Almost Sufficient':  { bg: '#FFF3CD', text: '#7A5200', border: '#FFD97D' },
  'High risk':          { bg: '#FAD7CC', text: '#7A1C0A', border: '#F4A58A' },
};

/* ── Index rating card (CCPI / CRI / CAT) — static values ── */
function IndexCard({ label, score, rank, badge, note, source }) {
  const col = BADGE_COLORS[badge] ?? { bg: '#ECEAE4', text: '#4C4840', border: '#DDD9CF' };
  return (
    <div className="card" style={{ padding: '1rem 1.1rem' }}>
      <p style={{ fontSize: '0.65rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: 7 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink)', lineHeight: 1 }}>
          {score}
        </span>
        {rank && (
          <span style={{ fontSize: '0.7rem', color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono, monospace' }}>
            Rank {rank}
          </span>
        )}
      </div>

      <span style={{
        display: 'inline-block',
        background: col.bg, color: col.text, border: `1px solid ${col.border}`,
        borderRadius: 3, fontSize: '0.65rem', fontWeight: 700,
        padding: '2px 8px', letterSpacing: '0.04em',
      }}>
        {badge}
      </span>

      {note && <p style={{ fontSize: '0.63rem', color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>{note}</p>}
      {source && <p style={{ fontSize: '0.6rem', color: 'var(--ink-4)', marginTop: 3, fontStyle: 'italic' }}>{source}</p>}
    </div>
  );
}

export default function KPICards({ year }) {
  const d  = BRAZIL.find(r => r.year === year);
  const dp = BRAZIL.find(r => r.year === year - 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>

      {/* Row 1: data-driven metrics — year-reactive */}
      <div className="kpi-grid-primary">
        <KPI label="Total CO₂" value={d.co2.toFixed(0)} unit="MtCO₂"
             sub="incl. land-use change" curr={d.co2} prev={dp?.co2} invert />
        <KPI label="CO₂ per capita" value={d.co2_pc.toFixed(2)} unit="tCO₂/person"
             curr={d.co2_pc} prev={dp?.co2_pc} invert />
        <KPI label="CO₂ intensity" value={(d.co2_gdp * 1000).toFixed(2)} unit="tCO₂/$1 000 GDP"
             sub="carbon efficiency" curr={d.co2_gdp} prev={dp?.co2_gdp} invert />
        <KPI label="Deforestation" value={d.deforestation.toLocaleString()} unit="km²"
             sub="PRODES estimate" curr={d.deforestation} prev={dp?.deforestation} invert />
        <KPI label="Forest cover" value={d.forest_area.toFixed(1)} unit="% land"
             curr={d.forest_area} prev={dp?.forest_area} />
        <KPI label="Global CO₂ share" value={d.global_share.toFixed(2)} unit="%"
             sub="incl. LUC" curr={d.global_share} prev={dp?.global_share} invert />
      </div>

      {/* Row 2: external index ratings — static (latest published edition) */}
      <div className="kpi-grid-secondary">
        <IndexCard
          label="CCPI — Climate Change Performance Index"
          score="58.2"
          rank="27 / 63"
          badge="Medium"
          note="Insufficient renewable energy targets and inconsistent forest protection policy penalise the score despite Brazil's clean electricity grid."
          source="Germanwatch · CCPI 2026"
        />
        <IndexCard
          label="CAT — Climate Action Tracker"
          score="2024"
          rank={null}
          badge="Insufficient"
          note="Unconditional NDC not aligned with a 1.5 °C pathway. Conditional NDC is 'Almost Sufficient' but contingent on international finance."
          source="Climate Action Tracker · November 2024"
        />
      </div>

    </div>
  );
}
