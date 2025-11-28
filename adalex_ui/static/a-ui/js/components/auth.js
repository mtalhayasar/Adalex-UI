/**
 * Auth Component JavaScript
 *
 * Handles password visibility toggle for login and register forms.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'Auth';

  /**
   * Get error handler utility (with fallback)
   */
  function getErrorHandler() {
    return window.AdalexUI && window.AdalexUI.ErrorHandler
      ? window.AdalexUI.ErrorHandler
      : {
          handle: (component, error, context) => {
            console.error(`[AdalexUI.${component}]`, error, context);
          },
          makeSafeEventHandler: (component, handler) => handler,
          safeExecute: (component, fn) => {
            try { return fn(); } catch (e) { console.error(`[AdalexUI.${component}]`, e); return null; }
          }
        };
  }

  /**
   * Initialize auth form functionality
   * Idempotent - can be called multiple times safely
   */
  function initAuthForms() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const passwordWrappers = document.querySelectorAll('[data-password-wrapper]');

      passwordWrappers.forEach(wrapper => {
        try {
          // Skip if already initialized
          if (wrapper.dataset.authInitialized === 'true') {
            return;
          }

          const toggleButton = wrapper.querySelector('[data-password-toggle]');
          const input = wrapper.querySelector('input[type="password"], input[type="text"]');

          if (!toggleButton || !input) {
            return;
          }

          // Set initial state
          toggleButton.setAttribute('data-visible', 'false');

          // Create safe click handler
          const safeToggleHandler = errorHandler.makeSafeEventHandler(
            COMPONENT_NAME,
            function() {
              const isVisible = toggleButton.getAttribute('data-visible') === 'true';

              if (!input || !toggleButton) {
                throw new Error('Password input or toggle button is no longer available');
              }

              if (isVisible) {
                // Hide password
                input.setAttribute('type', 'password');
                toggleButton.setAttribute('data-visible', 'false');
                toggleButton.setAttribute('aria-label', 'Show password');
              } else {
                // Show password
                input.setAttribute('type', 'text');
                toggleButton.setAttribute('data-visible', 'true');
                toggleButton.setAttribute('aria-label', 'Hide password');
              }

              // Keep focus on input after toggle
              input.focus();
            },
            {
              level: errorHandler.levels?.MEDIUM || 'medium',
              recovery: errorHandler.strategies?.SILENT || 'silent',
              details: { 
                action: 'password_toggle_click',
                wrapperId: wrapper.id || 'unknown'
              }
            }
          );

          // Toggle password visibility
          toggleButton.addEventListener('click', safeToggleHandler);

          // Mark as initialized
          wrapper.dataset.authInitialized = 'true';
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_single_password_wrapper',
              wrapperId: wrapper.id || 'unknown'
            }
          });
        }
      });
    });
  }

  /**
   * Toggle password visibility programmatically
   * @param {string|HTMLElement} inputOrId - Input element or ID
   * @param {boolean} [visible] - Force visibility state (optional)
   */
  function togglePassword(inputOrId, visible) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const input = typeof inputOrId === 'string'
        ? document.getElementById(inputOrId)
        : inputOrId;

      if (!input) {
        throw new Error(`Input not found: ${inputOrId}`);
      }

      const wrapper = input.closest('[data-password-wrapper]');
      if (!wrapper) {
        throw new Error(`Password wrapper not found for input: ${inputOrId}`);
      }

      const toggleButton = wrapper.querySelector('[data-password-toggle]');
      if (!toggleButton) {
        throw new Error('Password toggle button not found in wrapper');
      }

      const currentVisible = toggleButton.getAttribute('data-visible') === 'true';
      const shouldBeVisible = visible !== undefined ? visible : !currentVisible;

      if (shouldBeVisible) {
        input.setAttribute('type', 'text');
        toggleButton.setAttribute('data-visible', 'true');
        toggleButton.setAttribute('aria-label', 'Hide password');
      } else {
        input.setAttribute('type', 'password');
        toggleButton.setAttribute('data-visible', 'false');
        toggleButton.setAttribute('aria-label', 'Show password');
      }
    });
  }

  /**
   * Show password for an input
   * @param {string|HTMLElement} inputOrId - Input element or ID
   */
  function showPassword(inputOrId) {
    const errorHandler = getErrorHandler();
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      return togglePassword(inputOrId, true);
    });
  }

  /**
   * Hide password for an input
   * @param {string|HTMLElement} inputOrId - Input element or ID
   */
  function hidePassword(inputOrId) {
    const errorHandler = getErrorHandler();
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      return togglePassword(inputOrId, false);
    });
  }

  // Initialize on DOM ready with error handling
  const errorHandler = getErrorHandler();
  
  const safeInitAuth = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initAuthForms,
    {
      level: errorHandler.levels?.HIGH || 'high',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'dom_ready_init' }
    }
  );

  const safeHTMXInit = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initAuthForms,
    {
      level: errorHandler.levels?.MEDIUM || 'medium',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'htmx_after_swap_init' }
    }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitAuth);
  } else {
    safeInitAuth();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', safeHTMXInit);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Auth = {
    init: initAuthForms,
    togglePassword: togglePassword,
    showPassword: showPassword,
    hidePassword: hidePassword
  };
})();
