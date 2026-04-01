import { useState } from "react";
import { Link } from "react-router-dom";
import "./DocsPage.css";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quick Start" },
  { id: "howtoread", label: "How to Read" },
  { id: "metrics", label: "Key Metrics" },
  { id: "sources", label: "Data Sources" },
  { id: "notes", label: "Important Notes" },
  { id: "interpretation", label: "Interpretation" },
];

export default function DocsPage() {
  const [active, setActive] = useState("overview");

  const handleNavClick = (sectionId) => {
    setActive(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="docs-page">
      <div className="docs-grain" />
      <div className="docs-glow docs-glow-left" />
      <div className="docs-glow docs-glow-right" />

      <header className="docs-topbar">
        <div>
          <p className="docs-brand">Dashboard Documentation</p>
          <h1 className="docs-title">How to Use This Dashboard</h1>
        </div>
        <nav className="docs-nav">
          <Link to="/" className="docs-chip">Home</Link>
          <Link to="/dashboard" className="docs-chip">Dashboard</Link>
        </nav>
      </header>

      <p className="docs-lead">
        Quick guide to understanding Brazil's emissions, navigating the dashboard, and interpreting the data.
      </p>

      <nav className="docs-nav-sections">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`docs-nav-btn ${active === section.id ? "active" : ""}`}
            onClick={() => handleNavClick(section.id)}
          >
            {section.label}
          </button>
        ))}
        <a href="/Brazil_Dashboard_Documentation.pdf" download className="docs-nav-btn docs-pdf-btn">
          Download Full Documentation
        </a>
      </nav>

      <section className="docs-content">
        <article className="docs-card" id="overview">
          <h2>Overview</h2>
          <p>
            Brazil's emissions are driven by land-use change and deforestation, not industrial output. This dashboard tracks trends from 2003-2022 and compares Brazil with global peers.
          </p>
        </article>

        <article className="docs-card" id="quickstart">
          <h2>Quick Start</h2>
          <ol className="docs-steps">
            <li><strong>Select year:</strong> Use the slider at the top of the dashboard to pick a year (2003-2022).</li>
            <li><strong>Scan KPI cards:</strong> See total CO₂, per-capita emissions, deforestation, and policy scores.</li>
            <li><strong>Explore charts:</strong> Examine trends, sector breakdown, and per-capita comparisons.</li>
            <li><strong>Ask the AI:</strong> Use the "Explain Data" button to ask questions. The assistant answers based on the selected year.</li>
          </ol>
        </article>

        <article className="docs-card" id="howtoread">
          <h2>How to Read</h2>
          <div className="docs-subsection">
            <p className="docs-subhead">Updates with year selector</p>
            <ul className="docs-bullet">
              <li>KPI cards (CO₂, per capita, deforestation, forest cover)</li>
              <li>All charts showing the selected year</li>
              <li>AI assistant context that includes year-specific data</li>
            </ul>
          </div>
          <div className="docs-subsection">
            <p className="docs-subhead">Fixed (always shown)</p>
            <ul className="docs-bullet">
              <li>Historical trend lines (full 2003-2022 range)</li>
              <li>Policy index cards (CCPI, CAT)</li>
            </ul>
          </div>
          <div className="docs-subsection">
            <p className="docs-subhead">AI Assistant</p>
            <ul className="docs-bullet">
              <li>Detects your question type: Trend, Driver, Comparison, or Policy.</li>
              <li>Provides an answer, key points, and why it matters.</li>
              <li>Uses only data relevant to your question.</li>
            </ul>
          </div>
        </article>

        <article className="docs-card" id="metrics">
          <h2>Key Metrics</h2>
          <div className="docs-metric-list">
            <div className="metric-item">
              <strong>Total CO₂</strong>
              <p>Economy-wide emissions including land-use change.</p>
            </div>
            <div className="metric-item">
              <strong>CO₂ per Capita</strong>
              <p>Emissions normalized by population for fair country comparison.</p>
            </div>
            <div className="metric-item">
              <strong>Carbon Intensity</strong>
              <p>Emissions per unit of GDP; economic efficiency metric.</p>
            </div>
            <div className="metric-item">
              <strong>Deforestation</strong>
              <p>Annual forest loss in km²; primary emissions driver.</p>
            </div>
            <div className="metric-item">
              <strong>Forest Cover</strong>
              <p>Percentage of national land under forest.</p>
            </div>
            <div className="metric-item">
              <strong>CCPI Score</strong>
              <p>Global climate policy ranking; Brazil ranks 27 of 63.</p>
            </div>
            <div className="metric-item">
              <strong>CAT Rating</strong>
              <p>Assesses alignment with Paris Agreement temperature pathways.</p>
            </div>
          </div>
        </article>

        <article className="docs-card" id="sources">
          <h2>Data Sources</h2>
          <ul className="docs-source-list">
            <li><strong>OWID (Our World in Data):</strong> Emissions, per-capita, energy mix.</li>
            <li><strong>World Bank:</strong> GDP, population, forest area.</li>
            <li><strong>INPE PRODES:</strong> Deforestation measurements.</li>
            <li><strong>SEEG (Climate Observatory):</strong> Sector-level emissions breakdown.</li>
            <li><strong>GCP (Global Carbon Project):</strong> International benchmarks.</li>
          </ul>
        </article>

        <article className="docs-card" id="notes">
          <h2>Important Notes</h2>
          <div className="docs-note-item">
            <p className="docs-note-title">CO₂ vs CO₂e</p>
            <p>This dashboard shows CO₂ only. CO₂e (CO₂ equivalent) includes methane and nitrous oxide. It is higher but harder to compare year to year.</p>
          </div>
          <div className="docs-note-item">
            <p className="docs-note-title">Deforestation Cycle</p>
            <p>Deforestation is measured from Aug-Jul (Amazon year), not Jan-Dec. This affects year to year changes.</p>
          </div>
          <div className="docs-note-item">
            <p className="docs-note-title">Forest Estimates</p>
            <p>Forest cover is estimated; exact boundaries are hard to pin down from satellite.</p>
          </div>
          <div className="docs-note-item">
            <p className="docs-note-title">Interpolation</p>
            <p>Some years use interpolated data when official figures are incomplete.</p>
          </div>
        </article>

        <article className="docs-card docs-card-interpretation" id="interpretation">
          <h2>Interpretation</h2>
          <div className="docs-note-item">
            <p className="docs-note-title">Emissions Track Deforestation</p>
            <p>When forests are cleared, carbon is released. Brazil's emission spikes correlate with deforestation peaks.</p>
          </div>
          <div className="docs-note-item">
            <p className="docs-note-title">Energy Mix Is Relatively Clean</p>
            <p>Brazil's renewable energy share (about 60 percent of generation) keeps emissions lower than expected from GDP alone.</p>
          </div>
          <div className="docs-note-item">
            <p className="docs-note-title">Brazil Is A Mid-Range Emitter</p>
            <p>Per-capita emissions are well below the United States (about 16 t/person) but above India (about 2 t/person).</p>
          </div>
          <div className="docs-note-item">
            <p className="docs-note-title">Policy Execution Matters</p>
            <p>CCPI rank 27 of 63 and CAT rating "Insufficient" indicate that policy enforcement has lagged behind public commitments.</p>
          </div>
        </article>
      </section>
    </main>
  );
}
