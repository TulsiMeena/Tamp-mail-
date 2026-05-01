// Translation dictionary
const translations = {
    en: {
        nav_home: "Home",
        nav_about: "About Us",
        nav_contact: "Contact Us",
        nav_privacy: "Privacy Policy",
        hero_title: "Your Disposable Email Address",
        hero_subtitle: "Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.",
        copy: "Copy",
        refresh: "Refresh",
        new_mail: "New Email",
        delete_mail: "Delete",
        qr_code: "QR Code",
        inbox_title: "Your Inbox",
        empty_inbox: "Waiting for incoming emails...",
        stat_received: "Emails Received",
        stat_saved: "Time Saved",
        how_it_works: "How It Works",
        s1: "Step 1: Get your address",
        s2: "Step 2: Use it anywhere",
        s3: "Step 3: Check your inbox",
        about_title: "About Us",
        skill1: "Full Stack Developer",
        skill2: "UI/UX Designer",
        contact_title: "Contact Us",
        privacy_title: "Privacy Policy",
        glos_title: "Privacy Glossary"
    },
    hi: {
        nav_home: "होम",
        nav_about: "हमारे बारे में",
        nav_contact: "संपर्क करें",
        nav_privacy: "गोपनीयता नीति",
        hero_title: "आपका डिस्पोजेबल ईमेल पता",
        hero_subtitle: "स्पैम, विज्ञापन मेलिंग, हैकिंग और हमलावर रोबोट के बारे में भूल जाएं। अपने असली मेलबॉक्स को साफ और सुरक्षित रखें।",
        copy: "कॉपी",
        refresh: "रिफ्रेश",
        new_mail: "नया ईमेल",
        delete_mail: "डिलीट",
        qr_code: "QR कोड",
        inbox_title: "आपका इनबॉक्स",
        empty_inbox: "आने वाले ईमेल की प्रतीक्षा कर रहा है...",
        stat_received: "प्राप्त ईमेल",
        stat_saved: "बचाया गया समय",
        how_it_works: "यह कैसे काम करता है",
        s1: "चरण 1: अपना पता प्राप्त करें",
        s2: "चरण 2: इसे कहीं भी उपयोग करें",
        s3: "चरण 3: अपना इनबॉक्स जांचें",
        about_title: "हमारे बारे में",
        skill1: "फुल स्टैक डेवलपर",
        skill2: "UI/UX डिजाइनर",
        contact_title: "संपर्क करें",
        privacy_title: "गोपनीयता नीति",
        glos_title: "गोपनीयता शब्दावली"
    }
};

// State management
let currentLang = localStorage.getItem('mail_lang') || 'en';
let currentAccent = localStorage.getItem('mail_accent') || 'blue';
let currentTheme = localStorage.getItem('mail_theme') || 'dark';

// DOM Elements
const navLinks = document.querySelectorAll('#nav-links a');
const sections = document.querySelectorAll('main section');
const langToggle = document.getElementById('lang-toggle');
const accentBtns = document.querySelectorAll('.accent-btn');

// SPA Routing
function showSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const targetSection = document.getElementById(`${sectionId}-section`);
    const targetLink = document.querySelector(`[data-section="${sectionId}"]`);

    if (targetSection) targetSection.classList.add('active');
    if (targetLink) targetLink.classList.add('active');
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

// Localization
function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = translations[currentLang][key] || el.textContent;
    });
    localStorage.setItem('mail_lang', currentLang);
}

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    updateLanguage();
});

// Theme and Accent
function updateAccent(color) {
    const colors = {
        blue: '#3b82f6',
        green: '#10b981',
        red: '#ef4444',
        pink: '#ec4899'
    };
    document.documentElement.style.setProperty('--primary', colors[color]);
    localStorage.setItem('mail_accent', color);
}

accentBtns.forEach(btn => {
    btn.addEventListener('click', () => updateAccent(btn.dataset.color));
});

// Mail.tm API Integration
const API_URL = 'https://api.mail.tm';

async function apiRequest(endpoint, method = 'GET', body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && localStorage.getItem('temp_mail_token')) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('temp_mail_token')}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

async function getDomains() {
    const data = await apiRequest('/domains', 'GET', null, false);
    return data['hydra:member'];
}

async function createAccount(address, password) {
    return await apiRequest('/accounts', 'POST', { address, password }, false);
}

async function getToken(address, password) {
    return await apiRequest('/token', 'POST', { address, password }, false);
}

async function getMessages(page = 1) {
    const data = await apiRequest(`/messages?page=${page}`);
    return data['hydra:member'];
}

async function getMessage(id) {
    return await apiRequest(`/messages/${id}`);
}

async function viewMail(id) {
    try {
        const msg = await getMessage(id);
        const modal = document.getElementById('qr-modal');
        const display = document.getElementById('qr-code-display');

        display.innerHTML = `
            <div class="mail-view">
                <h3>${msg.subject}</h3>
                <p><strong>From:</strong> ${msg.from.address}</p>
                <hr>
                <div class="mail-body">${msg.html || msg.text}</div>
                <hr>
                <button onclick="downloadMail('${id}')">Download TXT</button>
                <button onclick="window.print()">Print</button>
            </div>
        `;
        modal.style.display = 'block';

        // Mark as read
        let readMsgs = JSON.parse(localStorage.getItem('read_messages') || '[]');
        if (!readMsgs.includes(id)) {
            readMsgs.push(id);
            localStorage.setItem('read_messages', JSON.stringify(readMsgs));
        }
    } catch (error) {
        showToast('Failed to load message', 'error');
    }
}

async function downloadMail(id) {
    const msg = await getMessage(id);
    const blob = new Blob([msg.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_${id}.txt`;
    a.click();
}

// Mailbox Management
let refreshTimer = 7;
let timerInterval;

async function generateNewEmail() {
    try {
        const domains = await getDomains();
        const domain = domains[0].domain;
        const randomStr = Math.random().toString(36).substring(2, 10);
        const address = `${randomStr}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        showToast('Creating account...', 'info');
        await createAccount(address, password);
        const tokenData = await getToken(address, password);

        localStorage.setItem('temp_mail_account', address);
        localStorage.setItem('temp_mail_token', tokenData.token);

        // Multi-mailbox persistence
        let accounts = JSON.parse(localStorage.getItem('temp_mail_accounts') || '[]');
        accounts.push({ address, token: tokenData.token, createdAt: new Date() });
        localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));

        document.getElementById('temp-email').value = address;
        showToast('Email generated!', 'success');
        startInboxPolling();
    } catch (error) {
        showToast('Failed to generate email', 'error');
    }
}

function startInboxPolling() {
    if (timerInterval) clearInterval(timerInterval);
    refreshTimer = 7;

    timerInterval = setInterval(async () => {
        refreshTimer--;
        const progress = ((7 - refreshTimer) / 7) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('timer-text').textContent = `Refreshing in ${refreshTimer}s`;

        if (refreshTimer <= 0) {
            refreshTimer = 7;
            await fetchInbox();
        }
    }, 1000);
}

async function fetchInbox() {
    if (!localStorage.getItem('temp_mail_token')) return;
    try {
        const messages = await getMessages();

        // Notification logic
        const oldMessages = JSON.parse(localStorage.getItem('last_messages') || '[]');
        if (messages.length > oldMessages.length) {
            const newMsg = messages[0];
            showToast(`New email: ${newMsg.subject}`, 'success');
            if (Notification.permission === "granted") {
                new Notification("New Email", { body: newMsg.subject });
            }
        }
        localStorage.setItem('last_messages', JSON.stringify(messages.map(m => m.id)));

        renderInbox(messages);
    } catch (error) {
        console.error('Fetch inbox error:', error);
    }
}

// Request notification permission
if ("Notification" in window) {
    Notification.requestPermission();
}

function renderInbox(messages) {
    const list = document.getElementById('inbox-list');
    if (!messages || messages.length === 0) {
        list.innerHTML = `<p class="empty-inbox">${translations[currentLang].empty_inbox}</p>`;
        return;
    }

    list.innerHTML = messages.map(msg => `
        <div class="message-card" onclick="viewMail('${msg.id}')">
            <div class="msg-sender">${msg.from.address}</div>
            <div class="msg-subject">${msg.subject}</div>
            <div class="msg-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
    `).join('');
}

// Toast system
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initial calls
updateLanguage();
updateAccent(currentAccent);

if (localStorage.getItem('temp_mail_account')) {
    document.getElementById('temp-email').value = localStorage.getItem('temp_mail_account');
    startInboxPolling();
} else {
    generateNewEmail();
}

// Event Listeners
document.getElementById('refresh-now-btn').addEventListener('click', () => {
    refreshTimer = 0;
});

document.getElementById('copy-btn').addEventListener('click', () => {
    const email = document.getElementById('temp-email').value;
    navigator.clipboard.writeText(email);
    showToast('Copied to clipboard!', 'success');
});

document.getElementById('new-mail-btn').addEventListener('click', () => {
    localStorage.removeItem('temp_mail_account');
    localStorage.removeItem('temp_mail_token');
    generateNewEmail();
});

document.getElementById('delete-mailbox-btn').addEventListener('click', () => {
    const currentAddr = localStorage.getItem('temp_mail_account');
    let accounts = JSON.parse(localStorage.getItem('temp_mail_accounts') || '[]');
    accounts = accounts.filter(acc => acc.address !== currentAddr);
    localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));

    localStorage.removeItem('temp_mail_account');
    localStorage.removeItem('temp_mail_token');

    showToast('Mailbox deleted', 'info');
    generateNewEmail();
});

// QR Code Generator
document.getElementById('qr-btn').addEventListener('click', () => {
    const email = document.getElementById('temp-email').value;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}`;

    document.getElementById('qr-code-display').innerHTML = `<img src="${qrUrl}" alt="QR Code">`;
    document.getElementById('qr-modal').style.display = 'block';
});

document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('qr-modal').style.display = 'none';
});

window.onclick = (event) => {
    if (event.target == document.getElementById('qr-modal')) {
        document.getElementById('qr-modal').style.display = 'none';
    }
};

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW error', err));
    });
}

console.log('App initialized');
