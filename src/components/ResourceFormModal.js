import React from "react";

function ResourceFormModal({ isOpen, onClose, editingRecord, currentConfig, modalFields, renderField, onSubmit }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <aside className="form-panel modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="form-header">
          <div>
            <h2>{editingRecord ? `Edit ${currentConfig.title}` : `Add ${currentConfig.title}`}</h2>
            <p>{editingRecord ? "Update the selected record." : "Use this form to add a new record to the selected table."}</p>
          </div>
          <button className="close-button" type="button" onClick={onClose}>
            x
          </button>
        </div>

        <form className="record-form" onSubmit={onSubmit}>
          {modalFields.map((field) => renderField(field))}

          <button className="save-button" type="submit">
            {editingRecord ? "Update Record" : "Save Record"}
          </button>
        </form>
      </aside>
    </div>
  );
}

export default ResourceFormModal;
