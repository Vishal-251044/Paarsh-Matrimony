// Script loader utility for Selenium testing and production use

/**
 * Load an external script dynamically
 * @param {string} src - Script source URL
 * @param {Object} options - Loading options
 * @param {boolean} options.async - Load script asynchronously (default: true)
 * @param {boolean} options.defer - Defer script loading (default: false)
 * @param {string} options.id - Script element ID
 * @param {string} options.crossorigin - Cross-origin attribute
 * @param {number} options.timeout - Timeout in milliseconds (default: 15000)
 * @returns {Promise<HTMLScriptElement>}
 */
export const loadScript = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve(existingScript);
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = options.async ?? true;
    script.defer = options.defer ?? false;
    
    if (options.id) script.id = options.id;
    if (options.crossorigin) script.crossOrigin = options.crossorigin;
    
    const timeout = setTimeout(() => {
      reject(new Error(`Script loading timeout: ${src}`));
    }, options.timeout || 15000);
    
    script.onload = () => {
      clearTimeout(timeout);
      resolve(script);
    };
    
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Wait for Razorpay to be available
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>}
 */
export const waitForRazorpay = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(checkInterval);
        resolve(window.Razorpay);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Razorpay not available'));
      }
    }, 100);
  });
};

/**
 * Load Razorpay script with retry mechanism
 * @param {boolean} forceReload - Force reload even if already loaded
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = async (forceReload = false, maxRetries = 3) => {
  if (!forceReload && window.Razorpay) {
    return true;
  }
  
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js', {
        timeout: 10000,
        id: 'razorpay-script'
      });
      
      // Verify script loaded correctly
      if (window.Razorpay) {
        return true;
      }
      
      // Wait a moment for initialization
      await waitForRazorpay(5000);
      return true;
      
    } catch (error) {
      lastError = error;
      console.warn(`Razorpay script load attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  console.error('Failed to load Razorpay after', maxRetries, 'attempts');
  return false;
};

/**
 * Add test attributes to elements for Selenium testing
 * @param {string} testId - Test ID value
 * @returns {Object} - Props object with data-testid
 */
export const getTestAttributes = (testId) => {
  if (import.meta.env.MODE === 'development' || window.__SELENIUM_TEST__) {
    return { 'data-testid': testId };
  }
  return {};
};

/**
 * Check if running in Selenium test environment
 * @returns {boolean}
 */
export const isSeleniumTest = () => {
  return window.__SELENIUM_TEST__ === true || 
         navigator.webdriver === true || 
         import.meta.env.VITE_SELENIUM_TEST === 'true';
};