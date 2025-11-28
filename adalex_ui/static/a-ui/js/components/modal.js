/**
 * Modal Component JavaScript
 *
 * Handles modal open/close, focus trap, ESC key, and backdrop click.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'Modal';
  
  let activeModal = null;
  let activeFocusTrap = null;
  let previousActiveElement = null;
  let previousScrollPosition = 0;

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
   * Get keyboard navigation utility (with fallback)
   */
  function getKeyboardNav() {
    return window.AdalexUI && window.AdalexUI.KeyboardNav
      ? window.AdalexUI.KeyboardNav
      : null;
  }

  /**
   * Initialize modal functionality
   * Idempotent - can be called multiple times safely
   */
  function initModals() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const modals = document.querySelectorAll('[data-modal]');

      modals.forEach(modal => {
        try {
          // Skip if already initialized
          if (modal.dataset.modalInitialized === 'true') {
            return;
          }

          // Mark as initialized
          modal.dataset.modalInitialized = 'true';
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_single_modal',
              modalId: modal.id || 'unknown'
            }
          });
        }
      });
    });
  }

  /**
   * Open a modal
   * @param {string|HTMLElement} modalOrId - Modal element or ID
   */
  function openModal(modalOrId) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const modal = typeof modalOrId === 'string'
        ? document.getElementById(modalOrId)
        : modalOrId;

      if (!modal) {
        throw new Error(`Modal not found: ${modalOrId}`);
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
        try {
          modal.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } catch (scrollError) {
          errorHandler.handle(COMPONENT_NAME, scrollError, {
            level: errorHandler.levels?.LOW || 'low',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { action: 'scroll_into_view' }
          });
        }
      });

      // Set up focus trap using keyboard navigation utility
      const keyboardNav = getKeyboardNav();
      if (keyboardNav) {
        try {
          activeFocusTrap = keyboardNav.createFocusTrap(modal, {
            autoFocus: true,
            returnFocusOnDeactivate: false, // We handle this manually
            escapeDeactivates: true
          });
          
          // Activate focus trap after a short delay for smoother UX
          setTimeout(() => {
            if (activeFocusTrap && activeModal === modal) {
              activeFocusTrap.activate();
            }
          }, 150);
        } catch (focusError) {
          errorHandler.handle(COMPONENT_NAME, focusError, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { action: 'setup_focus_trap' }
          });
          
          // Fallback to basic focus management
          setTimeout(() => {
            focusFirstElement(modal);
          }, 150);
        }
      } else {
        // Fallback for when keyboard navigation utility is not available
        setTimeout(() => {
          focusFirstElement(modal);
        }, 150);
        
        // Set up basic tab key handling
        const safeTabHandler = errorHandler.makeSafeEventHandler(
          COMPONENT_NAME,
          handleTabKey,
          {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { action: 'focus_trap_tab_key' }
          }
        );
        modal.addEventListener('keydown', safeTabHandler);
      }

      // Dispatch custom event
      try {
        const event = new CustomEvent('modal:opened', {
          detail: { modal },
          bubbles: true
        });
        modal.dispatchEvent(event);
      } catch (eventError) {
        errorHandler.handle(COMPONENT_NAME, eventError, {
          level: errorHandler.levels?.LOW || 'low',
          recovery: errorHandler.strategies?.SILENT || 'silent',
          details: { action: 'dispatch_opened_event' }
        });
      }
    });
  }

  /**
   * Close a modal
   * @param {HTMLElement} modal - Modal element to close
   */
  function closeModal(modal) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!modal) {
        modal = activeModal;
      }

      if (!modal) {
        return;
      }

      // Hide modal
      modal.setAttribute('aria-hidden', 'true');

      // Deactivate focus trap
      if (activeFocusTrap) {
        try {
          activeFocusTrap.deactivate();
        } catch (focusError) {
          errorHandler.handle(COMPONENT_NAME, focusError, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { action: 'deactivate_focus_trap' }
          });
        }
        activeFocusTrap = null;
      } else {
        // Remove fallback focus trap handler
        modal.removeEventListener('keydown', handleTabKey);
      }

      // Allow body scroll and restore scroll position
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      
      // Restore scroll position (macOS Safari fix)
      try {
        if (previousScrollPosition > 0) {
          window.scrollTo(0, previousScrollPosition);
          previousScrollPosition = 0;
        }
      } catch (scrollError) {
        errorHandler.handle(COMPONENT_NAME, scrollError, {
          level: errorHandler.levels?.LOW || 'low',
          recovery: errorHandler.strategies?.SILENT || 'silent',
          details: { action: 'restore_scroll_position' }
        });
      }

      // Return focus to previous element (manual restoration for better control)
      try {
        if (previousActiveElement) {
          previousActiveElement.focus();
          previousActiveElement = null;
        }
      } catch (focusError) {
        errorHandler.handle(COMPONENT_NAME, focusError, {
          level: errorHandler.levels?.LOW || 'low',
          recovery: errorHandler.strategies?.SILENT || 'silent',
          details: { action: 'restore_focus' }
        });
      }

      activeModal = null;

      // Dispatch custom event
      try {
        const event = new CustomEvent('modal:closed', {
          detail: { modal },
          bubbles: true
        });
        modal.dispatchEvent(event);
      } catch (eventError) {
        errorHandler.handle(COMPONENT_NAME, eventError, {
          level: errorHandler.levels?.LOW || 'low',
          recovery: errorHandler.strategies?.SILENT || 'silent',
          details: { action: 'dispatch_closed_event' }
        });
      }
    });
  }

  /**
   * Handle ESC key press
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleEscKey(e) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (e.key === 'Escape' && activeModal) {
        closeModal(activeModal);
      }
    });
  }

  /**
   * Handle Tab key for focus trap
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleTabKey(e) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (e.key !== 'Tab') {
        return;
      }

      const modal = e.currentTarget;
      if (!modal) {
        throw new Error('No modal element found for focus trap');
      }
      
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
    });
  }

  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {Array} Array of focusable elements
   */
  function getFocusableElements(container) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!container || !container.querySelectorAll) {
        throw new Error('Invalid container provided to getFocusableElements');
      }
      
      // Use keyboard navigation utility if available
      if (keyboardNav) {
        return keyboardNav.getFocusableElements(container);
      }
      
      // Fallback implementation
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');

      return Array.from(container.querySelectorAll(selector));
    }) || [];
  }

  /**
   * Focus first focusable element in modal
   * @param {HTMLElement} modal - Modal element
   */
  function focusFirstElement(modal) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!modal) {
        throw new Error('No modal element provided to focusFirstElement');
      }
      
      // Use keyboard navigation utility if available
      if (keyboardNav) {
        keyboardNav.focusFirst(modal);
      } else {
        // Fallback implementation
        const focusableElements = getFocusableElements(modal);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    });
  }

  /**
   * Set up event delegation for modal interactions
   */
  function setupEventDelegation() {
    const errorHandler = getErrorHandler();
    
    // Modal trigger clicks (delegated)
    const safeClickHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => {
        const trigger = e.target.closest('[data-modal-open]');
        if (trigger) {
          e.preventDefault();
          const modalId = trigger.dataset.modalOpen;
          openModal(modalId);
          return;
        }

        // Modal close button clicks (delegated)
        const closeButton = e.target.closest('[data-modal-close]');
        if (closeButton) {
          const modal = closeButton.closest('[data-modal]');
          if (modal) {
            closeModal(modal);
          }
          return;
        }

        // Modal backdrop clicks (delegated)
        const backdrop = e.target.closest('[data-modal-backdrop]');
        if (backdrop && e.target === backdrop) {
          const modal = backdrop.closest('[data-modal]');
          if (modal) {
            closeModal(modal);
          }
        }
      },
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'delegated_click_handler' }
      }
    );
    
    document.body.addEventListener('click', safeClickHandler);

    // Global ESC key handler (already delegated)
    const safeEscHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      handleEscKey,
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'global_esc_key' }
      }
    );
    
    document.addEventListener('keydown', safeEscHandler);
  }

  // Initialize on DOM ready with error handling
  const errorHandler = getErrorHandler();
  
  const safeInitAll = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    () => {
      initModals();
      setupEventDelegation();
    },
    {
      level: errorHandler.levels?.HIGH || 'high',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'dom_ready_init' }
    }
  );

  const safeHTMXInit = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initModals,
    {
      level: errorHandler.levels?.MEDIUM || 'medium',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'htmx_after_swap_init' }
    }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitAll);
  } else {
    safeInitAll();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', safeHTMXInit);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Modal = {
    init: initModals,
    open: openModal,
    close: closeModal
  };
})();
