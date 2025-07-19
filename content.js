// Content script for YouTube transcript extraction
// This script runs on YouTube pages and helps with transcript extraction

// Wait for page to load
window.addEventListener('load', function() {
    // Add a small delay to ensure YouTube's dynamic content is loaded
    setTimeout(initializeExtension, 2000);
});

function initializeExtension() {
    // Check if we're on a YouTube video page
    if (window.location.pathname === '/watch') {
        // Add visual indicator that extension is active
        addExtensionIndicator();
        
        // Listen for transcript requests
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractTranscript') {
                extractTranscriptFromPage()
                    .then(transcript => sendResponse({transcript: transcript}))
                    .catch(error => sendResponse({error: error.message}));
                return true; // Keep message channel open for async response
            }
        });
    }
}

function addExtensionIndicator() {
    // Create a small indicator to show extension is active
    const indicator = document.createElement('div');
    indicator.id = 'transcript-extension-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff0000;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        opacity: 0.8;
        transition: opacity 0.3s;
    `;
    indicator.textContent = '📝 Transcript Ready';
    document.body.appendChild(indicator);
    
    // Hide indicator after 3 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }, 3000);
}

async function extractTranscriptFromPage() {
    return new Promise((resolve, reject) => {
        // First, try to find existing transcript
        let transcriptElements = document.querySelectorAll('ytd-transcript-segment-renderer');
        
        if (transcriptElements.length > 0) {
            resolve(extractTextFromElements(transcriptElements));
            return;
        }
        
        // If no transcript visible, try to open it
        openTranscriptPanel().then(() => {
            // Wait for transcript to load
            const checkForTranscript = setInterval(() => {
                transcriptElements = document.querySelectorAll('ytd-transcript-segment-renderer');
                if (transcriptElements.length > 0) {
                    clearInterval(checkForTranscript);
                    resolve(extractTextFromElements(transcriptElements));
                }
            }, 500);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkForTranscript);
                reject(new Error('Transcript not found or not available'));
            }, 10000);
        }).catch(reject);
    });
}

function openTranscriptPanel() {
    return new Promise((resolve, reject) => {
        // Look for the more actions button (three dots)
        const moreActionsButton = document.querySelector('button[aria-label*="More actions" i]');
        if (moreActionsButton) {
            moreActionsButton.click();
            
            setTimeout(() => {
                // Look for transcript option in the menu
                const transcriptOption = Array.from(document.querySelectorAll('tp-yt-paper-listbox a, tp-yt-paper-listbox ytd-menu-service-item-renderer'))
                    .find(item => item.textContent.toLowerCase().includes('transcript'));
                
                if (transcriptOption) {
                    transcriptOption.click();
                    resolve();
                } else {
                    reject(new Error('Transcript option not found in menu'));
                }
            }, 500);
        } else {
            reject(new Error('More actions button not found'));
        }
    });
}

function extractTextFromElements(elements) {
    let transcript = '';
    elements.forEach(element => {
        const textElement = element.querySelector('.segment-text');
        if (textElement) {
            transcript += textElement.textContent.trim() + ' ';
        }
    });
    return transcript.trim();
}