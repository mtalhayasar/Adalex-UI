/**
 * Keyboard Navigation Utility for Adalex UI
 *
 * Provides comprehensive keyboard navigation support including:
 * - Focus trap management for modals and drawers
 * - Arrow key navigation for menus and tabs
 * - Roving tabindex implementation
 * - Focus restoration utilities
 * - WAI-ARIA keyboard pattern support
 */

(function() {
  'use strict';

  // Key codes for cross-browser compatibility
  const KEYS = {
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    ARROW_LEFT: 37,
    ARROW_RIGHT: 39,
    ENTER: 13,
    SPACE: 32,
    ESCAPE: 27,
    TAB: 9,
    HOME: 36,
    END: 35,
    PAGE_UP: 33,
    PAGE_DOWN: 34
  };

  // Focusable selectors
  const FOCUSABLE_SELECTORS = [
    'button',
    '[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  /**
   * Focus Trap Manager
   * Manages focus within a container element, typically for modals and drawers
   */
  class FocusTrap {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        autoFocus: true,
        returnFocusOnDeactivate: true,
        escapeDeactivates: true,
        ...options
      };
      this.previousFocus = null;
      this.isActive = false;
      this.focusableElements = [];
      
      // Bound methods for event listeners
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleFocusIn = this.handleFocusIn.bind(this);
    }

    /**
     * Activate the focus trap
     */
    activate() {
      if (this.isActive) return;
      
      this.previousFocus = document.activeElement;
      this.updateFocusableElements();
      
      if (this.options.autoFocus && this.focusableElements.length > 0) {
        this.focusableElements[0].focus();
      }
      
      document.addEventListener('keydown', this.handleKeyDown, true);
      document.addEventListener('focusin', this.handleFocusIn, true);
      
      this.isActive = true;
    }

    /**
     * Deactivate the focus trap
     */
    deactivate() {
      if (!this.isActive) return;
      
      document.removeEventListener('keydown', this.handleKeyDown, true);
      document.removeEventListener('focusin', this.handleFocusIn, true);
      
      if (this.options.returnFocusOnDeactivate && this.previousFocus) {
        this.previousFocus.focus();
      }
      
      this.isActive = false;
    }

    /**
     * Update the list of focusable elements
     */
    updateFocusableElements() {
      this.focusableElements = Array.from(
        this.element.querySelectorAll(FOCUSABLE_SELECTORS)
      ).filter(el => {
        return !el.disabled && 
               !el.hasAttribute('hidden') && 
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
      });
    }

    /**
     * Handle keydown events for tab cycling and escape
     */
    handleKeyDown(event) {
      if (event.keyCode === KEYS.ESCAPE && this.options.escapeDeactivates) {
        event.preventDefault();
        this.deactivate();
        return;
      }

      if (event.keyCode === KEYS.TAB) {
        this.handleTabKey(event);
      }
    }

    /**
     * Handle tab key for cycling focus
     */
    handleTabKey(event) {
      this.updateFocusableElements();
      
      if (this.focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];
      const isShiftTab = event.shiftKey;

      if (isShiftTab && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!isShiftTab && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    /**
     * Handle focus events to ensure focus stays within trap
     */
    handleFocusIn(event) {
      const target = event.target;
      
      if (!this.element.contains(target)) {
        this.updateFocusableElements();
        if (this.focusableElements.length > 0) {
          this.focusableElements[0].focus();
        }
      }
    }
  }

  /**
   * Arrow Navigation Manager
   * Provides arrow key navigation for lists, menus, and tab-like interfaces
   */
  class ArrowNavigation {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        selector: '[role="menuitem"], [role="tab"], [role="option"], button, a',
        horizontal: false,
        vertical: true,
        wrap: true,
        activateOnFocus: false,
        ...options
      };
      
      this.items = [];
      this.currentIndex = -1;
      
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.init();
    }

    /**
     * Initialize arrow navigation
     */
    init() {
      this.updateItems();
      this.container.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Update the list of navigable items
     */
    updateItems() {
      this.items = Array.from(this.container.querySelectorAll(this.options.selector))
        .filter(item => !item.disabled && !item.hasAttribute('hidden'));
      
      // Set up roving tabindex
      this.items.forEach((item, index) => {
        item.tabIndex = index === 0 ? 0 : -1;
        item.addEventListener('focus', () => {
          this.setCurrentIndex(index);
        });
      });
    }

    /**
     * Handle keydown events for arrow navigation
     */
    handleKeyDown(event) {
      const { keyCode } = event;
      let shouldHandle = false;
      let direction = 0;

      if (this.options.horizontal && (keyCode === KEYS.ARROW_LEFT || keyCode === KEYS.ARROW_RIGHT)) {
        shouldHandle = true;
        direction = keyCode === KEYS.ARROW_LEFT ? -1 : 1;
      }

      if (this.options.vertical && (keyCode === KEYS.ARROW_UP || keyCode === KEYS.ARROW_DOWN)) {
        shouldHandle = true;
        direction = keyCode === KEYS.ARROW_UP ? -1 : 1;
      }

      if (keyCode === KEYS.HOME) {
        shouldHandle = true;
        this.focusItem(0);
      }

      if (keyCode === KEYS.END) {
        shouldHandle = true;
        this.focusItem(this.items.length - 1);
      }

      if (shouldHandle) {
        event.preventDefault();
        if (direction !== 0) {
          this.moveByDirection(direction);
        }
      }

      // Handle activation keys
      if ((keyCode === KEYS.ENTER || keyCode === KEYS.SPACE) && 
          this.currentIndex >= 0 && 
          this.options.activateOnFocus) {
        event.preventDefault();
        this.activateCurrentItem();
      }
    }

    /**
     * Move focus by direction
     */
    moveByDirection(direction) {
      let newIndex = this.currentIndex + direction;
      
      if (this.options.wrap) {
        if (newIndex < 0) {
          newIndex = this.items.length - 1;
        } else if (newIndex >= this.items.length) {
          newIndex = 0;
        }
      } else {
        newIndex = Math.max(0, Math.min(this.items.length - 1, newIndex));
      }
      
      this.focusItem(newIndex);
    }

    /**
     * Focus a specific item by index
     */
    focusItem(index) {
      if (index < 0 || index >= this.items.length) return;
      
      this.setCurrentIndex(index);
      this.items[index].focus();
    }

    /**
     * Set current index and update tabindex
     */
    setCurrentIndex(index) {
      // Update tabindex for roving tabindex pattern
      this.items.forEach((item, i) => {
        item.tabIndex = i === index ? 0 : -1;
      });
      
      this.currentIndex = index;
    }

    /**
     * Activate the current item (click or custom activation)
     */
    activateCurrentItem() {
      const currentItem = this.items[this.currentIndex];
      if (currentItem) {
        if (typeof currentItem.click === 'function') {
          currentItem.click();
        } else {
          // Dispatch custom activation event
          const event = new CustomEvent('adalex:activate', {
            bubbles: true,
            detail: { item: currentItem, index: this.currentIndex }
          });
          currentItem.dispatchEvent(event);
        }
      }
    }

    /**
     * Destroy arrow navigation
     */
    destroy() {
      this.container.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * Focus Restoration Utility
   * Manages focus restoration for dynamic content
   */
  class FocusRestoration {
    constructor() {
      this.focusHistory = [];
    }

    /**
     * Save current focus
     */
    save(identifier) {
      this.focusHistory.push({
        identifier,
        element: document.activeElement,
        timestamp: Date.now()
      });
    }

    /**
     * Restore focus by identifier
     */
    restore(identifier) {
      const entry = this.focusHistory
        .reverse()
        .find(item => item.identifier === identifier);
      
      if (entry && entry.element && typeof entry.element.focus === 'function') {
        try {
          entry.element.focus();
          return true;
        } catch (e) {
          console.warn('Failed to restore focus:', e);
        }
      }
      return false;
    }

    /**
     * Clear focus history for identifier
     */
    clear(identifier) {
      this.focusHistory = this.focusHistory.filter(
        item => item.identifier !== identifier
      );
    }
  }

  /**
   * Keyboard Navigation Utilities
   */
  const KeyboardNav = {
    /**
     * Create a new focus trap
     */
    createFocusTrap(element, options) {
      return new FocusTrap(element, options);
    },

    /**
     * Create arrow navigation for a container
     */
    createArrowNavigation(container, options) {
      return new ArrowNavigation(container, options);
    },

    /**
     * Create focus restoration manager
     */
    createFocusRestoration() {
      return new FocusRestoration();
    },

    /**
     * Check if an element is focusable
     */
    isFocusable(element) {
      if (!element || element.disabled || element.hasAttribute('hidden')) {
        return false;
      }
      
      return element.matches(FOCUSABLE_SELECTORS);
    },

    /**
     * Get all focusable elements within a container
     */
    getFocusableElements(container) {
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS))
        .filter(el => this.isFocusable(el));
    },

    /**
     * Focus the first focusable element in a container
     */
    focusFirst(container) {
      const focusable = this.getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
        return true;
      }
      return false;
    },

    /**
     * Focus the last focusable element in a container
     */
    focusLast(container) {
      const focusable = this.getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[focusable.length - 1].focus();
        return true;
      }
      return false;
    },

    /**
     * Announce text to screen readers
     */
    announce(message, priority = 'polite') {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      
      document.body.appendChild(announcer);
      announcer.textContent = message;
      
      // Remove after announcement
      setTimeout(() => {
        if (document.body.contains(announcer)) {
          document.body.removeChild(announcer);
        }
      }, 1000);
    },

    // Key constants for external use
    KEYS,
    
    // Focusable selector for external use
    FOCUSABLE_SELECTORS
  };

  // Initialize and expose API
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.KeyboardNav = KeyboardNav;

  // Global focus restoration instance
  window.AdalexUI.FocusRestoration = new FocusRestoration();

})();