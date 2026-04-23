import React from "react";
import { buildOptionLabel, formatReadableValue, formatSchedule } from "../../utils/formatters";

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
  return (
    <div className="workspace-card enrollment-details-card">
      <div className="workspace-card-header">
        <div>
          <h2>Enrollment Details</h2>
          <p>View one student profile and all enrolled subjects based on the selected student.</p>
        </div>
      </div>

      <div className="details-toolbar">
        <label className="field enrollment-select-field">
          <span>Student</span>
          <select value={selectedEnrollmentId} onChange={(event) => setSelectedEnrollmentId(event.target.value)}>
            <option value="">Select student</option>
            {enrollmentStudentOptions.map((item) => (
              <option key={item.enroll_id} value={item.enroll_id}>
                {buildOptionLabel(item, {
                  labelKey: "idno",
                  secondaryLabelKey: "lastname",
                  tertiaryLabelKey: "firstname"
                })}
              </option>
            ))}
          </select>
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
          <button className="ghost-button" type="button" onClick={onResetSelection}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentDetailsWorkspace;
