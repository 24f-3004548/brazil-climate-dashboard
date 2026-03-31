import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value > 0 ? '+' : ''}{p.value.toFixed(1)}%</strong>
        </p>
      ))}
    </div>
  );
}

export default function EnergyGrowth() {
  /* Skip first year (no YoY for 2003 baseline) */
  const data = BRAZIL.slice(1);

  return (
    <div className="card" style={{ height: '100%' }}>
      <ChartHeader
        title="Energy Consumption Growth — Year-on-Year %"
        sub="Renewables vs fossil · 2004–2022 · fixed trend"
      />
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v}%`}
            domain={[-16, 16]}
            width={34}
          />
          <Tooltip content={<CustomTip />} />
          <Legend
            iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: '0.72rem', color: 'var(--ink-2)', paddingTop: 8 }}
          />
          <ReferenceLine y={0} stroke="#DDD9CF" strokeWidth={1} />

          {/* Annotate 2015–16 hydro drought */}
          <ReferenceLine x={2015} stroke="#DDD9CF" strokeDasharray="3 3"
            label={{ value: '↓ Drought', position: 'top', fontSize: 8, fill: '#7A746C', dy: -2 }} />

          <Bar
            dataKey="renewables_chg" name="Renewable % change"
            fill={C.renewables} fillOpacity={0.75}
            radius={[2, 2, 0, 0]}
          />
          <Line
            type="monotone" dataKey="fossil_chg" name="Fossil % change"
            stroke={C.fossil} strokeWidth={2}
            dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="chart-note">
        The 2015–16 hydro drought forced greater fossil fuel reliance. The 2020 dip reflects
        COVID-19 demand suppression; fossil consumption rebounded sharply in 2021.
      </p>
    </div>
  );
}
