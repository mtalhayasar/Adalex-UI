/**
 * File Upload Component
 * Handles drag & drop, validation, and preview
 */

(function() {
  'use strict';

  const COMPONENT_NAME = 'FileUpload';
  
  // Global map to store file upload data
  const fileUploadData = new WeakMap();

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

  function getFileUploadData(element) {
    if (!fileUploadData.has(element)) {
      fileUploadData.set(element, {
        files: [],
        maxSize: parseInt(element.dataset.maxSize || '10485760')
      });
    }
    return fileUploadData.get(element);
  }

  function initFileUpload(element) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!element) {
        throw new Error('No element provided to initFileUpload');
      }
      
      // Skip if already initialized
      if (element.dataset.fileUploadInitialized === 'true') {
        return;
      }

      // Initialize data store
      getFileUploadData(element);
      
      // Mark as initialized
      element.dataset.fileUploadInitialized = 'true';
    });
  }

  // Handle file processing
  function handleFiles(element, fileList) {
    const errorHandler = getErrorHandler();
    
    return errorHandler.safeExecute(COMPONENT_NAME, () => {
      if (!element || !fileList) {
        throw new Error('Invalid element or fileList provided to handleFiles');
      }
      
      const data = getFileUploadData(element);
      const input = element.querySelector('.a-file-upload__input');
      const preview = element.querySelector('[data-file-preview]');
      const fileListEl = element.querySelector('[data-file-list]');
      
      hideError(element);
      
      const filesArray = Array.from(fileList);
      
      // Validate files
      for (let file of filesArray) {
        if (file.size > data.maxSize) {
          showError(element, `File "${file.name}" exceeds maximum size of ${formatFileSize(data.maxSize)}`);
          return;
        }
        
        // Check if accept attribute is set and validate file type
        const accept = input.getAttribute('accept');
        if (accept && !isFileTypeAccepted(file, accept)) {
          showError(element, `File "${file.name}" is not an accepted type`);
          return;
        }
      }
      
      // Add files to list
      if (!input.multiple) {
        data.files = filesArray.slice(0, 1);
      } else {
        data.files = data.files.concat(filesArray);
      }
      
      updatePreview(element);
    });
  }

  // Check if file type is accepted
  function isFileTypeAccepted(file, accept) {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    
    for (let type of acceptedTypes) {
      if (type.startsWith('.')) {
        // Extension check
        if (file.name.toLowerCase().endsWith(type.toLowerCase())) {
          return true;
        }
      } else if (type.includes('*')) {
        // MIME type wildcard check
        const [mainType] = type.split('/');
        if (file.type.startsWith(mainType)) {
          return true;
        }
      } else {
        // Exact MIME type check
        if (file.type === type) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Update preview
  function updatePreview(element) {
    const data = getFileUploadData(element);
    const preview = element.querySelector('[data-file-preview]');
    const fileList = element.querySelector('[data-file-list]');
    const template = element.querySelector('[data-file-item-template]');
    
    fileList.innerHTML = '';
    
    if (data.files.length === 0) {
      preview.hidden = true;
      return;
    }
    
    preview.hidden = false;
    
    data.files.forEach((file, index) => {
      const item = createFileItem(element, file, index, template);
      fileList.appendChild(item);
    });
  }

  // Create file item element
  function createFileItem(element, file, index, template) {
    const clone = template.content.cloneNode(true);
    const item = clone.querySelector('.a-file-upload__item');
    const nameEl = clone.querySelector('[data-file-name]');
    const sizeEl = clone.querySelector('[data-file-size]');
    
    nameEl.textContent = file.name;
    sizeEl.textContent = formatFileSize(file.size);
    
    item.dataset.fileIndex = index;
    
    return clone;
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Show error
  function showError(element, message) {
    const errorEl = element.querySelector('[data-file-error]');
    const errorMessage = element.querySelector('[data-error-message]');
    
    errorMessage.textContent = message;
    errorEl.hidden = false;
    element.classList.add('is-error');
  }

  // Hide error
  function hideError(element) {
    const errorEl = element.querySelector('[data-file-error]');
    errorEl.hidden = true;
    element.classList.remove('is-error');
  }

  // Clear all files
  function clearAllFiles(element) {
    const data = getFileUploadData(element);
    const input = element.querySelector('.a-file-upload__input');
    
    data.files = [];
    input.value = '';
    updatePreview(element);
    hideError(element);
  }

  // Remove specific file
  function removeFile(element, index) {
    const data = getFileUploadData(element);
    const input = element.querySelector('.a-file-upload__input');
    
    data.files.splice(index, 1);
    updatePreview(element);
    
    // Update input files if possible
    if (data.files.length === 0) {
      input.value = '';
    }
  }

  // Event delegation handlers
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Global event delegation setup
  function setupEventDelegation() {
    // Prevent default drag behaviors globally
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Handle drag enter/over for dropzones
    document.body.addEventListener('dragenter', (e) => {
      const dropzone = e.target.closest('.a-file-upload__dropzone');
      if (dropzone) {
        dropzone.classList.add('is-dragover');
      }
    });

    document.body.addEventListener('dragover', (e) => {
      const dropzone = e.target.closest('.a-file-upload__dropzone');
      if (dropzone) {
        dropzone.classList.add('is-dragover');
      }
    });

    // Handle drag leave/drop for dropzones
    document.body.addEventListener('dragleave', (e) => {
      const dropzone = e.target.closest('.a-file-upload__dropzone');
      if (dropzone) {
        dropzone.classList.remove('is-dragover');
      }
    });

    document.body.addEventListener('drop', (e) => {
      const dropzone = e.target.closest('.a-file-upload__dropzone');
      if (dropzone) {
        dropzone.classList.remove('is-dragover');
        const fileUpload = dropzone.closest('[data-file-upload]');
        if (fileUpload) {
          const dt = e.dataTransfer;
          const droppedFiles = dt.files;
          handleFiles(fileUpload, droppedFiles);
        }
      }
    });

    // Handle file input changes
    document.body.addEventListener('change', (e) => {
      if (e.target.classList.contains('a-file-upload__input')) {
        const fileUpload = e.target.closest('[data-file-upload]');
        if (fileUpload) {
          handleFiles(fileUpload, e.target.files);
        }
      }
    });

    // Handle keyboard activation on dropzones
    document.body.addEventListener('keydown', (e) => {
      const dropzone = e.target.closest('.a-file-upload__dropzone');
      if (dropzone && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const fileUpload = dropzone.closest('[data-file-upload]');
        const input = fileUpload?.querySelector('.a-file-upload__input');
        if (input) {
          input.click();
        }
      }
    });

    // Handle clear all events
    document.body.addEventListener('clearAll', (e) => {
      const fileUpload = e.target.closest('[data-file-upload]');
      if (fileUpload) {
        clearAllFiles(fileUpload);
      }
    });

    // Handle remove file events
    document.body.addEventListener('removeFile', (e) => {
      const fileUpload = e.target.closest('[data-file-upload]');
      if (fileUpload && e.detail) {
        const index = parseInt(e.detail.dataset.fileIndex);
        removeFile(fileUpload, index);
      }
    });
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('[data-file-upload]').forEach(initFileUpload);
      setupEventDelegation();
    });
  } else {
    document.querySelectorAll('[data-file-upload]').forEach(initFileUpload);
    setupEventDelegation();
  }

  // Re-initialize after HTMX swap
  document.addEventListener('htmx:afterSwap', function(event) {
    event.detail.target.querySelectorAll('[data-file-upload]').forEach(initFileUpload);
  });

  // Export for manual initialization
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.FileUpload = {
    init: initFileUpload,
    clearAll: clearAllFiles,
    removeFile: removeFile
  };
})();