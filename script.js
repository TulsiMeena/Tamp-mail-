/**
 * TempMail Pro - script.js
 * Handles Mail.tm API integration, SPA routing, Localization, and UI updates.
 */

const API_URL = 'https://api.mail.tm';

const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    accent: localStorage.getItem('mail_accent') || '#4a90e2',
    account: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
    token: localStorage.getItem('temp_mail_token') || null,
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
    messages: [],
    pollingTimer: null,
    pollingSeconds: 7,
    stats: {
        emailsReceived: parseInt(localStorage.getItem('stats_emails')) || 0,
        timeSaved: parseInt(localStorage.getItem('stats_time')) || 0
    }
};

const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About',
        'nav-privacy': 'Privacy',
        'hero-title': 'Your Secure Temporary Email',
        'hero-subtitle': 'Protect your privacy and keep your real inbox clean from spam.',
        'btn-get-started': 'Get Started',
        'stat-emails-text': 'Emails Received',
        'stat-time-text': 'Time Saved',
        'stat-privacy-text': 'Privacy Focused',
        'how-it-works-title': 'How It Works',
        's1-title': 'Generate',
        's1-desc': 'Pick or generate a random email address instantly.',
        's2-title': 'Receive',
        's2-desc': 'Use it to sign up for services or receive files.',
        's3-title': 'Read/Delete',
        's3-desc': 'Read emails in real-time and delete them when done.',
        'btn-new': 'New',
        'btn-refresh': 'Refresh',
        'refresh-status': 'Checking for new mail in 7s...',
        'empty-inbox-text': 'Your inbox is empty',
        'select-mail-text': 'Select an email to read',
        'accounts-title': 'My Mailboxes',
        'about-title': 'About Us',
        'aman-desc': 'Full Stack Developer & UI/UX Enthusiast.',
        'amit-desc': 'Backend Engineer & Security Specialist.',
        'privacy-title': 'Privacy Policy',
        'privacy-intro': 'We value your privacy. This service is designed to keep your personal data safe.',
        'glos-title': 'Privacy Glossary',
        'key-benefits-title': 'Key Benefits',
        'feat-fast-title': 'Instant Setup',
        'feat-fast-desc': 'No registration required. Get your email address in one click.',
        'feat-secure-title': 'Private & Secure',
        'feat-secure-desc': 'We never store your personal data. All emails are encrypted.',
        'feat-auto-title': 'Auto Deletion',
        'feat-auto-desc': 'Emails are automatically purged after 24 hours for your safety.',
        'faq-title': 'Frequently Asked Questions',
        'faq-q1': 'Is this service free?',
        'faq-a1': 'Yes, TempMail Pro is 100% free to use for everyone.',
        'faq-q2': 'How long do emails stay?',
        'faq-a2': 'Emails are stored for 24 hours before being permanently deleted.',
        'footer-text': 'Built with love for privacy.',
        'msg_copied': 'Address copied to clipboard!',
        'msg_account_created': 'New temporary account created!',
        'msg_offline': 'You are currently offline.',
        'qr-title': 'Scan QR Code'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-privacy': 'गोपनीयता',
        'hero-title': 'आपका सुरक्षित अस्थायी ईमेल',
        'hero-subtitle': 'अपनी गोपनीयता की रक्षा करें और अपने वास्तविक इनबॉक्स को स्पैम से मुक्त रखें।',
        'btn-get-started': 'शुरू करें',
        'stat-emails-text': 'प्राप्त ईमेल',
        'stat-time-text': 'बचाया गया समय',
        'stat-privacy-text': 'गोपनीयता केंद्रित',
        'how-it-works-title': 'यह कैसे काम करता है',
        's1-title': 'बनाएं',
        's1-desc': 'तुरंत एक यादृच्छिक ईमेल पता चुनें या बनाएं।',
        's2-title': 'प्राप्त करें',
        's2-desc': 'सेवाओं के लिए साइन अप करने या फ़ाइलें प्राप्त करने के लिए इसका उपयोग करें।',
        's3-title': 'पढ़ें/हटाएं',
        's3-desc': 'रीयल-टाइम में ईमेल पढ़ें और काम पूरा होने पर उन्हें हटा दें।',
        'btn-new': 'नया',
        'btn-refresh': 'रिफ्रेश',
        'refresh-status': '7s में नए मेल की जाँच हो रही है...',
        'empty-inbox-text': 'आपका इनबॉक्स खाली है',
        'select-mail-text': 'पढ़ने के लिए एक ईमेल चुनें',
        'accounts-title': 'मेरे मेलबॉक्स',
        'about-title': 'हमारे बारे में',
        'aman-desc': 'फुल स्टैक डेवलपर और UI/UX उत्साही।',
        'amit-desc': 'बैकएंड इंजीनियर और सुरक्षा विशेषज्ञ।',
        'privacy-title': 'गोपनीयता नीति',
        'privacy-intro': 'हम आपकी गोपनीयता को महत्व देते हैं। यह सेवा आपके व्यक्तिगत डेटा को सुरक्षित रखने के लिए डिज़ाइन की गई है।',
        'glos-title': 'गोपनीयता शब्दावली',
        'key-benefits-title': 'मुख्य लाभ',
        'feat-fast-title': 'त्वरित सेटअप',
        'feat-fast-desc': 'किसी पंजीकरण की आवश्यकता नहीं है। एक क्लिक में अपना ईमेल पता प्राप्त करें।',
        'feat-secure-title': 'निजी और सुरक्षित',
        'feat-secure-desc': 'हम कभी भी आपका व्यक्तिगत डेटा संग्रहीत नहीं करते हैं। सभी ईमेल एन्क्रिप्टेड हैं।',
        'feat-auto-title': 'ऑटो विलोपन',
        'feat-auto-desc': 'आपकी सुरक्षा के लिए 24 घंटे के बाद ईमेल अपने आप हट जाते हैं।',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'faq-q1': 'क्या यह सेवा मुफ़्त है?',
        'faq-a1': 'हाँ, TempMail Pro सभी के लिए उपयोग करने के लिए 100% मुफ़्त है।',
        'faq-q2': 'ईमेल कितने समय तक रहते हैं?',
        'faq-a2': 'स्थायी रूप से हटाए जाने से पहले ईमेल 24 घंटों के लिए संग्रहीत किए जाते हैं।',
        'footer-text': 'गोपनीयता के लिए प्यार से बनाया गया।',
        'msg_copied': 'पता क्लिपबोर्ड पर कॉपी किया गया!',
        'msg_account_created': 'नया अस्थायी खाता बनाया गया!',
        'msg_offline': 'आप अभी ऑफलाइन हैं।',
        'qr-title': 'QR कोड स्कैन करें'
    }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    applyTheme();
    applyLanguage();
    startPolling();
    updateStats();
});

function initApp() {
    window.App = {
        state,
        init: initApp,
        switchSection
    };

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
        });
    }

    // Hash-based routing
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        switchSection(hash);
    });

    const initialHash = window.location.hash.replace('#', '') || 'home';
    switchSection(initialHash);

    if (!state.account) {
        createNewAccount();
    } else {
        updateMailboxUI();
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.getAttribute('data-section');
            window.location.hash = section;
        });
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Language Toggle
    document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);

    // Copy Email
    document.getElementById('copy-btn').addEventListener('click', () => {
        if (state.account) {
            navigator.clipboard.writeText(state.account.address);
            showToast(translations[state.lang]['msg_copied']);
        }
    });

    // New Account
    document.getElementById('new-mailbox-btn').addEventListener('click', createNewAccount);

    // Refresh Now
    document.getElementById('refresh-now-btn').addEventListener('click', () => {
        state.pollingSeconds = 0;
    });

    // Delete Mailbox
    document.getElementById('delete-mailbox-btn').addEventListener('click', deleteCurrentAccount);

    // Share Email
    document.getElementById('share-btn').addEventListener('click', shareEmail);

    // QR Code
    document.getElementById('qr-btn').addEventListener('click', showQRCode);

    // Mobile Menu Toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
        const navLinks = document.getElementById('nav-links');
        navLinks.classList.toggle('show');
    });

    // Close QR Modal
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('qr-modal').style.display = 'none';
    });

    window.onclick = (event) => {
        const modal = document.getElementById('qr-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Home "Get Started"
    document.getElementById('get-started-btn').addEventListener('click', () => {
        window.location.hash = 'inbox';
    });
}

async function shareEmail() {
    if (!state.account) return;
    const shareData = {
        title: 'My Temporary Email',
        text: `Here is my temporary email address: ${state.account.address}`,
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(state.account.address);
            showToast(translations[state.lang]['msg_copied']);
        }
    } catch (err) {
        console.error('Share failed:', err);
    }
}

function showQRCode() {
    if (!state.account) return;
    const qrModal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qr-code');
    const email = state.account.address;

    qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}" alt="QR Code">`;
    qrModal.style.display = 'flex';
}

function switchSection(sectionId) {
    document.querySelectorAll('.spa-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const targetNavItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }
}

function applyTheme() {
    document.body.className = state.theme === 'dark' ? 'dark-theme' : 'light-theme';
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    document.documentElement.style.setProperty('--primary', state.accent);
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mail_theme', state.theme);
    applyTheme();
}

function applyLanguage() {
    const dict = translations[state.lang];
    for (const key in dict) {
        const el = document.getElementById(key);
        if (el) {
            if (el.classList.contains('nav-item')) {
                const textSpan = el.querySelector('span');
                if (textSpan) textSpan.textContent = dict[key];
            } else if (el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'SMALL') {
                el.textContent = dict[key];
            }
        }
    }

    // Update button texts specifically
    const btnGetStarted = document.getElementById('btn-get-started');
    if (btnGetStarted) btnGetStarted.textContent = dict['btn-get-started'];

    const btnNew = document.getElementById('btn-new');
    if (btnNew) btnNew.textContent = dict['btn-new'];

    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) btnRefresh.textContent = dict['btn-refresh'];
}

function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'hi' : 'en';
    localStorage.setItem('mail_lang', state.lang);
    applyLanguage();
}

// Mail.tm API Logic
async function createNewAccount() {
    try {
        const domainRes = await fetch(`${API_URL}/domains`);
        const domains = await domainRes.json();
        const domain = domains['hydra:member'][0].domain;

        const username = Math.random().toString(36).substring(2, 12);
        const password = Math.random().toString(36).substring(2, 15);
        const address = `${username}@${domain}`;

        const createRes = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (createRes.ok) {
            const tokenRes = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });
            const tokenData = await tokenRes.json();

            state.account = { address, password, id: (await createRes.json()).id };
            state.token = tokenData.token;

            // Add to accounts list
            if (!state.accounts.find(a => a.address === address)) {
                state.accounts.push(state.account);
            }

            saveState();
            updateMailboxUI();
            showToast(translations[state.lang]['msg_account_created']);
        }
    } catch (error) {
        console.error('Account creation failed:', error);
        showToast('Error creating account', 'error');
    }
}

function updateMailboxUI() {
    const emailEl = document.getElementById('current-email');
    if (emailEl && state.account) {
        emailEl.textContent = state.account.address;
    }
    renderAccountsGrid();
}

function renderAccountsGrid() {
    const grid = document.getElementById('accounts-grid');
    if (!grid) return;
    grid.innerHTML = '';

    state.accounts.forEach(acc => {
        const card = document.createElement('div');
        card.className = `account-chip ${state.account?.address === acc.address ? 'active' : ''}`;
        card.innerHTML = `
            <span class="acc-addr">${acc.address}</span>
            <button class="switch-acc" onclick="switchAccount('${acc.address}')"><i class="fas fa-exchange-alt"></i></button>
        `;
        grid.appendChild(card);
    });
}

function switchAccount(address) {
    const acc = state.accounts.find(a => a.address === address);
    if (acc) {
        state.account = acc;
        // Re-authenticate to get token
        fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: acc.address, password: acc.password })
        }).then(res => res.json()).then(data => {
            state.token = data.token;
            saveState();
            updateMailboxUI();
            fetchMessages();
        });
    }
}

async function fetchMessages() {
    if (!state.token) return;
    try {
        const res = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        state.messages = data['hydra:member'];
        renderMessageList();
    } catch (error) {
        console.error('Failed to fetch messages:', error);
    }
}

function renderMessageList() {
    const list = document.getElementById('mail-list');
    if (!list) return;

    if (state.messages.length === 0) {
        list.innerHTML = `
            <div class="empty-inbox">
                <i class="fas fa-envelope-open"></i>
                <p id="empty-inbox-text">${translations[state.lang]['empty-inbox-text']}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = '';
    state.messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'mail-item';
        item.innerHTML = `
            <div class="mail-item-header">
                <span class="sender">${msg.from.name || msg.from.address}</span>
                <span class="time">${new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
            <div class="subject">${msg.subject}</div>
        `;
        item.onclick = () => readMessage(msg.id);
        list.appendChild(item);
    });
}

async function readMessage(id) {
    try {
        const res = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const msg = await res.json();

        const view = document.getElementById('mail-view');
        view.innerHTML = `
            <div class="msg-detail">
                <h2 id="msg-view-subject"></h2>
                <div class="msg-meta">
                    <span id="msg-view-from"></span>
                    <span id="msg-view-date"></span>
                </div>
                <hr>
                <div class="msg-body">
                    <iframe id="msg-view-frame" sandbox="allow-same-origin" style="width:100%; border:none; height:400px;"></iframe>
                </div>
            </div>
        `;

        document.getElementById('msg-view-subject').textContent = msg.subject;
        document.getElementById('msg-view-from').textContent = `From: ${msg.from.address}`;
        document.getElementById('msg-view-date').textContent = `Date: ${new Date(msg.createdAt).toLocaleString()}`;
        document.getElementById('msg-view-frame').srcdoc = msg.html || msg.text;

        // Update stats
        state.stats.emailsReceived++;
        state.stats.timeSaved += 5; // Assume 5 mins saved per email
        updateStats();
        saveState();
    } catch (error) {
        console.error('Failed to read message:', error);
    }
}

function deleteCurrentAccount() {
    if (!state.account) return;

    if (confirm('Are you sure you want to delete this mailbox?')) {
        state.accounts = state.accounts.filter(a => a.address !== state.account.address);
        if (state.accounts.length > 0) {
            switchAccount(state.accounts[0].address);
        } else {
            state.account = null;
            state.token = null;
            createNewAccount();
        }
        saveState();
        renderAccountsGrid();
    }
}

// Polling Logic
function startPolling() {
    setInterval(() => {
        if (state.pollingSeconds <= 0) {
            fetchMessages();
            state.pollingSeconds = 7;
        } else {
            state.pollingSeconds -= 1;
        }

        const progress = ((7 - state.pollingSeconds) / 7) * 100;
        document.documentElement.style.setProperty('--progress-width', `${progress}%`);

        const statusEl = document.getElementById('refresh-status');
        if (statusEl) {
            statusEl.textContent = translations[state.lang]['refresh-status'].replace('7s', `${state.pollingSeconds}s`);
        }
    }, 1000);
}

// Utilities
function saveState() {
    localStorage.setItem('temp_mail_account', JSON.stringify(state.account));
    localStorage.setItem('temp_mail_token', state.token);
    localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));
    localStorage.setItem('stats_emails', state.stats.emailsReceived);
    localStorage.setItem('stats_time', state.stats.timeSaved);
}

function updateStats() {
    const emailsEl = document.getElementById('stat-emails-count');
    const timeEl = document.getElementById('stat-time-saved');
    if (emailsEl) emailsEl.textContent = `${state.stats.emailsReceived}+`;
    if (timeEl) timeEl.textContent = `${Math.round(state.stats.timeSaved / 60)}h`;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Global scope for onclick handlers
window.switchAccount = switchAccount;
