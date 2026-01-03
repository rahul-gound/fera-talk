// Get DOM elements
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('modelSelect');
const customModelInput = document.getElementById('customModel');
const customModelGroup = document.getElementById('customModelGroup');
const workerUrlInput = document.getElementById('workerUrl');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Conversation history
let conversationHistory = [];

// Load saved settings from localStorage
function loadSettings() {
    const savedApiKey = localStorage.getItem('hf_api_key');
    const savedModel = localStorage.getItem('hf_model');
    const savedWorkerUrl = localStorage.getItem('worker_url');
    
    if (savedApiKey) apiKeyInput.value = savedApiKey;
    if (savedModel) {
        if (modelSelect.querySelector(`option[value="${savedModel}"]`)) {
            modelSelect.value = savedModel;
        } else {
            modelSelect.value = 'custom';
            customModelInput.value = savedModel;
            customModelGroup.style.display = 'block';
        }
    }
    if (savedWorkerUrl) workerUrlInput.value = savedWorkerUrl;
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('hf_api_key', apiKeyInput.value);
    const model = modelSelect.value === 'custom' ? customModelInput.value : modelSelect.value;
    localStorage.setItem('hf_model', model);
    localStorage.setItem('worker_url', workerUrlInput.value);
}

// Show/hide custom model input
modelSelect.addEventListener('change', () => {
    if (modelSelect.value === 'custom') {
        customModelGroup.style.display = 'block';
    } else {
        customModelGroup.style.display = 'none';
    }
});

// Save settings on change
[apiKeyInput, modelSelect, customModelInput, workerUrlInput].forEach(element => {
    element.addEventListener('change', saveSettings);
});

// Add message to chat
function addMessage(content, type = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.id = 'typing-indicator';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    
    messageDiv.appendChild(typingDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Get current model
function getCurrentModel() {
    return modelSelect.value === 'custom' ? customModelInput.value : modelSelect.value;
}

// Call Hugging Face API
async function callHuggingFaceAPI(message) {
    const apiKey = apiKeyInput.value.trim();
    const model = getCurrentModel();
    const workerUrl = workerUrlInput.value.trim();
    
    if (!apiKey) {
        throw new Error('Please enter your Hugging Face API token');
    }
    
    if (!model) {
        throw new Error('Please select or enter a model');
    }
    
    // Prepare the API request
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
    
    const body = {
        inputs: message,
        parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
        }
    };
    
    // Use Cloudflare Worker if URL is provided, otherwise direct API call
    if (workerUrl) {
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: apiKey,
                model: model,
                message: message
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Worker error: ${errorText}`);
        }
        
        return await response.json();
    } else {
        // Direct API call (may have CORS issues in browser)
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Handle different response formats
        if (Array.isArray(data) && data.length > 0) {
            if (data[0].generated_text) {
                return { generated_text: data[0].generated_text };
            } else if (data[0].translation_text) {
                return { generated_text: data[0].translation_text };
            } else if (data[0].summary_text) {
                return { generated_text: data[0].summary_text };
            }
        }
        
        return data;
    }
}

// Send message
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    conversationHistory.push({ role: 'user', content: message });
    
    // Clear input
    messageInput.value = '';
    
    // Disable send button and show typing indicator
    sendBtn.disabled = true;
    showTypingIndicator();
    
    try {
        // Call API
        const response = await callHuggingFaceAPI(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Extract response text
        let responseText = 'No response generated';
        if (response.generated_text) {
            responseText = response.generated_text;
        } else if (Array.isArray(response) && response.length > 0) {
            responseText = response[0].generated_text || response[0].translation_text || JSON.stringify(response[0]);
        } else if (typeof response === 'string') {
            responseText = response;
        }
        
        // Add assistant message
        addMessage(responseText, 'assistant');
        conversationHistory.push({ role: 'assistant', content: responseText });
        
    } catch (error) {
        removeTypingIndicator();
        console.error('Error:', error);
        addMessage(`Error: ${error.message}`, 'error');
        
        // Show helpful message about CORS
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            addMessage('💡 Tip: You may be experiencing CORS errors. Please deploy and use the Cloudflare Worker to bypass CORS restrictions.', 'system');
        }
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize
loadSettings();
addMessage('Welcome to Fera Talk! Configure your settings above and start chatting with AI models.', 'system');
