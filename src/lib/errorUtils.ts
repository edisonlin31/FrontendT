// Helper function to extract error message from various error formats
export const getErrorMessage = (error: unknown): string => {
  // Handle standard Error objects (most common case from our API)
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Default fallback
  return 'An unexpected error occurred';
};