import "./App.css";
import React, { startTransition, useCallback, useDeferredValue, useEffect, useState } from "react";

const RESOURCE_CONFIG = {
  teachers: {
    endpoint: "/teachers",
    title: "Teachers",
    subtitle: "Faculty directory and RFID assignments",
    primaryKey: "teacherid",
    columns: ["teacherid", "teachercode", "rfid", "lastname", "firstname", "deptid"],
    formFields: [
      { name: "teachercode", label: "Teacher Code", placeholder: "1004" },
      { name: "rfid", label: "RFID", placeholder: "998877" },
      { name: "lastname", label: "Last Name", placeholder: "Garcia" },
      { name: "firstname", label: "First Name", placeholder: "Ana" },
      { name: "deptid", label: "Dept ID", type: "number", min: "1", step: "1", placeholder: "2" }
    ]
  },
  students: {
    endpoint: "/students",
    title: "Students",
    subtitle: "Student master list",
    primaryKey: "idno",
    columns: ["idno", "lastname", "firstname", "course_code", "course_descr", "level"],
    formFields: [
      { name: "idno", label: "ID Number", placeholder: "1005" },
      { name: "lastname", label: "Last Name", placeholder: "Reyes" },
      { name: "firstname", label: "First Name", placeholder: "Juan" },
      { name: "course_id", label: "Course Code", type: "resource-select", resource: "course", valueKey: "course_id", labelKey: "course_code", placeholder: "1" },
      { name: "level", label: "Level", type: "select", options: ["1", "2", "3", "4"], placeholder: "1" }
    ]
  },
  subjects: {
    endpoint: "/subjects",
    title: "Subjects",
    subtitle: "Subject catalog",
    primaryKey: "subjid",
    columns: ["subjid", "subjcode", "subjdesc", "units"],
    formFields: [
      { name: "subjcode", label: "Subject Code", placeholder: "IT-DBSYS" },
      { name: "subjdesc", label: "Description", placeholder: "Database Systems" },
      { name: "units", label: "Units", type: "number", min: "1", max: "6", step: "0.5", placeholder: "3" }
    ]
  },
  subjectoffered: {
    endpoint: "/subjectoffered",
    title: "Subject Offered",
    subtitle: "EDP codes and scheduling",
    primaryKey: "suboffid",
    columns: ["suboffid", "edpcode", "subjcode", "subjdesc", "days", "start_time", "end_time", "room", "teacher_name"],
    formFields: [
      { name: "edpcode", label: "EDP Code", placeholder: "ec2000" },
      { name: "subjid", label: "Subject", type: "resource-select", resource: "subjects", valueKey: "subjid", labelKey: "subjcode", placeholder: "2" },
      { name: "start_time", label: "Start Time", type: "time", placeholder: "7:30" },
      { name: "end_time", label: "End Time", type: "time", placeholder: "9:00" },
      { name: "days", label: "Days", type: "select", options: ["mon", "tth", "mwf", "fri"], placeholder: "mwf" },
      { name: "room", label: "Room", placeholder: "526" },
      { name: "teacherid", label: "Teacher", type: "resource-select", resource: "teachers", valueKey: "teacherid", labelKey: "lastname", secondaryLabelKey: "firstname", placeholder: "1" }
    ]
  },
  course: {
    endpoint: "/course",
    title: "Course",
    subtitle: "Course reference list",
    primaryKey: "course_id",
    columns: ["course_id", "course_code", "course_desc"],
    formFields: [
      { name: "course_code", label: "Course Code", placeholder: "BSIS" },
      { name: "course_desc", label: "Description", placeholder: "Bachelor of Science in Information Systems" }
    ]
  },
  enrollment: {
    endpoint: "/enrollment",
    title: "Enrollment",
    subtitle: "Enrollment headers",
    primaryKey: "enroll_id",
    columns: ["enroll_id", "enroll_code", "enroll_date", "idno", "lastname", "firstname", "status", "amt_paid"],
    formFields: [
      { name: "enroll_code", label: "Enroll Code", placeholder: "ENR1001" },
      { name: "enroll_date", label: "Enroll Date", type: "date", placeholder: "2026-04-17" },
      { name: "student_id", label: "Student", type: "resource-select", resource: "students", valueKey: "id", labelKey: "idno", secondaryLabelKey: "lastname", tertiaryLabelKey: "firstname", placeholder: "1" },
      { name: "status", label: "Status", type: "select", options: ["enrolled", "pending", "cancelled"], placeholder: "enrolled" },
      { name: "amt_paid", label: "Amount Paid", type: "number", min: "0", step: "0.01", placeholder: "1500" }
    ]
  },
  enrollment_details: {
    endpoint: "/enrollment_details",
    title: "Enrollment Details",
    subtitle: "Subjects taken per enrollment",
    primaryKey: "enroll_detail_id",
    columns: ["enroll_detail_id", "enroll_code", "edpcode", "subjcode", "subjdesc"],
    formFields: [
      { name: "enroll_id", label: "Enrollment", type: "resource-select", resource: "enrollment", valueKey: "enroll_id", labelKey: "enroll_code", placeholder: "1" },
      { name: "suboffid", label: "Subject Offered", type: "resource-select", resource: "subjectoffered", valueKey: "suboffid", labelKey: "edpcode", secondaryLabelKey: "subjcode", placeholder: "1" }
    ]
  }
};

const RESOURCE_ENTRIES = Object.entries(RESOURCE_CONFIG);

const EMPTY_FORM = Object.keys(RESOURCE_CONFIG).reduce((result, key) => {
  result[key] = RESOURCE_CONFIG[key].formFields.reduce((fieldState, field) => {
    fieldState[field.name] = "";
    return fieldState;
  }, {});
  return result;
}, {});

function formatColumnLabel(column) {
  const customLabels = {
    course_code: "Course Code",
    course_descr: "Course Description",
    course_desc: "Course Description",
    enroll_code: "Enroll Code"
  };

  if (customLabels[column]) {
    return customLabels[column];
  }

  return column.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatCellValue(record, column) {
  const value = record[column];
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  return formatReadableValue(value, column);
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function formatReadableValue(value, key = "") {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const upperCaseKeys = new Set(["days"]);
  const titleCaseKeys = new Set([
    "lastname",
    "firstname",
    "course_desc",
    "course_descr",
    "subjdesc",
    "teacher_name",
    "status"
  ]);

  if (upperCaseKeys.has(key)) {
    return trimmed.toUpperCase();
  }

  if (titleCaseKeys.has(key)) {
    return toTitleCase(trimmed);
  }

  return trimmed;
}

function buildOptionLabel(item, field) {
  const primary = formatReadableValue(item[field.labelKey], field.labelKey);
  const secondary = field.secondaryLabelKey ? formatReadableValue(item[field.secondaryLabelKey], field.secondaryLabelKey) : "";
  const tertiary = field.tertiaryLabelKey ? formatReadableValue(item[field.tertiaryLabelKey], field.tertiaryLabelKey) : "";

  return [primary, secondary, tertiary].filter(Boolean).join(" - ");
}

function normalizeSearchValue(value) {
  return String(value ?? "").toLowerCase().trim();
}

function formatApiErrorDetails(payload) {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload.trim();
  }

  if (typeof payload === "object") {
    if (payload.message) {
      return String(payload.message).trim();
    }

    const code = payload.code ? String(payload.code).trim() : "";
    const address = payload.address ? String(payload.address).trim() : "";
    const port = payload.port ? String(payload.port).trim() : "";

    if (code && address && port) {
      return `${code} (${address}:${port})`;
    }

    if (code) {
      return code;
    }
  }

  return "";
}

function App() {
  const [activeResource, setActiveResource] = useState("students");
  const [records, setRecords] = useState({});
  const [errors, setErrors] = useState({});
  const [actionAlert, setActionAlert] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const deferredSearch = useDeferredValue(search);

  const currentConfig = RESOURCE_CONFIG[activeResource];
  const currentRows = records[activeResource] || [];
  const searchTerms = normalizeSearchValue(deferredSearch).split(/\s+/).filter(Boolean);
  const searchPlaceholderColumns = currentConfig.columns.slice(0, 2).map((column) => formatColumnLabel(column).toLowerCase());
  const searchPlaceholder = searchPlaceholderColumns.length
    ? `Search ${currentConfig.title.toLowerCase()} by ${searchPlaceholderColumns.join(" or ")}`
    : `Search ${currentConfig.title.toLowerCase()}`;
  const hasAnyErrors = Object.values(errors).some(Boolean);
  const filteredRows = currentRows.filter((record) => {
    if (!searchTerms.length) {
      return true;
    }

    const haystack = Object.values(record).map((value) => normalizeSearchValue(value)).join(" ");
    return searchTerms.every((term) => haystack.includes(term));
  });

  async function fetchResource(resourceKey) {
    const response = await fetch(RESOURCE_CONFIG[resourceKey].endpoint);
    if (!response.ok) {
      let details = "";

      try {
        const payload = await response.json();
        details = formatApiErrorDetails(payload);
      } catch (error) {
        details = "";
      }

      throw new Error(details ? `Failed to fetch ${resourceKey}: ${details}` : `Failed to fetch ${resourceKey}`);
    }
    return response.json();
  }

  const loadAllResources = useCallback(async (showRefresh = false) => {
    if (!showRefresh) {
      setLoading(true);
    }

    const results = await Promise.all(
      RESOURCE_ENTRIES.map(async ([resourceKey]) => {
        try {
          const data = await fetchResource(resourceKey);
          return [resourceKey, { data, error: "" }];
        } catch (error) {
          return [resourceKey, { data: [], error: error.message }];
        }
      })
    );

    const nextRecords = {};
    const nextErrors = {};

    results.forEach(([resourceKey, result]) => {
      nextRecords[resourceKey] = result.data;
      nextErrors[resourceKey] = result.error;
    });

    startTransition(() => {
      setRecords(nextRecords);
      setErrors(nextErrors);
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllResources();
  }, [loadAllResources]);

  useEffect(() => {
    if (!hasAnyErrors || loading) {
      return undefined;
    }

    const retryId = window.setTimeout(() => {
      loadAllResources(true);
    }, 3000);

    return () => window.clearTimeout(retryId);
  }, [hasAnyErrors, loading, loadAllResources]);

  useEffect(() => {
    setSearch("");
    setIsFormOpen(false);
    setEditingRecord(null);
  }, [activeResource]);

  useEffect(() => {
    if (!actionAlert) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setActionAlert("");
    }, 2200);

    return () => window.clearTimeout(timerId);
  }, [actionAlert]);

  function handleFieldChange(resourceKey, fieldName, value) {
    setFormState((previous) => ({
      ...previous,
      [resourceKey]: {
        ...previous[resourceKey],
        [fieldName]: value
      }
    }));
  }

  function openAddForm() {
    setEditingRecord(null);
    setFormState((previous) => ({
      ...previous,
      [activeResource]: EMPTY_FORM[activeResource]
    }));
    setIsFormOpen(true);
  }

  function mapRecordToForm(record) {
    const nextForm = currentConfig.formFields.reduce((result, field) => {
      result[field.name] = record[field.name] !== undefined && record[field.name] !== null ? String(record[field.name]) : "";
      return result;
    }, {});

    if (!Object.prototype.hasOwnProperty.call(nextForm, currentConfig.primaryKey)) {
      nextForm[currentConfig.primaryKey] =
        record[currentConfig.primaryKey] !== undefined && record[currentConfig.primaryKey] !== null
          ? String(record[currentConfig.primaryKey])
          : "";
    }

    return nextForm;
  }

  async function openEditForm(record) {
    const recordId = record[currentConfig.primaryKey];

    try {
      const response = await fetch(`${currentConfig.endpoint}/${recordId}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${currentConfig.title.toLowerCase()} details.`);
      }

      const data = await response.json();
      const fullRecord = Array.isArray(data) ? data[0] || record : data;
      const nextForm = mapRecordToForm(fullRecord);

      setEditingRecord(fullRecord);
      setFormState((previous) => ({
        ...previous,
        [activeResource]: nextForm
      }));
      setIsFormOpen(true);
    } catch (error) {
      const nextForm = mapRecordToForm(record);
      setEditingRecord(record);
      setFormState((previous) => ({
        ...previous,
        [activeResource]: nextForm
      }));
      setErrors((previous) => ({
        ...previous,
        [activeResource]: error.message
      }));
      setIsFormOpen(true);
    }
  }

  async function handleDelete(record) {
    const recordId = record[currentConfig.primaryKey];
    const confirmed = window.confirm(`Delete this ${currentConfig.title.toLowerCase()} record?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${currentConfig.endpoint}/${recordId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${currentConfig.title.toLowerCase()}.`);
      }

      await loadAllResources(true);
      setActionAlert(`${currentConfig.title} record deleted.`);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        [activeResource]: error.message
      }));
    }
  }

  function renderField(field) {
    const value = formState[activeResource][field.name];
    const isPrimaryKeyField = editingRecord !== null && field.name === currentConfig.primaryKey;

    if (field.type === "resource-select") {
      const options = records[field.resource] || [];
      return (
        <label key={field.name} className="field">
          <span>{field.label}</span>
          <select
            value={value}
            onChange={(event) => handleFieldChange(activeResource, field.name, event.target.value)}
            disabled={isPrimaryKeyField}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {options.map((item) => (
              <option key={item[field.valueKey]} value={item[field.valueKey]}>
                {buildOptionLabel(item, field)}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <label key={field.name} className="field">
          <span>{field.label}</span>
          <select
            value={value}
            onChange={(event) => handleFieldChange(activeResource, field.name, event.target.value)}
            disabled={isPrimaryKeyField}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label key={field.name} className="field">
        <span>{field.label}</span>
        <input
          type={field.type || "text"}
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(event) => handleFieldChange(activeResource, field.name, event.target.value)}
          placeholder={field.placeholder}
          disabled={isPrimaryKeyField}
        />
      </label>
    );
  }

  const modalFields =
    editingRecord && !currentConfig.formFields.some((field) => field.name === currentConfig.primaryKey)
      ? [
          {
            name: currentConfig.primaryKey,
            label: formatColumnLabel(currentConfig.primaryKey),
            type: "text"
          },
          ...currentConfig.formFields
        ]
      : currentConfig.formFields;

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = Object.entries(formState[activeResource]).reduce((result, [field, value]) => {
      if (value.trim()) {
        result[field] = value.trim();
      }
      return result;
    }, {});

    if (!Object.keys(payload).length) {
      return;
    }

    try {
      const requestUrl = editingRecord
        ? `${currentConfig.endpoint}/${editingRecord[currentConfig.primaryKey]}`
        : currentConfig.endpoint;
      const response = await fetch(requestUrl, {
        method: editingRecord ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${currentConfig.title.toLowerCase()}.`);
      }

      setFormState((previous) => ({
        ...previous,
        [activeResource]: EMPTY_FORM[activeResource]
      }));

      setIsFormOpen(false);
      setActionAlert(editingRecord ? `${currentConfig.title} record updated.` : `${currentConfig.title} record added.`);
      setEditingRecord(null);
      await loadAllResources(true);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        [activeResource]: error.message
      }));
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-title">School Management System</div>
        </div>
        <nav className="main-nav" aria-label="Main Navigation">
          {RESOURCE_ENTRIES.map(([resourceKey, config]) => (
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
        <button className="page-add-button" type="button" onClick={openAddForm}>
          <span aria-hidden="true">+</span>
          Add
        </button>
      </section>

      {actionAlert ? <div className="action-alert page-alert">{actionAlert}</div> : null}

      <section className="content-grid">
        <div className="table-panel">
          <div className="panel-toolbar">
            <div className="search-box">
              <span className="search-icon" aria-hidden="true">
                {"\u2315"}
              </span>
              <input
                className="search-input"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
              />
              {search ? (
                <button className="clear-search-button" type="button" onClick={() => setSearch("")}>
                  Clear
                </button>
              ) : null}
            </div>
            <div className="toolbar-actions">
              <div className="record-count">{filteredRows.length} records</div>
            </div>
          </div>

          {errors[activeResource] ? <div className="message error">{errors[activeResource]}</div> : null}
          {loading ? <div className="message">Loading data...</div> : null}

          {!loading && !filteredRows.length ? (
            <div className="message">
              {searchTerms.length ? `No ${currentConfig.title.toLowerCase()} matched "${search}".` : "No records found."}
            </div>
          ) : null}

          {!loading && filteredRows.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {currentConfig.columns.map((column) => (
                      <th key={column}>{formatColumnLabel(column)}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((record, index) => (
                    <tr key={record[currentConfig.primaryKey] ?? `${activeResource}-${index}`}>
                      {currentConfig.columns.map((column) => (
                        <td key={column}>{formatCellValue(record, column)}</td>
                      ))}
                      <td className="actions-cell">
                        <button className="icon-button edit-button" type="button" onClick={() => openEditForm(record)} aria-label="Edit">
                          {"\u270E"}
                        </button>
                        <button className="icon-button delete-button" type="button" onClick={() => handleDelete(record)} aria-label="Delete">
                          {"\u{1F5D1}"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      {isFormOpen ? (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <aside className="form-panel modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="form-header">
              <div>
                <h2>{editingRecord ? `Edit ${currentConfig.title}` : `Add ${currentConfig.title}`}</h2>
                <p>{editingRecord ? "Update the selected record." : "Use this form to add a new record to the selected table."}</p>
              </div>
              <button className="close-button" type="button" onClick={() => setIsFormOpen(false)}>
                x
              </button>
            </div>

            <form className="record-form" onSubmit={handleSubmit}>
              {modalFields.map((field) => renderField(field))}

              <button className="save-button" type="submit">
                {editingRecord ? "Update Record" : "Save Record"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default App;
