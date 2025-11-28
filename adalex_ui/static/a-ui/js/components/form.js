(function() {
  'use strict';

  function initForms() {
    const forms = document.querySelectorAll('.a-form');

    forms.forEach(form => {
      if (form.dataset.formInitialized === 'true') {
        return;
      }

      setupHTMXListeners(form);
      form.dataset.formInitialized = 'true';
    });
  }

  function setupHTMXListeners(form) {
    form.addEventListener('htmx:beforeRequest', (event) => {
      if (!validateForm(form)) {
        event.preventDefault();
        return;
      }
      
      // Set loading state if Loading component is available
      if (window.AdalexUI && window.AdalexUI.Loading && !form.dataset.skipAutoLoading) {
        const submitButton = form.querySelector('button[type="submit"]') || 
                           form.querySelector('input[type="submit"]');
        if (submitButton) {
          window.AdalexUI.Loading.setButtonLoading(submitButton, true);
        }
        window.AdalexUI.Loading.setFormLoading(form, true);
      }
    });

    form.addEventListener('htmx:afterRequest', (event) => {
      // Clear loading state if Loading component is available
      if (window.AdalexUI && window.AdalexUI.Loading) {
        const submitButton = form.querySelector('button[type="submit"]') || 
                           form.querySelector('input[type="submit"]');
        if (submitButton) {
          window.AdalexUI.Loading.setButtonLoading(submitButton, false);
        }
        window.AdalexUI.Loading.setFormLoading(form, false);
      }

      if (event.detail.successful) {
        showFeedback(form, 'Form submitted successfully!', 'success');
        if (form.dataset.resetOnSuccess === 'true') {
          setTimeout(() => {
            form.reset();
            clearAllErrors(form);
          }, 1500);
        }
      } else {
        showFeedback(form, 'An error occurred. Please try again.', 'error');
      }
    });

    // Handle errors and timeout scenarios
    form.addEventListener('htmx:responseError', () => {
      if (window.AdalexUI && window.AdalexUI.Loading) {
        const submitButton = form.querySelector('button[type="submit"]') || 
                           form.querySelector('input[type="submit"]');
        if (submitButton) {
          window.AdalexUI.Loading.setButtonLoading(submitButton, false);
        }
        window.AdalexUI.Loading.setFormLoading(form, false);
      }
    });

    form.addEventListener('htmx:sendError', () => {
      if (window.AdalexUI && window.AdalexUI.Loading) {
        const submitButton = form.querySelector('button[type="submit"]') || 
                           form.querySelector('input[type="submit"]');
        if (submitButton) {
          window.AdalexUI.Loading.setButtonLoading(submitButton, false);
        }
        window.AdalexUI.Loading.setFormLoading(form, false);
      }
    });
  }

  // Event delegation setup
  function setupEventDelegation() {
    // Handle input blur events for validation
    document.body.addEventListener('blur', (e) => {
      const input = e.target.closest('input, textarea, select');
      const form = input?.closest('.a-form');
      if (form && input) {
        validateField(input);
      }
    }, true); // Use capture phase for blur events

    // Handle input events to clear errors
    document.body.addEventListener('input', (e) => {
      const input = e.target.closest('input, textarea, select');
      const form = input?.closest('.a-form');
      if (form && input) {
        clearFieldError(input);
      }
    });

    // Handle form submissions for validation
    document.body.addEventListener('submit', (e) => {
      const form = e.target.closest('.a-form');
      if (form) {
        if (!validateForm(form)) {
          e.preventDefault();
          const firstError = form.querySelector('.a-form__group--error');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const input = firstError.querySelector('input, textarea, select');
            if (input) input.focus();
          }
        }
      }
    });
  }

  function validateField(input) {
    const group = input.closest('.a-form__group');
    if (!group) return true;

    clearFieldError(input);

    let isValid = true;
    let errorMessage = '';

    if (input.hasAttribute('required') && !input.value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    } else if (input.type === 'tel' && input.value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(input.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    } else if (input.type === 'url' && input.value) {
      try {
        new URL(input.value);
      } catch {
        isValid = false;
        errorMessage = 'Please enter a valid URL';
      }
    } else if (input.type === 'number' && input.value) {
      if (input.hasAttribute('min') && parseFloat(input.value) < parseFloat(input.min)) {
        isValid = false;
        errorMessage = `Value must be at least ${input.min}`;
      } else if (input.hasAttribute('max') && parseFloat(input.value) > parseFloat(input.max)) {
        isValid = false;
        errorMessage = `Value must be at most ${input.max}`;
      }
    }

    if (!isValid) {
      showFieldError(input, errorMessage);
    }

    return isValid;
  }

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

  function showFieldError(input, message) {
    const group = input.closest('.a-form__group');
    if (!group) return;

    group.classList.add('a-form__group--error');
    input.setAttribute('aria-invalid', 'true');

    let errorEl = group.querySelector('.a-form__error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'a-form__error';
      errorEl.setAttribute('role', 'alert');
      errorEl.id = `${input.name}-error`;
      errorEl.innerHTML = `<span class="a-form__error-icon" aria-hidden="true">⚠</span><span></span>`;
      group.appendChild(errorEl);
    }

    errorEl.querySelector('span:last-child').textContent = message;
    input.setAttribute('aria-describedby', errorEl.id);
  }

  function clearFieldError(input) {
    const group = input.closest('.a-form__group');
    if (!group) return;

    group.classList.remove('a-form__group--error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');

    const errorEl = group.querySelector('.a-form__error');
    if (errorEl && !input.dataset.serverError) {
      errorEl.remove();
    }
  }

  function showFeedback(form, message, type = 'info', duration = 5000) {
    let feedbackEl = form.querySelector('.a-form__feedback');
    if (!feedbackEl) {
      feedbackEl = document.createElement('div');
      feedbackEl.className = 'a-form__feedback';
      feedbackEl.setAttribute('role', 'status');
      feedbackEl.setAttribute('aria-live', 'polite');
      form.insertBefore(feedbackEl, form.querySelector('.a-form__actions'));
    }

    feedbackEl.className = `a-form__feedback a-form__feedback--${type} a-form__feedback--visible`;
    feedbackEl.textContent = message;

    if (duration > 0) {
      setTimeout(() => {
        feedbackEl.classList.remove('a-form__feedback--visible');
        setTimeout(() => {
          feedbackEl.textContent = '';
          feedbackEl.className = 'a-form__feedback';
        }, 300);
      }, duration);
    }
  }

  function clearAllErrors(form) {
    const groups = form.querySelectorAll('.a-form__group--error');
    groups.forEach(group => {
      group.classList.remove('a-form__group--error');
      const errorEl = group.querySelector('.a-form__error');
      if (errorEl) errorEl.remove();
    });

    const inputs = form.querySelectorAll('[aria-invalid="true"]');
    inputs.forEach(input => {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initForms();
      setupEventDelegation();
    });
  } else {
    initForms();
    setupEventDelegation();
  }

  document.addEventListener('htmx:afterSwap', initForms);

  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Form = {
    init: initForms,
    validate: validateForm,
    validateField: validateField,
    showFeedback: showFeedback,
    clearAllErrors: clearAllErrors
  };
})();
