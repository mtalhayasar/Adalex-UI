/**
 * Tag Component
 *
 * Dismissible tags/chips.
 */

(function() {
  'use strict';

  window.AdalexUI = window.AdalexUI || {};

  const Tag = {
    initialized: new WeakSet(),

    /**
     * Initialize all dismissible tags
     */
    init: function() {
      document.querySelectorAll('[data-tag-dismissible]').forEach(tag => {
        if (!this.initialized.has(tag)) {
          this.initTag(tag);
          this.initialized.add(tag);
        }
      });
    },

    /**
     * Initialize a single tag
     * @param {HTMLElement} tag - The tag element
     */
    initTag: function(tag) {
      const dismissBtn = tag.querySelector('[data-tag-dismiss]');

      if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.dismiss(tag);
        });

        dismissBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.dismiss(tag);
          }
        });
      }
    },

    /**
     * Dismiss a tag
     * @param {HTMLElement} tag - The tag element
     */
    dismiss: function(tag) {
      // Dispatch event before removal
      const event = new CustomEvent('tag:dismiss', {
        bubbles: true,
        cancelable: true,
        detail: { tag, id: tag.id }
      });

      if (tag.dispatchEvent(event)) {
        // Animate out
        tag.style.transition = 'opacity var(--transition-fast), transform var(--transition-fast)';
        tag.style.opacity = '0';
        tag.style.transform = 'scale(0.8)';

        setTimeout(() => {
          tag.remove();

          // Dispatch removed event
          document.dispatchEvent(new CustomEvent('tag:removed', {
            bubbles: true,
            detail: { id: tag.id }
          }));
        }, 150);
      }
    },

    /**
     * Dismiss a tag by ID
     * @param {string} id - The tag ID
     */
    dismissById: function(id) {
      const tag = document.getElementById(id);
      if (tag) {
        this.dismiss(tag);
      }
    }
  };

  window.AdalexUI.Tag = Tag;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Tag.init());
  } else {
    Tag.init();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', () => Tag.init());
})();
