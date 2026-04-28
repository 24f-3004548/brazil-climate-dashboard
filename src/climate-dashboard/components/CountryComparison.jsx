import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { COMPARISON } from '../data/comparison';
import { COUNTRY_META, ChartHeader } from './shared';
import AIExplanation from './AIExplanation';

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i}>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>: <strong>{p.value ? p.value.toFixed(2) : 'N/A'} t/person</strong>
        </p>
      ))}
    </div>
  );
}

export default function CountryComparison({ year }) {
  // Get all years in the data
  const years = Array.from(new Set(COMPARISON.map(r => r.year))).sort((a, b) => a - b);

  // List of countries to compare (excluding World)
  const countries = [
    'Brazil',
    'United States',
    'China',
    'India',
    'Germany',
    'Russia',
    'Indonesia',
    'Mexico',
  ];

  // Build time series for each country
  const data = years.map(y => {
    const row = { year: y };
    countries.forEach(c => {
      const entry = c === 'Brazil'
        ? BRAZIL.find(r => r.year === y)
        : COMPARISON.find(r => r.year === y && r.country === c);
      row[c] = entry?.co2_pc ?? null;
    });
    // World average
    const world = COMPARISON.find(r => r.year === y && r.country === 'World');
    row['World'] = world?.co2_pc ?? null;
    return row;
  });

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Per Capita Comparison"
        sub="tCO₂/person over time · selected peers"
      />

      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A746C' }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[0, 'dataMax + 1']}
              tick={{ fontSize: 10, fill: '#7A746C' }}
              tickLine={false} axisLine={false}
              tickFormatter={v => v.toFixed(1)}
              width={30}
            />
            <Tooltip content={<CustomTip />} />
            <ReferenceLine x={year} stroke="#DDD9CF" strokeWidth={1.5} strokeDasharray="3 3" />
            {countries.map(c => (
              <Line
                key={c}
                type="monotone"
                dataKey={c}
                name={COUNTRY_META[c]?.label || c}
                stroke={COUNTRY_META[c]?.color || '#888'}
                strokeWidth={c === 'Brazil' ? 2.5 : 1.5}
                dot={false}
                activeDot={c === 'Brazil' ? { r: 4, strokeWidth: 0 } : false}
              />
            ))}
            {/* World average as dashed line */}
            <Line
              type="monotone"
              dataKey="World"
              name="World avg."
              stroke={COUNTRY_META['World']?.color || '#9B7224'}
              strokeDasharray="4 3"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compact country colour legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4rem 0.8rem', marginTop: '0.3rem' }}>
        {[...countries, 'World']
          .map(c => ({
            id: c,
            label: COUNTRY_META[c]?.label || (c === 'World' ? 'World avg.' : c),
            color: COUNTRY_META[c]?.color || (c === 'World' ? '#9B7224' : '#888')
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
          .map(item => (
            <span key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--ink-3)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
              {item.label}
            </span>
          ))}
      </div>

      <AIExplanation
        staticNote="Per-capita emissions vary across countries, shaped by economic structure and energy use. The USA remains highest despite a gradual decline, while Germany trends downward with cleaner energy. China and India show rising or stable paths with growth. Brazil stays relatively low due to renewables, and global averages increase slowly, reflecting differing development and transition stages."
        chartTitle="Per Capita Comparison"
        chartContext="Trends in tCO₂/person over time across selected countries."
        contextMode="trend"
        seriesData={data}
        currentData={data[data.length - 1]}
        previousData={null}
      />
    </div>
  );
}
