import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';
import AIExplanation from './AIExplanation';

const SECTORS = [
  { key: 'land_use',    label: 'Land-use change', color: C.land_use },
  { key: 'energy',      label: 'Energy',           color: C.energy },
  { key: 'agriculture', label: 'Agriculture',      color: C.agriculture },
  { key: 'industrial',  label: 'Industrial',       color: C.industrial },
  { key: 'waste',       label: 'Waste',            color: C.waste },
];

function CustomTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="custom-tooltip">
      <strong>{name}</strong>
      <p>{(value * 100).toFixed(1)}% of total</p>
    </div>
  );
}

/* Compact legend rendered manually for precise styling */
function SectorLegend({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
      {data.map(s => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, flexShrink: 0 }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-2)' }}>
            {s.label}
            <span style={{ marginLeft: 6, fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.68rem', color: 'var(--ink-3)' }}>
              {(s.value * 100).toFixed(1)}%
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SectorDonut({ year }) {
  const row = BRAZIL.find(r => r.year === year);
  const prevRow = BRAZIL.find(r => r.year === year - 1);
  
  if (!row) {
    return <div className="card" style={{ height: '100%' }}>Data not found for {year}</div>;
  }
  
  const rawSlices = SECTORS.map(s => ({ ...s, value: Number(row[s.key] ?? 0) }));
  const sectorTotal = rawSlices.reduce((sum, slice) => sum + slice.value, 0);
  const slices = sectorTotal > 0
    ? rawSlices.map((slice) => ({ ...slice, value: slice.value / sectorTotal }))
    : rawSlices;
  const dominant = slices.reduce((a, b) => (a.value > b.value ? a : b));
  const dominantLabel = dominant.label.replace(' change', '');
  const dominantPct = (dominant.value * 100).toFixed(1);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Emissions by Sector"
        sub={`Share of total CO₂ · ${year} · SEEG Brazil`}
      />
      <div className="sector-layout" style={{ flex: 1 }}>
        <div className="sector-chart" style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices} dataKey="value"
                nameKey="label"
                cx="50%" cy="50%"
                innerRadius="52%" outerRadius="80%"
                startAngle={90} endAngle={-270}
                paddingAngle={2} strokeWidth={0}
              >
                {slices.map(s => <Cell key={s.key} fill={s.color} />)}
              </Pie>
              <Tooltip content={<CustomTip />} />
            </PieChart>
          </ResponsiveContainer>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '1.2rem', lineHeight: 1, fontWeight: 700, color: dominant.color, fontFamily: 'IBM Plex Mono, monospace' }}>
              {dominantPct}%
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.58rem', lineHeight: 1.2, fontWeight: 550, color: 'var(--ink-3)' }}>
              Major source - {dominantLabel}
            </p>
          </div>
        </div>
        <SectorLegend data={slices} />
      </div>
      <AIExplanation
        staticNote="Brazil’s emissions profile is dominated by land-use change and agriculture, unlike most large economies where energy is the primary source. Deforestation alone contributes a substantial share, followed by livestock and soil emissions. The energy sector plays a comparatively smaller role due to widespread use of renewables, making Brazil structurally different from fossil-fuel-dependent economies."
        chartTitle="Emissions by Sector"
        chartContext={`Breakdown of Brazil's CO₂ emissions by sector`}
        year={year}
        currentData={{
          land_use: row.land_use,
          agriculture: row.agriculture,
          energy: row.energy,
          industrial: row.industrial,
          waste: row.waste,
        }}
        previousData={prevRow ? {
          land_use: prevRow.land_use,
          agriculture: prevRow.agriculture,
          energy: prevRow.energy,
        } : null}
      />
    </div>
  );
}
