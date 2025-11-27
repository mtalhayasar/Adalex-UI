/**
 * Modal Component JavaScript
 *
 * Handles modal open/close, focus trap, ESC key, and backdrop click.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  let activeModal = null;
  let previousActiveElement = null;
  let previousScrollPosition = 0;

  /**
   * Initialize modal functionality
   * Idempotent - can be called multiple times safely
   */
  function initModals() {
    const modals = document.querySelectorAll('[data-modal]');

    modals.forEach(modal => {
      // Skip if already initialized
      if (modal.dataset.modalInitialized === 'true') {
        return;
      }

      const closeButton = modal.querySelector('[data-modal-close]');
      const backdrop = modal.querySelector('[data-modal-backdrop]');

      // Close button click
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          closeModal(modal);
        });
      }

      // Backdrop click
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          closeModal(modal);
        });
      }

      // Mark as initialized
      modal.dataset.modalInitialized = 'true';
    });

    // Global ESC key handler
    document.addEventListener('keydown', handleEscKey);
  }

  /**
   * Open a modal
   * @param {string|HTMLElement} modalOrId - Modal element or ID
   */
  function openModal(modalOrId) {
    const modal = typeof modalOrId === 'string'
      ? document.getElementById(modalOrId)
      : modalOrId;

    if (!modal) {
      console.error('Modal not found:', modalOrId);
      return;
    }

    // Store previously focused element
    previousActiveElement = document.activeElement;
    
    // Store scroll position for macOS Safari
    previousScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    activeModal = modal;

    // Prevent body scroll (with position fix for macOS)
    document.body.style.top = `-${previousScrollPosition}px`;
    document.body.classList.add('modal-open');

    // Force reflow for Safari/macOS positioning fix
    modal.offsetHeight;
    
    // Ensure modal is in viewport (macOS fix)
    requestAnimationFrame(() => {
      modal.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });

    // Focus first focusable element
    setTimeout(() => {
      focusFirstElement(modal);
    }, 150);

    // Set up focus trap
    modal.addEventListener('keydown', handleTabKey);

    // Dispatch custom event
    const event = new CustomEvent('modal:opened', {
      detail: { modal },
      bubbles: true
    });
    modal.dispatchEvent(event);
  }

  /**
   * Close a modal
   * @param {HTMLElement} modal - Modal element to close
   */
  function closeModal(modal) {
    if (!modal) {
      modal = activeModal;
    }

    if (!modal) {
      return;
    }

    // Hide modal
    modal.setAttribute('aria-hidden', 'true');

    // Allow body scroll and restore scroll position
    document.body.classList.remove('modal-open');
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
    modal.removeEventListener('keydown', handleTabKey);

    activeModal = null;

    // Dispatch custom event
    const event = new CustomEvent('modal:closed', {
      detail: { modal },
      bubbles: true
    });
    modal.dispatchEvent(event);
  }

  /**
   * Handle ESC key press
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleEscKey(e) {
    if (e.key === 'Escape' && activeModal) {
      closeModal(activeModal);
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

    const modal = e.currentTarget;
    const focusableElements = getFocusableElements(modal);

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
   * Focus first focusable element in modal
   * @param {HTMLElement} modal - Modal element
   */
  function focusFirstElement(modal) {
    const focusableElements = getFocusableElements(modal);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Set up modal triggers (buttons with data-modal-open attribute)
   */
  function initModalTriggers() {
    const triggers = document.querySelectorAll('[data-modal-open]');

    triggers.forEach(trigger => {
      // Skip if already initialized
      if (trigger.dataset.modalTriggerInitialized === 'true') {
        return;
      }

      const modalId = trigger.dataset.modalOpen;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalId);
      });

      trigger.dataset.modalTriggerInitialized = 'true';
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initModals();
      initModalTriggers();
    });
  } else {
    initModals();
    initModalTriggers();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', () => {
    initModals();
    initModalTriggers();
  });

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Modal = {
    init: initModals,
    open: openModal,
    close: closeModal
  };
})();
