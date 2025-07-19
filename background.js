// Background script (Service Worker) for YouTube Transcript Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('YouTube Transcript Extension installed');
    } else if (details.reason === 'update') {
        console.log('YouTube Transcript Extension updated');
    }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPerplexity') {
        // Open Perplexity in a new tab with the transcript
        const query = `Please summarize this YouTube video transcript: "${request.title}"\n\nTranscript:\n${request.transcript}`;
        const perplexityUrl = `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`;
        
        chrome.tabs.create({
            url: perplexityUrl,
            active: true
        });
        
        sendResponse({success: true});
    }
    
    return true; // Keep message channel open for async responses
});

// Handle tab updates to detect YouTube navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
        // Inject content script if needed
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            // Script might already be injected, ignore error
            console.log('Content script already injected or error:', err);
        });
    }
});

// Context menu for right-click functionality
chrome.contextMenus.create({
    id: 'extractTranscript',
    title: 'Extract Transcript to Perplexity',
    contexts: ['page'],
    documentUrlPatterns: ['https://www.youtube.com/watch*', 'https://youtube.com/watch*']
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extractTranscript') {
        // Send message to content script to extract transcript
        chrome.tabs.sendMessage(tab.id, {action: 'extractTranscript'}, (response) => {
            if (response && response.transcript) {
                // Get video title
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: () => {
                        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string');
                        return titleElement ? titleElement.textContent.trim() : 'YouTube Video';
                    }
                }).then(result => {
                    const title = result[0].result;
                    const query = `Please summarize this YouTube video transcript: "${title}"\n\nTranscript:\n${response.transcript}`;
                    const perplexityUrl = `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`;
                    
                    chrome.tabs.create({url: perplexityUrl});
                });
            }
        });
    }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'extract-transcript') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tab = tabs[0];
            if (tab.url && tab.url.includes('youtube.com/watch')) {
                chrome.tabs.sendMessage(tab.id, {action: 'extractTranscript'});
            }
        });
    }
});