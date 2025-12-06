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
      const dropdownToggles = navbar.querySelectorAll('[data-navbar-dropdown-toggle]');
      const dropdownMenus = navbar.querySelectorAll('[data-navbar-dropdown-menu]');

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

      // Dropdown menus
      dropdownToggles.forEach((dropdownToggle, index) => {
        const dropdownMenu = dropdownMenus[index];
        
        if (!dropdownMenu) return;

        dropdownToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';

          // Close all other dropdowns first
          closeAllDropdowns(navbar);

          if (isExpanded) {
            closeDropdown(dropdownToggle, dropdownMenu);
          } else {
            openDropdown(dropdownToggle, dropdownMenu);
          }
        });

        // Keyboard navigation
        dropdownToggle.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dropdownToggle.click();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            openDropdown(dropdownToggle, dropdownMenu);
            const firstLink = dropdownMenu.querySelector('.a-navbar__dropdown-link');
            if (firstLink) firstLink.focus();
          }
        });

        // Dropdown menu keyboard navigation
        const dropdownLinks = dropdownMenu.querySelectorAll('.a-navbar__dropdown-link');
        dropdownLinks.forEach((link, linkIndex) => {
          link.addEventListener('keydown', (e) => {
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                const nextLink = dropdownLinks[linkIndex + 1];
                if (nextLink) nextLink.focus();
                break;
              case 'ArrowUp':
                e.preventDefault();
                if (linkIndex === 0) {
                  dropdownToggle.focus();
                } else {
                  const prevLink = dropdownLinks[linkIndex - 1];
                  if (prevLink) prevLink.focus();
                }
                break;
              case 'Escape':
                e.preventDefault();
                closeDropdown(dropdownToggle, dropdownMenu);
                dropdownToggle.focus();
                break;
            }
          });
        });
      });

      // Close dropdowns when clicking outside
      document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
          closeAllDropdowns(navbar);
        }
      });

      // Close dropdowns on ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllDropdowns(navbar);
        }
      });

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

  /**
   * Open dropdown menu
   */
  function openDropdown(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');

    // Dispatch custom event
    const event = new CustomEvent('navbar:dropdownOpened', {
      detail: { menu },
      bubbles: true
    });
    menu.dispatchEvent(event);
  }

  /**
   * Close dropdown menu
   */
  function closeDropdown(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');

    // Dispatch custom event
    const event = new CustomEvent('navbar:dropdownClosed', {
      detail: { menu },
      bubbles: true
    });
    menu.dispatchEvent(event);
  }

  /**
   * Close all dropdown menus in a navbar
   */
  function closeAllDropdowns(navbar) {
    const dropdownToggles = navbar.querySelectorAll('[data-navbar-dropdown-toggle]');
    const dropdownMenus = navbar.querySelectorAll('[data-navbar-dropdown-menu]');

    dropdownToggles.forEach((toggle, index) => {
      const menu = dropdownMenus[index];
      if (menu && toggle.getAttribute('aria-expanded') === 'true') {
        closeDropdown(toggle, menu);
      }
    });
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
