import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';
import AIExplanation from './AIExplanation';

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value.toLocaleString()}{p.name.includes('CO₂') ? ' Mt' : ' km²'}</strong>
        </p>
      ))}
    </div>
  );
}

export default function DeforestationChart() {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Deforestation vs. Total CO₂ — Thesis Chart"
        sub="MtCO₂ & km² · 2003–2022 · INPE PRODES"
      />
      <div style={{ flex: 1, minHeight: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={BRAZIL} margin={{ top: 10, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A746C' }} tickLine={false} axisLine={false} />

          {/* Left axis: CO2 */}
          <YAxis
            yAxisId="co2"
            domain={[330, 580]}
            tick={{ fontSize: 10, fill: C.brazil }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v}`}
            width={34}
          />

          {/* Right axis: deforestation */}
          <YAxis
            yAxisId="def"
            orientation="right"
            domain={[3000, 30000]}
            tick={{ fontSize: 10, fill: C.fossil }}
            tickLine={false} axisLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            width={34}
          />

          <Tooltip content={<CustomTip />} />
          <Legend
            iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: '0.72rem', color: 'var(--ink-2)', paddingTop: 8 }}
          />

          {/* 2012 Forest Code — structural break */}
          <ReferenceLine yAxisId="co2" x={2012} stroke="#DDD9CF" strokeDasharray="4 3"
            label={{ value: 'Forest Code', position: 'top', fontSize: 9, fill: '#7A746C', dy: -4 }} />

          <Line
            yAxisId="co2" type="monotone" dataKey="co2"
            name="Total CO₂" stroke={C.brazil} strokeWidth={2}
            dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
          />
          <Line
            yAxisId="def" type="monotone" dataKey="deforestation"
            name="Deforestation" stroke={C.fossil} strokeWidth={2}
            strokeDasharray="6 3"
            dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
          />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <AIExplanation
        staticNote="Brazil’s emissions trajectory is tightly linked to deforestation cycles rather than industrial activity alone. Land-use change—primarily the clearing of forests for agriculture—accounts for a disproportionately large share of emissions, causing national totals to rise and fall with forest policy and enforcement. This makes Brazil’s emissions pattern more volatile and policy-sensitive than fossil-fuel-driven economies."
        chartTitle="Deforestation vs. Total CO₂"
        chartContext="Relationship between deforestation and CO₂ emissions in Brazil, showing policy impacts"
         contextMode="trend"
         seriesData={BRAZIL.map((r) => ({ year: r.year, co2: r.co2, deforestation: r.deforestation }))}
        currentData={{
          co2: BRAZIL[BRAZIL.length - 1]?.co2,
          deforestation: BRAZIL[BRAZIL.length - 1]?.deforestation,
        }}
        previousData={null}
      />
    </div>
  );
}
