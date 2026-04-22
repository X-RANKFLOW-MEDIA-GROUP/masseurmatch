/**
 * Accessibility utilities for WCAG 2.1 compliance
 */

export const a11y = {
  /**
   * Skip to main content link - helps keyboard users navigate faster
   */
  skipToMainLink: {
    href: '#main-content',
    className: 'sr-only focus:not-sr-only absolute top-0 left-0 z-50 px-4 py-2 bg-slate-900 text-white',
    text: 'Skip to main content',
  },

  /**
   * ARIA labels for common UI patterns
   */
  labels: {
    close: 'Close',
    menu: 'Open menu',
    search: 'Search',
    submit: 'Submit form',
    loading: 'Loading',
    noResults: 'No results found',
    error: 'Error',
    success: 'Success',
  },

  /**
   * ARIA descriptions for form fields
   */
  descriptions: {
    password: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
    email: 'Enter a valid email address',
    phone: 'Enter a valid phone number starting with + and country code',
  },

  /**
   * Live region announcements
   */
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const element = document.createElement('div');
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', priority);
    element.setAttribute('aria-atomic', 'true');
    element.className = 'sr-only';
    element.textContent = message;
    document.body.appendChild(element);
    
    setTimeout(() => element.remove(), 1000);
  },

  /**
   * Focus management
   */
  setFocus: (selector: string) => {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.focus();
    }
  },

  /**
   * Keyboard trap prevention
   */
  handleKeyboardTrap: (event: KeyboardEvent, elements: HTMLElement[]) => {
    if (event.key !== 'Tab') return;

    const focusableElements = elements.filter(el => el.offsetParent !== null);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  },

  /**
   * Color contrast checker helper
   */
  hasGoodContrast: (foreground: string, background: string): boolean => {
    // Simplified contrast ratio check (WCAG AA compliant = 4.5:1 for text)
    // In production, use a proper library like polished or tinycolor
    return true; // Placeholder - implement actual contrast calculation
  },

  /**
   * Required attributes for accessible components
   */
  requiredAriaAttributes: {
    button: { role: 'button', tabIndex: 0 },
    link: { role: 'link' },
    form: { noValidate: false },
    input: { required: true, 'aria-required': true },
  },
};
