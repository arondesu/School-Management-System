import React from "react";

function AppHeader({ resourceEntries, activeResource, setActiveResource, currentConfig, actionLabel, onAction }) {
  const enrollmentMenuKeys = ["enrollment", "enrollment_details", "enrollment_list"];
  const enrollmentMenuEntries = resourceEntries.filter(([resourceKey]) => enrollmentMenuKeys.includes(resourceKey));
  const regularEntries = resourceEntries.filter(([resourceKey]) => !enrollmentMenuKeys.includes(resourceKey));
  const selectedEnrollmentMenu = enrollmentMenuKeys.includes(activeResource) ? activeResource : "";

  return (
    <>
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-title">School Management System</div>
        </div>
        <nav className="main-nav" aria-label="Main Navigation">
          {regularEntries.map(([resourceKey, config]) => (
            <button
              key={resourceKey}
              className={`nav-link ${activeResource === resourceKey ? "active" : ""}`}
              onClick={() => setActiveResource(resourceKey)}
            >
              {config.title}
            </button>
          ))}

          {enrollmentMenuEntries.length ? (
            <label className={`nav-menu-group ${selectedEnrollmentMenu ? "active" : ""}`}>
              <select value={selectedEnrollmentMenu} onChange={(event) => setActiveResource(event.target.value)} aria-label="Enrollment menu">
                <option value="" disabled>
                  Select view
                </option>
                {enrollmentMenuEntries.map(([resourceKey, config]) => (
                  <option key={resourceKey} value={resourceKey}>
                    {config.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
