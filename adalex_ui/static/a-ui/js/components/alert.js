/**
 * Alert Component JavaScript
 *
 * Handles dismissible alert functionality with smooth animations.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  /**
   * Initialize alert dismiss functionality
   * Idempotent - can be called multiple times safely
   */
  function initAlerts() {
    const alerts = document.querySelectorAll('.a-alert');

    alerts.forEach(alert => {
      // Skip if already initialized
      if (alert.dataset.alertInitialized === 'true') {
        return;
      }

      const closeButton = alert.querySelector('[data-alert-close]');

      if (closeButton) {
        closeButton.addEventListener('click', () => {
          dismissAlert(alert);
        });

        // Mark as initialized
        alert.dataset.alertInitialized = 'true';
      }
    });
  }

  /**
   * Dismiss an alert with animation
   * @param {HTMLElement} alert - The alert element to dismiss
   */
  function dismissAlert(alert) {
    // Add dismissing class for animation
    alert.classList.add('is-dismissing');

    // Wait for animation to complete, then hide
    setTimeout(() => {
      alert.classList.add('is-hidden');

      // Dispatch custom event for tracking
      const event = new CustomEvent('alert:dismissed', {
        detail: { alert },
        bubbles: true
      });
      alert.dispatchEvent(event);
    }, 150); // Match CSS transition duration
  }

  /**
   * Programmatically create and show an alert
   * @param {Object} options - Alert options
   * @param {string} options.message - Alert message
   * @param {string} options.type - Alert type (info/success/warning/error)
   * @param {boolean} options.dismissible - Whether alert is dismissible
   * @param {HTMLElement} options.container - Container to append alert to
   * @param {number} options.autoDismiss - Auto dismiss after N milliseconds (optional)
   */
  function showAlert(options) {
    const {
      message,
      type = 'info',
      dismissible = true,
      container = document.body,
      autoDismiss = null
    } = options;

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `a-alert a-alert--${type}`;
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'polite');

    // Build alert HTML
    alert.innerHTML = `
      <div class="a-alert__icon">
        ${getIconSVG(type)}
      </div>
      <div class="a-alert__content">${message}</div>
      ${dismissible ? `
        <button type="button" class="a-alert__close" aria-label="Close alert" data-alert-close>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      ` : ''}
    `;

    // Append to container
    container.appendChild(alert);

    // Initialize dismiss functionality
    initAlerts();

    // Auto dismiss if specified
    if (autoDismiss && typeof autoDismiss === 'number') {
      setTimeout(() => {
        dismissAlert(alert);
      }, autoDismiss);
    }

    return alert;
  }

  /**
   * Get icon SVG based on alert type
   * @param {string} type - Alert type
   * @returns {string} SVG markup
   */
  function getIconSVG(type) {
    const icons = {
      info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 15C9.45 15 9 14.55 9 14V10C9 9.45 9.45 9 10 9C10.55 9 11 9.45 11 10V14C11 14.55 10.55 15 10 15ZM11 7H9V5H11V7Z" fill="currentColor"/></svg>',
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M1 17H19L10 1L1 17ZM11 14H9V12H11V14ZM11 10H9V6H11V10Z" fill="currentColor"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/></svg>'
    };
    return icons[type] || icons.info;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlerts);
  } else {
    initAlerts();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initAlerts);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Alert = {
    init: initAlerts,
    show: showAlert,
    dismiss: dismissAlert
  };
})();
