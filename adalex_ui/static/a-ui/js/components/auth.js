/**
 * Auth Component JavaScript
 *
 * Handles password visibility toggle for login and register forms.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  /**
   * Initialize auth form functionality
   * Idempotent - can be called multiple times safely
   */
  function initAuthForms() {
    const passwordWrappers = document.querySelectorAll('[data-password-wrapper]');

    passwordWrappers.forEach(wrapper => {
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

      // Toggle password visibility
      toggleButton.addEventListener('click', function() {
        const isVisible = toggleButton.getAttribute('data-visible') === 'true';

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
      });

      // Mark as initialized
      wrapper.dataset.authInitialized = 'true';
    });
  }

  /**
   * Toggle password visibility programmatically
   * @param {string|HTMLElement} inputOrId - Input element or ID
   * @param {boolean} [visible] - Force visibility state (optional)
   */
  function togglePassword(inputOrId, visible) {
    const input = typeof inputOrId === 'string'
      ? document.getElementById(inputOrId)
      : inputOrId;

    if (!input) {
      console.error('Auth: Input not found:', inputOrId);
      return;
    }

    const wrapper = input.closest('[data-password-wrapper]');
    if (!wrapper) {
      console.error('Auth: Password wrapper not found for input:', inputOrId);
      return;
    }

    const toggleButton = wrapper.querySelector('[data-password-toggle]');
    if (!toggleButton) {
      return;
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
  }

  /**
   * Show password for an input
   * @param {string|HTMLElement} inputOrId - Input element or ID
   */
  function showPassword(inputOrId) {
    togglePassword(inputOrId, true);
  }

  /**
   * Hide password for an input
   * @param {string|HTMLElement} inputOrId - Input element or ID
   */
  function hidePassword(inputOrId) {
    togglePassword(inputOrId, false);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthForms);
  } else {
    initAuthForms();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initAuthForms);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Auth = {
    init: initAuthForms,
    togglePassword: togglePassword,
    showPassword: showPassword,
    hidePassword: hidePassword
  };
})();
