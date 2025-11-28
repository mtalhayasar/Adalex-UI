/**
 * Tabs Component JavaScript
 *
 * Handles tab switching with keyboard navigation and ARIA support.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'Tabs';

  /**
   * Get error handler utility (with fallback)
   */
  function getErrorHandler() {
    return window.AdalexUI && window.AdalexUI.ErrorHandler
      ? window.AdalexUI.ErrorHandler
      : {
          handle: (component, error, context) => {
            console.error(`[AdalexUI.${component}]`, error, context);
          },
          makeSafeEventHandler: (component, handler) => handler,
          safeExecute: (component, fn) => {
            try { return fn(); } catch (e) { console.error(`[AdalexUI.${component}]`, e); return null; }
          }
        };
  }

  /**
   * Get keyboard navigation utility (with fallback)
   */
  function getKeyboardNav() {
    return window.AdalexUI && window.AdalexUI.KeyboardNav
      ? window.AdalexUI.KeyboardNav
      : null;
  }

  // Store arrow navigation instances
  const arrowNavInstances = new WeakMap();

  /**
   * Initialize tabs functionality
   * Idempotent - can be called multiple times safely
   */
  function initTabs() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const tabContainers = document.querySelectorAll('[data-tabs]');

      tabContainers.forEach(container => {
        try {
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

          // Add click handlers with error boundaries
          tabs.forEach(tab => {
            const safeClickHandler = errorHandler.makeSafeEventHandler(
              COMPONENT_NAME,
              () => activateTab(container, tab),
              {
                level: errorHandler.levels?.MEDIUM || 'medium',
                recovery: errorHandler.strategies?.SILENT || 'silent',
                details: { action: 'tab_click' }
              }
            );
            tab.addEventListener('click', safeClickHandler);
          });

          // Set up enhanced keyboard navigation
          const keyboardNav = getKeyboardNav();
          if (keyboardNav) {
            try {
              // Use enhanced arrow navigation for tabs
              const arrowNav = keyboardNav.createArrowNavigation(tabList, {
                selector: '[role="tab"]:not([disabled])',
                horizontal: !container.classList.contains('a-tabs--vertical') || window.innerWidth <= 768,
                vertical: container.classList.contains('a-tabs--vertical') && window.innerWidth > 768,
                wrap: true,
                activateOnFocus: true // Activate tab when focused via keyboard
              });
              
              // Store instance for cleanup
              arrowNavInstances.set(container, arrowNav);
              
              // Listen for activation events from arrow navigation
              tabList.addEventListener('adalex:activate', errorHandler.makeSafeEventHandler(
                COMPONENT_NAME,
                (e) => {
                  const tab = e.detail.item;
                  if (tab && tab.matches('[role="tab"]')) {
                    activateTab(container, tab);
                  }
                },
                {
                  level: errorHandler.levels?.MEDIUM || 'medium',
                  recovery: errorHandler.strategies?.SILENT || 'silent',
                  details: { action: 'arrow_nav_activation' }
                }
              ));
              
            } catch (navError) {
              errorHandler.handle(COMPONENT_NAME, navError, {
                level: errorHandler.levels?.MEDIUM || 'medium',
                recovery: errorHandler.strategies?.SILENT || 'silent',
                details: { action: 'setup_arrow_navigation' }
              });
              
              // Fallback to basic keyboard navigation
              setupFallbackKeyboardNavigation(tabList, container, tabs, errorHandler);
            }
          } else {
            // Fallback for when keyboard navigation utility is not available
            setupFallbackKeyboardNavigation(tabList, container, tabs, errorHandler);
          }

          // Mark as initialized
          container.dataset.tabsInitialized = 'true';
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_single_tabs_container',
              containerId: container.id || 'unknown'
            }
          });
        }
      });
    });
  }

  /**
   * Set up fallback keyboard navigation for when enhanced navigation is not available
   * @param {HTMLElement} tabList - Tab list element
   * @param {HTMLElement} container - Tabs container
   * @param {NodeList} tabs - Tab elements
   * @param {Object} errorHandler - Error handler instance
   */
  function setupFallbackKeyboardNavigation(tabList, container, tabs, errorHandler) {
    const safeKeydownHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => handleKeydown(e, container, tabs),
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'fallback_keyboard_navigation' }
      }
    );
    
    tabList.addEventListener('keydown', safeKeydownHandler);
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
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
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
        
        // Announce tab change to screen readers
        if (keyboardNav) {
          keyboardNav.announce(`Switched to ${tab.textContent.trim()} tab`);
        }
      }

      // Dispatch custom event
      try {
        const event = new CustomEvent('tabs:changed', {
          detail: {
            tabId: tab.dataset.tabId,
            tab: tab,
            panel: targetPanel
          },
          bubbles: true
        });
        container.dispatchEvent(event);
      } catch (eventError) {
        errorHandler.handle(COMPONENT_NAME, eventError, {
          level: errorHandler.levels?.LOW || 'low',
          recovery: errorHandler.strategies?.SILENT || 'silent',
          details: { action: 'dispatch_tabs_changed_event' }
        });
      }
    });
  }

  /**
   * Programmatically switch to a tab
   * @param {HTMLElement|string} containerOrId - Container element or ID
   * @param {string} tabId - Tab ID to activate
   */
  function switchTo(containerOrId, tabId) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const container = typeof containerOrId === 'string'
        ? document.getElementById(containerOrId)
        : containerOrId;

      if (!container) {
        throw new Error(`Tabs container not found: ${containerOrId}`);
      }

      const tab = container.querySelector(`[data-tab-id="${tabId}"]`);
      if (tab) {
        activateTab(container, tab);
        // Focus the tab for keyboard users
        tab.focus();
      } else {
        throw new Error(`Tab not found: ${tabId}`);
      }
    });
  }

  /**
   * Clean up arrow navigation instances
   * @param {HTMLElement} container - Tabs container to clean up
   */
  function cleanupArrowNavigation(container) {
    const arrowNav = arrowNavInstances.get(container);
    if (arrowNav && arrowNav.destroy) {
      arrowNav.destroy();
      arrowNavInstances.delete(container);
    }
  }

  // Initialize on DOM ready with error handling
  const errorHandler = getErrorHandler();
  
  const safeInitTabs = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initTabs,
    {
      level: errorHandler.levels?.HIGH || 'high',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'dom_ready_init' }
    }
  );

  const safeHTMXInit = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initTabs,
    {
      level: errorHandler.levels?.MEDIUM || 'medium',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'htmx_after_swap_init' }
    }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitTabs);
  } else {
    safeInitTabs();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', safeHTMXInit);

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    // Clean up all arrow navigation instances
    document.querySelectorAll('[data-tabs]').forEach(cleanupArrowNavigation);
  });

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Tabs = {
    init: initTabs,
    switchTo: switchTo
  };
})();
