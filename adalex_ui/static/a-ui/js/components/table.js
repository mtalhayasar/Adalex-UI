/**
 * Table Component JavaScript
 *
 * Handles sorting, searching, and pagination with HTMX integration.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'Table';
  
  // Store table navigation instances
  const tableNavInstances = new WeakMap();

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

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Build URL with updated query parameters
   * @param {string} baseUrl - Base URL
   * @param {Object} params - Query parameters to update
   * @returns {string} Updated URL
   */
  function buildUrl(baseUrl, params) {
    const url = new URL(baseUrl, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.set(key, params[key]);
      } else {
        url.searchParams.delete(key);
      }
    });
    return url.toString();
  }

  /**
   * Get current query parameters
   * @returns {Object} Query parameters
   */
  function getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  }

  /**
   * Initialize table functionality
   * Idempotent - can be called multiple times safely
   */
  function initTables() {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const containers = document.querySelectorAll('[data-table-container]');

      containers.forEach(container => {
        try {
          // Skip if already initialized
          if (container.dataset.tableInitialized === 'true') {
            return;
          }

          // Set up keyboard navigation for the table
          setupTableKeyboardNavigation(container);

          // Mark as initialized
          container.dataset.tableInitialized = 'true';
        } catch (error) {
          errorHandler.handle(COMPONENT_NAME, error, {
            level: errorHandler.levels?.MEDIUM || 'medium',
            recovery: errorHandler.strategies?.SILENT || 'silent',
            details: { 
              action: 'init_single_table_container',
              containerId: container.id || 'unknown'
            }
          });
        }
      });
    });
  }

  /**
   * Set up keyboard navigation for a table
   * @param {HTMLElement} container - Table container element
   */
  function setupTableKeyboardNavigation(container) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    const table = container.querySelector('table');
    
    if (!table) return;
    
    try {
      // Set up arrow navigation for sortable headers
      const headerRow = table.querySelector('thead tr');
      if (headerRow && keyboardNav) {
        const headerNav = keyboardNav.createArrowNavigation(headerRow, {
          selector: '[data-sort-key]',
          horizontal: true,
          vertical: false,
          wrap: true,
          activateOnFocus: false // Don't auto-sort on focus, wait for Enter/Space
        });
        
        // Store instance for cleanup
        const navInstances = tableNavInstances.get(container) || {};
        navInstances.header = headerNav;
        tableNavInstances.set(container, navInstances);
      }
      
      // Set up grid navigation for table body (if interactive)
      const tableBody = table.querySelector('tbody');
      if (tableBody) {
        setupTableBodyNavigation(tableBody, container);
      }
      
    } catch (navError) {
      errorHandler.handle(COMPONENT_NAME, navError, {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'setup_table_keyboard_navigation' }
      });
    }
  }

  /**
   * Set up keyboard navigation for table body (row and cell navigation)
   * @param {HTMLElement} tableBody - Table body element
   * @param {HTMLElement} container - Table container element
   */
  function setupTableBodyNavigation(tableBody, container) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    // Only set up grid navigation if there are interactive elements in cells
    const interactiveElements = tableBody.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (interactiveElements.length === 0) return;
    
    const safeKeydownHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => handleTableBodyKeydown(e, tableBody, container),
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'table_body_keyboard_navigation' }
      }
    );
    
    tableBody.addEventListener('keydown', safeKeydownHandler);
  }

  /**
   * Handle keyboard navigation in table body
   * @param {KeyboardEvent} e - Keyboard event
   * @param {HTMLElement} tableBody - Table body element
   * @param {HTMLElement} container - Table container element
   */
  function handleTableBodyKeydown(e, tableBody, container) {
    const keyboardNav = getKeyboardNav();
    if (!keyboardNav) return;
    
    const currentElement = e.target;
    const currentCell = currentElement.closest('td');
    const currentRow = currentElement.closest('tr');
    
    if (!currentCell || !currentRow) return;
    
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const cells = Array.from(currentRow.querySelectorAll('td'));
    const currentRowIndex = rows.indexOf(currentRow);
    const currentCellIndex = cells.indexOf(currentCell);
    
    let targetCell = null;
    
    switch (e.key) {
      case 'ArrowUp':
        if (currentRowIndex > 0) {
          const targetRow = rows[currentRowIndex - 1];
          const targetRowCells = targetRow.querySelectorAll('td');
          targetCell = targetRowCells[Math.min(currentCellIndex, targetRowCells.length - 1)];
        }
        break;
        
      case 'ArrowDown':
        if (currentRowIndex < rows.length - 1) {
          const targetRow = rows[currentRowIndex + 1];
          const targetRowCells = targetRow.querySelectorAll('td');
          targetCell = targetRowCells[Math.min(currentCellIndex, targetRowCells.length - 1)];
        }
        break;
        
      case 'ArrowLeft':
        if (currentCellIndex > 0) {
          targetCell = cells[currentCellIndex - 1];
        }
        break;
        
      case 'ArrowRight':
        if (currentCellIndex < cells.length - 1) {
          targetCell = cells[currentCellIndex + 1];
        }
        break;
        
      case 'Home':
        if (e.ctrlKey || e.metaKey) {
          // Go to first cell of first row
          const firstRow = rows[0];
          if (firstRow) {
            targetCell = firstRow.querySelector('td');
          }
        } else {
          // Go to first cell of current row
          targetCell = cells[0];
        }
        break;
        
      case 'End':
        if (e.ctrlKey || e.metaKey) {
          // Go to last cell of last row
          const lastRow = rows[rows.length - 1];
          if (lastRow) {
            const lastRowCells = lastRow.querySelectorAll('td');
            targetCell = lastRowCells[lastRowCells.length - 1];
          }
        } else {
          // Go to last cell of current row
          targetCell = cells[cells.length - 1];
        }
        break;
        
      default:
        return; // Don't prevent default for other keys
    }
    
    if (targetCell) {
      e.preventDefault();
      
      // Focus the first focusable element in the target cell
      const focusableElement = targetCell.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElement) {
        focusableElement.focus();
      } else {
        // If no focusable element, make the cell itself focusable temporarily
        targetCell.tabIndex = 0;
        targetCell.focus();
        targetCell.addEventListener('blur', () => {
          targetCell.removeAttribute('tabindex');
        }, { once: true });
      }
      
      // Announce position to screen readers
      if (keyboardNav.announce) {
        const rowNumber = currentRowIndex + 1;
        const colNumber = currentCellIndex + 1;
        keyboardNav.announce(`Row ${rowNumber}, Column ${colNumber}`);
      }
    }
  }

  /**
   * Clean up table navigation instances
   * @param {HTMLElement} container - Table container to clean up
   */
  function cleanupTableNavigation(container) {
    const navInstances = tableNavInstances.get(container);
    if (navInstances) {
      if (navInstances.header && navInstances.header.destroy) {
        navInstances.header.destroy();
      }
      tableNavInstances.delete(container);
    }
  }

  /**
   * Handle sort action
   * @param {HTMLElement} container - Table container element
   * @param {HTMLElement} header - Clicked header element
   */
  function handleSort(container, header) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const sortKey = header.dataset.sortKey;
      const currentDirection = header.dataset.sortDirection;

      // Determine next direction
      let nextDirection = 'asc';
      if (currentDirection === 'asc') {
        nextDirection = 'desc';
      } else if (currentDirection === 'desc') {
        nextDirection = 'none';
      }

      // Build new URL with sort parameters
      const params = getQueryParams();

      if (nextDirection === 'none') {
        delete params.sort;
        delete params.direction;
      } else {
        params.sort = sortKey;
        params.direction = nextDirection;
      }

      // Reset to first page when sorting
      params.page = 1;

      const newUrl = buildUrl(window.location.pathname, params);

      // Announce sort action to screen readers
      if (keyboardNav && keyboardNav.announce) {
        const columnLabel = header.textContent.trim();
        const directionText = nextDirection === 'asc' ? 'ascending' : 
                             nextDirection === 'desc' ? 'descending' : 'unsorted';
        keyboardNav.announce(`Sorted ${columnLabel} ${directionText}`);
      }

      // Add loading state with skeleton
      if (window.AdalexUI && window.AdalexUI.Loading) {
        window.AdalexUI.Loading.showTableSkeleton(container);
      } else {
        container.classList.add('a-table-container--loading');
      }

      // Fall back to page navigation (HTMX partial updates require server-side support)
      window.location.href = newUrl;

      // Dispatch custom event
      try {
        const event = new CustomEvent('table:sorted', {
          detail: { sortKey, direction: nextDirection },
          bubbles: true
        });
        container.dispatchEvent(event);
      } catch (eventError) {
        errorHandler.handle(COMPONENT_NAME, eventError, {
          level: errorHandler.levels?.LOW || 'low',
          recovery: errorHandler.strategies?.SILENT || 'silent',
          details: { action: 'dispatch_sort_event' }
        });
      }
    });
  }

  /**
   * Set up event delegation for table interactions
   */
  function setupEventDelegation() {
    const errorHandler = getErrorHandler();
    
    // Handle sorting clicks (delegated)
    const safeSortClickHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => {
        const sortableHeader = e.target.closest('[data-sort-key]');
        if (sortableHeader) {
          const container = sortableHeader.closest('[data-table-container]');
          if (container) {
            handleSort(container, sortableHeader);
          }
        }
      },
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'sort_click_handler' }
      }
    );
    
    document.body.addEventListener('click', safeSortClickHandler);

    // Handle sorting keyboard activation (delegated)
    const safeSortKeydownHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => {
        const sortableHeader = e.target.closest('[data-sort-key]');
        if (sortableHeader && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          const container = sortableHeader.closest('[data-table-container]');
          if (container) {
            handleSort(container, sortableHeader);
          }
        }
      },
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'sort_keyboard_handler' }
      }
    );
    
    document.body.addEventListener('keydown', safeSortKeydownHandler);

    // Handle search input (delegated with debouncing)
    const searchDebounceMap = new WeakMap();
    
    const safeSearchInputHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => {
        if (e.target.type === 'search') {
          const container = e.target.closest('[data-table-container]');
          if (container) {
            // Get or create debounced function for this input
            if (!searchDebounceMap.has(e.target)) {
              const debouncedSearch = debounce((target, value) => {
                const currentContainer = target.closest('[data-table-container]');
                if (currentContainer) {
                  handleSearch(currentContainer, value);
                }
              }, 300);
              searchDebounceMap.set(e.target, debouncedSearch);
            }
            
            const debouncedSearch = searchDebounceMap.get(e.target);
            debouncedSearch(e.target, e.target.value);
          }
        }
      },
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'search_input_handler' }
      }
    );
    
    document.body.addEventListener('input', safeSearchInputHandler);

    // Handle immediate search on Enter key (delegated)
    const safeSearchKeydownHandler = errorHandler.makeSafeEventHandler(
      COMPONENT_NAME,
      (e) => {
        if (e.target.type === 'search' && e.key === 'Enter') {
          e.preventDefault();
          const container = e.target.closest('[data-table-container]');
          if (container) {
            handleSearch(container, e.target.value);
          }
        }
      },
      {
        level: errorHandler.levels?.MEDIUM || 'medium',
        recovery: errorHandler.strategies?.SILENT || 'silent',
        details: { action: 'search_keyboard_handler' }
      }
    );
    
    document.body.addEventListener('keydown', safeSearchKeydownHandler);
  }

  /**
   * Handle search action
   * @param {HTMLElement} container - Table container element
   * @param {string} query - Search query
   */
  function handleSearch(container, query) {
    const errorHandler = getErrorHandler();
    const keyboardNav = getKeyboardNav();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      const params = getQueryParams();

      params.search = query.trim();

      // Reset to first page when searching
      params.page = 1;

      const newUrl = buildUrl(window.location.pathname, params);

      // Announce search action to screen readers
      if (keyboardNav && keyboardNav.announce) {
        if (query.trim()) {
          keyboardNav.announce(`Searching for ${query.trim()}`);
        } else {
          keyboardNav.announce('Cleared search');
        }
      }

      // Add loading state with skeleton
      if (window.AdalexUI && window.AdalexUI.Loading) {
        window.AdalexUI.Loading.showTableSkeleton(container);
      } else {
        container.classList.add('a-table-container--loading');
      }

      // Fall back to page navigation (HTMX partial updates require server-side support)
      window.location.href = newUrl;

      // Dispatch custom event
      try {
        const event = new CustomEvent('table:searched', {
          detail: { query },
          bubbles: true
        });
        container.dispatchEvent(event);
      } catch (eventError) {
        errorHandler.handle(COMPONENT_NAME, eventError, {
          level: errorHandler.levels?.LOW || 'low',
          recovery: errorHandler.strategies?.SILENT || 'silent',
          details: { action: 'dispatch_search_event' }
        });
      }
    });
  }

  /**
   * Refresh table data
   * @param {HTMLElement|string} containerOrId - Container element or ID (optional)
   */
  function refresh(containerOrId) {
    // Simply reload the page to refresh table data
    window.location.reload();
  }

  // Initialize on DOM ready with error handling
  const errorHandler = getErrorHandler();
  
  const safeInitAll = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    () => {
      initTables();
      setupEventDelegation();
    },
    {
      level: errorHandler.levels?.HIGH || 'high',
      recovery: errorHandler.strategies?.SILENT || 'silent',
      details: { action: 'dom_ready_init' }
    }
  );

  const safeHTMXInit = errorHandler.makeSafeEventHandler(
    COMPONENT_NAME,
    initTables,
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

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    // Clean up all table navigation instances
    document.querySelectorAll('[data-table-container]').forEach(cleanupTableNavigation);
  });

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Table = {
    init: initTables,
    refresh: refresh
  };
})();
