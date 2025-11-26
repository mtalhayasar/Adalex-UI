/**
 * Drawer Component JavaScript
 *
 * Handles drawer open/close, focus trap, ESC key, and backdrop click.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  let activeDrawer = null;
  let previousActiveElement = null;

  /**
   * Initialize drawer functionality
   * Idempotent - can be called multiple times safely
   */
  function initDrawers() {
    const drawers = document.querySelectorAll('[data-drawer]');

    drawers.forEach(drawer => {
      // Skip if already initialized
      if (drawer.dataset.drawerInitialized === 'true') {
        return;
      }

      const closeButton = drawer.querySelector('[data-drawer-close]');
      const backdrop = drawer.querySelector('[data-drawer-backdrop]');

      // Close button click
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          closeDrawer(drawer);
        });
      }

      // Backdrop click
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          closeDrawer(drawer);
        });
      }

      // Mark as initialized
      drawer.dataset.drawerInitialized = 'true';
    });

    // Global ESC key handler
    document.removeEventListener('keydown', handleEscKey);
    document.addEventListener('keydown', handleEscKey);
  }

  /**
   * Open a drawer
   * @param {string|HTMLElement} drawerOrId - Drawer element or ID
   */
  function openDrawer(drawerOrId) {
    const drawer = typeof drawerOrId === 'string'
      ? document.getElementById(drawerOrId)
      : drawerOrId;

    if (!drawer) {
      console.error('Drawer: Drawer not found:', drawerOrId);
      return;
    }

    // Store previously focused element
    previousActiveElement = document.activeElement;

    // Show drawer
    drawer.setAttribute('aria-hidden', 'false');
    activeDrawer = drawer;

    // Prevent body scroll
    document.body.classList.add('drawer-open');

    // Focus first focusable element
    setTimeout(() => {
      focusFirstElement(drawer);
    }, 100);

    // Set up focus trap
    drawer.addEventListener('keydown', handleTabKey);

    // Dispatch custom event
    const event = new CustomEvent('drawer:opened', {
      detail: { drawer },
      bubbles: true
    });
    drawer.dispatchEvent(event);
  }

  /**
   * Close a drawer
   * @param {HTMLElement} drawer - Drawer element to close
   */
  function closeDrawer(drawer) {
    if (!drawer) {
      drawer = activeDrawer;
    }

    if (!drawer) {
      return;
    }

    // Hide drawer
    drawer.setAttribute('aria-hidden', 'true');

    // Allow body scroll
    document.body.classList.remove('drawer-open');

    // Return focus to previous element
    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }

    // Remove focus trap
    drawer.removeEventListener('keydown', handleTabKey);

    activeDrawer = null;

    // Dispatch custom event
    const event = new CustomEvent('drawer:closed', {
      detail: { drawer },
      bubbles: true
    });
    drawer.dispatchEvent(event);
  }

  /**
   * Toggle a drawer
   * @param {string|HTMLElement} drawerOrId - Drawer element or ID
   */
  function toggleDrawer(drawerOrId) {
    const drawer = typeof drawerOrId === 'string'
      ? document.getElementById(drawerOrId)
      : drawerOrId;

    if (!drawer) {
      console.error('Drawer: Drawer not found:', drawerOrId);
      return;
    }

    const isOpen = drawer.getAttribute('aria-hidden') === 'false';

    if (isOpen) {
      closeDrawer(drawer);
    } else {
      openDrawer(drawer);
    }
  }

  /**
   * Handle ESC key press
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleEscKey(e) {
    if (e.key === 'Escape' && activeDrawer) {
      closeDrawer(activeDrawer);
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
   * Focus first focusable element in drawer
   * @param {HTMLElement} drawer - Drawer element
   */
  function focusFirstElement(drawer) {
    const focusableElements = getFocusableElements(drawer);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Set up drawer triggers (buttons with data-drawer-open attribute)
   */
  function initDrawerTriggers() {
    const triggers = document.querySelectorAll('[data-drawer-open]');

    triggers.forEach(trigger => {
      // Skip if already initialized
      if (trigger.dataset.drawerTriggerInitialized === 'true') {
        return;
      }

      const drawerId = trigger.dataset.drawerOpen;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer(drawerId);
      });

      trigger.dataset.drawerTriggerInitialized = 'true';
    });
  }

  /**
   * Set up drawer toggle triggers (buttons with data-drawer-toggle attribute)
   */
  function initDrawerToggleTriggers() {
    const triggers = document.querySelectorAll('[data-drawer-toggle]');

    triggers.forEach(trigger => {
      // Skip if already initialized
      if (trigger.dataset.drawerToggleTriggerInitialized === 'true') {
        return;
      }

      const drawerId = trigger.dataset.drawerToggle;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        toggleDrawer(drawerId);
      });

      trigger.dataset.drawerToggleTriggerInitialized = 'true';
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDrawers();
      initDrawerTriggers();
      initDrawerToggleTriggers();
    });
  } else {
    initDrawers();
    initDrawerTriggers();
    initDrawerToggleTriggers();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', () => {
    initDrawers();
    initDrawerTriggers();
    initDrawerToggleTriggers();
  });

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Drawer = {
    init: initDrawers,
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer
  };
})();
