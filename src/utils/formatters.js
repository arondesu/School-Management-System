const UPPER_CASE_KEYS = new Set(["days", "course_code"]);
const TITLE_CASE_KEYS = new Set([
  "lastname",
  "firstname",
  "course_desc",
  "course_descr",
  "subjdesc",
  "teacher_name",
  "status"
]);

export function formatColumnLabel(column) {
  const customLabels = {
    course_code: "Course Code",
    course_descr: "Course Description",
    course_desc: "Course Description",
    course_level: "Course - Level",
    enroll_code: "Enroll Code",
    enroll_date: "Date"
  };

  if (customLabels[column]) {
    return customLabels[column];
  }

  return column.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function toTitleCase(value) {
  return value.toLowerCase().replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

export function formatReadableValue(value, key = "") {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (UPPER_CASE_KEYS.has(key)) {
    return trimmed.toUpperCase();
  }

  if (TITLE_CASE_KEYS.has(key)) {
    return toTitleCase(trimmed);
  }

  return trimmed;
}

export function formatCellValue(record, column) {
  const value = record[column];
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  if (column === "start_time" || column === "end_time") {
    return formatTimeValue(value);
  }

  return formatReadableValue(value, column);
}

export function normalizeTimeTo24Hour(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})(?:\s*)(AM|PM)$/i);
  if (ampmMatch) {
    const hourValue = Number(ampmMatch[1]);
    const minuteValue = ampmMatch[2];
    const suffix = ampmMatch[3].toUpperCase();

    if (Number.isNaN(hourValue) || hourValue < 1 || hourValue > 12) {
      return "";
    }

    let hour24 = hourValue % 12;
    if (suffix === "PM") {
      hour24 += 12;
    }

    return `${String(hour24).padStart(2, "0")}:${minuteValue}`;
  }

  const shortMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!shortMatch) {
    return "";
  }

  const hourValue = Number(shortMatch[1]);
  const minuteValue = shortMatch[2];

  if (Number.isNaN(hourValue) || hourValue < 0 || hourValue > 23) {
    return "";
  }

  return `${String(hourValue).padStart(2, "0")}:${minuteValue}`;
}

function formatTimeValue(value) {
  const formatted = normalizeTimeTo24Hour(value);
  if (!formatted) {
    return "--";
  }

  const [hourText, minuteText] = formatted.split(":");
  const hourValue = Number(hourText);
  if (Number.isNaN(hourValue)) {
    return "--";
  }

  const suffix = hourValue >= 12 ? "PM" : "AM";
  const hour12 = hourValue % 12 || 12;
  return `${hour12}:${minuteText} ${suffix}`;
}

export function formatSchedule(offering) {
  const start = formatTimeValue(offering.start_time);
  const end = formatTimeValue(offering.end_time);
  return `${start} - ${end}`;
}

export function formatLongDate(value) {
  if (!value) {
    return "No date selected";
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

export function buildOptionLabel(item, field) {
  const primary = formatReadableValue(item[field.labelKey], field.labelKey);
  const secondary = field.secondaryLabelKey ? formatReadableValue(item[field.secondaryLabelKey], field.secondaryLabelKey) : "";
  const tertiary = field.tertiaryLabelKey ? formatReadableValue(item[field.tertiaryLabelKey], field.tertiaryLabelKey) : "";

  return [primary, secondary, tertiary].filter(Boolean).join(" - ");
}

export function normalizeSearchValue(value) {
  return String(value ?? "").toLowerCase().trim();
}

export function formatApiErrorDetails(payload) {
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
