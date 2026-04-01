import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
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
      <p>Forest cover: <strong>{payload[0].value.toFixed(2)}% of land area</strong></p>
    </div>
  );
}

export default function ForestArea() {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Forest Area"
        sub="% of total land area · 2003–2022 · World Bank"
      />
      <div style={{ flex: 1, minHeight: 170 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={BRAZIL} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green_light ?? '#52B788'} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.green_light ?? '#52B788'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#7A746C' }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[58, 65.5]}
              tick={{ fontSize: 10, fill: '#7A746C' }}
              tickLine={false} axisLine={false}
              tickFormatter={v => `${v}%`}
              width={34}
            />
            <Tooltip content={<CustomTip />} />
            <Area
              type="monotone" dataKey="forest_area"
              stroke="#2D6A4F" strokeWidth={2}
              fill="url(#forestGrad)"
              dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <AIExplanation
        staticNote="Brazil maintains one of the largest forest reserves globally, but gradual declines in forest cover reflect sustained pressure from agricultural expansion and land conversion. Even small percentage losses translate into large absolute area reductions, with significant implications for carbon storage and biodiversity. Changes in forest cover directly influence whether Brazil acts as a carbon sink or source."
        chartTitle="Forest Area"
        chartContext="Proportion of Brazil's land under forest cover, indicating deforestation trends"
         contextMode="trend"
         seriesData={BRAZIL.map((r) => ({ year: r.year, forest_area: r.forest_area }))}
        currentData={{
          forest_area: BRAZIL[BRAZIL.length - 1]?.forest_area,
        }}
        previousData={BRAZIL.length > 1 ? {
          forest_area: BRAZIL[BRAZIL.length - 2]?.forest_area,
        } : null}
      />
    </div>
  );
}
