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
    return {
      message: 'Cannot connect to server. Make sure the backend is running on http://localhost:5000',
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

