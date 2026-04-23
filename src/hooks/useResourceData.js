import { startTransition, useCallback, useEffect, useState } from "react";
import { RESOURCE_CONFIG, RESOURCE_ENTRIES } from "../config/resources";
import { formatApiErrorDetails } from "../utils/formatters";

function useResourceData() {
  const [records, setRecords] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const hasAnyErrors = Object.values(errors).some(Boolean);

  const fetchResource = useCallback(async (resourceKey) => {
    const response = await fetch(RESOURCE_CONFIG[resourceKey].endpoint);
    if (!response.ok) {
      let details = "";

      try {
        const payload = await response.json();
        details = formatApiErrorDetails(payload);
      } catch {
        details = "";
      }

      throw new Error(details ? `Failed to fetch ${resourceKey}: ${details}` : `Failed to fetch ${resourceKey}`);
    }

    return response.json();
  }, []);

  const loadAllResources = useCallback(
    async (showRefresh = false) => {
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
    },
    [fetchResource]
  );

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

  return {
    records,
    errors,
    setErrors,
    loading,
    loadAllResources
  };
}

export default useResourceData;
