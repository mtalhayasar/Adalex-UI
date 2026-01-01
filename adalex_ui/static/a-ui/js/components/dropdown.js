/**
 * Dropdown Component
 *
 * Button-triggered dropdown menu with keyboard navigation.
 */

(function() {
  'use strict';

  window.AdalexUI = window.AdalexUI || {};

  const Dropdown = {
    initialized: new WeakSet(),
    openDropdown: null,

    /**
     * Initialize all dropdowns
     */
    init: function() {
      document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
        if (!this.initialized.has(dropdown)) {
          this.initDropdown(dropdown);
          this.initialized.add(dropdown);
        }
      });

      // Global click handler for closing dropdowns
      document.addEventListener('click', (e) => {
        if (this.openDropdown && !this.openDropdown.contains(e.target)) {
          this.close(this.openDropdown);
        }
      });

      // Global escape handler
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.openDropdown) {
          this.close(this.openDropdown);
        }
      });
    },

    /**
     * Initialize a single dropdown
     * @param {HTMLElement} dropdown - The dropdown container
     */
    initDropdown: function(dropdown) {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const menu = dropdown.querySelector('.a-dropdown__menu');
      const items = menu.querySelectorAll('.a-dropdown__item:not(.a-dropdown__item--disabled)');

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle(dropdown);
      });

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.open(dropdown);
          if (items.length > 0) {
            items[0].focus();
          }
        }
      });

      // Menu item keyboard navigation
      items.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
          this.handleMenuKeydown(e, items, index, dropdown);
        });

        item.addEventListener('click', () => {
          this.close(dropdown);
        });
      });
    },

    /**
     * Toggle dropdown
     * @param {HTMLElement} dropdown - The dropdown container
     */
    toggle: function(dropdown) {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        this.close(dropdown);
      } else {
        this.open(dropdown);
      }
    },

    /**
     * Open dropdown
     * @param {HTMLElement} dropdown - The dropdown container
     */
    open: function(dropdown) {
      // Close any other open dropdown
      if (this.openDropdown && this.openDropdown !== dropdown) {
        this.close(this.openDropdown);
      }

      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const menu = dropdown.querySelector('.a-dropdown__menu');

      trigger.setAttribute('aria-expanded', 'true');
      menu.removeAttribute('hidden');
      this.openDropdown = dropdown;

      dropdown.dispatchEvent(new CustomEvent('dropdown:open', {
        bubbles: true,
        detail: { dropdown }
      }));
    },

    /**
     * Close dropdown
     * @param {HTMLElement} dropdown - The dropdown container
     */
    close: function(dropdown) {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const menu = dropdown.querySelector('.a-dropdown__menu');

      trigger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('hidden', '');

      if (this.openDropdown === dropdown) {
        this.openDropdown = null;
      }

      dropdown.dispatchEvent(new CustomEvent('dropdown:close', {
        bubbles: true,
        detail: { dropdown }
      }));
    },

    /**
     * Handle menu item keyboard navigation
     * @param {KeyboardEvent} e - The keyboard event
     * @param {NodeList} items - All menu items
     * @param {number} currentIndex - Current item index
     * @param {HTMLElement} dropdown - The dropdown container
     */
    handleMenuKeydown: function(e, items, currentIndex, dropdown) {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
          break;

        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();
          break;

        case 'Home':
          e.preventDefault();
          items[0].focus();
          break;

        case 'End':
          e.preventDefault();
          items[items.length - 1].focus();
          break;

        case 'Tab':
          this.close(dropdown);
          break;

        case 'Escape':
          e.preventDefault();
          this.close(dropdown);
          trigger.focus();
          break;
      }
    }
  };

  window.AdalexUI.Dropdown = Dropdown;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Dropdown.init());
  } else {
    Dropdown.init();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', () => Dropdown.init());
})();
