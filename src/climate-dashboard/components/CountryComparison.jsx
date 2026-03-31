import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { COMPARISON } from '../data/comparison';
import { COUNTRY_META, ChartHeader } from './shared';

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p>CO₂/capita: <strong>{payload[0].value.toFixed(2)} t/person</strong></p>
    </div>
  );
}

export default function CountryComparison({ year }) {
  const brazilRow = BRAZIL.find(r => r.year === year);
  const peers = COMPARISON.filter(r => r.year === year && r.country !== 'World');
  const world = COMPARISON.find(r => r.year === year && r.country === 'World');

  /* Combine Brazil + peers, sort ascending */
  const data = [
    { name: 'Brazil', co2_pc: brazilRow.co2_pc, isBrazil: true },
    ...peers.map(r => ({ name: COUNTRY_META[r.country]?.label ?? r.country, co2_pc: r.co2_pc, isBrazil: false })),
  ].sort((a, b) => a.co2_pc - b.co2_pc);

  return (
    <div className="card" style={{ height: '100%' }}>
      <ChartHeader
        title="Per Capita Comparison"
        sub={`tCO₂/person · ${year} · selected peers`}
      />
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 56, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" horizontal={false} />
          <XAxis
            type="number" tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v} t`}
          />
          <YAxis
            type="category" dataKey="name"
            tick={{ fontSize: 10, fill: '#4C4840' }}
            tickLine={false} axisLine={false}
            width={54}
          />
          <Tooltip content={<CustomTip />} />

          {/* World average reference */}
          {world && (
            <ReferenceLine
              x={world.co2_pc} stroke="#9B7224" strokeDasharray="4 3"
              label={{ value: 'World avg', position: 'right', fontSize: 9, fill: '#9B7224' }}
            />
          )}

          <Bar dataKey="co2_pc" radius={[0, 3, 3, 0]}>
            {data.map((d, i) => {
              const baseColor = Object.entries(COUNTRY_META).find(([k, v]) =>
                d.isBrazil ? k === 'Brazil' : v.label === d.name
              )?.[1]?.color ?? '#9E988E';
              return (
                <Cell
                  key={i}
                  fill={baseColor}
                  opacity={d.isBrazil ? 1 : 0.72}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-note">
        Brazil's per-capita emissions are low relative to most industrialised nations but
        have risen since the policy rollbacks of 2019. Use the year slider to explore changes over time.
      </p>
    </div>
  );
}
