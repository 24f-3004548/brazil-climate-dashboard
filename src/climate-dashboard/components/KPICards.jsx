import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { BRAZIL } from '../data/brazil';
import AIExplanation from './AIExplanation';

/* ── Trend arrow for data-driven cards ── */
function Trend({ curr, prev, invert = false, trendText, trendColor }) {
  const up = curr > prev;
  const good = invert ? !up : up;
  const color = trendColor || (good ? '#2D6A4F' : '#B5282B');
  return (
    <span style={{ fontSize: '0.66rem', fontWeight: 600, color }}>
      {up ? '▲' : '▼'} {trendText || `${Math.abs(((curr - prev) / prev) * 100).toFixed(1)}% (YoY)`}
    </span>
  );
}

function Icon({ kind }) {
  const styles = { width: 11, height: 11, stroke: 'currentColor', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const common = { display: 'inline-flex', alignItems: 'center', marginRight: 5, color: 'var(--ink-4)' };

  if (kind === 'co2') {
    return <span style={common}><svg viewBox="0 0 16 16" style={styles}><circle cx="8" cy="8" r="5.2" /><path d="M3.2 8h9.6" /></svg></span>;
  }
  if (kind === 'person') {
    return <span style={common}><svg viewBox="0 0 16 16" style={styles}><circle cx="8" cy="5" r="2.1" /><path d="M3.8 13c.4-2.2 2-3.4 4.2-3.4S11.8 10.8 12.2 13" /></svg></span>;
  }
  if (kind === 'intensity') {
    return <span style={common}><svg viewBox="0 0 16 16" style={styles}><path d="M8.8 1.8 4.9 8h2.4L6.8 14.2l4.3-6.5H8.7z" /></svg></span>;
  }
  if (kind === 'deforestation') {
    return <span style={common}><svg viewBox="0 0 16 16" style={styles}><path d="M8 13V9" /><path d="M8 2.5c2.1 1.2 3.2 2.6 3.2 4.1C11.2 8.3 9.9 9 8 9 6.1 9 4.8 8.3 4.8 6.6 4.8 5.1 5.9 3.7 8 2.5z" /></svg></span>;
  }
  if (kind === 'forest') {
    return <span style={common}><svg viewBox="0 0 16 16" style={styles}><path d="M8 13V9.2" /><path d="M8 2.2 3.6 8h8.8z" /><path d="M8 5.2 5.2 8.8h5.6z" /></svg></span>;
  }
  return <span style={common}><svg viewBox="0 0 16 16" style={styles}><path d="M2.5 8h11" /><path d="M8 2.5a5.5 5.5 0 1 0 0 11" /></svg></span>;
}

/* ── Standard data KPI ── */
function KPI({ label, value, unit, micro, curr, prev, invert, icon, series, trendText, trendColor }) {
  return (
    <div className="card" style={{ padding: '0.95rem 1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p style={{ fontSize: '0.64rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2, display: 'flex', alignItems: 'center' }}>
        <Icon kind={icon} />
        {label}
      </p>
      <p style={{ fontSize: '1.35rem', fontWeight: 650, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink)', lineHeight: 1.05, margin: 0 }}>
        <span>{value}</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--ink-3)', opacity: 0.72, marginLeft: 4 }}>{unit}</span>
      </p>

      {prev != null && (
        <p style={{ margin: 0, lineHeight: 1 }}>
          <Trend curr={curr} prev={prev} invert={invert} trendText={trendText} trendColor={trendColor} />
        </p>
      )}

      <div style={{ width: '100%', height: 20, marginTop: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="rgba(77, 97, 54, 0.55)"
              strokeWidth={1.2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default function KPICards({ year }) {
  const d  = BRAZIL.find(r => r.year === year);
  const dp = BRAZIL.find(r => r.year === year - 1);
  const spark = (key) => BRAZIL.slice(-12).map((r) => ({ year: r.year, v: r[key] }));
  const ccpiRows = [
    { label: 'GHG Emission', rating: 'Very Low', rank: 54 },
    { label: 'Renewable Energy', rating: 'Medium', rank: 9 },
    { label: 'Energy Use', rating: 'Medium', rank: 33 },
    { label: 'Climate Policy', rating: 'High', rank: 5 },
  ];
  const ratingWidth = { 'Very Low': 24, Low: 40, Medium: 62, High: 82, 'Very High': 96 };
  const decoupling = Number(d?.decoupling_index ?? 0);
  const decouplingLabel = decoupling < 0
    ? 'Strong Decoupling'
    : decoupling < 0.8
      ? 'Weak Decoupling'
      : decoupling <= 1.2
        ? 'No Decoupling'
        : 'Negative Decoupling';
  const decouplingTrendColor = decouplingLabel === 'Strong Decoupling' ? '#2D6A4F' : '#B5282B';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>

      {/* Row 1: data-driven metrics — year-reactive */}
      <div className="kpi-grid-primary">
        <KPI label="Total CO₂" value={d.co2.toFixed(0)} unit="MtCO₂"
           micro="Driven largely by land-use change" curr={d.co2} prev={dp?.co2} invert icon="co2" series={spark('co2')} />
        <KPI label="CO₂ per capita" value={d.co2_pc.toFixed(2)} unit="tCO₂/person"
           micro="Low due to renewable-heavy electricity" curr={d.co2_pc} prev={dp?.co2_pc} invert icon="person" series={spark('co2_pc')} />
        <KPI label="Deforestation" value={d.deforestation.toLocaleString()} unit="km²"
           micro="Primary driver of emissions volatility" curr={d.deforestation} prev={dp?.deforestation} invert icon="deforestation" series={spark('deforestation')} />
        <KPI label="Forest cover" value={d.forest_area.toFixed(1)} unit="% land"
           micro="Declining slowly, high absolute impact" curr={d.forest_area} prev={dp?.forest_area} icon="forest" series={spark('forest_area')} />
        <KPI label="Global CO₂ share" value={d.global_share.toFixed(2)} unit="%"
           micro="Moderate, but land-use amplified" curr={d.global_share} prev={dp?.global_share} invert icon="global" series={spark('global_share')} />
          <KPI label="Decoupling index" value={decoupling.toFixed(2)} unit="idx"
            micro={decouplingLabel} curr={decoupling} prev={dp?.decoupling_index} invert icon="intensity" series={spark('decoupling_index')} trendText={decouplingLabel} trendColor={decouplingTrendColor} />
      </div>

      <div className="card" style={{ padding: '1.05rem 1.1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '25% 25% 50%', alignItems: 'stretch', gap: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 14 }}>
            <p style={{ margin: 0, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--ink-4)' }}>
              Climate Performance (CCPI 2026)
            </p>
            <p style={{ margin: '5px 0 0', fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: 'var(--ink)' }}>58.2</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-2)' }}>Rank 27 / 63</p>
            <p style={{ margin: '3px 0 0', fontSize: '0.67rem', color: 'var(--ink-4)' }}>Global mid-tier performance</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)', padding: '0 14px' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--ink-4)' }}>
              Policy Alignment (CAT 2024)
            </p>
            <p style={{ margin: '5px 0 0', fontSize: '1.52rem', fontWeight: 700, lineHeight: 1.05, color: '#B5282B' }}>Insufficient</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--ink-3)' }}>Not aligned with 1.5°C pathway</p>
          </div>

          <div style={{ padding: '0 0 0 14px', borderRadius: 4 }}>
            <p style={{ margin: 0, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--ink-4)' }}>
              CCPI Components
            </p>
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 58px 34px', gap: 8, padding: '0 0 4px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <span style={{ fontSize: '0.54rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Indicators</span>
                <span style={{ fontSize: '0.54rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</span>
                <span style={{ fontSize: '0.54rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Rank</span>
              </div>
              {ccpiRows.map((r) => (
                <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '1fr 58px 34px', gap: 8, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--ink-3)', lineHeight: 1.1 }}>{r.label}</p>
                    <div style={{ marginTop: 2, height: 3.5, background: 'rgba(0,0,0,0.08)', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: `${ratingWidth[r.rating]}%`, background: 'rgba(66, 112, 80, 0.62)', borderRadius: 999 }} />
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--ink-3)' }}>{r.rating}</p>
                  <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--ink-3)', textAlign: 'right' }}>{r.rank}</p>
                </div>
              ))}
            </div>

            <p style={{ margin: '7px 0 0', fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)' }}>
              Global Target Alignment
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginTop: 4 }}>
              {['Compatible', 'Almost', 'Insufficient', 'Highly', 'Critical'].map((step) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                  <span style={{ width: '100%', height: 5, borderRadius: 999, background: step === 'Insufficient' ? 'rgba(181,40,43,0.78)' : 'rgba(120,120,120,0.28)' }} />
                  <span style={{ fontSize: '0.5rem', color: 'var(--ink-4)', lineHeight: 1.1 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AIExplanation
          staticNote="Brazil's climate performance reflects a structural split: a relatively clean energy system supported by renewables, but weak alignment with global climate targets due to policy inconsistency and persistent land-use emissions. Deforestation and agriculture continue to drive emissions volatility, limiting progress despite advantages in electricity generation."
          chartTitle="Climate Performance Panel (CCPI + CAT)"
          chartContext="Explain how CCPI and Climate Action Tracker (CAT) work, then interpret Brazil's position using CCPI 2026 score 58.2 (rank 27/63), CAT 2024 label 'Insufficient', and the component profile showing weak GHG emissions performance but stronger climate policy and moderate renewable/energy-use ratings."
          currentData={{
            ccpi_score: 58.2,
            ccpi_rank: 27,
            ccpi_total: 63,
            cat_label: 'Insufficient',
            ghg_rating: 'Very Low',
            renewable_rating: 'Medium',
            energy_use_rating: 'Medium',
            climate_policy_rating: 'High',
            decoupling_index: decoupling,
            decoupling_label: decouplingLabel,
          }}
          previousData={null}
        />
      </div>

    </div>
  );
}
