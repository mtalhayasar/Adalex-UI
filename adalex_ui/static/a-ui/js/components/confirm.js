/**
 * Confirm Dialog Component JavaScript
 *
 * Handles confirm dialog open/close, focus trap, ESC key, and backdrop click.
 * Supports promise-based confirmation for async workflows.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  let activeDialog = null;
  let previousActiveElement = null;
  let resolvePromise = null;
  let previousScrollPosition = 0;

  /**
   * Initialize confirm dialog functionality
   * Idempotent - can be called multiple times safely
   */
  function initConfirmDialogs() {
    const dialogs = document.querySelectorAll('[data-confirm-dialog]');

    dialogs.forEach(dialog => {
      // Skip if already initialized
      if (dialog.dataset.confirmInitialized === 'true') {
        return;
      }

      const backdrop = dialog.querySelector('[data-confirm-backdrop]');
      const actions = dialog.querySelector('.a-confirm-dialog__actions');

      // Backdrop click
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          closeDialog(dialog, false);
        });
      }

      // Action button clicks
      if (actions) {
        const buttons = actions.querySelectorAll('.a-button');
        buttons.forEach((button, index) => {
          button.addEventListener('click', () => {
            // First button is cancel, second is confirm
            const confirmed = index === 1;
            closeDialog(dialog, confirmed);
          });
        });
      }

      // Mark as initialized
      dialog.dataset.confirmInitialized = 'true';
    });

    // Global ESC key handler
    document.removeEventListener('keydown', handleEscKey);
    document.addEventListener('keydown', handleEscKey);
  }

  /**
   * Open a confirm dialog
   * @param {string|HTMLElement} dialogOrId - Dialog element or ID
   * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false otherwise
   */
  function openDialog(dialogOrId) {
    const dialog = typeof dialogOrId === 'string'
      ? document.getElementById(dialogOrId)
      : dialogOrId;

    if (!dialog) {
      console.error('ConfirmDialog: Dialog not found:', dialogOrId);
      return Promise.resolve(false);
    }

    // Store previously focused element
    previousActiveElement = document.activeElement;
    
    // Store scroll position for macOS Safari
    previousScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Show dialog
    dialog.setAttribute('aria-hidden', 'false');
    activeDialog = dialog;

    // Prevent body scroll (with position fix for macOS)
    document.body.style.top = `-${previousScrollPosition}px`;
    document.body.classList.add('confirm-dialog-open');

    // Force reflow for Safari/macOS positioning fix
    dialog.offsetHeight;
    
    // Ensure dialog is in viewport (macOS fix)
    requestAnimationFrame(() => {
      dialog.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });

    // Focus first button (cancel button)
    setTimeout(() => {
      const firstButton = dialog.querySelector('.a-confirm-dialog__actions .a-button');
      if (firstButton) {
        firstButton.focus();
      }
    }, 150);

    // Set up focus trap
    dialog.addEventListener('keydown', handleTabKey);

    // Dispatch custom event
    const event = new CustomEvent('confirm:opened', {
      detail: { dialog },
      bubbles: true
    });
    dialog.dispatchEvent(event);

    // Return promise for async usage
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  /**
   * Close a confirm dialog
   * @param {HTMLElement} dialog - Dialog element to close
   * @param {boolean} confirmed - Whether the user confirmed the action
   */
  function closeDialog(dialog, confirmed) {
    if (!dialog) {
      dialog = activeDialog;
    }

    if (!dialog) {
      return;
    }

    // Hide dialog
    dialog.setAttribute('aria-hidden', 'true');

    // Allow body scroll and restore scroll position
    document.body.classList.remove('confirm-dialog-open');
    document.body.style.top = '';
    
    // Restore scroll position (macOS Safari fix)
    if (previousScrollPosition > 0) {
      window.scrollTo(0, previousScrollPosition);
      previousScrollPosition = 0;
    }

    // Return focus to previous element
    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }

    // Remove focus trap
    dialog.removeEventListener('keydown', handleTabKey);

    // Resolve promise if exists
    if (resolvePromise) {
      resolvePromise(confirmed);
      resolvePromise = null;
    }

    activeDialog = null;

    // Dispatch custom event
    const event = new CustomEvent('confirm:closed', {
      detail: { dialog, confirmed },
      bubbles: true
    });
    dialog.dispatchEvent(event);
  }

  /**
   * Handle ESC key press
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleEscKey(e) {
    if (e.key === 'Escape' && activeDialog) {
      closeDialog(activeDialog, false);
    }
  }

  /**
   * Handle Tab key for focus trap
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleTabKey(e) {
    if (e.key !== 'Tab') {
      return;
    }

    const dialog = e.currentTarget;
    const focusableElements = getFocusableElements(dialog);

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Shift + Tab
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    }
    // Tab
    else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {Array} Array of focusable elements
   */
  function getFocusableElements(container) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  }

  /**
   * Show a confirm dialog and wait for user response
   * Convenience method for programmatic usage
   * @param {Object} options - Dialog options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message
   * @param {string} [options.confirmText='Confirm'] - Confirm button text
   * @param {string} [options.cancelText='Cancel'] - Cancel button text
   * @param {boolean} [options.danger=false] - Whether this is a destructive action
   * @returns {Promise<boolean>} Promise that resolves to true if confirmed
   */
  function confirm(options) {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      danger = false
    } = options;

    // Create dynamic dialog if needed
    let dialog = document.getElementById('a-confirm-dialog-dynamic');

    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'a-confirm-dialog-dynamic';
      dialog.className = 'a-confirm-dialog';
      dialog.setAttribute('data-confirm-dialog', '');
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'a-confirm-dialog-dynamic-title');
      dialog.setAttribute('aria-describedby', 'a-confirm-dialog-dynamic-message');
      dialog.setAttribute('aria-hidden', 'true');

      dialog.innerHTML = `
        <div class="a-confirm-dialog__backdrop" data-confirm-backdrop></div>
        <div class="a-confirm-dialog__container">
          <div class="a-confirm-dialog__content">
            <div class="a-confirm-dialog__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 id="a-confirm-dialog-dynamic-title" class="a-confirm-dialog__title"></h3>
            <p id="a-confirm-dialog-dynamic-message" class="a-confirm-dialog__message"></p>
            <div class="a-confirm-dialog__actions">
              <button type="button" class="a-button a-button--secondary a-button--md">
                <span class="a-button__text"></span>
              </button>
              <button type="button" class="a-button a-button--primary a-button--md">
                <span class="a-button__text"></span>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);
      initConfirmDialogs();
    }

    // Update dialog content
    dialog.querySelector('.a-confirm-dialog__title').textContent = title;
    dialog.querySelector('.a-confirm-dialog__message').textContent = message;

    const buttons = dialog.querySelectorAll('.a-confirm-dialog__actions .a-button__text');
    buttons[0].textContent = cancelText;
    buttons[1].textContent = confirmText;

    // Update danger state
    if (danger) {
      dialog.classList.add('a-confirm-dialog--danger');
      // Update icon to warning triangle
      const iconContainer = dialog.querySelector('.a-confirm-dialog__icon');
      iconContainer.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 9V13M12 17H12.01M12 3L21.5 21H2.5L12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else {
      dialog.classList.remove('a-confirm-dialog--danger');
      // Update icon to info circle
      const iconContainer = dialog.querySelector('.a-confirm-dialog__icon');
      iconContainer.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    return openDialog(dialog);
  }

  /**
   * Set up confirm dialog triggers (elements with data-confirm-open attribute)
   */
  function initConfirmTriggers() {
    const triggers = document.querySelectorAll('[data-confirm-open]');

    triggers.forEach(trigger => {
      // Skip if already initialized
      if (trigger.dataset.confirmTriggerInitialized === 'true') {
        return;
      }

      const dialogId = trigger.dataset.confirmOpen;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openDialog(dialogId);
      });

      trigger.dataset.confirmTriggerInitialized = 'true';
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initConfirmDialogs();
      initConfirmTriggers();
    });
  } else {
    initConfirmDialogs();
    initConfirmTriggers();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', () => {
    initConfirmDialogs();
    initConfirmTriggers();
  });

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.ConfirmDialog = {
    init: initConfirmDialogs,
    open: openDialog,
    close: closeDialog,
    confirm: confirm
  };
})();
