/**
 * Sidebar Component JavaScript
 *
 * Handles sidebar collapse/expand functionality.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  /**
   * Initialize sidebar functionality
   * Idempotent - can be called multiple times safely
   */
  function initSidebars() {
    const sidebars = document.querySelectorAll('[data-sidebar]');

    sidebars.forEach(sidebar => {
      // Skip if already initialized
      if (sidebar.dataset.sidebarInitialized === 'true') {
        return;
      }

      const toggle = sidebar.querySelector('[data-sidebar-toggle]');

      if (toggle) {
        toggle.addEventListener('click', () => {
          toggleSidebar(sidebar, toggle);
        });
      }

      // Mark as initialized
      sidebar.dataset.sidebarInitialized = 'true';
    });
  }

  /**
   * Toggle sidebar collapsed state
   * @param {HTMLElement} sidebar - Sidebar element
   * @param {HTMLElement} toggle - Toggle button element
   */
  function toggleSidebar(sidebar, toggle) {
    const isCollapsed = sidebar.classList.contains('a-sidebar--collapsed');

    if (isCollapsed) {
      expandSidebar(sidebar, toggle);
    } else {
      collapseSidebar(sidebar, toggle);
    }
  }

  /**
   * Expand sidebar
   * @param {HTMLElement} sidebar - Sidebar element
   * @param {HTMLElement} toggle - Toggle button element
   */
  function expandSidebar(sidebar, toggle) {
    sidebar.classList.remove('a-sidebar--collapsed');
    toggle.setAttribute('aria-expanded', 'true');

    // Dispatch custom event
    const event = new CustomEvent('sidebar:expanded', {
      detail: { sidebar },
      bubbles: true
    });
    sidebar.dispatchEvent(event);
  }

  /**
   * Collapse sidebar
   * @param {HTMLElement} sidebar - Sidebar element
   * @param {HTMLElement} toggle - Toggle button element
   */
  function collapseSidebar(sidebar, toggle) {
    sidebar.classList.add('a-sidebar--collapsed');
    toggle.setAttribute('aria-expanded', 'false');

    // Dispatch custom event
    const event = new CustomEvent('sidebar:collapsed', {
      detail: { sidebar },
      bubbles: true
    });
    sidebar.dispatchEvent(event);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebars);
  } else {
    initSidebars();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initSidebars);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Sidebar = {
    init: initSidebars,
    toggle: toggleSidebar,
    expand: expandSidebar,
    collapse: collapseSidebar
  };
})();
