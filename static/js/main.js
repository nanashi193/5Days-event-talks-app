// State Management
let appState = {
    releases: [],
    selectedRelease: null,
    selectedText: "",
    isLoading: false
};

// DOM Elements
const btnRefresh = document.getElementById('btn-refresh');
const refreshIcon = document.getElementById('refresh-icon');
const refreshText = document.getElementById('refresh-text');
const releaseCount = document.getElementById('release-count');
const releasesList = document.getElementById('releases-list');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const btnRetry = document.getElementById('btn-retry');

const detailInstruction = document.getElementById('detail-instruction');
const detailCard = document.getElementById('detail-card');
const detailDate = document.getElementById('detail-date');
const detailTitleText = document.getElementById('detail-title-text');
const detailLink = document.getElementById('detail-link');
const detailContent = document.getElementById('detail-content');

const composerArea = document.getElementById('composer-area');
const btnClearSelection = document.getElementById('btn-clear-selection');
const selectedTextPreview = document.getElementById('selected-text-preview');
const charCounter = document.getElementById('char-counter');
const tweetTextarea = document.getElementById('tweet-textarea');
const mockTweetText = document.getElementById('mock-tweet-text');
const mockTweetTime = document.getElementById('mock-tweet-time');
const btnTweet = document.getElementById('btn-tweet');

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    fetchReleaseNotes();
    
    btnRefresh.addEventListener('click', fetchReleaseNotes);
    btnRetry.addEventListener('click', fetchReleaseNotes);
    btnClearSelection.addEventListener('click', clearSelection);
    
    // Tweet textarea live updates
    tweetTextarea.addEventListener('input', handleTweetTextareaInput);
    
    // Tweet post button
    btnTweet.addEventListener('click', postTweet);
    
    // Update mock tweet timestamp dynamically
    updateMockTime();
});

// ==========================================================================
// API Calls & Data Fetching
// ==========================================================================
async function fetchReleaseNotes() {
    if (appState.isLoading) return;
    
    setLoading(true);
    try {
        const response = await fetch('/api/releases');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.status === 'success') {
            appState.releases = data.releases;
            
            // Set Feed Metadata if available
            if (data.feed_title) {
                document.title = `${data.feed_title} | Tracker`;
            }
            
            renderReleasesList();
            showMainContent();
        } else {
            throw new Error(data.message || 'Failed to fetch release notes.');
        }
    } catch (error) {
        console.error('Error fetching release notes:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// ==========================================================================
// UI Rendering Functions
// ==========================================================================
function setLoading(loading) {
    appState.isLoading = loading;
    if (loading) {
        loadingState.classList.remove('hidden');
        releasesList.classList.add('hidden');
        errorState.classList.add('hidden');
        refreshIcon.classList.add('spinning');
        refreshText.textContent = 'Refreshing...';
        btnRefresh.disabled = true;
    } else {
        loadingState.classList.add('hidden');
        refreshIcon.classList.remove('spinning');
        refreshText.textContent = 'Refresh';
        btnRefresh.disabled = false;
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorState.classList.remove('hidden');
    releasesList.classList.add('hidden');
    loadingState.classList.add('hidden');
}

function showMainContent() {
    errorState.classList.add('hidden');
    releasesList.classList.remove('hidden');
}

function renderReleasesList() {
    releasesList.innerHTML = '';
    releaseCount.textContent = `${appState.releases.length} Updates`;
    
    if (appState.releases.length === 0) {
        releasesList.innerHTML = '<div class="loading-state"><p>No release notes found.</p></div>';
        return;
    }
    
    appState.releases.forEach((release) => {
        const card = document.createElement('div');
        card.className = 'release-card';
        card.setAttribute('data-id', release.id);
        if (appState.selectedRelease && appState.selectedRelease.id === release.id) {
            card.classList.add('active');
        }
        
        const formattedDate = formatDateString(release.updated);
        const relativeTime = getRelativeTime(release.updated);
        const textSnippet = stripHtml(release.content).substring(0, 100) + '...';
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-date">${formattedDate}</span>
                <span class="card-time-ago">${relativeTime}</span>
            </div>
            <div class="card-preview">${textSnippet}</div>
        `;
        
        card.addEventListener('click', () => selectRelease(release, card));
        releasesList.appendChild(card);
    });
}

function selectRelease(release, cardElement) {
    // Manage active state in list
    document.querySelectorAll('.release-card').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');
    
    appState.selectedRelease = release;
    
    // Clear selection from previous release
    clearSelection();
    
    // Render details
    detailInstruction.classList.add('hidden');
    detailCard.classList.remove('hidden');
    
    detailDate.textContent = formatDateString(release.updated);
    detailTitleText.textContent = release.title;
    detailLink.href = release.link;
    
    // Set content and process interactive elements
    detailContent.innerHTML = release.content || '<p>No detail content available.</p>';
    makeContentInteractive();
}

function makeContentInteractive() {
    // Select all paragraphs, list items inside detail-content to make them clickable
    const clickables = detailContent.querySelectorAll('p, li');
    
    clickables.forEach(elem => {
        // Skip elements that are empty or have no readable text
        if (elem.textContent.trim().length === 0) return;
        
        elem.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering parent clicks
            
            // Remove previous active styles
            detailContent.querySelectorAll('.selected-update').forEach(el => {
                el.classList.remove('selected-update');
            });
            
            // Set current active element
            elem.classList.add('selected-update');
            
            // Get selected text content
            const rawText = elem.textContent.trim();
            // Clean up double spaces or tabs
            appState.selectedText = rawText.replace(/\s+/g, ' ');
            
            // Show and populate composer
            composerArea.classList.remove('hidden');
            selectedTextPreview.textContent = `"${appState.selectedText}"`;
            
            // Prefill tweet content
            const defaultTweet = `Google Cloud BigQuery Update:\n\n"${appState.selectedText}"\n\n#BigQuery #GoogleCloud`;
            tweetTextarea.value = limitText(defaultTweet, 280);
            
            handleTweetTextareaInput();
            
            // Scroll to composer area smoothly on mobile/tablets
            if (window.innerWidth <= 992) {
                composerArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

function clearSelection() {
    appState.selectedText = "";
    
    // Remove highlighting
    detailContent.querySelectorAll('.selected-update').forEach(el => {
        el.classList.remove('selected-update');
    });
    
    // Hide composer
    composerArea.classList.add('hidden');
    tweetTextarea.value = "";
    mockTweetText.textContent = "";
}

function handleTweetTextareaInput() {
    const text = tweetTextarea.value;
    const remaining = 280 - text.length;
    
    charCounter.textContent = remaining;
    
    // Manage color warnings for char counter
    charCounter.className = 'char-counter';
    if (remaining < 0) {
        charCounter.classList.add('danger');
    } else if (remaining < 30) {
        charCounter.classList.add('warning');
    }
    
    // Update live preview in mock tweet card
    mockTweetText.textContent = text || "Compose your tweet details...";
    updateMockTime();
}

function postTweet() {
    const tweetText = tweetTextarea.value.trim();
    if (!tweetText) return;
    
    if (tweetText.length > 280) {
        alert("Your Tweet is too long! Please keep it under 280 characters.");
        return;
    }
    
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterIntentUrl, '_blank');
}

// ==========================================================================
// Helper Utilities
// ==========================================================================
function formatDateString(dateStr) {
    if (!dateStr) return 'Unknown Date';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

function getRelativeTime(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 30) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    } catch (e) {
        return '';
    }
}

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function limitText(text, limit) {
    if (text.length <= limit) return text;
    
    // Try to truncate elegantly
    const ellipsis = "...";
    const tags = "\n\n#BigQuery #GoogleCloud";
    const availableSpace = limit - tags.length - ellipsis.length;
    
    // Extract base content
    const baseMatch = text.match(/Google Cloud BigQuery Update:\n\n"([\s\S]*)"/);
    if (baseMatch && baseMatch[1]) {
        const truncatedSnippet = baseMatch[1].substring(0, availableSpace) + ellipsis;
        return `Google Cloud BigQuery Update:\n\n"${truncatedSnippet}"${tags}`;
    }
    
    return text.substring(0, limit - 3) + "...";
}

function updateMockTime() {
    const date = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    
    mockTweetTime.textContent = `${formattedTime} · ${formattedDate}`;
}
