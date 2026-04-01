import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer, ReferenceLine,
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
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Per Capita Comparison"
        sub={`tCO₂/person · ${year} · selected peers`}
      />
      <div style={{ flex: 1, minHeight: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
      <AIExplanation
        staticNote="Brazil’s per-capita emissions are lower than most industrialised economies due to its renewable-heavy electricity mix and lower dependence on coal. However, this advantage is partly offset by emissions from deforestation and agriculture, which are not typically dominant in developed countries. This creates a profile where Brazil appears efficient in energy terms but less so when land-use impacts are included."
        chartTitle="Per Capita Comparison"
        chartContext={`How Brazil's per-capita emissions compare to global peers in ${year}`}
        year={year}
        currentData={{
          brazil_co2_pc: brazilRow?.co2_pc,
          world_avg: world?.co2_pc,
        }}
        previousData={BRAZIL.find(r => r.year === year - 1) ? {
          brazil_co2_pc: BRAZIL.find(r => r.year === year - 1)?.co2_pc,
        } : null}
      />
    </div>
  );
}
