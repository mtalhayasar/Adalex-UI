/**
 * Tooltip Component JavaScript
 *
 * Handles tooltip show/hide on hover and focus.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  /**
   * Initialize tooltip functionality
   * Idempotent - can be called multiple times safely
   */
  function initTooltips() {
    const tooltipWrappers = document.querySelectorAll('[data-tooltip-wrapper]');

    tooltipWrappers.forEach(wrapper => {
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
      const showTooltip = () => {
        tooltip.setAttribute('aria-hidden', 'false');
      };

      // Hide tooltip
      const hideTooltip = () => {
        tooltip.setAttribute('aria-hidden', 'true');
      };

      // Mouse events
      trigger.addEventListener('mouseenter', showTooltip);
      trigger.addEventListener('mouseleave', hideTooltip);

      // Focus events (for keyboard navigation)
      trigger.addEventListener('focus', showTooltip);
      trigger.addEventListener('blur', hideTooltip);

      // Mark as initialized
      wrapper.dataset.tooltipInitialized = 'true';
    });
  }

  /**
   * Programmatically show a tooltip
   * @param {HTMLElement} wrapper - The tooltip wrapper element
   */
  function showTooltip(wrapper) {
    const tooltip = wrapper.querySelector('[data-tooltip]');
    if (tooltip) {
      tooltip.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Programmatically hide a tooltip
   * @param {HTMLElement} wrapper - The tooltip wrapper element
   */
  function hideTooltip(wrapper) {
    const tooltip = wrapper.querySelector('[data-tooltip]');
    if (tooltip) {
      tooltip.setAttribute('aria-hidden', 'true');
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips);
  } else {
    initTooltips();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initTooltips);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Tooltip = {
    init: initTooltips,
    show: showTooltip,
    hide: hideTooltip
  };
})();
