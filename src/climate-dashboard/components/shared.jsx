/* eslint-disable react-refresh/only-export-components */
/* Shared constants and helpers used across all chart components */

export const C = {
  brazil:     '#1B4332',
  india:      '#C27A2B',
  china:      '#B5282B',
  usa:        '#2B4C7E',
  indonesia:  '#5B8A4C',
  mexico:     '#8B4513',
  germany:    '#4A4E69',
  russia:     '#7B3F9E',
  world:      '#6B6560',
  fossil:     '#C4501A',
  renewables: '#2E7D6E',
  land_use:   '#1B4332',
  energy:     '#C27A2B',
  agriculture:'#5B8A4C',
  industrial: '#4A4E69',
  waste:      '#9B7224',
};

/* Country display labels */
export const COUNTRY_META = {
  Brazil:        { color: C.brazil,    label: 'Brazil' },
  India:         { color: C.india,     label: 'India' },
  China:         { color: C.china,     label: 'China' },
  'United States':{ color: C.usa,      label: 'USA' },
  Indonesia:     { color: C.indonesia, label: 'Indonesia' },
  Mexico:        { color: C.mexico,    label: 'Mexico' },
  Germany:       { color: C.germany,   label: 'Germany' },
  Russia:        { color: C.russia,    label: 'Russia' },
  World:         { color: C.world,     label: 'World avg.' },
};

/* Axis tick formatters */
export const fmtMt  = v => `${v} Mt`;
export const fmtT   = v => `${v} t`;
export const fmtKm  = v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v;
export const fmtPct = v => `${v}%`;

/* Generic tooltip wrapper */
export function Tip({ active, payload, label, unit = '', transform = x => x }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4, color: '#1A1814' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color ?? '#4C4840', margin: '2px 0' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.color, marginRight: 6 }} />
          {p.name}: <strong>{transform(p.value)}{unit}</strong>
        </p>
      ))}
    </div>
  );
}

/* Chart header block used by every panel */
export function ChartHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <p className="chart-title">{title}</p>
      {sub && <p className="chart-sub">{sub}</p>}
    </div>
  );
}
