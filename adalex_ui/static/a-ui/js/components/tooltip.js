/**
 * Tooltip Component JavaScript
 *
 * Handles tooltip show/hide on hover and focus.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'Tooltip';

  // Store active tooltips for ESC handling
  const activeTooltips = new Set();

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

  /**
   * Initialize tooltip functionality
   * Idempotent - can be called multiple times safely
   */
  function initTooltips() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const tooltipWrappers = document.querySelectorAll('[data-tooltip-wrapper]');

      tooltipWrappers.forEach(wrapper => {
        try {
          // Skip if already initialized
          if (wrapper.dataset.tooltipInitialized === 'true') {
            return;
          }

          const trigger = wrapper.querySelector('[data-tooltip-trigger]');
          const tooltip = wrapper.querySelector('[data-tooltip]');

          if (!trigger || !tooltip) {
            return;
          }

          // Show tooltip
          const showTooltipLocal = () => {
            tooltip.setAttribute('aria-hidden', 'false');
            activeTooltips.add(wrapper);
            
            // Announce tooltip content to screen readers with a slight delay
            const keyboardNav = getKeyboardNav();
            if (keyboardNav && keyboardNav.announce) {
              setTimeout(() => {
                if (!tooltip.hasAttribute('aria-hidden') || tooltip.getAttribute('aria-hidden') === 'false') {
                  keyboardNav.announce(tooltip.textContent.trim());
                }
              }, 100);
            }
          };

          // Hide tooltip
          const hideTooltipLocal = () => {
            tooltip.setAttribute('aria-hidden', 'true');
            activeTooltips.delete(wrapper);
          };

          // Create safe event handlers
          const safeShowHandler = errorHandler.makeSafeEventHandler(
            COMPONENT_NAME,
            showTooltipLocal,
            {
              level: errorHandler.levels?.MEDIUM || 'medium',
              recovery: errorHandler.strategies?.SILENT || 'silent',
              details: { action: 'show_tooltip', wrapperId: wrapper.id || 'unknown' }
            }
          );

          const safeHideHandler = errorHandler.makeSafeEventHandler(
            COMPONENT_NAME,
            hideTooltipLocal,
            {
              level: errorHandler.levels?.MEDIUM || 'medium',
              recovery: errorHandler.strategies?.SILENT || 'silent',
              details: { action: 'hide_tooltip', wrapperId: wrapper.id || 'unknown' }
            }
          );

          // Keyboard event handler for ESC key
          const safeKeydownHandler = errorHandler.makeSafeEventHandler(
            COMPONENT_NAME,
            (e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                hideTooltipLocal();
                trigger.blur(); // Remove focus to fully dismiss tooltip
              }
            },
            {
              level: errorHandler.levels?.MEDIUM || 'medium',
              recovery: errorHandler.strategies?.SILENT || 'silent',
              details: { action: 'tooltip_keydown', wrapperId: wrapper.id || 'unknown' }
            }
          );

          // Mouse events
          trigger.addEventListener('mouseenter', safeShowHandler);
          trigger.addEventListener('mouseleave', safeHideHandler);

          // Focus events (for keyboard navigation)
          trigger.addEventListener('focus', safeShowHandler);
          trigger.addEventListener('blur', safeHideHandler);
          
          // Keyboard events
          trigger.addEventListener('keydown', safeKeydownHandler);

          // Mark as initialized
          wrapper.dataset.tooltipInitialized = 'true';
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_single_tooltip',
              wrapperId: wrapper.id || 'unknown'
            }
          });
        }
      });
    });
  }

  /**
   * Programmatically show a tooltip
   * @param {HTMLElement} wrapper - The tooltip wrapper element
   */
  function showTooltip(wrapper) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!wrapper) {
        throw new Error('No wrapper provided to showTooltip');
      }
      
      const tooltip = wrapper.querySelector('[data-tooltip]');
      if (tooltip) {
        tooltip.setAttribute('aria-hidden', 'false');
        activeTooltips.add(wrapper);
        
        // Announce tooltip content to screen readers with a slight delay
        if (keyboardNav && keyboardNav.announce) {
          setTimeout(() => {
            if (!tooltip.hasAttribute('aria-hidden') || tooltip.getAttribute('aria-hidden') === 'false') {
              keyboardNav.announce(tooltip.textContent.trim());
            }
          }, 100);
        }
      }
    });
  }

  /**
   * Programmatically hide a tooltip
   * @param {HTMLElement} wrapper - The tooltip wrapper element
   */
  function hideTooltip(wrapper) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!wrapper) {
        throw new Error('No wrapper provided to hideTooltip');
      }
      
      const tooltip = wrapper.querySelector('[data-tooltip]');
      if (tooltip) {
        tooltip.setAttribute('aria-hidden', 'true');
        activeTooltips.delete(wrapper);
      }
    });
  }

  /**
   * Hide all active tooltips (useful for ESC key handling)
   */
  function hideAllTooltips() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      activeTooltips.forEach(wrapper => {
        hideTooltip(wrapper);
      });
    });
  }

  /**
   * Set up global ESC key handling for tooltips
   */
  function setupGlobalKeyhandling() {
    const errorHandler = getErrorHandler();
    
    const safeGlobalEscHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => {
        if (e.key === 'Escape' && activeTooltips.size > 0) {
          e.preventDefault();
          hideAllTooltips();
        }
      },
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'global_esc_handler' }
      }
    );
    
    document.addEventListener('keydown', safeGlobalEscHandler);
  }

  // Initialize on DOM ready with error handling
  const errorHandler = getErrorHandler();
  
  const safeInitAll = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    () => {
      initTooltips();
      setupGlobalKeyhandling();
    },
    {
      level: errorHandler.levels?.HIGH || 'high',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'dom_ready_init' }
    }
  );

  const safeHTMXInit = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initTooltips,
    {
      level: errorHandler.levels?.MEDIUM || 'medium',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'htmx_after_swap_init' }
    }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitAll);
  } else {
    safeInitAll();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', safeHTMXInit);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Tooltip = {
    init: initTooltips,
    show: showTooltip,
    hide: hideTooltip,
    hideAll: hideAllTooltips
  };
})();
