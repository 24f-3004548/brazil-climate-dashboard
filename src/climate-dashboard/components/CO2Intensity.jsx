import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p>CO₂ intensity: <strong>{(payload[0].value * 1000).toFixed(2)} tCO₂/$1 000 GDP</strong></p>
    </div>
  );
}

export default function CO2Intensity() {
  return (
    <div className="card" style={{ height: '100%' }}>
      <ChartHeader
        title="Carbon Intensity of GDP"
        sub="tCO₂ per $1 000 GDP (PPP) · 2003–2022"
      />
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={BRAZIL} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A746C' }} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0.14, 0.2]}
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => (v * 1000).toFixed(0)}
            width={30}
          />
          <Tooltip content={<CustomTip />} />
          <Line
            type="monotone" dataKey="co2_gdp"
            stroke={C.teal ?? '#2E7D6E'} strokeWidth={2}
            dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="chart-note">
        Carbon intensity has declined from ~181 tCO₂/$m GDP in 2003 to ~151 in 2022,
        reflecting both efficiency gains and GDP growth outpacing emissions.
      </p>
    </div>
  );
}
