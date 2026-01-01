/**
 * Adalex UI - Main JavaScript
 *
 * This file imports all component JavaScript modules.
 * Components are loaded in a modular, HTMX-compatible way.
 *
 * Usage:
 *   Include this file in your Django templates:
 *   <script src="{% static 'a-ui/js/utils/error-handler.js' %}"></script>
 *   <script src="{% static 'a-ui/js/utils/keyboard-nav.js' %}"></script>
 *   <script src="{% static 'a-ui/js/main.js' %}" defer></script>
 *
 * All components are initialized automatically on DOMContentLoaded
 * and re-initialized after HTMX swaps.
 */

(function() {
  'use strict';

  // Ensure essential utilities are available
  if (!window.AdalexUI || !window.AdalexUI.ErrorHandler) {
    console.warn('[AdalexUI.Main] Error handler not available. Components may not have proper error boundaries.');
  }
  
  if (!window.AdalexUI || !window.AdalexUI.KeyboardNav) {
    console.warn('[AdalexUI.Main] Keyboard navigation utility not available. Accessibility features may be limited.');
  }

  // Load all component scripts dynamically
  // This ensures all components are available when main.js runs
  const componentScripts = [
    'utils/error-handler.js',
    'utils/keyboard-nav.js',
    'components/accordion.js',
    'components/alert.js',
    'components/auth.js',
    'components/carousel.js',
    'components/confirm.js',
    'components/drawer.js',
    'components/dropdown.js',
    'components/file_upload.js',
    'components/form.js',
    'components/loading.js',
    'components/modal.js',
    'components/navbar.js',
    'components/notification.js',
    'components/sidebar.js',
    'components/table.js',
    'components/tabs.js',
    'components/tag.js',
    'components/tooltip.js'
  ];

  // Function to load scripts dynamically
  function loadComponentScripts() {
    return Promise.all(componentScripts.map(script => {
      return new Promise((resolve, reject) => {
        const scriptElement = document.createElement('script');
        scriptElement.src = `/static/a-ui/js/${script}`;
        scriptElement.onload = resolve;
        scriptElement.onerror = reject;
        document.head.appendChild(scriptElement);
      });
    }));
  }

  /**
   * Initialize all components
   * Called on page load and after HTMX swaps
   */
  function initializeComponents() {
    const errorHandler = window.AdalexUI && window.AdalexUI.ErrorHandler;
    
    // Define components to initialize with their safe initialization
    const components = [
      { name: 'Accordion', init: () => window.AdalexUI.Accordion?.init?.() },
      { name: 'Alert', init: () => window.AdalexUI.Alert?.init?.() },
      { name: 'Auth', init: () => window.AdalexUI.Auth?.init?.() },
      { name: 'Carousel', init: () => window.initCarousels?.() },
      { name: 'ConfirmDialog', init: () => window.AdalexUI.ConfirmDialog?.init?.() },
      { name: 'Drawer', init: () => window.AdalexUI.Drawer?.init?.() },
      { name: 'Dropdown', init: () => window.AdalexUI.Dropdown?.init?.() },
      {
        name: 'FileUpload',
        init: () => {
          if (window.AdalexUI?.initFileUpload) {
            document.querySelectorAll('[data-file-upload]').forEach(window.AdalexUI.initFileUpload);
          }
        }
      },
      { name: 'Form', init: () => window.AdalexUI.Form?.init?.() },
      { name: 'Loading', init: () => window.AdalexUI.Loading?.init?.() },
      { name: 'Modal', init: () => window.AdalexUI.Modal?.init?.() },
      { name: 'Tooltip', init: () => window.AdalexUI.Tooltip?.init?.() },
      { name: 'Navbar', init: () => window.AdalexUI.Navbar?.init?.() },
      { name: 'Sidebar', init: () => window.AdalexUI.Sidebar?.init?.() },
      { name: 'Table', init: () => window.AdalexUI.Table?.init?.() },
      { name: 'Tabs', init: () => window.AdalexUI.Tabs?.init?.() },
      { name: 'Tag', init: () => window.AdalexUI.Tag?.init?.() },
      { name: 'Notification', init: () => window.AdalexUI.Notification?.init?.() }
    ];
    
    // Initialize each component with error boundaries
    components.forEach(component => {
      try {
        if (errorHandler) {
          errorHandler.safeExecute('Main', component.init, {
            level: errorHandler.levels?.HIGH || 'high',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_component',
              componentName: component.name
            }
          });
        } else {
          // Fallback if error handler not available
          component.init();
        }
      } catch (error) {
        console.error(`[AdalexUI.Main] Failed to initialize ${component.name}:`, error);
      }
    });
  }

  // Initialize on DOM ready with error handling
  const errorHandler = window.AdalexUI && window.AdalexUI.ErrorHandler;
  
  const safeInitializeComponents = errorHandler ? 
    errorHandler.makeSafeEventHandler(
      'Main',
      initializeComponents,
      {
        level: errorHandler.levels?.CRITICAL || 'critical',
        recovery: errorHandler.strategies?.NOTIFY || 'notify',
        details: { action: 'dom_ready_init' }
      }
    ) : initializeComponents;

  const safeHTMXInit = errorHandler ?
    errorHandler.makeSafeEventHandler(
      'Main', 
      initializeComponents,
      {
        level: errorHandler.levels?.HIGH || 'high',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'htmx_after_swap_init' }
      }
    ) : initializeComponents;

  // Load scripts and then initialize
  async function initializeWhenReady() {
    try {
      await loadComponentScripts();
      safeInitializeComponents();
    } catch (error) {
      console.error('[AdalexUI.Main] Failed to load component scripts:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
  } else {
    initializeWhenReady();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', safeHTMXInit);

  // Expose initialization function globally
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.init = initializeComponents;
})();
