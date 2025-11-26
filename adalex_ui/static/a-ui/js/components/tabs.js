/**
 * Tabs Component JavaScript
 *
 * Handles tab switching with keyboard navigation and ARIA support.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  /**
   * Initialize tabs functionality
   * Idempotent - can be called multiple times safely
   */
  function initTabs() {
    const tabContainers = document.querySelectorAll('[data-tabs]');

    tabContainers.forEach(container => {
      // Skip if already initialized
      if (container.dataset.tabsInitialized === 'true') {
        return;
      }

      const tabList = container.querySelector('[role="tablist"]');
      const tabs = container.querySelectorAll('[role="tab"]');
      const panels = container.querySelectorAll('[role="tabpanel"]');

      if (!tabList || tabs.length === 0) {
        return;
      }

      // Add click handlers
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          activateTab(container, tab);
        });
      });

      // Add keyboard navigation
      tabList.addEventListener('keydown', (e) => {
        handleKeydown(e, container, tabs);
      });

      // Mark as initialized
      container.dataset.tabsInitialized = 'true';
    });
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   * @param {HTMLElement} container - Tabs container
   * @param {NodeList} tabs - Tab elements
   */
  function handleKeydown(e, container, tabs) {
    const currentTab = document.activeElement;
    const tabArray = Array.from(tabs);
    const currentIndex = tabArray.indexOf(currentTab);

    if (currentIndex === -1) {
      return;
    }

    let newIndex = currentIndex;

    // Determine direction based on orientation
    const tabList = container.querySelector('[role="tablist"]');
    const isVertical = container.classList.contains('a-tabs--vertical') &&
                       window.innerWidth > 768;

    switch (e.key) {
      case 'ArrowLeft':
        if (!isVertical) {
          e.preventDefault();
          newIndex = currentIndex === 0 ? tabArray.length - 1 : currentIndex - 1;
        }
        break;

      case 'ArrowRight':
        if (!isVertical) {
          e.preventDefault();
          newIndex = currentIndex === tabArray.length - 1 ? 0 : currentIndex + 1;
        }
        break;

      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          newIndex = currentIndex === 0 ? tabArray.length - 1 : currentIndex - 1;
        }
        break;

      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          newIndex = currentIndex === tabArray.length - 1 ? 0 : currentIndex + 1;
        }
        break;

      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newIndex = tabArray.length - 1;
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        activateTab(container, currentTab);
        return;

      default:
        return;
    }

    // Skip disabled tabs
    let attempts = 0;
    while (tabArray[newIndex].disabled && attempts < tabArray.length) {
      newIndex = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
        ? (newIndex === 0 ? tabArray.length - 1 : newIndex - 1)
        : (newIndex === tabArray.length - 1 ? 0 : newIndex + 1);
      attempts++;
    }

    // Focus and optionally activate new tab
    if (newIndex !== currentIndex && !tabArray[newIndex].disabled) {
      tabArray[newIndex].focus();
      // Activate on focus (recommended for usability)
      activateTab(container, tabArray[newIndex]);
    }
  }

  /**
   * Activate a tab
   * @param {HTMLElement} container - Tabs container
   * @param {HTMLElement} tab - Tab to activate
   */
  function activateTab(container, tab) {
    if (tab.disabled) {
      return;
    }

    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');
    const targetId = tab.getAttribute('aria-controls');
    const targetPanel = container.querySelector(`#${targetId}`);

    // Deactivate all tabs
    tabs.forEach(t => {
      t.classList.remove('a-tabs__tab--active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });

    // Hide all panels
    panels.forEach(p => {
      p.classList.remove('a-tabs__panel--active');
      p.setAttribute('hidden', '');
    });

    // Activate selected tab
    tab.classList.add('a-tabs__tab--active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    // Show selected panel
    if (targetPanel) {
      targetPanel.classList.add('a-tabs__panel--active');
      targetPanel.removeAttribute('hidden');
    }

    // Dispatch custom event
    const event = new CustomEvent('tabs:changed', {
      detail: {
        tabId: tab.dataset.tabId,
        tab: tab,
        panel: targetPanel
      },
      bubbles: true
    });
    container.dispatchEvent(event);
  }

  /**
   * Programmatically switch to a tab
   * @param {HTMLElement|string} containerOrId - Container element or ID
   * @param {string} tabId - Tab ID to activate
   */
  function switchTo(containerOrId, tabId) {
    const container = typeof containerOrId === 'string'
      ? document.getElementById(containerOrId)
      : containerOrId;

    if (!container) {
      console.error('Tabs container not found:', containerOrId);
      return;
    }

    const tab = container.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      activateTab(container, tab);
    } else {
      console.error('Tab not found:', tabId);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initTabs);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Tabs = {
    init: initTabs,
    switchTo: switchTo
  };
})();
