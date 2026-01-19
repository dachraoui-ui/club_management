export const handleApiError = (error: any): { message: string; errors: any[] } => {
  if (error.response) {
    // Server responded with error
    const { message, errors } = error.response.data;
    return {
      message: message || 'An error occurred',
      errors: errors || [],
    };
  } else if (error.request) {
    // Request made but no response - backend is not reachable
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return {
      message: `Cannot connect to server. Make sure the backend is running on ${apiUrl.replace('/api', '')}`,
      errors: [],
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      errors: [],
    };
  }
};

