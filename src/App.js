import "./App.css";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { EMPTY_FORM, RESOURCE_CONFIG, RESOURCE_ENTRIES } from "./config/resources";
import { buildOptionLabel, formatColumnLabel, normalizeSearchValue } from "./utils/formatters";
import ResourceFormModal from "./components/ResourceFormModal";
import ResourceTableSection from "./components/ResourceTableSection";
import AppHeader from "./components/AppHeader";
import EnrollmentHeaderWorkspace from "./components/enrollment/EnrollmentHeaderWorkspace";
import EnrollmentDraftDetailsWorkspace from "./components/enrollment/EnrollmentDraftDetailsWorkspace";
import EnrollmentDetailsWorkspace from "./components/enrollment/EnrollmentDetailsWorkspace";
import useResourceData from "./hooks/useResourceData";
import useEnrollmentWorkspace from "./hooks/useEnrollmentWorkspace";
import { validateResourceForm } from "./utils/validation";

function App() {
  const [activeResource, setActiveResource] = useState("students");
  const [actionAlert, setActionAlert] = useState("");
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [formFieldErrors, setFormFieldErrors] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const deferredSearch = useDeferredValue(search);
  const { records, errors, setErrors, loading, loadAllResources } = useResourceData();
  const {
    enrollmentHeaderResource,
    enrollmentDetailsResource,
    isCustomEnrollmentScreen,
    enrollmentDraft,
    updateEnrollmentDraft,
    resetEnrollmentDraft,
    handleStudentLookup,
    selectedStudent,
    totalUnits,
    handleOfferingLookup,
    handleRemoveDraftRow,
    handleEnrollmentSave,
    selectedEnrollmentId,
    setSelectedEnrollmentId,
    enrollmentStudentOptions,
    selectedEnrollmentStudent,
    selectedEnrollment,
    selectedStudentEnrollmentRows,
    selectedEnrollmentDetails,
    selectedEnrollmentTotalUnits,
    resetEnrollmentSelection
  } = useEnrollmentWorkspace({
    activeResource,
    records,
    setErrors,
    setActionAlert,
    loadAllResources
  });

  const currentConfig = RESOURCE_CONFIG[activeResource];
  const currentRows = records[activeResource] || [];

  const searchTerms = normalizeSearchValue(deferredSearch).split(/\s+/).filter(Boolean);
  const searchPlaceholderColumns = currentConfig.columns
    .slice(0, 2)
    .map((column) => formatColumnLabel(column).toLowerCase());
  const searchPlaceholder = searchPlaceholderColumns.length
    ? `Search ${currentConfig.title.toLowerCase()} by ${searchPlaceholderColumns.join(" or ")}`
    : `Search ${currentConfig.title.toLowerCase()}`;

  const filteredRows = currentRows.filter((record) => {
    if (!searchTerms.length) {
      return true;
    }

    const haystack = Object.values(record).map((value) => normalizeSearchValue(value)).join(" ");
    return searchTerms.every((term) => haystack.includes(term));
  });

  const enrollmentHeaderTimestamp = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date()),
    []
  );

  useEffect(() => {
    setSearch("");
    setIsFormOpen(false);
    setEditingRecord(null);
  }, [activeResource]);

  useEffect(() => {
    setFormState((previous) => {
      let didChange = false;
      const nextState = { ...previous };

      RESOURCE_ENTRIES.forEach(([resourceKey, config]) => {
        const currentResourceState = previous[resourceKey];
        if (!currentResourceState) {
          return;
        }

        let nextResourceState = currentResourceState;

        config.formFields.forEach((field) => {
          if (field.type !== "resource-select") {
            return;
          }

          const selectedValue = currentResourceState[field.name];
          if (!selectedValue) {
            return;
          }

          const options = records[field.resource] || [];
          const hasMatch = options.some((item) => String(item[field.valueKey]) === String(selectedValue));

          if (!hasMatch) {
            if (nextResourceState === currentResourceState) {
              nextResourceState = { ...currentResourceState };
            }

            nextResourceState[field.name] = "";
            didChange = true;
          }
        });

        if (nextResourceState !== currentResourceState) {
          nextState[resourceKey] = nextResourceState;
        }
      });

      return didChange ? nextState : previous;
    });
  }, [records]);

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

    setFormFieldErrors((previous) => {
      if (!previous[resourceKey]?.[fieldName]) {
        return previous;
      }

      return {
        ...previous,
        [resourceKey]: {
          ...previous[resourceKey],
          [fieldName]: ""
        }
      };
    });
  }

  function openAddForm() {
    if (isCustomEnrollmentScreen) {
      resetEnrollmentDraft();
      setErrors((previous) => ({
        ...previous,
        [activeResource]: ""
      }));
      return;
    }

    setEditingRecord(null);
    setFormState((previous) => ({
      ...previous,
      [activeResource]: EMPTY_FORM[activeResource]
    }));
    setFormFieldErrors((previous) => ({
      ...previous,
      [activeResource]: {}
    }));
    setIsFormOpen(true);
  }

  function handlePageAction() {
    if (activeResource === enrollmentDetailsResource) {
      resetEnrollmentDraft();
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "",
        [enrollmentDetailsResource]: ""
      }));
      setActiveResource(enrollmentHeaderResource);
      return;
    }

    openAddForm();
  }

  const pageActionLabel =
    activeResource === enrollmentDetailsResource ? "Go To Enrollment" : isCustomEnrollmentScreen ? "New Enrollment" : "Add";

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
      setFormFieldErrors((previous) => ({
        ...previous,
        [activeResource]: {}
      }));
      setIsFormOpen(true);
    } catch (error) {
      const nextForm = mapRecordToForm(record);
      setEditingRecord(record);
      setFormState((previous) => ({
        ...previous,
        [activeResource]: nextForm
      }));
      setFormFieldErrors((previous) => ({
        ...previous,
        [activeResource]: {}
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
    const fieldError = formFieldErrors[activeResource]?.[field.name];

    if (field.type === "resource-select") {
      const options = records[field.resource] || [];
      return (
        <label key={field.name} className={`field ${fieldError ? "has-error" : ""}`}>
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
          {fieldError ? <small className="field-error">{fieldError}</small> : null}
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <label key={field.name} className={`field ${fieldError ? "has-error" : ""}`}>
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
          {fieldError ? <small className="field-error">{fieldError}</small> : null}
        </label>
      );
    }

    return (
      <label key={field.name} className={`field ${fieldError ? "has-error" : ""}`}>
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
        {fieldError ? <small className="field-error">{fieldError}</small> : null}
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

    const validationErrors = validateResourceForm(currentConfig, formState[activeResource]);
    if (Object.keys(validationErrors).length) {
      setFormFieldErrors((previous) => ({
        ...previous,
        [activeResource]: validationErrors
      }));
      setErrors((previous) => ({
        ...previous,
        [activeResource]: "Please fix the highlighted fields."
      }));
      return;
    }

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
      setFormFieldErrors((previous) => ({
        ...previous,
        [activeResource]: {}
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
      <AppHeader
        resourceEntries={RESOURCE_ENTRIES}
        activeResource={activeResource}
        setActiveResource={setActiveResource}
        currentConfig={currentConfig}
        actionLabel={pageActionLabel}
        onAction={handlePageAction}
      />

      {actionAlert ? <div className="action-alert page-alert">{actionAlert}</div> : null}

      {activeResource === enrollmentHeaderResource ? (
        <section className="content-grid enrollment-layout">
          {errors[enrollmentHeaderResource] ? <div className="message error">{errors[enrollmentHeaderResource]}</div> : null}
          {loading ? (
            <div className="message">Loading data...</div>
          ) : (
            <div className="enrollment-workspace">
              <EnrollmentHeaderWorkspace
                enrollmentHeaderTimestamp={enrollmentHeaderTimestamp}
                enrollmentDraft={enrollmentDraft}
                updateEnrollmentDraft={updateEnrollmentDraft}
                handleStudentLookup={handleStudentLookup}
                selectedStudent={selectedStudent}
              />
              <EnrollmentDraftDetailsWorkspace
                enrollmentDraft={enrollmentDraft}
                totalUnits={totalUnits}
                updateEnrollmentDraft={updateEnrollmentDraft}
                handleOfferingLookup={handleOfferingLookup}
                handleRemoveDraftRow={handleRemoveDraftRow}
                onResetDraft={resetEnrollmentDraft}
                onSave={handleEnrollmentSave}
              />
            </div>
          )}
        </section>
      ) : null}

      {activeResource === enrollmentDetailsResource ? (
        <section className="content-grid enrollment-layout">
          {errors[enrollmentDetailsResource] ? <div className="message error">{errors[enrollmentDetailsResource]}</div> : null}
          {loading ? (
            <div className="message">Loading data...</div>
          ) : (
            <EnrollmentDetailsWorkspace
              selectedEnrollmentTotalUnits={selectedEnrollmentTotalUnits}
              selectedEnrollmentId={selectedEnrollmentId}
              setSelectedEnrollmentId={setSelectedEnrollmentId}
              enrollmentStudentOptions={enrollmentStudentOptions}
              selectedEnrollmentStudent={selectedEnrollmentStudent}
              selectedEnrollment={selectedEnrollment}
              selectedStudentEnrollmentRows={selectedStudentEnrollmentRows}
              selectedEnrollmentDetails={selectedEnrollmentDetails}
              onDelete={handleDelete}
              onResetSelection={resetEnrollmentSelection}
            />
          )}
        </section>
      ) : null}

      {!isCustomEnrollmentScreen ? (
        <ResourceTableSection
          currentConfig={currentConfig}
          search={search}
          setSearch={setSearch}
          searchPlaceholder={searchPlaceholder}
          filteredRows={filteredRows}
          errors={errors}
          activeResource={activeResource}
          loading={loading}
          searchTerms={searchTerms}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : null}

      <ResourceFormModal
        isOpen={isFormOpen && !isCustomEnrollmentScreen}
        onClose={() => setIsFormOpen(false)}
        editingRecord={editingRecord}
        currentConfig={currentConfig}
        modalFields={modalFields}
        renderField={renderField}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;
