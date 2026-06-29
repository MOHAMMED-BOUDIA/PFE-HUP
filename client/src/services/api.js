/**
 * API Service for communicating with the backend server.
 * Uses Vite's environment variable `import.meta.env.VITE_API_URL`
 * falling back to '/api' if not defined or if using the proxy.
 */
const API_URL = import.meta.env.VITE_API_URL ;

export const apiRequest = async (endpoint, options = {}) => {
  const { headers, ...restOptions } = options;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

export default apiRequest;
