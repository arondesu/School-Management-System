function normalizeValue(value) {
  return String(value ?? "").trim();
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function validateResourceForm(config, values) {
  const errors = {};

  config.formFields.forEach((field) => {
    const value = normalizeValue(values[field.name]);

    if (!value) {
      errors[field.name] = `${field.label} is required.`;
      return;
    }

    if (field.type === "number") {
      const numericValue = Number(value);

      if (Number.isNaN(numericValue)) {
        errors[field.name] = `${field.label} must be a valid number.`;
        return;
      }

      if (field.min !== undefined && numericValue < Number(field.min)) {
        errors[field.name] = `${field.label} must be at least ${field.min}.`;
        return;
      }

      if (field.max !== undefined && numericValue > Number(field.max)) {
        errors[field.name] = `${field.label} must be at most ${field.max}.`;
      }
    }

    if (field.type === "date" && !isValidDate(value)) {
      errors[field.name] = `${field.label} must use YYYY-MM-DD format.`;
    }

    if (field.type === "time" && !isValidTime(value)) {
      errors[field.name] = `${field.label} must use HH:MM format.`;
    }
  });

  return errors;
}
