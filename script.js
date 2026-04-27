const API_URL = 'https://api.mail.tm';

let account = null;
let token = null;
let messages = [];
let currentMessageId = null;

// Initialize the app
async function init() {
    loadAccountFromStorage();
    if (!account) {
        await createNewAccount();
    } else {
        updateEmailUI();
        await fetchMessages();
    }
}

// Storage helpers
function loadAccountFromStorage() {
    const savedAccount = localStorage.getItem('temp_mail_account');
    const savedToken = localStorage.getItem('temp_mail_token');
    if (savedAccount && savedToken) {
        account = JSON.parse(savedAccount);
        token = savedToken;
    }
}

function saveAccountToStorage() {
    localStorage.setItem('temp_mail_account', JSON.stringify(account));
    localStorage.setItem('temp_mail_token', token);
}

// API Functions
async function createNewAccount() {
    try {
        // Get available domains
        const domainResponse = await fetch(`${API_URL}/domains`);
        const domains = await domainResponse.json();
        const domain = domains['hydra:member'][0].domain;

        // Generate random credentials
        const randomStr = Math.random().toString(36).substring(7);
        const address = `${randomStr}@${domain}`;
        const password = 'password123';

        // Create account
        const createResponse = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!createResponse.ok) throw new Error('Failed to create account');
        account = await createResponse.json();

        // Get token
        const tokenResponse = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const tokenData = await tokenResponse.json();
        token = tokenData.token;

        saveAccountToStorage();
        updateEmailUI();
    } catch (error) {
        console.error('Error creating account:', error);
    }
}

async function fetchMessages() {
    if (!token) return;
    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        messages = data['hydra:member'];
        if (typeof renderMessageList === 'function') {
            renderMessageList();
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

async function fetchMessageById(id) {
    if (!token) return;
    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching message details:', error);
    }
}

function updateEmailUI() {
    const emailInput = document.getElementById('temp-email');
    if (emailInput && account) {
        emailInput.value = account.address;
        generateQRCode(account.address);
    }
}

function renderMessageList() {
    const listEl = document.getElementById('message-list');
    if (!listEl) return;

    if (messages.length === 0) {
        listEl.innerHTML = '<div class="empty-inbox"><i class="fas fa-inbox"></i><p>Your inbox is empty</p></div>';
        return;
    }

    listEl.innerHTML = messages.map(msg => `
        <div class="message-item ${currentMessageId === msg.id ? 'active' : ''}" onclick="selectMessage('${msg.id}')">
            <div class="msg-sender"><strong>From:</strong> ${msg.from.address}</div>
            <div class="msg-subject">${msg.subject || '(No Subject)'}</div>
            <div class="msg-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
    `).join('');
}

async function selectMessage(id) {
    currentMessageId = id;
    renderMessageList();
    const messageView = document.getElementById('message-view');
    messageView.innerHTML = '<p>Loading message...</p>';

    const msgData = await fetchMessageById(id);
    if (msgData) {
        messageView.innerHTML = `
            <div class="message-full">
                <h3>${msgData.subject || '(No Subject)'}</h3>
                <p><strong>From:</strong> ${msgData.from.address}</p>
                <hr>
                <div class="message-body">
                    <iframe sandbox srcdoc="${msgData.html || msgData.text}" frameborder="0" width="100%" height="400px"></iframe>
                </div>
            </div>
        `;
    }
}

window.selectMessage = selectMessage; // Make it global for onclick

function generateQRCode(text) {
    const qrImg = document.getElementById('qr-code');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
    }
}

// Event Listeners for new email and refresh
document.getElementById('refresh-email').addEventListener('click', async () => {
    localStorage.removeItem('temp_mail_account');
    localStorage.removeItem('temp_mail_token');
    await createNewAccount();
    await fetchMessages();
});

document.getElementById('force-refresh').addEventListener('click', fetchMessages);

// Clipboard Logic
document.getElementById('copy-email').addEventListener('click', () => {
    const emailInput = document.getElementById('temp-email');
    emailInput.select();
    navigator.clipboard.writeText(emailInput.value);

    const copyBtn = document.getElementById('copy-email');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
});

// QR Code Toggle
document.getElementById('show-qr').addEventListener('click', () => {
    const qrContainer = document.getElementById('qr-container');
    qrContainer.classList.toggle('hidden');
    const btnText = document.getElementById('show-qr');
    if (qrContainer.classList.contains('hidden')) {
        btnText.innerHTML = '<i class="fas fa-qrcode"></i> QR Code';
    } else {
        btnText.innerHTML = '<i class="fas fa-times"></i> Hide QR';
    }
});

// Accent Color Picker
const accentColors = document.querySelectorAll('.accent-color');
accentColors.forEach(color => {
    color.addEventListener('click', () => {
        const hex = color.getAttribute('data-color');
        document.documentElement.style.setProperty('--primary', hex);
        accentColors.forEach(c => c.classList.remove('active'));
        color.classList.add('active');
        localStorage.setItem('mail_accent', hex);
    });
});

// Load saved accent color
const savedAccent = localStorage.getItem('mail_accent');
if (savedAccent) {
    document.documentElement.style.setProperty('--primary', savedAccent);
    accentColors.forEach(c => {
        if (c.getAttribute('data-color') === savedAccent) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
}

// SPA Routing Logic
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links li, .logo, .footer-links span');

function showSection(sectionId) {
    sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === sectionId) {
            sec.classList.add('active');
        }
    });

    // Update nav active state
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('data-section') === sectionId) {
            li.classList.add('active');
        }
    });

    // Reset mobile menu if open
    document.querySelector('.nav-links').classList.remove('mobile-active');
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const sectionId = link.getAttribute('data-section');
        if (sectionId) showSection(sectionId);
    });
});

// Mobile Menu Toggle
document.getElementById('mobile-menu').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('mobile-active');
});

// Multi-language Support
let currentLang = 'EN';
const translations = {
    'EN': {
        'hero-title': 'Your Secure Temporary Email',
        'hero-subtitle': 'Protect your privacy and stay anonymous with our disposable email service.',
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About Us',
        'nav-contact': 'Contact Us'
    },
    'HI': {
        'hero-title': 'आपका सुरक्षित अस्थायी ईमेल',
        'hero-subtitle': 'हमारी डिस्पोजेबल ईमेल सेवा के साथ अपनी गोपनीयता की रक्षा करें और गुमनाम रहें।',
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-contact': 'संपर्क करें'
    }
};

document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'EN' ? 'HI' : 'EN';
    document.getElementById('lang-text').textContent = currentLang === 'EN' ? 'HI' : 'EN';
    updateLanguage();
});

function updateLanguage() {
    const texts = translations[currentLang];
    for (const id in texts) {
        const el = document.getElementById(id);
        if (el) el.textContent = texts[id];
    }
}

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    const themeIcon = document.querySelector('#theme-toggle i');
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
});

// Set default theme
document.body.setAttribute('data-theme', 'light');

// Auto-Refresh Logic
let timeLeft = 10;
const timerEl = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');

function startTimer() {
    setInterval(async () => {
        timeLeft--;
        if (timeLeft < 0) {
            timeLeft = 10;
            await fetchMessages();
        }
        if (timerEl) timerEl.textContent = timeLeft;
        if (progressBar) progressBar.style.width = `${(10 - timeLeft) * 10}%`;
    }, 1000);
}

// Notifications
async function requestNotificationPermission() {
    if ('Notification' in window) {
        await Notification.requestPermission();
    }
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body });
    }
}

// Wrap fetchMessages to show notifications
const originalFetchMessages = fetchMessages;
fetchMessages = async function() {
    const oldMessageCount = messages.length;
    await originalFetchMessages();
    if (messages.length > oldMessageCount) {
        showNotification('New Email Received!', messages[0].subject || 'You have a new message.');
    }
};

// Initial Call
init();
startTimer();
requestNotificationPermission();
