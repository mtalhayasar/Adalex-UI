/**
 * Alert Component JavaScript
 *
 * Handles dismissible alert functionality with smooth animations.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'Alert';

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
   * Initialize alert dismiss functionality
   * Idempotent - can be called multiple times safely
   */
  function initAlerts() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const alerts = document.querySelectorAll('.a-alert');

      alerts.forEach(alert => {
        try {
          // Skip if already initialized
          if (alert.dataset.alertInitialized === 'true') {
            return;
          }

          const closeButton = alert.querySelector('[data-alert-close]');

          if (closeButton) {
            const safeClickHandler = errorHandler.makeSafeEventHandler(
              COMPONENT_NAME,
              () => dismissAlert(alert),
              {
                level: errorHandler.levels?.MEDIUM || 'medium',
                recovery: errorHandler.strategies?.SILENT || 'silent',
                details: { action: 'dismiss_alert_click' }
              }
            );

            const safeKeydownHandler = errorHandler.makeSafeEventHandler(
              COMPONENT_NAME,
              (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dismissAlert(alert);
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  dismissAlert(alert);
                }
              },
              {
                level: errorHandler.levels?.MEDIUM || 'medium',
                recovery: errorHandler.strategies?.SILENT || 'silent',
                details: { action: 'dismiss_alert_keyboard' }
              }
            );

            closeButton.addEventListener('click', safeClickHandler);
            closeButton.addEventListener('keydown', safeKeydownHandler);

            // Mark as initialized
            alert.dataset.alertInitialized = 'true';
          }
          
          // Set up global ESC key handling for this alert
          const globalKeydownHandler = errorHandler.makeSafeEventHandler(
            COMPONENT_NAME,
            (e) => {
              if (e.key === 'Escape' && alert.contains(document.activeElement)) {
                e.preventDefault();
                dismissAlert(alert);
              }
            },
            {
              level: errorHandler.levels?.MEDIUM || 'medium',
              recovery: errorHandler.strategies?.SILENT || 'silent',
              details: { action: 'global_alert_esc' }
            }
          );
          
          document.addEventListener('keydown', globalKeydownHandler);
          
          // Store handler for cleanup
          alert.dataset.globalKeydownHandler = globalKeydownHandler;
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_single_alert',
              alertId: alert.id || 'unknown'
            }
          });
        }
      });
    });
  }

  /**
   * Dismiss an alert with animation
   * @param {HTMLElement} alert - The alert element to dismiss
   */
  function dismissAlert(alert) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!alert || !alert.classList) {
        throw new Error('Invalid alert element provided for dismissal');
      }

      // Add dismissing class for animation
      alert.classList.add('is-dismissing');

      // Wait for animation to complete, then hide
      setTimeout(() => {
        try {
          alert.classList.add('is-hidden');

          // Dispatch custom event for tracking
          const event = new CustomEvent('alert:dismissed', {
            detail: { alert },
            bubbles: true
          });
          alert.dispatchEvent(event);
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: {
              action: 'dismiss_alert_animation_complete',
              alertId: alert.id || 'unknown'
            }
          });
        }
      }, 150); // Match CSS transition duration
    });
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
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!options || typeof options !== 'object') {
        throw new Error('Invalid options provided to showAlert');
      }

      const {
        message,
        type = 'info',
        dismissible = true,
        container = document.body,
        autoDismiss = null
      } = options;

      if (!message) {
        throw new Error('Alert message is required');
      }

      if (!container || !container.appendChild) {
        throw new Error('Invalid container provided for alert');
      }

      // Create alert element
      const alert = document.createElement('div');
      alert.className = `a-alert a-alert--${type}`;
      alert.setAttribute('role', 'alert');
      alert.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
      alert.setAttribute('aria-atomic', 'true');
      
      // Generate unique ID for accessibility
      const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      alert.id = alertId;

      try {
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
            try {
              dismissAlert(alert);
            } catch (dismissError) {
              errorHandler.handle(COMPONENT_NAME, dismissError, {
                level: errorHandler.levels?.MEDIUM || 'medium',
                recovery: errorHandler.strategies?.SILENT || 'silent',
                details: {
                  action: 'auto_dismiss_alert',
                  autoDismissTime: autoDismiss
                }
              });
            }
          }, autoDismiss);
        }

        return alert;
      } catch (htmlError) {
        // Clean up partial creation
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
        throw htmlError;
      }
    });
  }

  /**
   * Get icon SVG based on alert type
   * @param {string} type - Alert type
   * @returns {string} SVG markup
   */
  function getIconSVG(type) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const icons = {
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 15C9.45 15 9 14.55 9 14V10C9 9.45 9.45 9 10 9C10.55 9 11 9.45 11 10V14C11 14.55 10.55 15 10 15ZM11 7H9V5H11V7Z" fill="currentColor"/></svg>',
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M1 17H19L10 1L1 17ZM11 14H9V12H11V14ZM11 10H9V6H11V10Z" fill="currentColor"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/></svg>'
      };
      return icons[type] || icons.info;
    }) || '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" fill="currentColor"/></svg>'; // Fallback icon
  }

  // Initialize on DOM ready with error handling
  const errorHandler = getErrorHandler();
  
  const safeInitAlerts = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initAlerts,
    {
      level: errorHandler.levels?.HIGH || 'high',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'dom_ready_init' }
    }
  );

  const safeHTMXInit = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initAlerts,
    {
      level: errorHandler.levels?.MEDIUM || 'medium',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'htmx_after_swap_init' }
    }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitAlerts);
  } else {
    safeInitAlerts();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', safeHTMXInit);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Alert = {
    init: initAlerts,
    show: showAlert,
    dismiss: dismissAlert
  };
})();
