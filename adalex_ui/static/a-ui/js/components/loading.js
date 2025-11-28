/**
 * Loading State Manager
 *
 * Comprehensive loading state management for forms, buttons, tables, and global indicators.
 * HTMX compatible with idempotent initialization.
 */

(function() {
  'use strict';

  // Global loading state
  let globalLoadingCount = 0;
  let globalLoader = null;

  /**
   * Initialize loading system
   * Idempotent - can be called multiple times safely
   */
  function initLoading() {
    // Setup HTMX global loading indicators
    setupHTMXGlobalLoading();
    
    // Initialize global loading bar
    initGlobalLoadingBar();
    
    // Setup automatic form loading states
    setupFormLoadingStates();
  }

  /**
   * Set button loading state
   * @param {HTMLElement} button - Button element
   * @param {boolean} isLoading - Loading state
   * @param {string} loadingText - Optional loading text
   */
  function setButtonLoading(button, isLoading, loadingText = null) {
    if (!button) return;

    try {
      if (isLoading) {
        // Store original state
        if (!button.dataset.originalText) {
          button.dataset.originalText = button.textContent.trim();
          button.dataset.originalDisabled = button.disabled;
        }

        // Add loading class and disable
        button.classList.add('a-button--loading');
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');

        // Add spinner and update text
        const spinner = createSpinner('sm');
        const textElement = button.querySelector('.a-button__text') || button;
        
        // Clear existing spinner
        const existingSpinner = button.querySelector('.a-button__spinner');
        if (existingSpinner) {
          existingSpinner.remove();
        }

        // Add spinner to button
        spinner.className = 'a-button__spinner';
        if (button.querySelector('.a-button__text')) {
          button.insertBefore(spinner, button.querySelector('.a-button__text'));
        } else {
          button.insertBefore(spinner, button.firstChild);
        }

        // Update text if provided
        if (loadingText) {
          textElement.textContent = loadingText;
        }

      } else {
        // Restore original state
        button.classList.remove('a-button--loading');
        button.disabled = button.dataset.originalDisabled === 'true';
        button.removeAttribute('aria-busy');

        // Remove spinner
        const spinner = button.querySelector('.a-button__spinner');
        if (spinner) {
          spinner.remove();
        }

        // Restore original text
        if (button.dataset.originalText) {
          const textElement = button.querySelector('.a-button__text') || button;
          textElement.textContent = button.dataset.originalText;
          delete button.dataset.originalText;
          delete button.dataset.originalDisabled;
        }
      }
    } catch (error) {
      console.error('[Loading] Error setting button loading state:', error);
    }
  }

  /**
   * Set form loading state
   * @param {HTMLElement} form - Form element
   * @param {boolean} isLoading - Loading state
   */
  function setFormLoading(form, isLoading) {
    if (!form) return;

    try {
      if (isLoading) {
        form.classList.add('a-form--loading');
        form.setAttribute('aria-busy', 'true');

        // Disable all form controls
        const controls = form.querySelectorAll('input, textarea, select, button');
        controls.forEach(control => {
          if (!control.dataset.originalDisabled) {
            control.dataset.originalDisabled = control.disabled;
          }
          control.disabled = true;
        });

        // Add loading overlay
        addFormLoadingOverlay(form);

      } else {
        form.classList.remove('a-form--loading');
        form.removeAttribute('aria-busy');

        // Restore form controls
        const controls = form.querySelectorAll('input, textarea, select, button');
        controls.forEach(control => {
          control.disabled = control.dataset.originalDisabled === 'true';
          delete control.dataset.originalDisabled;
        });

        // Remove loading overlay
        removeFormLoadingOverlay(form);
      }
    } catch (error) {
      console.error('[Loading] Error setting form loading state:', error);
    }
  }

  /**
   * Show global loading indicator
   * @param {string} message - Optional loading message
   */
  function showGlobalLoader(message = null) {
    globalLoadingCount++;
    
    if (globalLoader) {
      globalLoader.classList.add('a-loading-bar--visible');
      
      if (message) {
        const messageEl = globalLoader.querySelector('.a-loading-bar__message');
        if (messageEl) {
          messageEl.textContent = message;
          messageEl.style.display = 'block';
        }
      }
    }
  }

  /**
   * Hide global loading indicator
   */
  function hideGlobalLoader() {
    globalLoadingCount = Math.max(0, globalLoadingCount - 1);
    
    if (globalLoadingCount === 0 && globalLoader) {
      globalLoader.classList.remove('a-loading-bar--visible');
      
      // Hide message after animation
      setTimeout(() => {
        const messageEl = globalLoader.querySelector('.a-loading-bar__message');
        if (messageEl) {
          messageEl.style.display = 'none';
          messageEl.textContent = '';
        }
      }, 300);
    }
  }

  /**
   * Show table skeleton loader
   * @param {HTMLElement} tableContainer - Table container element
   * @param {number} rows - Number of skeleton rows
   */
  function showTableSkeleton(tableContainer, rows = 5) {
    if (!tableContainer) return;

    try {
      const table = tableContainer.querySelector('table');
      const tbody = table?.querySelector('tbody');
      
      if (!tbody) return;

      // Store original content
      if (!tbody.dataset.originalContent) {
        tbody.dataset.originalContent = tbody.innerHTML;
      }

      // Add skeleton class
      tableContainer.classList.add('a-table-container--skeleton');

      // Get number of columns from header
      const thead = table.querySelector('thead');
      const headerCells = thead?.querySelectorAll('th') || [];
      const colCount = headerCells.length || 3;

      // Generate skeleton rows
      const skeletonRows = Array.from({ length: rows }, (_, i) => {
        const cells = Array.from({ length: colCount }, () => 
          '<td><div class="a-skeleton a-skeleton--text"></div></td>'
        ).join('');
        return `<tr class="a-table__row--skeleton">${cells}</tr>`;
      }).join('');

      tbody.innerHTML = skeletonRows;
    } catch (error) {
      console.error('[Loading] Error showing table skeleton:', error);
    }
  }

  /**
   * Hide table skeleton loader
   * @param {HTMLElement} tableContainer - Table container element
   */
  function hideTableSkeleton(tableContainer) {
    if (!tableContainer) return;

    try {
      const tbody = tableContainer.querySelector('tbody');
      
      if (!tbody) return;

      // Remove skeleton class
      tableContainer.classList.remove('a-table-container--skeleton');

      // Restore original content
      if (tbody.dataset.originalContent) {
        tbody.innerHTML = tbody.dataset.originalContent;
        delete tbody.dataset.originalContent;
      }
    } catch (error) {
      console.error('[Loading] Error hiding table skeleton:', error);
    }
  }

  /**
   * Create spinner element
   * @param {string} size - Spinner size (sm, md, lg)
   * @returns {HTMLElement} Spinner element
   */
  function createSpinner(size = 'md') {
    const spinner = document.createElement('div');
    spinner.className = `a-spinner a-spinner--${size}`;
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Loading...');
    
    spinner.innerHTML = `
      <svg class="a-spinner__svg" viewBox="0 0 50 50">
        <circle
          class="a-spinner__circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="5"
        ></circle>
      </svg>
      <span class="a-spinner__sr-only">Loading...</span>
    `;
    
    return spinner;
  }

  /**
   * Add loading overlay to form
   * @param {HTMLElement} form - Form element
   */
  function addFormLoadingOverlay(form) {
    let overlay = form.querySelector('.a-form__loading-overlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'a-form__loading-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      
      const spinner = createSpinner('md');
      overlay.appendChild(spinner);
      
      form.style.position = 'relative';
      form.appendChild(overlay);
    }
    
    overlay.classList.add('a-form__loading-overlay--visible');
  }

  /**
   * Remove loading overlay from form
   * @param {HTMLElement} form - Form element
   */
  function removeFormLoadingOverlay(form) {
    const overlay = form.querySelector('.a-form__loading-overlay');
    
    if (overlay) {
      overlay.classList.remove('a-form__loading-overlay--visible');
      
      // Remove after animation
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 300);
    }
  }

  /**
   * Initialize global loading bar
   */
  function initGlobalLoadingBar() {
    if (globalLoader) return; // Already initialized

    globalLoader = document.createElement('div');
    globalLoader.className = 'a-loading-bar';
    globalLoader.setAttribute('role', 'progressbar');
    globalLoader.setAttribute('aria-label', 'Page loading');
    
    globalLoader.innerHTML = `
      <div class="a-loading-bar__progress"></div>
      <div class="a-loading-bar__message" style="display: none;"></div>
    `;
    
    document.body.appendChild(globalLoader);
  }

  /**
   * Setup HTMX global loading indicators
   */
  function setupHTMXGlobalLoading() {
    // Show global loader on HTMX requests
    document.body.addEventListener('htmx:beforeRequest', () => {
      showGlobalLoader();
    });

    // Hide global loader after HTMX requests
    document.body.addEventListener('htmx:afterRequest', () => {
      hideGlobalLoader();
    });

    // Handle HTMX errors
    document.body.addEventListener('htmx:responseError', () => {
      hideGlobalLoader();
    });

    document.body.addEventListener('htmx:sendError', () => {
      hideGlobalLoader();
    });
  }

  /**
   * Setup automatic form loading states
   */
  function setupFormLoadingStates() {
    // Auto-enable loading state on form submission
    document.body.addEventListener('submit', (e) => {
      const form = e.target.closest('.a-form');
      if (form && !form.dataset.skipAutoLoading) {
        const submitButton = form.querySelector('button[type="submit"]') || 
                           form.querySelector('input[type="submit"]');
        
        // Set button loading
        if (submitButton) {
          setButtonLoading(submitButton, true);
        }
        
        // Set form loading if it has HTMX attributes
        if (form.hasAttribute('hx-post') || 
            form.hasAttribute('hx-put') || 
            form.hasAttribute('hx-patch') || 
            form.hasAttribute('hx-delete')) {
          setFormLoading(form, true);
        }
      }
    });

    // Reset loading states after HTMX form responses
    document.body.addEventListener('htmx:afterRequest', (e) => {
      const form = e.target.closest('.a-form');
      if (form) {
        const submitButton = form.querySelector('button[type="submit"]') || 
                           form.querySelector('input[type="submit"]');
        
        if (submitButton) {
          setButtonLoading(submitButton, false);
        }
        
        setFormLoading(form, false);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoading);
  } else {
    initLoading();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initLoading);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Loading = {
    init: initLoading,
    setButtonLoading: setButtonLoading,
    setFormLoading: setFormLoading,
    showGlobalLoader: showGlobalLoader,
    hideGlobalLoader: hideGlobalLoader,
    showTableSkeleton: showTableSkeleton,
    hideTableSkeleton: hideTableSkeleton
  };
})();