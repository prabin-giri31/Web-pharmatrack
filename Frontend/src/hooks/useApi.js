import { useState, useCallback } from "react";
import { apiRequest } from "../config/api";

/**
 * Custom hook for making API calls with loading, error, and data state management
 * Reusable across different pages and components
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest(url, options);
      setLoading(false);

      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError };
};

/**
 * Custom hook for fetching data on mount with optional refetch capability
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 */
export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Build URL with query params
      let url = endpoint;
      if (Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "" && value !== "all") {
            params.append(key, value);
          }
        });
        if (params.toString()) {
          url = `${endpoint}?${params.toString()}`;
        }
      }

      const result = await apiRequest(url);
      setLoading(false);

      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      setData(result.data);
      return { success: true, data: result.data };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [endpoint]);

  return { data, setData, loading, error, refetch: fetchData };
};

/**
 * Hook for CRUD operations
 * @param {string} baseEndpoint - Base API endpoint for the resource
 */
export const useCrud = (baseEndpoint) => {
  const { execute, loading, error } = useApi();

  const create = useCallback(async (data) => {
    return await execute(baseEndpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }, [baseEndpoint, execute]);

  const update = useCallback(async (id, data) => {
    return await execute(`${baseEndpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }, [baseEndpoint, execute]);

  const remove = useCallback(async (id) => {
    return await execute(`${baseEndpoint}/${id}`, {
      method: "DELETE",
    });
  }, [baseEndpoint, execute]);

  const get = useCallback(async (id) => {
    return await execute(`${baseEndpoint}/${id}`);
  }, [baseEndpoint, execute]);

  const getAll = useCallback(async (params = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        queryString.append(key, value);
      }
    });
    const url = queryString.toString() 
      ? `${baseEndpoint}?${queryString.toString()}`
      : baseEndpoint;
    return await execute(url);
  }, [baseEndpoint, execute]);

  return { create, update, remove, get, getAll, loading, error };
};

export default useApi;
