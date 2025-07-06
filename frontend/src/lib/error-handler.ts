/**
 * Centralized error handling for the Turkish Learning App
 */

export class AppError extends Error {
  public readonly code?: string;
  public readonly context?: string;
  public readonly timestamp: Date;

  constructor(message: string, code?: string, context?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: string) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: string) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class LessonError extends AppError {
  constructor(message: string, context?: string) {
    super(message, 'LESSON_ERROR', context);
    this.name = 'LessonError';
  }
}

/**
 * Centralized error handler
 */
export const handleError = (error: unknown, context: string): void => {
  const timestamp = new Date().toISOString();
  
  if (error instanceof AppError) {
    console.error(`[${timestamp}] [${context}] ${error.name}:`, {
      message: error.message,
      code: error.code,
      context: error.context,
      stack: error.stack
    });
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] [${context}] Error:`, {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  } else {
    console.error(`[${timestamp}] [${context}] Unknown error:`, error);
  }

  // In production, you would send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // errorReportingService.captureError(error, { context });
  }
};

/**
 * Async error handler for promises
 */
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  context: string
): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    handleError(error, context);
    return null;
  }
};

/**
 * Error boundary helper for React components
 */
export const createErrorInfo = (error: Error, errorInfo: any) => ({
  error: {
    message: error.message,
    name: error.name,
    stack: error.stack
  },
  errorInfo,
  timestamp: new Date().toISOString(),
  userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
  url: typeof window !== 'undefined' ? window.location.href : 'SSR'
});

/**
 * Safe JSON parse with error handling
 */
export const safeJsonParse = <T>(json: string, context: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    handleError(new ValidationError(`Invalid JSON: ${json}`), context);
    return null;
  }
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    handleError(error, context);
    return fallback;
  }
};
