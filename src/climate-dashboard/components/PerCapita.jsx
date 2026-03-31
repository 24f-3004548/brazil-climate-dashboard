import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';

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
  return (
    <div className="card" style={{ height: '100%' }}>
      <ChartHeader
        title="CO₂ per Capita"
        sub="tCO₂/person · 2003–2022 · fixed trend"
      />
      <ResponsiveContainer width="100%" height={210}>
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
      <p className="chart-note">
        Per-capita emissions have remained relatively stable (1.9–2.8 t) compared to the rapid growth
        seen in emerging Asian economies, reflecting Brazil's high renewables share in its electricity mix.
      </p>
    </div>
  );
}
