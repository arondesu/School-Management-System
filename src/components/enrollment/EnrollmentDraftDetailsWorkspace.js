import React from "react";
import { formatReadableValue, formatSchedule } from "../../utils/formatters";

function EnrollmentDraftDetailsWorkspace({
  enrollmentDraft,
  totalUnits,
  updateEnrollmentDraft,
  handleOfferingLookup,
  handleRemoveDraftRow,
  onResetDraft,
  onSave
}) {
  return (
    <div className="workspace-card enrollment-details-card">
      <div className="workspace-card-header">
        <div>
          <h2></h2>
          <p>Add each offered subject by EDP code, then review the units before saving.</p>
        </div>
      </div>

      <div className="details-toolbar">
        <label className="lookup-box edp-box">
          <span>EDP Code</span>
          <div className="lookup-input-row">
            <input
              type="text"
              value={enrollmentDraft.edpLookup}
              onChange={(event) => updateEnrollmentDraft("edpLookup", event.target.value)}
              placeholder="Enter EDP code"
            />
            <button type="button" className="lookup-button" onClick={handleOfferingLookup} aria-label="Search EDP code">
              {"\u2315"}
            </button>
          </div>
        </label>
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
            {enrollmentDraft.detailRows.length ? (
              enrollmentDraft.detailRows.map((row) => (
                <tr key={row.suboffid}>
                  <td>{row.edpcode}</td>
                  <td>{row.subjcode}</td>
                  <td>{formatReadableValue(row.subjdesc, "subjdesc")}</td>
                  <td>{formatSchedule(row)}</td>
                  <td>{formatReadableValue(row.days, "days")}</td>
                  <td>{row.room || "--"}</td>
                  <td>{row.units}</td>
                  <td className="actions-cell">
                    <button
                      className="icon-button delete-button"
                      type="button"
                      onClick={() => handleRemoveDraftRow(row.suboffid)}
                      aria-label={`Remove ${row.edpcode}`}
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  <div className="message empty-inline-message">No subjects added yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="workspace-footer">
        <div className="workspace-total">
          <span>Total Units</span>
          <strong>{totalUnits}</strong>
        </div>
        <div className="workspace-actions">
          <button className="ghost-button" type="button" onClick={onResetDraft}>
            Clear
          </button>
          <button className="save-button" type="button" onClick={onSave}>
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentDraftDetailsWorkspace;
