/**
 * Navbar Component JavaScript
 *
 * Handles mobile menu toggle and user dropdown.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  /**
   * Initialize navbar functionality
   * Idempotent - can be called multiple times safely
   */
  function initNavbars() {
    const navbars = document.querySelectorAll('[data-navbar]');

    navbars.forEach(navbar => {
      // Skip if already initialized
      if (navbar.dataset.navbarInitialized === 'true') {
        return;
      }

      const toggle = navbar.querySelector('[data-navbar-toggle]');
      const menu = navbar.querySelector('[data-navbar-menu]');
      const userToggle = navbar.querySelector('[data-navbar-user-toggle]');
      const userMenu = navbar.querySelector('[data-navbar-user-menu]');

      // Mobile menu toggle
      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

          if (isExpanded) {
            closeMobileMenu(toggle, menu);
          } else {
            openMobileMenu(toggle, menu);
          }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
          if (!navbar.contains(e.target)) {
            closeMobileMenu(toggle, menu);
          }
        });

        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeMobileMenu(toggle, menu);
          }
        });
      }

      // User menu dropdown
      if (userToggle && userMenu) {
        userToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = userToggle.getAttribute('aria-expanded') === 'true';

          if (isExpanded) {
            closeUserMenu(userToggle, userMenu);
          } else {
            openUserMenu(userToggle, userMenu);
          }
        });

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
          if (!userToggle.contains(e.target) && !userMenu.contains(e.target)) {
            closeUserMenu(userToggle, userMenu);
          }
        });

        // Close user menu on ESC key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeUserMenu(userToggle, userMenu);
          }
        });
      }

      // Mark as initialized
      navbar.dataset.navbarInitialized = 'true';
    });
  }

  /**
   * Open mobile menu
   */
  function openMobileMenu(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    document.body.classList.add('navbar-open');

    // Dispatch custom event
    const event = new CustomEvent('navbar:mobileMenuOpened', {
      detail: { menu },
      bubbles: true
    });
    menu.dispatchEvent(event);
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.classList.remove('navbar-open');

    // Dispatch custom event
    const event = new CustomEvent('navbar:mobileMenuClosed', {
      detail: { menu },
      bubbles: true
    });
    menu.dispatchEvent(event);
  }

  /**
   * Open user menu
   */
  function openUserMenu(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');

    // Dispatch custom event
    const event = new CustomEvent('navbar:userMenuOpened', {
      detail: { menu },
      bubbles: true
    });
    menu.dispatchEvent(event);
  }

  /**
   * Close user menu
   */
  function closeUserMenu(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');

    // Dispatch custom event
    const event = new CustomEvent('navbar:userMenuClosed', {
      detail: { menu },
      bubbles: true
    });
    menu.dispatchEvent(event);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbars);
  } else {
    initNavbars();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initNavbars);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Navbar = {
    init: initNavbars
  };
})();
