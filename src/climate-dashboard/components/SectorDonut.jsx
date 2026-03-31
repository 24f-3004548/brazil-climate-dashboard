import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';

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
  const slices = SECTORS.map(s => ({ ...s, value: row[s.key] }));

  return (
    <div className="card" style={{ height: '100%' }}>
      <ChartHeader
        title="Emissions by Sector"
        sub={`Share of total CO₂ · ${year} · SEEG Brazil`}
      />
      <div className="sector-layout">
        <div className="sector-chart">
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
        </div>
        <SectorLegend data={slices} />
      </div>
      <p className="chart-note">
        Land-use change—primarily deforestation—dominates Brazil's emission profile, unlike most
        industrialised economies where energy is the primary source.
      </p>
    </div>
  );
}
