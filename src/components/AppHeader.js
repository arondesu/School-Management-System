import React from "react";

function AppHeader({ resourceEntries, activeResource, setActiveResource, currentConfig, actionLabel, onAction }) {
  return (
    <>
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-title">School Management System</div>
        </div>
        <nav className="main-nav" aria-label="Main Navigation">
          {resourceEntries.map(([resourceKey, config]) => (
            <button
              key={resourceKey}
              className={`nav-link ${activeResource === resourceKey ? "active" : ""}`}
              onClick={() => setActiveResource(resourceKey)}
            >
              {config.title}
            </button>
          ))}
        </nav>
      </header>

      <section className="page-header">
        <div>
          <h1>{currentConfig.title}</h1>
          <p>{currentConfig.subtitle}</p>
        </div>
        <button className="page-add-button" type="button" onClick={onAction}>
          <span aria-hidden="true">+</span>
          {actionLabel}
        </button>
      </section>
    </>
  );
}

export default AppHeader;
