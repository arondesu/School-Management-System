import React from "react";
import { formatCellValue, formatColumnLabel } from "../utils/formatters";

function ResourceTableSection({
  currentConfig,
  search,
  setSearch,
  searchPlaceholder,
  filteredRows,
  errors,
  activeResource,
  loading,
  searchTerms,
  onEdit,
  onDelete,
  showActions = true,
  onCellAction,
  clickableColumns = []
}) {
  return (
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
                  {showActions ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((record, index) => (
                  <tr key={record[currentConfig.primaryKey] ?? `${activeResource}-${index}`}>
                    {currentConfig.columns.map((column) => {
                      const canClickCell = typeof onCellAction === "function" && clickableColumns.includes(column);

                      return (
                        <td key={column}>
                          {canClickCell ? (
                            <button
                              type="button"
                              className="table-link-button"
                              onClick={() => onCellAction({ record, column })}
                            >
                              {formatCellValue(record, column)}
                            </button>
                          ) : (
                            formatCellValue(record, column)
                          )}
                        </td>
                      );
                    })}
                    {showActions ? (
                      <td className="actions-cell">
                        <button className="icon-button edit-button" type="button" onClick={() => onEdit(record)} aria-label="Edit">
                          {"\u270E"}
                        </button>
                        <button className="icon-button delete-button" type="button" onClick={() => onDelete(record)} aria-label="Delete">
                          {"\u{1F5D1}"}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ResourceTableSection;
