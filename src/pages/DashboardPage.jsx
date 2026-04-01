import { useState } from "react";
import { Link } from "react-router-dom";
import KPICards from "../climate-dashboard/components/KPICards";
import TotalEmissions from "../climate-dashboard/components/TotalEmissions";
import SectorDonut from "../climate-dashboard/components/SectorDonut";
import PerCapita from "../climate-dashboard/components/PerCapita";
import CountryComparison from "../climate-dashboard/components/CountryComparison";
import DeforestationChart from "../climate-dashboard/components/DeforestationChart";
import IncomeEmissions from "../climate-dashboard/components/IncomeEmissions";
import EnergyGrowth from "../climate-dashboard/components/EnergyGrowth";
import ForestArea from "../climate-dashboard/components/ForestArea";
import CO2Intensity from "../climate-dashboard/components/CO2Intensity";
import GlobalTrends from "../climate-dashboard/components/GlobalTrends";
import GeminiChatFab from "../climate-dashboard/components/GeminiChatFab";
import "./DashboardPage.css";

const MIN_YEAR = 2003;
const MAX_YEAR = 2022;

function Rule({ label }) {
  return (
    <div className="dash-rule">
      <span>{label}</span>
      <div />
    </div>
  );
}

export default function DashboardPage() {
  const [year, setYear] = useState(2010);

  return (
    <main className="dashboard-page">
      <div className="dashboard-grain" />
      <div className="dashboard-glow dashboard-glow-left" />
      <div className="dashboard-glow dashboard-glow-right" />

      <header className="dashboard-topbar">
        <div>
          <p className="dashboard-brand">Republica Federativa do Brasil</p>
          <h1 className="dashboard-title">Climate & Emissions Atlas</h1>
        </div>
        <nav className="dashboard-nav">
          <Link to="/" className="dashboard-chip">Home</Link>
          <Link to="/docs" className="dashboard-chip">Documentation</Link>
        </nav>
      </header>

      <section className="dashboard-intro">
        <p className="dashboard-kicker">Data-driven Dashboard · 2003–2022</p>
        <p className="dashboard-subtitle">
          A data-driven view of Brazil&apos;s emissions, highlighting the structural role of land-use change alongside a relatively clean energy system.
        </p>
        <p className="dashboard-focus">Focus: emissions structure, policy alignment, and global context</p>
      </section>

      <section className="year-control card">
        <span>Year</span>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={1}
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
        />
        <strong>{year}</strong>
        <small>drag to explore</small>
      </section>

      <section className="section-fade kpi-section">
        <KPICards year={year} />
      </section>

      <Rule label="Emissions overview" />
      <section className="section-grid-two section-fade">
        <TotalEmissions />
        <SectorDonut year={year} />
      </section>

      <Rule label="Per capita" />
      <section className="section-grid-two section-fade">
        <PerCapita year={year} />
        <CountryComparison year={year} />
      </section>

      <Rule label="Land use and deforestation" />
      <section className="section-grid-wide section-fade">
        <DeforestationChart />
        <ForestArea />
      </section>

      <Rule label="Economy and energy" />
      <section className="section-grid-two section-fade">
        <IncomeEmissions year={year} />
        <EnergyGrowth />
      </section>

      <Rule label="Global context" />
      <section className="section-grid-wide section-fade">
        <GlobalTrends />
        <CO2Intensity />
      </section>

      <GeminiChatFab year={year} />
    </main>
  );
}
