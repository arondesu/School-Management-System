import React, { useEffect, useMemo, useState } from "react";
import { formatReadableValue, formatSchedule, normalizeSearchValue } from "../../utils/formatters";

function EnrollmentDetailsWorkspace({
  selectedEnrollmentTotalUnits,
  selectedEnrollmentId,
  setSelectedEnrollmentId,
  enrollmentStudentOptions,
  selectedEnrollmentStudent,
  selectedEnrollment,
  selectedStudentEnrollmentRows,
  selectedEnrollmentDetails,
  onDelete,
  onResetSelection
}) {
  const [studentLookup, setStudentLookup] = useState("");
  const [searchError, setSearchError] = useState("");

  const selectedLookupValue = useMemo(() => {
    const selectedOption = enrollmentStudentOptions.find((item) => String(item.enroll_id) === String(selectedEnrollmentId));
    return selectedOption ? String(selectedOption.idno || "") : "";
  }, [enrollmentStudentOptions, selectedEnrollmentId]);

  useEffect(() => {
    setStudentLookup(selectedLookupValue);
    setSearchError("");
  }, [selectedLookupValue]);

  function handleStudentSearch() {
    const lookupValue = normalizeSearchValue(studentLookup);

    if (!lookupValue) {
      setSearchError("Enter a student ID number before searching.");
      return;
    }

    const matchedOption = enrollmentStudentOptions.find(
      (item) => normalizeSearchValue(item.idno) === lookupValue || normalizeSearchValue(item.student_id) === lookupValue
    );

    if (!matchedOption) {
      setSearchError("Student not found in enrolled records.");
      return;
    }

    setSearchError("");
    setSelectedEnrollmentId(String(matchedOption.enroll_id));
  }

  return (
    <div className="workspace-card enrollment-details-card">
      <div className="workspace-card-header">
        <div>
          <h2>Enrollment Details</h2>
        </div>
      </div>

      <div className="details-toolbar">
        <label className="lookup-box enrollment-select-field">
          <span>Student ID</span>
          <div className="lookup-input-row">
            <input
              type="text"
              value={studentLookup}
              onChange={(event) => setStudentLookup(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleStudentSearch();
                }
              }}
              placeholder="Enter ID number"
            />
            <button type="button" className="lookup-button" onClick={handleStudentSearch} aria-label="Search student">
              {"\u2315"}
            </button>
          </div>
          {searchError ? <small className="field-error">{searchError}</small> : null}
        </label>
      </div>

      <div className="table-section-label">Student Enrolled</div>

      <div className="student-summary-grid">
        <div className="summary-field">
          <span>ID Number</span>
          <strong>{selectedEnrollmentStudent ? selectedEnrollmentStudent.idno || "--" : selectedEnrollment?.idno || "--"}</strong>
        </div>
        <div className="summary-field">
          <span>Last Name</span>
          <strong>
            {selectedEnrollmentStudent ? formatReadableValue(selectedEnrollmentStudent.lastname || "", "lastname") || "--" : "--"}
          </strong>
        </div>
        <div className="summary-field">
          <span>First Name</span>
          <strong>
            {selectedEnrollmentStudent ? formatReadableValue(selectedEnrollmentStudent.firstname || "", "firstname") || "--" : "--"}
          </strong>
        </div>
        <div className="summary-field">
          <span>Enrollments</span>
          <strong>{selectedStudentEnrollmentRows.length || "--"}</strong>
        </div>
      </div>

      <div className="workspace-table-wrap">
        <table className="details-table">
          <thead>
            <tr>
              <th>EDP Code</th>
              <th>Subject Code</th>
              <th>Description</th>
              <th>Time</th>
              <th>Days</th>
              <th>Room</th>
              <th>Units</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedEnrollmentDetails.length ? (
              selectedEnrollmentDetails.map((row) => (
                <tr key={row.enroll_detail_id}>
                  <td>{row.edpcode}</td>
                  <td>{row.subjcode}</td>
                  <td>{formatReadableValue(row.subjdesc, "subjdesc")}</td>
                  <td>{formatSchedule(row)}</td>
                  <td>{formatReadableValue(row.days, "days")}</td>
                  <td>{row.room || "--"}</td>
                  <td>{row.units}</td>
                  <td className="actions-cell">
                    <button className="icon-button delete-button" type="button" onClick={() => onDelete(row)} aria-label={`Remove ${row.edpcode}`}>
                      x
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  <div className="message empty-inline-message">
                    {selectedEnrollmentId ? "No saved subjects for this student." : "Select a student to view details."}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="workspace-footer">
        <div className="workspace-total">
          <span>Total Units</span>
          <strong>{selectedEnrollmentTotalUnits}</strong>
        </div>
        <div className="workspace-actions">
        </div>
      </div>
    </div>
  );
}

export default EnrollmentDetailsWorkspace;
