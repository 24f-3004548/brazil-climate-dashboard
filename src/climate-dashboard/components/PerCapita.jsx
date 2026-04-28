import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';
import AIExplanation from './AIExplanation';

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p>CO₂/capita: <strong>{payload[0].value.toFixed(2)} t</strong></p>
    </div>
  );
}

export default function PerCapita({ year }) {
  const row = BRAZIL.find(r => r.year === year);
  const prevRow = BRAZIL.find(r => r.year === year - 1);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="CO₂ per Capita"
        sub="tCO₂/person · 2003–2022 · Our World in Data"
      />
      <div style={{ flex: 1, minHeight: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={BRAZIL} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A746C' }} tickLine={false} axisLine={false} />
          <YAxis
            domain={[1.7, 3.0]}
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => v.toFixed(1)}
            width={30}
          />
          <Tooltip content={<CustomTip />} />

          {/* Highlight selected year */}
          <ReferenceLine x={year} stroke="#DDD9CF" strokeWidth={1.5} strokeDasharray="3 3" />

          <Line
            type="monotone" dataKey="co2_pc"
            stroke={C.blue} strokeWidth={2}
            dot={d => d.index === BRAZIL.findIndex(r => r.year === year)
              ? <circle key={d.key} cx={d.cx} cy={d.cy} r={4} fill={C.blue} stroke="#fff" strokeWidth={1.5} />
              : <g key={d.key} />
            }
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <AIExplanation
        staticNote="Brazil’s per-capita emissions remain relatively low and stable compared to major economies, reflecting a structurally cleaner energy system. A large share of electricity comes from renewables, especially hydropower, thus reducing reliance on fossil fuels. However, stability in this metric masks fluctuations driven by land-use change, which can significantly alter total emissions without strongly affecting per-capita energy trends."
        chartTitle="CO₂ per Capita"
         chartContext="Brazil's per-capita emissions trend across 2003-2022"
         contextMode="trend"
         seriesData={BRAZIL.map((r) => ({ year: r.year, co2_pc: r.co2_pc, gdp_pc: r.gdp_pc }))}
        currentData={{
          co2_pc: row?.co2_pc,
          gdp_pc: row?.gdp_pc,
        }}
        previousData={prevRow ? {
          co2_pc: prevRow.co2_pc,
        } : null}
      />
    </div>
  );
}
