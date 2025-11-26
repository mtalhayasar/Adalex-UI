/**
 * Table Component JavaScript
 *
 * Handles sorting, searching, and pagination with HTMX integration.
 * HTMX compatible - idempotent initialization.
 */

(function() {
  'use strict';

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
    const containers = document.querySelectorAll('[data-table-container]');

    containers.forEach(container => {
      // Skip if already initialized
      if (container.dataset.tableInitialized === 'true') {
        return;
      }

      initSorting(container);
      initSearch(container);

      // Mark as initialized
      container.dataset.tableInitialized = 'true';
    });
  }

  /**
   * Initialize sorting functionality
   * @param {HTMLElement} container - Table container element
   */
  function initSorting(container) {
    const sortableHeaders = container.querySelectorAll('[data-sort-key]');

    sortableHeaders.forEach(header => {
      // Remove old listeners (if any) by cloning
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);

      // Add click listener
      newHeader.addEventListener('click', () => {
        handleSort(container, newHeader);
      });

      // Add keyboard listener (Enter/Space)
      newHeader.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSort(container, newHeader);
        }
      });
    });
  }

  /**
   * Handle sort action
   * @param {HTMLElement} container - Table container element
   * @param {HTMLElement} header - Clicked header element
   */
  function handleSort(container, header) {
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

    // Add loading state
    container.classList.add('a-table-container--loading');

    // Fall back to page navigation (HTMX partial updates require server-side support)
    window.location.href = newUrl;

    // Dispatch custom event
    const event = new CustomEvent('table:sorted', {
      detail: { sortKey, direction: nextDirection },
      bubbles: true
    });
    container.dispatchEvent(event);
  }

  /**
   * Initialize search functionality
   * @param {HTMLElement} container - Table container element
   */
  function initSearch(container) {
    const searchInput = container.querySelector('[type="search"]');

    if (!searchInput) {
      return;
    }

    // Remove old listener (if any) by cloning
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    // Add debounced input listener
    const debouncedSearch = debounce((e) => {
      handleSearch(container, e.target.value);
    }, 300);

    newSearchInput.addEventListener('input', debouncedSearch);

    // Immediate search on Enter key
    newSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch(container, e.target.value);
      }
    });
  }

  /**
   * Handle search action
   * @param {HTMLElement} container - Table container element
   * @param {string} query - Search query
   */
  function handleSearch(container, query) {
    const params = getQueryParams();

    params.search = query.trim();

    // Reset to first page when searching
    params.page = 1;

    const newUrl = buildUrl(window.location.pathname, params);

    // Add loading state
    container.classList.add('a-table-container--loading');

    // Fall back to page navigation (HTMX partial updates require server-side support)
    window.location.href = newUrl;

    // Dispatch custom event
    const event = new CustomEvent('table:searched', {
      detail: { query },
      bubbles: true
    });
    container.dispatchEvent(event);
  }

  /**
   * Refresh table data
   * @param {HTMLElement|string} containerOrId - Container element or ID (optional)
   */
  function refresh(containerOrId) {
    // Simply reload the page to refresh table data
    window.location.reload();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTables);
  } else {
    initTables();
  }

  // Re-initialize after HTMX swaps
  document.addEventListener('htmx:afterSwap', initTables);

  // Expose API to window
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.Table = {
    init: initTables,
    refresh: refresh
  };
})();
