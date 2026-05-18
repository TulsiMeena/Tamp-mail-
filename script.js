const API_URL = 'https://api.mail.tm';

const state = {
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
    currentAccount: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
    messages: [],
    theme: localStorage.getItem('mail_theme') || 'dark',
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || '#4a90e2',
    refreshTimer: 7,
    isRefreshing: false
};

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Registration Failed', err));
    });
}

// --- Initialization ---
window.App = {
    init: initApp,
    state: state,
    createNewAccount: createNewAccount,
    fetchMessages: fetchMessages,
    showSection: showSection
};

document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});

function initApp() {
    applyTheme();
    applyAccent();
    applyLanguage();
    setupEventListeners();

    if (state.currentAccount) {
        startPolling();
    } else {
        createNewAccount();
    }
}

// --- API Logic ---
async function createNewAccount() {
    try {
        const domainResp = await fetch(`${API_URL}/domains`);
        const domains = await domainResp.json();
        const domain = domains['hydra:member'][0].domain;

        const username = Math.random().toString(36).substring(2, 12);
        const password = Math.random().toString(36).substring(2, 15);
        const address = `${username}@${domain}`;

        const createResp = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!createResp.ok) throw new Error('Account creation failed');

        const tokenResp = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const { token } = await tokenResp.json();

        const newAccount = { address, password, token, createdAt: new Date().toISOString() };
        state.currentAccount = newAccount;
        state.accounts.push(newAccount);
        saveState();

        updateUI();
        startPolling();
        showToast('New email address generated!');
    } catch (err) {
        showToast('Error creating account: ' + err.message, 'error');
    }
}

async function fetchMessages() {
    if (!state.currentAccount || state.isRefreshing) return;
    state.isRefreshing = true;

    try {
        const resp = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${state.currentAccount.token}` }
        });
        const data = await resp.json();
        state.messages = data['hydra:member'];
        renderMessages();
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isRefreshing = false;
    }
}

// --- UI Logic ---
function updateUI() {
    const emailEl = document.getElementById('current-email');
    if (emailEl) emailEl.textContent = state.currentAccount ? state.currentAccount.address : 'loading...';
}

function renderMessages() {
    const listEl = document.getElementById('email-list');
    if (!listEl) return;

    if (state.messages.length === 0) {
        listEl.innerHTML = `<div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p id="empty-inbox">${translations[state.lang]['empty-inbox']}</p>
        </div>`;
        return;
    }

    listEl.innerHTML = state.messages.map(msg => `
        <div class="email-item" onclick="viewMessage('${msg.id}')">
            <div class="email-info">
                <strong>${msg.from.address}</strong>
                <p>${msg.subject || '(No Subject)'}</p>
            </div>
            <span class="email-time">${new Date(msg.createdAt).toLocaleTimeString()}</span>
        </div>
    `).join('');
}

async function viewMessage(id) {
    try {
        const resp = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${state.currentAccount.token}` }
        });
        const msg = await resp.json();

        document.getElementById('email-list').classList.add('hidden');
        document.getElementById('email-detail').classList.remove('hidden');

        document.getElementById('detail-subject').textContent = msg.subject;
        document.getElementById('detail-from').textContent = `${translations[state.lang]['label-from']}: ${msg.from.address}`;
        document.getElementById('detail-date').textContent = new Date(msg.createdAt).toLocaleString();

        const frame = document.getElementById('email-frame');
        const content = msg.html ? (Array.isArray(msg.html) ? msg.html.join('') : msg.html) : msg.text;
        frame.srcdoc = content;
    } catch (err) {
        showToast('Error loading message', 'error');
    }
}

// --- Utilities ---
function saveState() {
    localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));
    localStorage.setItem('temp_mail_account', JSON.stringify(state.currentAccount));
    localStorage.setItem('mail_theme', state.theme);
    localStorage.setItem('mail_lang', state.lang);
    localStorage.setItem('mail_accent', state.accent);
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function applyTheme() {
    document.body.className = `${state.theme}-theme`;
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.innerHTML = state.theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function applyAccent() {
    document.documentElement.style.setProperty('--primary', state.accent);
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveState();
    });

    // Language Toggle
    document.getElementById('lang-toggle').addEventListener('click', () => {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        applyLanguage();
        saveState();
    });

    // Mobile Menu
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('active');
    });

    // Actions
    document.getElementById('copy-email-btn').addEventListener('click', () => {
        if (state.currentAccount) {
            navigator.clipboard.writeText(state.currentAccount.address);
            showToast('Address copied to clipboard!');
        }
    });

    document.getElementById('back-to-list').addEventListener('click', () => {
        document.getElementById('email-detail').classList.add('hidden');
        document.getElementById('email-list').classList.remove('hidden');
    });

    document.getElementById('refresh-now-btn').addEventListener('click', () => {
        fetchMessages();
        state.refreshTimer = 7;
    });

    document.getElementById('add-mailbox-btn').addEventListener('click', createNewAccount);

    document.getElementById('qr-btn').addEventListener('click', () => {
        if (state.currentAccount) {
            const qrImg = document.getElementById('qr-code-img');
            const email = encodeURIComponent(state.currentAccount.address);
            qrImg.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${email}" alt="QR Code">`;
            document.getElementById('qr-modal').classList.add('active');
        }
    });

    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('qr-modal').classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    document.querySelectorAll('.accent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.accent = btn.getAttribute('data-color');
            applyAccent();
            saveState();
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    if (window.innerWidth <= 768) {
        document.getElementById('nav-links').classList.remove('active');
    }
}

// --- Polling Logic ---
function startPolling() {
    if (window.pollingInterval) clearInterval(window.pollingInterval);

    window.pollingInterval = setInterval(() => {
        state.refreshTimer--;

        if (state.refreshTimer <= 0) {
            state.refreshTimer = 7;
            fetchMessages();
        }

        updatePollingUI();
    }, 1000);
}

function updatePollingUI() {
    const bar = document.querySelector('.progress-bar');
    const status = document.getElementById('refresh-status');

    if (bar) {
        const width = ((7 - state.refreshTimer) / 7) * 100;
        bar.style.setProperty('--progress-width', `${width}%`);
    }

    if (status) {
        const text = translations[state.lang]['refresh-status'] || 'Checking in 7s...';
        status.textContent = text.replace('7s', `${state.refreshTimer}s`);
    }
}

// --- Localization Logic ---
function applyLanguage() {
    const trans = translations[state.lang];
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.innerHTML = state.lang === 'en' ? 'EN' : 'HI';

    Object.keys(trans).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'A') {
                el.textContent = trans[key];
            } else if (el.classList.contains('btn-primary') || el.classList.contains('btn-secondary')) {
                const textEl = el.querySelector('.btn-text');
                if (textEl) textEl.textContent = trans[key];
                else el.textContent = trans[key];
            } else {
                el.textContent = trans[key];
            }
        }
    });

    updatePollingUI();
}

const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About Us',
        'nav-privacy': 'Privacy',
        'hero-title': 'Secure Your Inbox',
        'hero-desc': 'Generate temporary disposable email addresses to keep your real inbox clean and safe from spam.',
        'btn-get-started': 'Get Started',
        'stat-emails-label': 'Emails Received',
        'stat-time-label': 'Time Saved',
        'how-title': 'How It Works',
        's1-title': 'Generate',
        's1-desc': 'Create a new temporary email address with one click.',
        's2-title': 'Receive',
        's2-desc': 'Use it to sign up or receive confirmation codes.',
        's3-title': 'Auto-Purge',
        's3-desc': 'Emails are automatically deleted after 24 hours.',
        'feedback-title': 'User Reviews & Feedback',
        'faq-title': 'Frequently Asked Questions',
        'faq-q1': 'What is Temp Mail?',
        'faq-a1': 'Temporary mail is a disposable email address used to protect your privacy.',
        'inbox-title': 'Your Mailbox',
        'btn-add-mail': 'New Mailbox',
        'empty-inbox': 'Your inbox is empty',
        'refresh-status': 'Checking in 7s...',
        'about-title': 'About the Developers',
        'skill1': 'Full Stack Developer',
        'skill2': 'UI/UX Designer',
        'privacy-title': 'Privacy Policy',
        'privacy-desc': 'We value your privacy. We do not store any personal data or logs of your emails.',
        'glos-title': 'Privacy Glossary',
        'back-text': 'Back',
        'label-from': 'From'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-privacy': 'गोपनीयता',
        'hero-title': 'अपना इनबॉक्स सुरक्षित करें',
        'hero-desc': 'अपने असली इनबॉक्स को साफ और स्पैम से सुरक्षित रखने के लिए अस्थायी डिस्पोजेबल ईमेल पते जेनरेट करें।',
        'btn-get-started': 'शुरू करें',
        'stat-emails-label': 'प्राप्त ईमेल',
        'stat-time-label': 'बचाया गया समय',
        'how-title': 'यह कैसे काम करता है',
        's1-title': 'जेनरेट करें',
        's1-desc': 'एक क्लिक के साथ एक नया अस्थायी ईमेल पता बनाएं।',
        's2-title': 'प्राप्त करें',
        's2-desc': 'साइन अप करने या पुष्टिकरण कोड प्राप्त करने के लिए इसका उपयोग करें।',
        's3-title': 'ऑटो-डिलीट',
        's3-desc': 'ईमेल 24 घंटे के बाद अपने आप डिलीट हो जाते हैं।',
        'feedback-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'faq-q1': 'अस्थायी मेल क्या है?',
        'faq-a1': 'अस्थायी मेल एक डिस्पोजेबल ईमेल पता है जिसका उपयोग आपकी गोपनीयता की रक्षा के लिए किया जाता है।',
        'inbox-title': 'आपका मेलबॉक्स',
        'btn-add-mail': 'नया मेलबॉक्स',
        'empty-inbox': 'आपका इनबॉक्स खाली है',
        'refresh-status': '7s में जाँच हो रही है...',
        'about-title': 'डेवलपर्स के बारे में',
        'skill1': 'फुल स्टैक डेवलपर',
        'skill2': 'UI/UX डिज़ाइनर',
        'privacy-title': 'गोपनीयता नीति',
        'privacy-desc': 'हम आपकी गोपनीयता को महत्व देते हैं। हम आपके ईमेल का कोई व्यक्तिगत डेटा या लॉग स्टोर नहीं करते हैं।',
        'glos-title': 'गोपनीयता शब्दावली',
        'back-text': 'वापस',
        'label-from': 'प्रेषक'
    }
};
