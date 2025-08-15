/**
 * Real-time Form Validation System
 * Provides instant feedback for form inputs with accessibility support
 * Swiss/German localized error messages
 */

class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();
    this.validators = {
      email: {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      },
      phone: {
        pattern: /^[\+]?[\d\s\-\(\)]{10,}$/,
        message: 'Bitte geben Sie eine gültige Telefonnummer ein'
      },
      name: {
        pattern: /^[a-zA-ZäöüÄÖÜß\s]{2,}$/,
        message: 'Name muss mindestens 2 Zeichen enthalten'
      },
      postalCode: {
        pattern: /^[0-9]{4}$/,
        message: 'Schweizer Postleitzahl muss 4 Ziffern haben'
      },
      required: {
        pattern: /.+/,
        message: 'Dieses Feld ist erforderlich'
      }
    };
    
    this.init();
  }

  init() {
    // Add validation to all form inputs
    const inputs = this.form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select');
    
    inputs.forEach(input => {
      // Add validation on blur and input events
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
      
      // Real-time validation for certain fields
      if (input.type === 'email' || input.name.includes('email')) {
        input.addEventListener('input', this.debounce(() => this.validateField(input), 300));
      }
    });

    // Enhanced form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    const isRequired = field.hasAttribute('required') || field.hasAttribute('aria-required');
    
    // Clear previous errors
    this.clearFieldError(field);
    
    // Check if required field is empty
    if (isRequired && !value) {
      this.showFieldError(field, this.validators.required.message);
      return false;
    }
    
    // Skip validation if field is empty and not required
    if (!value && !isRequired) {
      return true;
    }
    
    // Validate based on field type/name
    let validator;
    if (field.type === 'email' || fieldName.includes('email')) {
      validator = this.validators.email;
    } else if (field.type === 'tel' || fieldName.includes('phone') || fieldName.includes('tel')) {
      validator = this.validators.phone;
    } else if (fieldName.includes('name') || fieldName.includes('Name')) {
      validator = this.validators.name;
    } else if (fieldName.includes('postal') || fieldName.includes('zip') || fieldName.includes('plz')) {
      validator = this.validators.postalCode;
    }
    
    // Apply validation
    if (validator && !validator.pattern.test(value)) {
      this.showFieldError(field, validator.message);
      return false;
    }
    
    // Show success state
    this.showFieldSuccess(field);
    return true;
  }

  showFieldError(field, message) {
    const fieldContainer = field.closest('.field') || field.parentElement;
    const fieldLabel = fieldContainer.querySelector('.field__label') || fieldContainer.querySelector('label');
    
    // Add error class
    fieldContainer.classList.add('field--error');
    field.classList.add('field__input--error');
    field.setAttribute('aria-invalid', 'true');
    
    // Enhanced ARIA labeling
    const fieldId = field.id || field.name || `field-${Date.now()}`;
    if (!field.id) field.id = fieldId;
    
    // Associate label properly
    if (fieldLabel && !fieldLabel.getAttribute('for')) {
      fieldLabel.setAttribute('for', fieldId);
    }
    
    // Create or update error message
    let errorElement = fieldContainer.querySelector('.field__error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field__error animate-fade-in';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'assertive');
      errorElement.setAttribute('aria-atomic', 'true');
      fieldContainer.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `
      <span class="field__error-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </span>
      <span class="field__error-text">${message}</span>
    `;
    
    // Connect error to field for screen readers with comprehensive associations
    const errorId = `${fieldId}-error`;
    const helpId = `${fieldId}-help`;
    errorElement.id = errorId;
    
    // Build describedby list including existing help text
    let describedBy = [errorId];
    const existingDescribedBy = field.getAttribute('aria-describedby');
    if (existingDescribedBy) {
      describedBy = [...existingDescribedBy.split(' '), errorId];
    }
    
    // Check for help text
    const helpText = fieldContainer.querySelector('.field__help, .field__note');
    if (helpText && !helpText.id) {
      helpText.id = helpId;
      describedBy.push(helpId);
    }
    
    field.setAttribute('aria-describedby', describedBy.join(' '));
    field.setAttribute('aria-errormessage', errorId);
    
    this.errors.set(field, message);
  }

  showFieldSuccess(field) {
    const fieldContainer = field.closest('.field') || field.parentElement;
    
    // Add success class
    fieldContainer.classList.add('field--success');
    fieldContainer.classList.remove('field--error');
    field.classList.add('field__input--success');
    field.classList.remove('field__input--error');
    field.setAttribute('aria-invalid', 'false');
    
    // Show success indicator
    let successElement = fieldContainer.querySelector('.field__success');
    if (!successElement) {
      successElement = document.createElement('div');
      successElement.className = 'field__success animate-scale-in';
      successElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      `;
      fieldContainer.appendChild(successElement);
    }
    
    this.errors.delete(field);
  }

  clearFieldError(field) {
    const fieldContainer = field.closest('.field') || field.parentElement;
    
    // Remove error/success classes
    fieldContainer.classList.remove('field--error', 'field--success');
    field.classList.remove('field__input--error', 'field__input--success');
    
    // Remove error message
    const errorElement = fieldContainer.querySelector('.field__error');
    if (errorElement) {
      errorElement.remove();
    }
    
    // Remove success indicator
    const successElement = fieldContainer.querySelector('.field__success');
    if (successElement) {
      successElement.remove();
    }
    
    // Clean up ARIA attributes
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    
    this.errors.delete(field);
  }

  handleSubmit(event) {
    // Validate all fields
    const inputs = this.form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    // Prevent submission if validation fails
    if (!isValid) {
      event.preventDefault();
      
      // Focus first error field
      const firstErrorField = this.form.querySelector('.field__input--error');
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Show form-level error message
      this.showFormError('Bitte korrigieren Sie die markierten Felder');
      return false;
    }
    
    // Show loading state
    this.showFormLoading();
    return true;
  }

  showFormError(message) {
    let errorContainer = this.form.querySelector('.form__error');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'form__error animate-fade-in';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.setAttribute('aria-live', 'assertive');
      this.form.insertBefore(errorContainer, this.form.firstChild);
    }
    
    errorContainer.innerHTML = `
      <div class="form__error-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>${message}</span>
      </div>
    `;
  }

  showFormLoading() {
    const submitButton = this.form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('loading');
      
      const originalText = submitButton.textContent;
      submitButton.innerHTML = `
        <span class="loading-spinner"></span>
        <span>Wird gesendet...</span>
      `;
      
      // Restore button after 10 seconds failsafe
      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.textContent = originalText;
      }, 10000);
    }
  }

  // Utility function for debouncing
  debounce(func, wait) {
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
}

// Auto-initialize validation on forms (only if enabled in theme settings)
document.addEventListener('DOMContentLoaded', () => {
  // Check if form validation is enabled
  const formValidationEnabled = document.documentElement.dataset.enableFormValidation !== 'false';
  
  if (!formValidationEnabled) {
    console.log('Form validation disabled via theme settings');
    return;
  }
  
  // Find all forms that need validation
  const forms = document.querySelectorAll('form[data-validate], #ContactForm, form[action*="contact"]');
  
  forms.forEach(form => {
    new FormValidator(form);
  });
  
  console.log('Form validation initialized for', forms.length, 'forms');
});