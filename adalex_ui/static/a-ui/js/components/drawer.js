/**
 * Drawer Component JavaScript
 *
 * Handles drawer open/close, focus trap, ESC key, and backdrop click.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'Drawer';
  
  let activeDrawer = null;
  let activeFocusTrap = null;
  let previousActiveElement = null;

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
   * Initialize drawer functionality
   * Idempotent - can be called multiple times safely
   */
  function initDrawers() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const drawers = document.querySelectorAll('[data-drawer]');

      drawers.forEach(drawer => {
        try {
          // Skip if already initialized
          if (drawer.dataset.drawerInitialized === 'true') {
            return;
          }

          // Mark as initialized
          drawer.dataset.drawerInitialized = 'true';
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_single_drawer',
              drawerId: drawer.id || 'unknown'
            }
          });
        }
      });
    });
  }

  /**
   * Open a drawer
   * @param {string|HTMLElement} drawerOrId - Drawer element or ID
   */
  function openDrawer(drawerOrId) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const drawer = typeof drawerOrId === 'string'
        ? document.getElementById(drawerOrId)
        : drawerOrId;

      if (!drawer) {
        throw new Error(`Drawer not found: ${drawerOrId}`);
      }

      // Store previously focused element
      previousActiveElement = document.activeElement;

      // Show drawer
      drawer.setAttribute('aria-hidden', 'false');
      activeDrawer = drawer;

      // Prevent body scroll
      document.body.classList.add('drawer-open');

      // Set up focus trap using keyboard navigation utility
      const keyboardNav = getKeyboardNav();
      if (keyboardNav) {
        try {
          activeFocusTrap = keyboardNav.createFocusTrap(drawer, {
            autoFocus: true,
            returnFocusOnDeactivate: false, // We handle this manually
            escapeDeactivates: true
          });
          
          // Activate focus trap after a short delay for smoother UX
          setTimeout(() => {
            if (activeFocusTrap && activeDrawer === drawer) {
              activeFocusTrap.activate();
            }
          }, 100);
        } catch (focusError) {
          errorHandler.handle(COMPONENT_NAME, focusError, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { action: 'setup_focus_trap' }
          });
          
          // Fallback to basic focus management
          setTimeout(() => {
            focusFirstElement(drawer);
          }, 100);
        }
      } else {
        // Fallback for when keyboard navigation utility is not available
        setTimeout(() => {
          focusFirstElement(drawer);
        }, 100);
        
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
        drawer.addEventListener('keydown', safeTabHandler);
      }

      // Dispatch custom event
      try {
        const event = new CustomEvent('drawer:opened', {
          detail: { drawer },
          bubbles: true
        });
        drawer.dispatchEvent(event);
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
   * Close a drawer
   * @param {HTMLElement} drawer - Drawer element to close
   */
  function closeDrawer(drawer) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!drawer) {
        drawer = activeDrawer;
      }

      if (!drawer) {
        return;
      }

      // Hide drawer
      drawer.setAttribute('aria-hidden', 'true');

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
        drawer.removeEventListener('keydown', handleTabKey);
      }

      // Allow body scroll
      document.body.classList.remove('drawer-open');

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

      activeDrawer = null;

      // Dispatch custom event
      try {
        const event = new CustomEvent('drawer:closed', {
          detail: { drawer },
          bubbles: true
        });
        drawer.dispatchEvent(event);
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
   * Toggle a drawer
   * @param {string|HTMLElement} drawerOrId - Drawer element or ID
   */
  function toggleDrawer(drawerOrId) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const drawer = typeof drawerOrId === 'string'
        ? document.getElementById(drawerOrId)
        : drawerOrId;

      if (!drawer) {
        throw new Error(`Drawer not found: ${drawerOrId}`);
      }

      const isOpen = drawer.getAttribute('aria-hidden') === 'false';

      if (isOpen) {
        closeDrawer(drawer);
      } else {
        openDrawer(drawer);
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
      if (e.key === 'Escape' && activeDrawer) {
        closeDrawer(activeDrawer);
      }
    });
  }

  /**
   * Handle Tab key for focus trap
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleTabKey(e) {
    if (e.key !== 'Tab') {
      return;
    }

    const drawer = e.currentTarget;
    const focusableElements = getFocusableElements(drawer);

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
   * Focus first focusable element in drawer
   * @param {HTMLElement} drawer - Drawer element
   */
  function focusFirstElement(drawer) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!drawer) {
        throw new Error('No drawer element provided to focusFirstElement');
      }
      
      // Use keyboard navigation utility if available
      if (keyboardNav) {
        keyboardNav.focusFirst(drawer);
      } else {
        // Fallback implementation
        const focusableElements = getFocusableElements(drawer);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    });
  }

  /**
   * Set up event delegation for drawer interactions
   */
  function setupEventDelegation() {
    const errorHandler = getErrorHandler();
    
    // Drawer trigger clicks (delegated)
    const safeClickHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => {
        // Drawer open triggers
        const openTrigger = e.target.closest('[data-drawer-open]');
        if (openTrigger) {
          e.preventDefault();
          const drawerId = openTrigger.dataset.drawerOpen;
          openDrawer(drawerId);
          return;
        }

        // Drawer toggle triggers
        const toggleTrigger = e.target.closest('[data-drawer-toggle]');
        if (toggleTrigger) {
          e.preventDefault();
          const drawerId = toggleTrigger.dataset.drawerToggle;
          toggleDrawer(drawerId);
          return;
        }

        // Drawer close button clicks (delegated)
        const closeButton = e.target.closest('[data-drawer-close]');
        if (closeButton) {
          const drawer = closeButton.closest('[data-drawer]');
          if (drawer) {
            closeDrawer(drawer);
          }
          return;
        }

        // Drawer backdrop clicks (delegated)
        const backdrop = e.target.closest('[data-drawer-backdrop]');
        if (backdrop && e.target === backdrop) {
          const drawer = backdrop.closest('[data-drawer]');
          if (drawer) {
            closeDrawer(drawer);
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
      initDrawers();
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
    initDrawers,
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
  window.AdalexUI.Drawer = {
    init: initDrawers,
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer
  };
})();
