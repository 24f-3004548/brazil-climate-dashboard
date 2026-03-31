import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { ChartHeader, C } from './shared';

/* Key Brazilian climate policy events */
const EVENTS = [
  { year: 2004, label: 'PPCDAM', dy: -18 },
  { year: 2012, label: 'Forest Code', dy: -18 },
  { year: 2019, label: 'Policy rollback', dy: -18 },
];

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p>Total CO₂: <strong>{payload[0].value.toFixed(1)} MtCO₂</strong></p>
    </div>
  );
}

export default function TotalEmissions() {
  return (
    <div className="card" style={{ height: '100%' }}>
      <ChartHeader
        title="Total CO₂ Emissions"
        sub="MtCO₂e · 2003–2022 · incl. land-use change"
      />
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={BRAZIL} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C.brazil} stopOpacity={0.18} />
              <stop offset="95%" stopColor={C.brazil} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A746C' }} tickLine={false} axisLine={false} />
          <YAxis
            domain={[300, 580]}
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v}`}
            width={32}
          />
          <Tooltip content={<CustomTip />} />

          {/* Policy annotation lines */}
          {EVENTS.map(e => (
            <ReferenceLine
              key={e.year} x={e.year}
              stroke="#DDD9CF" strokeDasharray="4 3"
              label={{
                value: e.label,
                position: 'top',
                fontSize: 9,
                fill: '#7A746C',
                dy: e.dy,
              }}
            />
          ))}

          <Area
            type="monotone" dataKey="co2"
            stroke={C.brazil} strokeWidth={2}
            fill="url(#co2Grad)"
            dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="chart-note">
        Annotations mark major policy inflection points. PPCDAM = Action Plan for Prevention and Control of
        Deforestation in the Amazon. Source: SEEG Brazil / OWID.
      </p>
    </div>
  );
}
