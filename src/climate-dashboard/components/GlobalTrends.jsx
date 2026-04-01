import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { COMPARISON } from '../data/comparison';
import { COUNTRY_META, ChartHeader } from './shared';
import AIExplanation from './AIExplanation';

/* Merge all country data into year-keyed rows for Recharts */
function buildData() {
  const years = BRAZIL.map(r => r.year);
  return years.map(year => {
    const row = { year };
    row['Brazil'] = BRAZIL.find(r => r.year === year)?.co2_pc ?? null;
    COMPARISON.filter(r => r.year === year).forEach(r => {
      row[r.country] = r.co2_pc;
    });
    return row;
  });
}

/* Show a curated subset to avoid clutter */
const SHOW = ['Brazil', 'India', 'China', 'United States', 'Germany', 'World'];

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {sorted.map(p => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: p.color, marginRight: 5 }} />
          {COUNTRY_META[p.dataKey]?.label ?? p.dataKey}: <strong>{p.value.toFixed(2)} t</strong>
        </p>
      ))}
    </div>
  );
}

export default function GlobalTrends() {
  const data = buildData();

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Per Capita CO₂ — Global Trends"
        sub="tCO₂/person · 2003–2022 · selected countries"
      />
      <div style={{ flex: 1, minHeight: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A746C' }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v} t`}
            width={38}
          />
          <Tooltip content={<CustomTip />} />
          <Legend
            iconType="plainline" iconSize={18}
            wrapperStyle={{ fontSize: '0.72rem', paddingTop: 8 }}
            formatter={(value) => COUNTRY_META[value]?.label ?? value}
          />
          {SHOW.map(country => (
            <Line
              key={country}
              type="monotone"
              dataKey={country}
              stroke={COUNTRY_META[country]?.color ?? '#9E988E'}
              strokeWidth={country === 'Brazil' ? 2.5 : 1.5}
              strokeDasharray={country === 'World' ? '5 3' : undefined}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <AIExplanation
        staticNote="Compared to major emitters, Brazil’s per-capita emissions remain low and relatively stable over time. While countries like China and India show rising trajectories linked to industrialisation, and the US shows gradual decline, Brazil’s trend is shaped less by energy transitions and more by land-use dynamics. This results in a flatter curve with periodic deviations linked to deforestation cycles."
        chartTitle="Per Capita CO₂ — Global Trends"
        chartContext="Per-capita emissions comparison across major economies over 2003-2022"
         contextMode="trend"
         seriesData={data}
        currentData={{
          Brazil: BRAZIL[BRAZIL.length - 1]?.co2_pc,
          China: COMPARISON.find(r => r.year === 2022 && r.country === 'China')?.co2_pc,
          USA: COMPARISON.find(r => r.year === 2022 && r.country === 'United States')?.co2_pc,
        }}
        previousData={null}
      />
    </div>
  );
}
