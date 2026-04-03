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

/* ── Standard data KPI ── */
function KPI({ label, value, unit, curr, prev, invert, series, trendText, trendColor }) {
  return (
    <div className="card" style={{ padding: '0.95rem 1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p style={{ fontSize: '0.64rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
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
          curr={d.co2} prev={dp?.co2} invert series={spark('co2')} />
        <KPI label="CO₂ per capita" value={d.co2_pc.toFixed(2)} unit="tCO₂/person"
          curr={d.co2_pc} prev={dp?.co2_pc} invert series={spark('co2_pc')} />
        <KPI label="Deforestation" value={d.deforestation.toLocaleString()} unit="km²"
          curr={d.deforestation} prev={dp?.deforestation} invert series={spark('deforestation')} />
        <KPI label="Forest cover" value={d.forest_area.toFixed(1)} unit="% land"
          curr={d.forest_area} prev={dp?.forest_area} series={spark('forest_area')} />
        <KPI label="Global CO₂ share" value={d.global_share.toFixed(2)} unit="%"
          curr={d.global_share} prev={dp?.global_share} invert series={spark('global_share')} />
          <KPI label="Decoupling index" value={decoupling.toFixed(2)} unit="idx"
          curr={decoupling} prev={dp?.decoupling_index} invert series={spark('decoupling_index')} trendText={decouplingLabel} trendColor={decouplingTrendColor} />
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
