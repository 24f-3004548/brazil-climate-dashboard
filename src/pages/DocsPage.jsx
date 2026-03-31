import { Link } from "react-router-dom";
import "./DocsPage.css";

const tocItems = [
  { id: "objective", label: "Objective" },
  { id: "framework", label: "Core analytical framework" },
  { id: "sources", label: "Data sources" },
  { id: "definitions", label: "Indicator definitions" },
  { id: "design", label: "Visualization design choices" },
  { id: "indices", label: "Role of climate indices" },
  { id: "insights", label: "Key analytical insights" },
  { id: "interpretation", label: "Interpretation approach" },
  { id: "limitations", label: "Limitations" },
  { id: "conclusion", label: "Conclusion" },
  { id: "interactive", label: "Interactive features" },
  { id: "build", label: "Implementation and tech stack" },
];

const snippets = {
  stack: `Core: React + Vite + React Router
Charts: Recharts
Styling: Scoped CSS modules/files per page/component
Data: Curated static datasets in src/assets/climate-dashboard/data
Structure: Reusable chart components + shared design tokens/helpers`,
};

export default function DocsPage() {
  return (
    <main className="docs-page">
      <div className="docs-aura docs-aura-left" />
      <div className="docs-aura docs-aura-right" />

      <header className="docs-topbar">
        <div>
          <p className="docs-kicker">Brazil climate dashboard documentation</p>
          <h1>Brazil - Climate &amp; Emissions Dashboard</h1>
          <p className="docs-lead">
            Analytical documentation outlining conceptual framing, indicator selection, methodological limits,
            and implementation design.
          </p>
        </div>
        <nav className="docs-nav">
          <Link to="/" className="docs-link">Home</Link>
          <Link to="/dashboard" className="docs-link">Dashboard</Link>
        </nav>
      </header>

      <div className="docs-layout">
        <aside className="docs-toc">
          <h2>Contents</h2>
          <ul>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>

          <div className="docs-meta">
            <p>Theme</p>
            <strong>Brazil Flag Palette</strong>
            <p>Range</p>
            <strong>2003–2022</strong>
          </div>
        </aside>

        <section className="docs-content">
          <article className="docs-card" id="objective">
            <h3>1. Objective</h3>
            <p>
              To evaluate Brazil&apos;s emissions profile, development trajectory, and climate responsibility
              through a multi-dimensional indicator framework.
            </p>
          </article>

          <article className="docs-card" id="framework">
            <h3>2. Core Analytical Framework</h3>
            <p>
              Brazil is conceptualized as a moderate per-capita emitter whose trajectory is materially shaped
              by land-use dynamics, rather than exclusively by industrial production.
            </p>
          </article>

          <article className="docs-card" id="sources">
            <h3>3. Data Sources</h3>
            <p>
              Our World in Data (OWID): emissions, per-capita indicators, and energy composition.
            </p>
            <p>World Bank: GDP per capita, population, and forest-area statistics.</p>
            <p>Global Carbon Project: aggregate emissions benchmarks.</p>
            <p>INPE PRODES: annual deforestation measurements.</p>
            <p>Germanwatch: Climate Change Performance Index (CCPI).</p>
            <p>Climate Action Tracker: policy-alignment assessment.</p>
          </article>

          <article className="docs-card" id="definitions">
            <h3>4. Indicator Definitions</h3>
            <p>Total CO2 Emissions: economy-wide emissions inclusive of land-use change.</p>
            <p>CO2 per Capita: total emissions normalized by population.</p>
            <p>Carbon Intensity: emissions normalized by gross domestic product.</p>
            <p>Deforestation: annual net forest-loss proxy.</p>
            <p>Forest Cover: proportion of national land area under forest.</p>
            <p>share_global_co2_including_luc: Brazil&apos;s contribution to global CO2 including land-use change.</p>
            <p>renewables_cons_change_pct: year-on-year percentage variation in renewable-energy consumption.</p>
          </article>

          <article className="docs-card" id="design">
            <h3>5. Visualization Design Choices</h3>
            <p>KPI cards provide high-level annual summaries for rapid cross-period comparison.</p>
            <p>Time-series charts represent trend direction, structural breaks, and year-to-year volatility.</p>
            <p>The donut chart emphasizes proportional sector composition rather than absolute magnitude.</p>
            <p>The scatter plot examines the association between GDP and emissions across countries.</p>
            <p>Comparative charts situate Brazil within a global peer context.</p>
          </article>

          <article className="docs-card" id="indices">
            <h3>6. Role of Climate Indices</h3>
            <p>CCPI (Germanwatch): evaluates national performance on emissions, energy transition, and policy.</p>
            <p>CAT: assesses policy alignment with Paris Agreement temperature pathways (2024 assessment cycle).</p>
          </article>

          <article className="docs-card" id="insights">
            <h3>7. Key Analytical Insights</h3>
            <p>Emission variability is strongly associated with land-use change dynamics.</p>
            <p>GDP expansion does not exhibit a proportional increase in emissions over the period observed.</p>
            <p>Brazil occupies an intermediate position in cross-country emissions comparisons.</p>
            <p>Changes in the renewable profile are captured through renewable-consumption growth indicators.</p>
            <p>Deforestation remains a primary source of temporal fluctuation in aggregate emissions.</p>
            <p>Carbon intensity demonstrates an improving trajectory over time.</p>
          </article>

          <article className="docs-card" id="interpretation">
            <h3>8. Interpretation Approach</h3>
            <p>
              Visual outputs are interpreted as an integrated system, linking emissions outcomes to structural
              drivers, policy context, and development patterns.
            </p>
          </article>

          <article className="docs-card" id="limitations">
            <h3>9. Limitations</h3>
            <p>Some comparisons are affected by differences between CO2e and CO2 accounting boundaries.</p>
            <p>Deforestation reporting follows an August-July reference cycle.</p>
            <p>Forest-cover series is observed through 2020; subsequent values are estimated.</p>
            <p>Minor cross-source inconsistencies may persist due to methodological heterogeneity.</p>
            <p>Scatter-plot inputs include interpolation for years with incomplete observations.</p>
          </article>

          <article className="docs-card" id="conclusion">
            <h3>10. Conclusion</h3>
            <p>
              Brazil&apos;s emissions profile is substantially land-use driven. Although per-capita and intensity
              indicators suggest moderate responsibility, Brazil&apos;s forest endowment implies a distinctive
              governance obligation centered on forest stewardship.
            </p>
          </article>

          <article className="docs-card" id="interactive">
            <h3>11. Interactive Features</h3>
            <p>
              A year slider supports dynamic exploration across 2003-2022. KPI cards and chart modules update
              synchronously, enabling temporal comparison of emissions and structural indicators.
            </p>
          </article>

          <article className="docs-card" id="build">
            <h3>12. Implementation and Tech Stack</h3>
            <p>
              The dashboard is implemented as a React single-page application, with Vite used for rapid local
              iteration and optimized production bundling.
            </p>
            <p>
              Client-side routing is managed through React Router. Visualization modules are implemented as
              reusable components that consume curated datasets from local data assets.
            </p>
            <p>
              Recharts provides the interactive charting layer, while scoped CSS supports maintainable
              page-level and component-level styling.
            </p>
            <pre>
              <code>{snippets.stack}</code>
            </pre>
          </article>
        </section>
      </div>
    </main>
  );
}
