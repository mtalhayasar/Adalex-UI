/**
 * File Upload Component
 * Handles drag & drop, validation, and preview
 */

(function() {
  'use strict';

  function initFileUpload(element) {
    const input = element.querySelector('.a-file-upload__input');
    const dropzone = element.querySelector('.a-file-upload__dropzone');
    const preview = element.querySelector('[data-file-preview]');
    const fileList = element.querySelector('[data-file-list]');
    const errorEl = element.querySelector('[data-file-error]');
    const errorMessage = element.querySelector('[data-error-message]');
    const template = element.querySelector('[data-file-item-template]');
    const maxSize = parseInt(element.dataset.maxSize || '10485760');
    
    let files = [];

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      dropzone.classList.add('is-dragover');
    }

    function unhighlight(e) {
      dropzone.classList.remove('is-dragover');
    }

    // Handle dropped files
    dropzone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const droppedFiles = dt.files;
      handleFiles(droppedFiles);
    }

    // Handle file selection via input
    input.addEventListener('change', function(e) {
      handleFiles(e.target.files);
    });

    // Handle keyboard activation
    dropzone.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    // Handle file processing
    function handleFiles(fileList) {
      hideError();
      
      const filesArray = Array.from(fileList);
      
      // Validate files
      for (let file of filesArray) {
        if (file.size > maxSize) {
          showError(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`);
          return;
        }
        
        // Check if accept attribute is set and validate file type
        const accept = input.getAttribute('accept');
        if (accept && !isFileTypeAccepted(file, accept)) {
          showError(`File "${file.name}" is not an accepted type`);
          return;
        }
      }
      
      // Add files to list
      if (!input.multiple) {
        files = filesArray.slice(0, 1);
      } else {
        files = files.concat(filesArray);
      }
      
      updatePreview();
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
    function updatePreview() {
      fileList.innerHTML = '';
      
      if (files.length === 0) {
        preview.hidden = true;
        return;
      }
      
      preview.hidden = false;
      
      files.forEach((file, index) => {
        const item = createFileItem(file, index);
        fileList.appendChild(item);
      });
    }

    // Create file item element
    function createFileItem(file, index) {
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
    function showError(message) {
      errorMessage.textContent = message;
      errorEl.hidden = false;
      element.classList.add('is-error');
    }

    // Hide error
    function hideError() {
      errorEl.hidden = true;
      element.classList.remove('is-error');
    }

    // Handle clear all
    element.addEventListener('clearAll', function() {
      files = [];
      input.value = '';
      updatePreview();
      hideError();
    });

    // Handle remove file
    element.addEventListener('removeFile', function(e) {
      const item = e.detail;
      const index = parseInt(item.dataset.fileIndex);
      
      files.splice(index, 1);
      updatePreview();
      
      // Update input files if possible
      if (files.length === 0) {
        input.value = '';
      }
    });

    // Store files reference for form submission
    element.files = files;
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-file-upload]').forEach(initFileUpload);
  });

  // Re-initialize after HTMX swap
  document.addEventListener('htmx:afterSwap', function(event) {
    event.detail.target.querySelectorAll('[data-file-upload]').forEach(initFileUpload);
  });

  // Export for manual initialization
  window.AdalexUI = window.AdalexUI || {};
  window.AdalexUI.initFileUpload = initFileUpload;
})();