import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Label,
} from 'recharts';
import { BRAZIL } from '../data/brazil';
import { COMPARISON } from '../data/comparison';
import { COUNTRY_META, ChartHeader } from './shared';
import AIExplanation from './AIExplanation';

function CustomTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.name} · {d.year}</p>
      <p>GDP/capita: <strong>${d.gdp_pc.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></p>
      <p>CO₂/capita: <strong>{d.co2_pc.toFixed(2)} t</strong></p>
    </div>
  );
}

export default function IncomeEmissions({ year }) {
  /* Build scatter data for selected year across all countries */
  const brazilRow = BRAZIL.find(r => r.year === year);

  const points = [
    { name: 'Brazil', gdp_pc: brazilRow.gdp_pc, co2_pc: brazilRow.co2_pc, year, isBrazil: true,
      color: COUNTRY_META['Brazil']?.color },
    ...COMPARISON
      .filter(r => r.year === year)
      .map(r => ({
        name: COUNTRY_META[r.country]?.label ?? r.country,
        gdp_pc: r.gdp_pc,
        co2_pc: r.co2_pc,
        year,
        isBrazil: false,
        color: COUNTRY_META[r.country]?.color ?? '#9E988E',
      })),
  ];

  /* Split Brazil from peers so it renders on top with a distinct marker */
  const peers  = points.filter(p => !p.isBrazil);
  const brazil = points.filter(p =>  p.isBrazil);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartHeader
        title="Income vs. Emissions"
        sub={`GDP PPP p.c. vs CO₂ p.c. · ${year} · 8 countries + world`}
      />
      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" />
          <XAxis
            type="number" dataKey="gdp_pc"
            name="GDP p.c."
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            domain={[0, 80000]}
          >
            <Label value="GDP per capita (PPP, intl $)" offset={-10} position="insideBottom"
              style={{ fontSize: 9, fill: '#7A746C' }} />
          </XAxis>
          <YAxis
            type="number" dataKey="co2_pc"
            name="CO₂ p.c."
            tick={{ fontSize: 10, fill: '#7A746C' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v} t`}
            width={38}
          />
          <Tooltip content={<CustomTip />} cursor={{ strokeDasharray: '3 3' }} />

          {/* Peer countries */}
          <Scatter
            data={peers} name="Peers"
            shape={props => {
              const color = props.payload?.color ?? '#9E988E';
              return <circle cx={props.cx} cy={props.cy} r={5} fill={color} fillOpacity={0.75} stroke="none" />;
            }}
          />

          {/* Brazil — larger, labelled */}
          <Scatter
            data={brazil} name="Brazil"
            shape={props => (
              <g>
                <circle cx={props.cx} cy={props.cy} r={7} fill="#1B4332" stroke="#fff" strokeWidth={1.5} />
                <text x={props.cx + 10} y={props.cy + 4} fontSize={9} fill="#1B4332" fontWeight={600}>Brazil</text>
              </g>
            )}
          />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Compact country colour legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4rem 0.8rem', marginTop: '0.3rem' }}>
        {[...points].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
          <span key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--ink-3)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}
          </span>
        ))}
      </div>

      <AIExplanation
        staticNote="Brazil lies below the typical income–emissions curve, indicating lower emissions for its level of economic development. This deviation is driven by a relatively low-carbon energy mix and limited heavy industry compared to high-income economies. However, when land-use emissions are included, this apparent efficiency weakens, highlighting the structural importance of agriculture and deforestation in Brazil’s economy."
        chartTitle="Income vs. Emissions"
        chartContext={`Relationship between GDP per capita and CO₂ emissions in ${year}`}
        year={year}
        currentData={{
          gdp_pc: brazilRow.gdp_pc,
          co2_pc: brazilRow.co2_pc,
        }}
        previousData={BRAZIL.find(r => r.year === year - 1) ? {
          gdp_pc: BRAZIL.find(r => r.year === year - 1)?.gdp_pc,
          co2_pc: BRAZIL.find(r => r.year === year - 1)?.co2_pc,
        } : null}
      />
    </div>
  );
}
