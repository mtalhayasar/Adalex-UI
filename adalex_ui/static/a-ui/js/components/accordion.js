/**
 * Accordion Component
 *
 * Expandable/collapsible content panels with keyboard navigation.
 */

(function() {
  'use strict';

  window.AdalexUI = window.AdalexUI || {};

  const Accordion = {
    initialized: new WeakSet(),

    /**
     * Initialize all accordions
     */
    init: function() {
      document.querySelectorAll('[data-accordion]').forEach(accordion => {
        if (!this.initialized.has(accordion)) {
          this.initAccordion(accordion);
          this.initialized.add(accordion);
        }
      });
    },

    /**
     * Initialize a single accordion
     * @param {HTMLElement} accordion - The accordion container
     */
    initAccordion: function(accordion) {
      const multiple = accordion.hasAttribute('data-accordion-multiple');
      const triggers = accordion.querySelectorAll('[data-accordion-trigger]');

      triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle(trigger, accordion, multiple);
        });

        trigger.addEventListener('keydown', (e) => {
          this.handleKeydown(e, trigger, accordion);
        });
      });
    },

    /**
     * Toggle an accordion item
     * @param {HTMLElement} trigger - The trigger button
     * @param {HTMLElement} accordion - The accordion container
     * @param {boolean} multiple - Whether multiple items can be open
     */
    toggle: function(trigger, accordion, multiple) {
      const item = trigger.closest('[data-accordion-item]');
      const panel = item.querySelector('.a-accordion__panel');
      const isOpen = item.classList.contains('a-accordion__item--open');

      if (!multiple && !isOpen) {
        // Close other items
        accordion.querySelectorAll('[data-accordion-item]').forEach(otherItem => {
          if (otherItem !== item) {
            this.close(otherItem);
          }
        });
      }

      if (isOpen) {
        this.close(item);
      } else {
        this.open(item);
      }

      // Dispatch event
      accordion.dispatchEvent(new CustomEvent('accordion:toggle', {
        bubbles: true,
        detail: { item, isOpen: !isOpen }
      }));
    },

    /**
     * Open an accordion item
     * @param {HTMLElement} item - The accordion item
     */
    open: function(item) {
      const trigger = item.querySelector('[data-accordion-trigger]');
      const panel = item.querySelector('.a-accordion__panel');

      item.classList.add('a-accordion__item--open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.removeAttribute('hidden');
    },

    /**
     * Close an accordion item
     * @param {HTMLElement} item - The accordion item
     */
    close: function(item) {
      const trigger = item.querySelector('[data-accordion-trigger]');
      const panel = item.querySelector('.a-accordion__panel');

      item.classList.remove('a-accordion__item--open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('hidden', '');
    },

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - The keyboard event
     * @param {HTMLElement} trigger - The current trigger
     * @param {HTMLElement} accordion - The accordion container
     */
    handleKeydown: function(e, trigger, accordion) {
      const triggers = Array.from(accordion.querySelectorAll('[data-accordion-trigger]'));
      const currentIndex = triggers.indexOf(trigger);

      let targetIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          targetIndex = (currentIndex + 1) % triggers.length;
          triggers[targetIndex].focus();
          break;

        case 'ArrowUp':
          e.preventDefault();
          targetIndex = (currentIndex - 1 + triggers.length) % triggers.length;
          triggers[targetIndex].focus();
          break;

        case 'Home':
          e.preventDefault();
          triggers[0].focus();
          break;

        case 'End':
          e.preventDefault();
          triggers[triggers.length - 1].focus();
          break;
      }
    },

    /**
     * Open all accordion items
     * @param {HTMLElement} accordion - The accordion container
     */
    openAll: function(accordion) {
      accordion.querySelectorAll('[data-accordion-item]').forEach(item => {
        this.open(item);
      });
    },

    /**
     * Close all accordion items
     * @param {HTMLElement} accordion - The accordion container
     */
    closeAll: function(accordion) {
      accordion.querySelectorAll('[data-accordion-item]').forEach(item => {
        this.close(item);
      });
    }
  };

  window.AdalexUI.Accordion = Accordion;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Accordion.init());
  } else {
    Accordion.init();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', () => Accordion.init());
})();
