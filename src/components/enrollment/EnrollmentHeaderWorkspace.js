import React from "react";
import { formatLongDate, formatReadableValue } from "../../utils/formatters";

function EnrollmentHeaderWorkspace({
  enrollmentHeaderTimestamp,
  enrollmentDraft,
  updateEnrollmentDraft,
  handleStudentLookup,
  selectedStudent
}) {
  return (
    <div className="workspace-card enrollment-header-card">
      <div className="workspace-card-header">
        <div>
          <h2>Student Information</h2>
        </div>
        <div className="header-meta">
          <small>{enrollmentHeaderTimestamp}</small>
          <small>Date: {formatLongDate(enrollmentDraft.enroll_date)}</small>
        </div>
      </div>

      <div className="enrollment-top-row">
        <label className="lookup-box">
          <span>Student ID</span>
          <div className="lookup-input-row">
            <input
              type="text"
              value={enrollmentDraft.studentLookup}
              onChange={(event) => updateEnrollmentDraft("studentLookup", event.target.value)}
              placeholder="Enter ID number"
            />
            <button type="button" className="lookup-button" onClick={handleStudentLookup} aria-label="Search student">
              {"\u2315"}
            </button>
          </div>
        </label>
      </div>

      <div className="table-section-label">Enrollment Info</div>

      <div className="enrollment-meta-grid">
        <div className="summary-field">
          <span>Student ID</span>
          <strong>{selectedStudent ? selectedStudent.idno || "--" : "--"}</strong>
        </div>
        <div className="summary-field">
          <span>Enroll Code</span>
          <strong>{enrollmentDraft.enroll_code || "--"}</strong>
        </div>
      </div>

      <div className="student-summary-grid">
        <div className="summary-field">
          <span>Last Name</span>
          <strong>{selectedStudent ? formatReadableValue(selectedStudent.lastname, "lastname") : "--"}</strong>
        </div>
        <div className="summary-field">
          <span>First Name</span>
          <strong>{selectedStudent ? formatReadableValue(selectedStudent.firstname, "firstname") : "--"}</strong>
        </div>
        <div className="summary-field">
          <span>Course</span>
          <strong>{selectedStudent ? formatReadableValue(selectedStudent.course_code || selectedStudent.course, "course_code") : "--"}</strong>
        </div>
        <div className="summary-field">
          <span>Level</span>
          <strong>{selectedStudent ? selectedStudent.level : "--"}</strong>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentHeaderWorkspace;
