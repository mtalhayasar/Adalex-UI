/**
 * Error Handler Utility for Adalex UI
 *
 * Centralized error handling system for all UI components.
 * Provides error logging, recovery strategies, and optional notifications.
 * HTMX compatible and follows ES6+ standards.
 */

(function() {
  'use strict';

  /**
   * Error severity levels
   */
  const ERROR_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  /**
   * Error recovery strategies
   */
  const RECOVERY_STRATEGIES = {
    SILENT: 'silent',           // Log only, no user notification
    NOTIFY: 'notify',           // Show user-friendly notification
    RETRY: 'retry',             // Attempt to retry the operation
    FALLBACK: 'fallback'        // Use fallback functionality
  };

  /**
   * Central error handler for all Adalex UI components
   * @param {string} componentName - Name of the component that threw the error
   * @param {Error|string} error - The error object or error message
   * @param {Object} context - Additional context about the error
   * @param {string} context.level - Error severity level (low|medium|high|critical)
   * @param {string} context.recovery - Recovery strategy to use
   * @param {Object} context.details - Additional error details
   * @param {Function} context.retryFn - Function to retry if recovery is 'retry'
   * @param {Function} context.fallbackFn - Function to execute if recovery is 'fallback'
   */
  function handleError(componentName, error, context = {}) {
    const {
      level = ERROR_LEVELS.MEDIUM,
      recovery = RECOVERY_STRATEGIES.SILENT,
      details = {},
      retryFn = null,
      fallbackFn = null
    } = context;

    // Create structured error object
    const errorInfo = {
      component: componentName,
      error: error instanceof Error ? error : new Error(error),
      level,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details
    };

    // Log error to console
    logError(errorInfo);

    // Handle error based on recovery strategy
    switch (recovery) {
      case RECOVERY_STRATEGIES.NOTIFY:
        showUserNotification(errorInfo);
        break;
      
      case RECOVERY_STRATEGIES.RETRY:
        if (retryFn && typeof retryFn === 'function') {
          setTimeout(() => {
            try {
              retryFn();
            } catch (retryError) {
              // If retry fails, fall back to silent logging
              handleError(componentName, retryError, {
                level: ERROR_LEVELS.HIGH,
                recovery: RECOVERY_STRATEGIES.SILENT,
                details: { ...details, originalError: error, retryAttempt: true }
              });
            }
          }, 100);
        }
        break;
      
      case RECOVERY_STRATEGIES.FALLBACK:
        if (fallbackFn && typeof fallbackFn === 'function') {
          try {
            fallbackFn();
          } catch (fallbackError) {
            // If fallback fails, log both errors
            handleError(componentName, fallbackError, {
              level: ERROR_LEVELS.HIGH,
              recovery: RECOVERY_STRATEGIES.SILENT,
              details: { ...details, originalError: error, fallbackAttempt: true }
            });
          }
        }
        break;
      
      case RECOVERY_STRATEGIES.SILENT:
      default:
        // Already logged, nothing more to do
        break;
    }

    // Emit custom error event for external error tracking systems
    try {
      const errorEvent = new CustomEvent('adalex:error', {
        detail: errorInfo,
        bubbles: true
      });
      document.dispatchEvent(errorEvent);
    } catch (eventError) {
      // Prevent infinite error loops
      console.error('[AdalexUI.ErrorHandler] Failed to emit error event:', eventError);
    }

    return errorInfo;
  }

  /**
   * Log error with appropriate console method based on severity
   * @param {Object} errorInfo - Structured error information
   */
  function logError(errorInfo) {
    const prefix = `[AdalexUI.${errorInfo.component}]`;
    const message = errorInfo.error.message;
    const details = {
      error: errorInfo.error,
      level: errorInfo.level,
      timestamp: errorInfo.timestamp,
      details: errorInfo.details
    };

    switch (errorInfo.level) {
      case ERROR_LEVELS.CRITICAL:
        console.error(`${prefix} CRITICAL:`, message, details);
        break;
      case ERROR_LEVELS.HIGH:
        console.error(`${prefix} HIGH:`, message, details);
        break;
      case ERROR_LEVELS.MEDIUM:
        console.warn(`${prefix} MEDIUM:`, message, details);
        break;
      case ERROR_LEVELS.LOW:
      default:
        console.log(`${prefix} LOW:`, message, details);
        break;
    }
  }

  /**
   * Show user-friendly error notification
   * @param {Object} errorInfo - Structured error information
   */
  function showUserNotification(errorInfo) {
    // Only show notifications for medium severity and above
    if (errorInfo.level === ERROR_LEVELS.LOW) {
      return;
    }

    // Check if Alert component is available
    if (window.AdalexUI && window.AdalexUI.Alert && window.AdalexUI.Alert.show) {
      try {
        const userMessage = getUserFriendlyMessage(errorInfo);
        window.AdalexUI.Alert.show({
          message: userMessage,
          type: 'error',
          dismissible: true,
          autoDismiss: errorInfo.level === ERROR_LEVELS.CRITICAL ? null : 5000
        });
      } catch (alertError) {
        // Fallback if Alert component fails
        console.error('[AdalexUI.ErrorHandler] Failed to show alert:', alertError);
        showFallbackNotification(errorInfo);
      }
    } else {
      // Fallback if Alert component not available
      showFallbackNotification(errorInfo);
    }
  }

  /**
   * Generate user-friendly error messages
   * @param {Object} errorInfo - Structured error information
   * @returns {string} User-friendly error message
   */
  function getUserFriendlyMessage(errorInfo) {
    const componentMessages = {
      Alert: 'There was an issue displaying the notification.',
      Auth: 'Authentication feature encountered an error.',
      ConfirmDialog: 'Confirmation dialog encountered an error.',
      Drawer: 'Side panel encountered an error.',
      FileUpload: 'File upload encountered an error.',
      Form: 'Form validation encountered an error.',
      Modal: 'Dialog window encountered an error.',
      Navbar: 'Navigation encountered an error.',
      Notification: 'Notification system encountered an error.',
      Sidebar: 'Sidebar encountered an error.',
      Table: 'Data table encountered an error.',
      Tabs: 'Tab navigation encountered an error.',
      Tooltip: 'Tooltip display encountered an error.'
    };

    const componentMessage = componentMessages[errorInfo.component] || 
                           'A user interface component encountered an error.';

    switch (errorInfo.level) {
      case ERROR_LEVELS.CRITICAL:
        return `${componentMessage} Please refresh the page and try again.`;
      case ERROR_LEVELS.HIGH:
        return `${componentMessage} Some features may not work properly.`;
      case ERROR_LEVELS.MEDIUM:
      default:
        return componentMessage;
    }
  }

  /**
   * Fallback notification when Alert component is not available
   * @param {Object} errorInfo - Structured error information
   */
  function showFallbackNotification(errorInfo) {
    if (errorInfo.level === ERROR_LEVELS.CRITICAL) {
      // Use native alert for critical errors
      const message = getUserFriendlyMessage(errorInfo);
      setTimeout(() => alert(message), 0);
    }
    // For other levels, rely on console logging only
  }

  /**
   * Wrapper function to safely execute component functions with error handling
   * @param {string} componentName - Name of the component
   * @param {Function} fn - Function to execute safely
   * @param {Object} errorContext - Error context for any caught errors
   * @returns {*} Function result or null if error occurred
   */
  function safeExecute(componentName, fn, errorContext = {}) {
    try {
      return fn();
    } catch (error) {
      handleError(componentName, error, {
        level: ERROR_LEVELS.MEDIUM,
        recovery: RECOVERY_STRATEGIES.SILENT,
        ...errorContext
      });
      return null;
    }
  }

  /**
   * Create a safe version of an async function with error handling
   * @param {string} componentName - Name of the component
   * @param {Function} asyncFn - Async function to make safe
   * @param {Object} errorContext - Error context for any caught errors
   * @returns {Function} Safe async function
   */
  function makeSafeAsync(componentName, asyncFn, errorContext = {}) {
    return async function(...args) {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(componentName, error, {
          level: ERROR_LEVELS.MEDIUM,
          recovery: RECOVERY_STRATEGIES.SILENT,
          ...errorContext
        });
        return null;
      }
    };
  }

  /**
   * Create a safe event handler with error boundaries
   * @param {string} componentName - Name of the component
   * @param {Function} handler - Event handler function
   * @param {Object} errorContext - Error context for any caught errors
   * @returns {Function} Safe event handler
   */
  function makeSafeEventHandler(componentName, handler, errorContext = {}) {
    return function(event) {
      try {
        return handler.call(this, event);
      } catch (error) {
        handleError(componentName, error, {
          level: ERROR_LEVELS.MEDIUM,
          recovery: RECOVERY_STRATEGIES.SILENT,
          details: {
            eventType: event ? event.type : 'unknown',
            ...errorContext.details
          },
          ...errorContext
        });
      }
    };
  }

  // Initialize error handler and expose API
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.ErrorHandler = {
    handle: handleError,
    safeExecute: safeExecute,
    makeSafeAsync: makeSafeAsync,
    makeSafeEventHandler: makeSafeEventHandler,
    levels: ERROR_LEVELS,
    strategies: RECOVERY_STRATEGIES
  };

  // Also expose a shorter alias for convenience
  window.AdalexUI.handleError = handleError;

})();