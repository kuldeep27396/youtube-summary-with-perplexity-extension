// Content script for Perplexity.ai to auto-submit queries from URL parameters
(function() {
    'use strict';
    
    console.log('Perplexity content script loaded on:', window.location.href);
    
    // Debug function to inspect page elements
    function debugPageElements() {
        console.log('=== DEBUGGING PAGE ELEMENTS ===');
        console.log('All textareas:', document.querySelectorAll('textarea'));
        console.log('All inputs:', document.querySelectorAll('input'));
        console.log('All contenteditable:', document.querySelectorAll('[contenteditable="true"]'));
        console.log('All buttons:', document.querySelectorAll('button'));
        console.log('All forms:', document.querySelectorAll('form'));
        console.log('Body innerHTML (first 1000 chars):', document.body?.innerHTML?.substring(0, 1000));
        console.log('================================');
    }
    
    // Function to wait for element to appear with multiple selectors
    function waitForAnyElement(selectors, timeout = 15000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function check() {
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        console.log(`Found element with selector: ${selector}`);
                        resolve({ element, selector });
                        return;
                    }
                }
                
                if (Date.now() - startTime > timeout) {
                    console.log('TIMEOUT - Available elements:');
                    debugPageElements();
                    reject(new Error(`No elements found with selectors: ${selectors.join(', ')} within ${timeout}ms`));
                    return;
                }
                
                setTimeout(check, 200);
            }
            
            check();
        });
    }
    
    // Function to simulate typing
    function simulateTyping(element, text) {
        // Clear existing content
        element.value = '';
        element.textContent = '';
        element.innerHTML = '';
        
        // Set the text
        if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
            element.value = text;
        } else {
            element.textContent = text;
        }
        
        // Trigger events
        const events = [
            new Event('focus', { bubbles: true }),
            new Event('input', { bubbles: true }),
            new Event('change', { bubbles: true }),
            new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }),
            new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true })
        ];
        
        events.forEach(event => element.dispatchEvent(event));
    }
    
    // Fallback function to try any available input
    function tryFallbackInputs(query) {
        console.log('Trying fallback inputs...');
        
        // Try all textareas
        const textareas = document.querySelectorAll('textarea');
        for (const textarea of textareas) {
            if (textarea.offsetParent !== null) { // Check if visible
                console.log('Trying textarea:', textarea);
                simulateTyping(textarea, query);
                return true;
            }
        }
        
        // Try all text inputs
        const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
        for (const input of inputs) {
            if (input.offsetParent !== null) { // Check if visible
                console.log('Trying input:', input);
                simulateTyping(input, query);
                return true;
            }
        }
        
        // Try contenteditable elements
        const editables = document.querySelectorAll('[contenteditable="true"]');
        for (const editable of editables) {
            if (editable.offsetParent !== null) { // Check if visible
                console.log('Trying contenteditable:', editable);
                simulateTyping(editable, query);
                return true;
            }
        }
        
        return false;
    }
    
    // Function to auto-submit query
    async function autoSubmitQuery() {
        try {
            // Get query from URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            
            if (!query) {
                console.log('No query parameter found in URL');
                return;
            }
            
            console.log('Found query parameter:', query.substring(0, 100) + '...');
            
            // First, debug what's available
            debugPageElements();
            
            // Multiple selectors to try for the search input
            const inputSelectors = [
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="search"]',
                'textarea[placeholder*="What"]',
                'textarea[placeholder*="anything"]',
                'input[placeholder*="Ask"]',
                'input[placeholder*="search"]',
                'textarea[data-testid*="search"]',
                'textarea[name="q"]',
                'input[name="q"]',
                '.search-input',
                '.query-input',
                '[contenteditable="true"]',
                'textarea:not([style*="display: none"])',
                'input[type="text"]:not([style*="display: none"])',
                'input[type="search"]'
            ];
            
            console.log('Looking for search input...');
            
            let searchInput;
            let foundWithSelector = false;
            
            try {
                // Wait for search input
                const result = await waitForAnyElement(inputSelectors);
                searchInput = result.element;
                foundWithSelector = true;
                console.log('Found search input with selector:', result.selector);
            } catch (error) {
                console.log('Specific selectors failed, trying fallback...');
                if (tryFallbackInputs(query)) {
                    console.log('Fallback input worked, trying to submit...');
                    // Try to submit with any available button
                    setTimeout(() => {
                        const buttons = document.querySelectorAll('button');
                        for (const button of buttons) {
                            if (button.offsetParent !== null && !button.disabled) {
                                console.log('Trying button:', button);
                                button.click();
                                break;
                            }
                        }
                    }, 500);
                    return;
                } else {
                    throw error;
                }
            }
            
            if (!foundWithSelector) return;
            
            console.log('Search input element:', searchInput);
            
            // Focus the element first
            searchInput.focus();
            
            // Simulate typing the query
            simulateTyping(searchInput, query);
            
            console.log('Query entered into search field');
            
            // Wait a moment for the UI to process
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Multiple selectors for submit button
            const submitSelectors = [
                'button[type="submit"]',
                'button[aria-label*="submit"]',
                'button[aria-label*="Search"]',
                'button[aria-label*="search"]',
                'button[aria-label*="Ask"]',
                'button[title*="submit"]',
                'button[title*="Search"]',
                'button:has(svg)',
                '.submit-button',
                '.search-button',
                '[data-testid*="submit"]',
                '[data-testid*="search"]',
                'button[class*="submit"]',
                'button[class*="search"]',
                'form button:not([disabled])',
                'button:not([disabled])'
            ];
            
            console.log('Looking for submit button...');
            
            try {
                const { element: submitButton } = await waitForAnyElement(submitSelectors, 5000);
                
                if (submitButton && !submitButton.disabled) {
                    console.log('Found and clicking submit button:', submitButton);
                    submitButton.click();
                    console.log('Submit button clicked');
                } else {
                    throw new Error('Submit button disabled or not found');
                }
            } catch (buttonError) {
                console.log('No submit button found, trying Enter key...');
                
                // Try pressing Enter as fallback
                searchInput.focus();
                
                const enterEvents = [
                    new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    }),
                    new KeyboardEvent('keypress', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    }),
                    new KeyboardEvent('keyup', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    })
                ];
                
                enterEvents.forEach(event => {
                    searchInput.dispatchEvent(event);
                    console.log('Dispatched:', event.type);
                });
            }
            
            console.log('Query auto-submission completed');
            
            // Clean up URL by removing the q parameter after a delay
            setTimeout(() => {
                try {
                    const url = new URL(window.location);
                    url.searchParams.delete('q');
                    window.history.replaceState({}, '', url);
                    console.log('URL cleaned up');
                } catch (error) {
                    console.log('Error cleaning URL:', error);
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error in auto-submit:', error);
            debugPageElements();
        }
    }
    
    // Multiple ways to trigger the auto-submit
    function initAutoSubmit() {
        console.log('Initializing auto-submit...');
        
        // Try immediately if page is already loaded
        if (document.readyState === 'complete') {
            setTimeout(autoSubmitQuery, 500);
        }
        
        // Try after DOM content loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(autoSubmitQuery, 1000);
            });
        }
        
        // Try after full page load
        window.addEventListener('load', () => {
            setTimeout(autoSubmitQuery, 1500);
        });
        
        // Try periodically for first 10 seconds (in case of slow loading)
        let attempts = 0;
        const maxAttempts = 10;
        const retryInterval = setInterval(() => {
            attempts++;
            console.log(`Retry attempt ${attempts}/${maxAttempts}`);
            
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('q')) {
                autoSubmitQuery();
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(retryInterval);
                console.log('Max retry attempts reached');
            }
        }, 1000);
    }
    
    // Start the auto-submit process
    initAutoSubmit();
    
})();