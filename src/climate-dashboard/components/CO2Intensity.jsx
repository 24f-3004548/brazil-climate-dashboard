import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { C, ChartHeader } from './shared';
import AIExplanation from './AIExplanation';

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
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Carbon Intensity of GDP"
        sub="tCO₂ per $1k GDP · 2003–2022 · Our World in Data"
      />
      <div style={{ flex: 1, minHeight: 170 }}>
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
      <AIExplanation
        staticNote="Brazil’s carbon intensity is relatively low due to a less energy-intensive economic structure and a high share of renewables in electricity generation. Improvements over time reflect efficiency gains and structural changes, but progress is uneven as emissions from agriculture and land-use change are not directly tied to GDP growth in the same way as industrial emissions."
        chartTitle="Carbon Intensity of GDP"
        chartContext="Brazil's emissions relative to economic output, showing decoupling trends"
         contextMode="trend"
         seriesData={BRAZIL.map((r) => ({ year: r.year, co2_gdp: r.co2_gdp, gdp_pc: r.gdp_pc }))}
        currentData={{
          co2_gdp: BRAZIL[BRAZIL.length - 1]?.co2_gdp,
          gdp_pc: BRAZIL[BRAZIL.length - 1]?.gdp_pc,
        }}
        previousData={BRAZIL.length > 1 ? {
          co2_gdp: BRAZIL[BRAZIL.length - 2]?.co2_gdp,
        } : null}
      />
    </div>
  );
}
