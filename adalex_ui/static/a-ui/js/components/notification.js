/**
 * Notification/Toast Component JavaScript
 *
 * Handles notification display, stacking, and auto-dismiss.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  // Default settings
  const DEFAULTS = {
    duration: 5000,        // Auto-dismiss after 5 seconds (0 = no auto-dismiss)
    position: 'top-right', // Container position
    maxNotifications: 5    // Maximum visible notifications
  };

  // Container element reference
  let container = null;

  // Active notifications
  const notifications = [];

  /**
   * Get or create the notification container
   * @returns {HTMLElement} Container element
   */
  function getContainer() {
    if (container && document.body.contains(container)) {
      return container;
    }

    container = document.querySelector('.a-notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'a-notification-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(container);
    }

    return container;
  }

  /**
   * Show a notification
   * @param {Object} options - Notification options
   * @param {string} options.message - Notification message
   * @param {string} [options.type='info'] - Type: info, success, warning, error
   * @param {number} [options.duration=5000] - Auto-dismiss duration in ms (0 = no auto-dismiss)
   * @param {boolean} [options.dismissible=true] - Show close button
   * @returns {HTMLElement} Notification element
   */
  function show(options) {
    const {
      message,
      type = 'info',
      duration = DEFAULTS.duration,
      dismissible = true
    } = options;

    const containerEl = getContainer();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `a-notification a-notification--${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('aria-atomic', 'true');
    notification.dataset.notification = '';

    // Icon based on type
    const icons = {
      info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fill="currentColor"/></svg>',
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill="currentColor"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fill="currentColor"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill="currentColor"/></svg>'
    };

    notification.innerHTML = `
      <div class="a-notification__icon">${icons[type] || icons.info}</div>
      <div class="a-notification__content">
        <p class="a-notification__message">${escapeHtml(message)}</p>
      </div>
      ${dismissible ? `
        <button type="button" class="a-notification__close" aria-label="Close notification" data-notification-close>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12.207 4.207a1 1 0 00-1.414-1.414L8 5.586 5.207 2.793a1 1 0 00-1.414 1.414L6.586 7 3.793 9.793a1 1 0 101.414 1.414L8 8.414l2.793 2.793a1 1 0 001.414-1.414L9.414 7l2.793-2.793z" fill="currentColor"/>
          </svg>
        </button>
      ` : ''}
    `;

    // Add close button handler
    const closeBtn = notification.querySelector('[data-notification-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dismiss(notification));
    }

    // Add to container
    containerEl.appendChild(notification);
    notifications.push(notification);

    // Limit visible notifications
    while (notifications.length > DEFAULTS.maxNotifications) {
      const oldest = notifications.shift();
      dismiss(oldest);
    }

    // Auto-dismiss
    if (duration > 0) {
      notification._timeout = setTimeout(() => {
        dismiss(notification);
      }, duration);
    }

    // Dispatch event
    const event = new CustomEvent('notification:shown', {
      detail: { notification, type, message },
      bubbles: true
    });
    notification.dispatchEvent(event);

    return notification;
  }

  /**
   * Dismiss a notification
   * @param {HTMLElement} notification - Notification element to dismiss
   */
  function dismiss(notification) {
    if (!notification || notification.classList.contains('a-notification--exiting')) {
      return;
    }

    // Clear timeout if exists
    if (notification._timeout) {
      clearTimeout(notification._timeout);
    }

    // Add exiting class for animation
    notification.classList.add('a-notification--exiting');

    // Remove after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }

      // Remove from array
      const index = notifications.indexOf(notification);
      if (index > -1) {
        notifications.splice(index, 1);
      }

      // Dispatch event
      const event = new CustomEvent('notification:dismissed', {
        detail: { notification },
        bubbles: true
      });
      document.dispatchEvent(event);
    }, 200);
  }

  /**
   * Dismiss all notifications
   */
  function dismissAll() {
    [...notifications].forEach(dismiss);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize notifications from existing DOM elements
   * Idempotent - can be called multiple times safely
   */
  function initNotifications() {
    const existingNotifications = document.querySelectorAll('[data-notification]');

    existingNotifications.forEach(notification => {
      // Skip if already initialized
      if (notification.dataset.notificationInitialized === 'true') {
        return;
      }

      // Add close handler
      const closeBtn = notification.querySelector('[data-notification-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => dismiss(notification));
      }

      // Auto-dismiss if duration is set
      const duration = parseInt(notification.dataset.duration, 10);
      if (duration > 0) {
        notification._timeout = setTimeout(() => {
          dismiss(notification);
        }, duration);
      }

      notification.dataset.notificationInitialized = 'true';
    });
  }

  // Convenience methods
  function info(message, options = {}) {
    return show({ ...options, message, type: 'info' });
  }

  function success(message, options = {}) {
    return show({ ...options, message, type: 'success' });
  }

  function warning(message, options = {}) {
    return show({ ...options, message, type: 'warning' });
  }

  function error(message, options = {}) {
    return show({ ...options, message, type: 'error' });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
  } else {
    initNotifications();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initNotifications);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Notification = {
    init: initNotifications,
    show: show,
    dismiss: dismiss,
    dismissAll: dismissAll,
    info: info,
    success: success,
    warning: warning,
    error: error
  };
})();
