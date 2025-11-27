/**
 * Adalex UI - Main JavaScript
 *
 * This file imports all component JavaScript modules.
 * Components are loaded in a modular, HTMX-compatible way.
 *
 * Usage:
 *   Include this file in your Django templates:
 *   <script src="{% static 'a-ui/js/main.js' %}" defer></script>
 *
 * All components are initialized automatically on DOMContentLoaded
 * and re-initialized after HTMX swaps.
 */

(function() {
  'use strict';

  // Import component modules
  // Note: In production, you might use a bundler like webpack or rollup
  // For now, components are loaded via individual script tags

  /**
   * Initialize all components
   * Called on page load and after HTMX swaps
   */
  function initializeComponents() {
    // Initialize Alert component
    if (window.AdalexUI && window.AdalexUI.Alert) {
      window.AdalexUI.Alert.init();
    }

    // Initialize Auth component (password toggle)
    if (window.AdalexUI && window.AdalexUI.Auth) {
      window.AdalexUI.Auth.init();
    }

    // Initialize ConfirmDialog component
    if (window.AdalexUI && window.AdalexUI.ConfirmDialog) {
      window.AdalexUI.ConfirmDialog.init();
    }

    // Initialize Drawer component
    if (window.AdalexUI && window.AdalexUI.Drawer) {
      window.AdalexUI.Drawer.init();
    }

    // Initialize File Upload component
    if (window.AdalexUI && window.AdalexUI.initFileUpload) {
      document.querySelectorAll('[data-file-upload]').forEach(window.AdalexUI.initFileUpload);
    }

    // Initialize Form component
    if (window.AdalexUI && window.AdalexUI.Form) {
      window.AdalexUI.Form.init();
    }

    // Initialize Modal component
    if (window.AdalexUI && window.AdalexUI.Modal) {
      window.AdalexUI.Modal.init();
    }

    // Initialize Tooltip component
    if (window.AdalexUI && window.AdalexUI.Tooltip) {
      window.AdalexUI.Tooltip.init();
    }

    // Initialize Navbar component
    if (window.AdalexUI && window.AdalexUI.Navbar) {
      window.AdalexUI.Navbar.init();
    }

    // Initialize Sidebar component
    if (window.AdalexUI && window.AdalexUI.Sidebar) {
      window.AdalexUI.Sidebar.init();
    }

    // Initialize Table component
    if (window.AdalexUI && window.AdalexUI.Table) {
      window.AdalexUI.Table.init();
    }

    // Initialize Tabs component
    if (window.AdalexUI && window.AdalexUI.Tabs) {
      window.AdalexUI.Tabs.init();
    }

    // Initialize Notification component
    if (window.AdalexUI && window.AdalexUI.Notification) {
      window.AdalexUI.Notification.init();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
  } else {
    initializeComponents();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initializeComponents);

  // Expose initialization function globally
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.init = initializeComponents;
})();
