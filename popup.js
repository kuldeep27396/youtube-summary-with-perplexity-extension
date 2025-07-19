document.addEventListener('DOMContentLoaded', function() {
    const extractBtn = document.getElementById('extractBtn');
    const statusDiv = document.getElementById('status');
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
    }
    
    function hideStatus() {
        statusDiv.style.display = 'none';
    }
    
    extractBtn.addEventListener('click', async function() {
        try {
            extractBtn.disabled = true;
            showStatus('Extracting transcript...', 'loading');
            
            // Get current tab
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // Check if we're on YouTube
            if (!tab.url.includes('youtube.com/watch')) {
                showStatus('Please navigate to a YouTube video first', 'error');
                extractBtn.disabled = false;
                return;
            }
            
            // Get video title and URL
            const videoTitle = await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: getVideoTitle
            });
            
            const title = videoTitle[0].result;
            const videoUrl = tab.url;
            
            // Create an optimized prompt for Perplexity to extract and summarize
            const query = `Please analyze this YouTube video: ${videoUrl}

Extract the full transcript and provide a comprehensive summary with the following structure:

## Video: "${title}"

## Key Points Summary
- List the main topics and key insights
- Include important details and examples mentioned
- Highlight any actionable advice or recommendations

## Detailed Summary
Provide a well-structured summary that captures:
- The main thesis or central message
- Supporting arguments and evidence
- Practical applications or takeaways
- Any notable quotes or specific data mentioned

Please make the summary detailed enough to understand the full content without watching the video.`;
            
            // Open Perplexity in new tab
            const perplexityUrl = `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`;
            chrome.tabs.create({url: perplexityUrl});
            
            showStatus('Video sent to Perplexity for analysis!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showStatus('Error extracting transcript', 'error');
        } finally {
            extractBtn.disabled = false;
        }
    });
    
    // Function to be injected into the page
    function extractTranscript() {
        // Try to find transcript elements
        const transcriptElements = document.querySelectorAll('ytd-transcript-segment-renderer');
        
        if (transcriptElements.length === 0) {
            // Try to click the transcript button to open it
            const transcriptButton = document.querySelector('button[aria-label*="transcript" i], button[aria-label*="Show transcript" i]');
            if (transcriptButton) {
                transcriptButton.click();
                
                // Wait a bit and try again
                return new Promise(resolve => {
                    setTimeout(() => {
                        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
                        if (segments.length > 0) {
                            let transcript = '';
                            segments.forEach(segment => {
                                const textElement = segment.querySelector('.segment-text');
                                if (textElement) {
                                    transcript += textElement.textContent.trim() + ' ';
                                }
                            });
                            resolve(transcript.trim());
                        } else {
                            resolve(null);
                        }
                    }, 2000);
                });
            }
            return null;
        }
        
        // Extract transcript text
        let transcript = '';
        transcriptElements.forEach(element => {
            const textElement = element.querySelector('.segment-text');
            if (textElement) {
                transcript += textElement.textContent.trim() + ' ';
            }
        });
        
        return transcript.trim();
    }
    
    function getVideoTitle() {
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string');
        return titleElement ? titleElement.textContent.trim() : 'YouTube Video';
    }
});