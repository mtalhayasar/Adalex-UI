/**
 * Form Component JavaScript
 *
 * Handles client-side validation, form feedback, and HTMX integration.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  /**
   * Initialize form functionality
   * Idempotent - can be called multiple times safely
   */
  function initForms() {
    const forms = document.querySelectorAll('.a-form');

    forms.forEach(form => {
      // Skip if already initialized
      if (form.dataset.formInitialized === 'true') {
        return;
      }

      // Setup validation if enabled
      if (form.dataset.validate === 'true') {
        setupValidation(form);
      }

      // Setup HTMX event listeners for feedback
      setupHTMXListeners(form);

      // Mark as initialized
      form.dataset.formInitialized = 'true';
    });
  }

  /**
   * Setup form validation
   * @param {HTMLFormElement} form - The form element
   */
  function setupValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Real-time validation on blur
      input.addEventListener('blur', () => {
        validateField(input);
      });

      // Clear error on input
      input.addEventListener('input', () => {
        clearFieldError(input);
      });
    });

    // Validate on submit
    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
        showFeedback(form, 'Please fix the errors below.', 'error');
      }
    });
  }

  /**
   * Validate a single field
   * @param {HTMLElement} input - The input element
   * @returns {boolean} Whether the field is valid
   */
  function validateField(input) {
    const fieldGroup = input.closest('.a-form__field-group');
    if (!fieldGroup) return true;

    // Clear existing error
    clearFieldError(input);

    // Check HTML5 validity
    if (!input.checkValidity()) {
      showFieldError(input, input.validationMessage);
      return false;
    }

    // Custom validations can be added here
    // For example, pattern matching, custom business rules, etc.

    return true;
  }

  /**
   * Validate entire form
   * @param {HTMLFormElement} form - The form element
   * @returns {boolean} Whether the form is valid
   */
  function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Show field error message
   * @param {HTMLElement} input - The input element
   * @param {string} message - Error message
   */
  function showFieldError(input, message) {
    const fieldGroup = input.closest('.a-form__field-group');
    if (!fieldGroup) return;

    // Add error class to field group
    fieldGroup.classList.add('a-form__field-group--error');

    // Add error class to input
    input.classList.add('a-text-input--error', 'a-select--error', 'a-textarea--error');
    input.setAttribute('aria-invalid', 'true');

    // Create or update error message
    let errorMsg = fieldGroup.querySelector('.a-text-input__error-message, .a-select__error-message, .a-textarea__error-message');

    if (!errorMsg) {
      errorMsg = document.createElement('span');
      errorMsg.className = getErrorMessageClass(input);
      errorMsg.setAttribute('role', 'alert');
      errorMsg.id = `${input.id}-error`;
      input.setAttribute('aria-describedby', errorMsg.id);
      input.parentNode.insertBefore(errorMsg, input.nextSibling);
    }

    errorMsg.textContent = message;
  }

  /**
   * Clear field error
   * @param {HTMLElement} input - The input element
   */
  function clearFieldError(input) {
    const fieldGroup = input.closest('.a-form__field-group');
    if (!fieldGroup) return;

    // Remove error class from field group
    fieldGroup.classList.remove('a-form__field-group--error');

    // Remove error class from input
    input.classList.remove('a-text-input--error', 'a-select--error', 'a-textarea--error');
    input.setAttribute('aria-invalid', 'false');

    // Remove error message
    const errorMsg = fieldGroup.querySelector('.a-text-input__error-message, .a-select__error-message, .a-textarea__error-message');
    if (errorMsg && !input.dataset.serverError) {
      errorMsg.remove();
    }
  }

  /**
   * Get appropriate error message class based on input type
   * @param {HTMLElement} input - The input element
   * @returns {string} Error message class name
   */
  function getErrorMessageClass(input) {
    if (input.tagName === 'SELECT') {
      return 'a-select__error-message';
    } else if (input.tagName === 'TEXTAREA') {
      return 'a-textarea__error-message';
    }
    return 'a-text-input__error-message';
  }

  /**
   * Setup HTMX event listeners for form feedback
   * @param {HTMLFormElement} form - The form element
   */
  function setupHTMXListeners(form) {
    // Show success message after successful HTMX request
    form.addEventListener('htmx:afterRequest', (event) => {
      if (event.detail.successful) {
        showFeedback(form, 'Form submitted successfully!', 'success');

        // Optionally reset form
        if (form.dataset.resetOnSuccess === 'true') {
          setTimeout(() => {
            resetForm(form);
          }, 1500);
        }
      } else {
        showFeedback(form, 'An error occurred. Please try again.', 'error');
      }
    });

    // Handle HTMX errors
    form.addEventListener('htmx:responseError', () => {
      showFeedback(form, 'Server error. Please try again later.', 'error');
    });
  }

  /**
   * Show form feedback message
   * @param {HTMLFormElement} form - The form element
   * @param {string} message - Feedback message
   * @param {string} type - Message type (success/error/warning/info)
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   */
  function showFeedback(form, message, type = 'info', duration = 5000) {
    const feedbackEl = form.querySelector('.a-form__feedback');
    if (!feedbackEl) return;

    // Clear existing classes
    feedbackEl.className = 'a-form__feedback a-form__feedback--visible';
    feedbackEl.classList.add(`a-form__feedback--${type}`);

    // Set message
    feedbackEl.textContent = message;

    // Auto-hide if duration specified
    if (duration > 0) {
      setTimeout(() => {
        hideFeedback(form);
      }, duration);
    }

    // Announce to screen readers
    feedbackEl.setAttribute('aria-live', 'polite');
    feedbackEl.setAttribute('role', 'status');
  }

  /**
   * Hide form feedback message
   * @param {HTMLFormElement} form - The form element
   */
  function hideFeedback(form) {
    const feedbackEl = form.querySelector('.a-form__feedback');
    if (!feedbackEl) return;

    feedbackEl.classList.remove('a-form__feedback--visible');

    setTimeout(() => {
      feedbackEl.textContent = '';
      feedbackEl.className = 'a-form__feedback';
    }, 300);
  }

  /**
   * Reset form and clear all errors
   * @param {HTMLFormElement} form - The form element
   */
  function resetForm(form) {
    // Reset native form
    form.reset();

    // Clear all field errors
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      clearFieldError(input);
    });

    // Hide feedback
    hideFeedback(form);

    // Dispatch custom event
    const event = new CustomEvent('form:reset', {
      detail: { form },
      bubbles: true
    });
    form.dispatchEvent(event);
  }

  /**
   * Get form data as object
   * @param {HTMLFormElement} form - The form element
   * @returns {Object} Form data as key-value pairs
   */
  function getFormData(form) {
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      // Handle multiple values (checkboxes, multi-select)
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
  } else {
    initForms();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initForms);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Form = {
    init: initForms,
    validate: validateForm,
    validateField: validateField,
    showFeedback: showFeedback,
    hideFeedback: hideFeedback,
    reset: resetForm,
    getData: getFormData
  };
})();
