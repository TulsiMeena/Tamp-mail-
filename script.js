// State Management
const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    accent: localStorage.getItem('mail_accent') || 'blue',
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
    currentAccount: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
    token: localStorage.getItem('temp_mail_token') || null,
    messages: [],
    pollingInterval: null,
    refreshTimer: 7,
    isMenuOpen: false
};

const API_URL = 'https://api.mail.tm';

// Translations
const translations = {
    en: {
        'nav-brand': 'Temp Mail',
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About',
        'nav-privacy': 'Privacy',
        'btn-lang': 'Hindi',
        'hero-title': 'Your Secure Temporary Email',
        'hero-desc': 'Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.',
        'btn-add-mail': 'Generate New Mail',
        'info-1-title': 'Fast & Anonymous',
        'info-1-desc': 'Instant mailbox generation. No personal data required.',
        'info-2-title': 'Safe & Secure',
        'info-2-desc': 'Emails are automatically deleted after 24 hours.',
        'info-3-title': 'Auto Refresh',
        'info-3-desc': 'Real-time inbox updates with 7-second polling.',
        'my-mails-title': 'My Mailboxes',
        'inbox-title': 'Messages',
        'refresh-status': 'Refreshing in 7s',
        'empty-msg': 'Your inbox is empty',
        'back-text': 'Back',
        'btn-backup': 'Backup',
        'btn-restore': 'Restore',
        'btn-delete': 'Delete',
        'about-title': 'About Us',
        'privacy-title': 'Privacy & Security'
    },
    hi: {
        'nav-brand': 'अस्थायी मेल',
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-privacy': 'गोपनीयता',
        'btn-lang': 'English',
        'hero-title': 'आपका सुरक्षित अस्थायी ईमेल',
        'hero-desc': 'स्पैम, विज्ञापन मेलिंग, हैकिंग और हमला करने वाले रोबोट के बारे में भूल जाएं। अपने असली मेलबॉक्स को साफ और सुरक्षित रखें।',
        'btn-add-mail': 'नया मेल जेनरेट करें',
        'info-1-title': 'तेज़ और अनाम',
        'info-1-desc': 'त्वरित मेलबॉक्स निर्माण। किसी व्यक्तिगत डेटा की आवश्यकता नहीं है।',
        'info-2-title': 'सुरक्षित और संरक्षित',
        'info-2-desc': 'ईमेल 24 घंटों के बाद स्वचालित रूप से हटा दिए जाते हैं।',
        'info-3-title': 'ऑटो रिफ्रेश',
        'info-3-desc': '7-सेकंड पोलिंग के साथ रीयल-टाइम इनबॉक्स अपडेट।',
        'my-mails-title': 'मेरे मेलबॉक्स',
        'inbox-title': 'संदेश',
        'refresh-status': '7s में रिफ्रेश हो रहा है',
        'empty-msg': 'आपका इनबॉक्स खाली है',
        'back-text': 'पीछे',
        'btn-backup': 'बैकअप',
        'btn-restore': 'रिस्टोर',
        'btn-delete': 'हटाएं',
        'about-title': 'हमारे बारे में',
        'privacy-title': 'गोपनीयता और सुरक्षा'
    }
};

// DOM Elements
const elements = {
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.spa-section'),
    themeCheckbox: document.getElementById('theme-checkbox'),
    langToggle: document.getElementById('lang-toggle'),
    accentPicker: document.getElementById('accent-picker'),
    createMailBtn: document.getElementById('create-mail-btn'),
    addAccountBtn: document.getElementById('add-account-btn'),
    copyEmailBtn: document.getElementById('copy-email-btn'),
    qrBtn: document.getElementById('qr-btn'),
    refreshNowBtn: document.getElementById('refresh-now-btn'),
    deleteMailboxBtn: document.getElementById('delete-mailbox-btn'),
    backupBtn: document.getElementById('backup-btn'),
    restoreBtn: document.getElementById('restore-btn'),
    currentEmail: document.getElementById('current-email'),
    accountsList: document.getElementById('accounts-list'),
    messagesList: document.getElementById('messages-list'),
    messageCount: document.getElementById('message-count'),
    refreshProgress: document.getElementById('refresh-progress'),
    refreshText: document.getElementById('refresh-text'),
    emailDetail: document.getElementById('email-detail-container'),
    messagesListContainer: document.getElementById('messages-list-container'),
    backToList: document.getElementById('back-to-list'),
    menuToggle: document.getElementById('menu-toggle'),
    menuClose: document.getElementById('menu-close'),
    sidebar: document.getElementById('sidebar'),
    toastContainer: document.getElementById('toast-container'),
    qrModal: document.getElementById('qr-modal'),
    helpModal: document.getElementById('help-modal'),
    helpBtn: document.getElementById('help-btn'),
    qrCodeImg: document.getElementById('qr-code-img'),
    qrEmailDisplay: document.getElementById('qr-email-display'),
    emailSubject: document.getElementById('email-subject'),
    senderAvatar: document.getElementById('sender-avatar'),
    emailFromName: document.getElementById('email-from-name'),
    emailFromAddress: document.getElementById('email-from-address'),
    emailDate: document.getElementById('email-date'),
    emailBodyFrame: document.getElementById('email-body-frame'),
    emailAttachments: document.getElementById('email-attachments')
};

// --- Initialization ---
function init() {
    applyTheme();
    applyAccent();
    applyLanguage();
    setupEventListeners();
    updateUI();
    populateHelp();
    registerServiceWorker();
    if (state.currentAccount) {
        startPolling();
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
        });
    }
}

function populateHelp() {
    const helpSteps = [
        { en: 'Click "Generate New Mail" to create a mailbox.', hi: 'मेलबॉक्स बनाने के लिए "नया मेल जेनरेट करें" पर क्लिक करें।' },
        { en: 'Copy the email address and use it anywhere.', hi: 'ईमेल पता कॉपी करें और इसे कहीं भी उपयोग करें।' },
        { en: 'Wait for emails to arrive in the Inbox (refreshes every 7s).', hi: 'इनबॉक्स में ईमेल आने की प्रतीक्षा करें (हर 7 सेकंड में रिफ्रेश होता है)।' },
        { en: 'Click on a message to read its content safely.', hi: 'सामग्री को सुरक्षित रूप से पढ़ने के लिए संदेश पर क्लिक करें।' }
    ];

    const helpStepsContainer = elements.helpModal.querySelector('.help-steps');
    if (helpStepsContainer) {
        helpStepsContainer.innerHTML = helpSteps.map((step, index) => `
            <div class="help-step" style="display: flex; gap: 15px; margin-bottom: 15px; align-items: flex-start;">
                <span class="step-num" style="background: var(--primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.8rem; font-weight: bold;">${index + 1}</span>
                <p style="margin: 0; font-size: 0.95rem;">${step[state.lang]}</p>
            </div>
        `).join('');
    }
}

// --- Navigation ---
function navigate(sectionId) {
    elements.sections.forEach(s => s.classList.add('hidden'));
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) targetSection.classList.remove('hidden');

    elements.navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('data-section') === sectionId);
    });

    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('active');
    }
}

// --- API Logic ---
async function fetchDomains() {
    try {
        const res = await fetch(`${API_URL}/domains`);
        const data = await res.json();
        return data['hydra:member'];
    } catch (err) {
        showToast('Error fetching domains', 'error');
        return [{ domain: 'tempmail.com' }]; // Fallback
    }
}

async function createAccount() {
    showToast(state.lang === 'en' ? 'Creating mailbox...' : 'मेलबॉक्स बनाया जा रहा है...', 'info');
    const domains = await fetchDomains();
    const domain = domains[0].domain;
    const username = Math.random().toString(36).substring(2, 10);
    const email = `${username}@${domain}`;
    const password = Math.random().toString(36).substring(2, 15);

    try {
        const res = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
        });
        const account = await res.json();

        // Get Token
        const tokenRes = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
        });
        const tokenData = await tokenRes.json();

        const newAccount = { ...account, password, token: tokenData.token };
        state.accounts.push(newAccount);
        switchAccount(newAccount);
        saveState();
        showToast(state.lang === 'en' ? 'Mailbox created successfully!' : 'मेलबॉक्स सफलतापूर्वक बनाया गया!', 'success');
        navigate('inbox');
    } catch (err) {
        showToast('Failed to create mailbox', 'error');
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
        renderMessages();
    } catch (err) {
        console.error('Fetch messages error:', err);
    }
}

async function openMessage(msgId) {
    if (!state.token) return;
    try {
        const res = await fetch(`${API_URL}/messages/${msgId}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const msg = await res.json();

        // Render Message Detail
        elements.emailSubject.textContent = msg.subject;
        elements.emailFromName.textContent = msg.from.name || 'Unknown';
        elements.emailFromAddress.textContent = `<${msg.from.address}>`;
        elements.emailDate.textContent = new Date(msg.createdAt).toLocaleString();
        elements.senderAvatar.style.background = generateColor(msg.from.address);
        elements.senderAvatar.textContent = (msg.from.name || msg.from.address)[0].toUpperCase();

        // Sanitize and set body
        const body = msg.html || msg.text || '';
        elements.emailBodyFrame.srcdoc = `
            <html>
                <head><style>body { font-family: sans-serif; color: #333; line-height: 1.6; }</style></head>
                <body>${Array.isArray(body) ? body.join('') : body}</body>
            </html>
        `;

        // Attachments
        elements.emailAttachments.innerHTML = '';
        if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments.forEach(att => {
                const btn = document.createElement('button');
                btn.className = 'btn-sm';
                btn.innerHTML = `<i class="fas fa-paperclip"></i> ${att.filename}`;
                btn.onclick = () => downloadAttachment(msg.id, att.id, att.filename);
                elements.emailAttachments.appendChild(btn);
            });
        }

        elements.messagesListContainer.classList.add('hidden');
        elements.emailDetail.classList.remove('hidden');

        // Mark as seen locally
        const msgIdx = state.messages.findIndex(m => m.id === msgId);
        if (msgIdx !== -1) state.messages[msgIdx].seen = true;
        renderMessages();

    } catch (err) {
        showToast('Error loading message', 'error');
    }
}

async function downloadAttachment(msgId, attId, filename) {
    try {
        const res = await fetch(`${API_URL}/messages/${msgId}/attachments/${attId}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    } catch (err) {
        showToast('Download failed', 'error');
    }
}

// --- UI Rendering ---
function updateUI() {
    elements.currentEmail.textContent = state.currentAccount ? state.currentAccount.address : (state.lang === 'en' ? 'Select or create a mailbox' : 'मेलबॉक्स चुनें या बनाएं');
    renderAccounts();
    renderMessages();
}

function renderAccounts() {
    elements.accountsList.innerHTML = '';
    state.accounts.forEach(acc => {
        const li = document.createElement('li');
        li.className = `account-item ${state.currentAccount?.id === acc.id ? 'active' : ''}`;
        li.innerHTML = `
            <div class="avatar" style="background: ${generateColor(acc.address)}">${acc.address[0].toUpperCase()}</div>
            <span class="acc-addr">${acc.address}</span>
        `;
        li.onclick = () => switchAccount(acc);
        elements.accountsList.appendChild(li);
    });
}

function renderMessages() {
    elements.messagesList.innerHTML = '';
    elements.messageCount.textContent = state.messages.length;

    if (state.messages.length === 0) {
        elements.messagesList.innerHTML = `<div class="empty-inbox"><i class="fas fa-envelope-open"></i><p>${translations[state.lang]['empty-msg']}</p></div>`;
        return;
    }

    state.messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = `message-item ${!msg.seen ? 'unread' : ''}`;
        item.innerHTML = `
            <span class="msg-sender">${msg.from.name || msg.from.address}</span>
            <span class="msg-subject">${msg.subject}</span>
            <span class="msg-time">${new Date(msg.createdAt).toLocaleTimeString()}</span>
        `;
        item.onclick = () => openMessage(msg.id);
        elements.messagesList.appendChild(item);
    });
}

// --- Helpers ---
function switchAccount(acc) {
    state.currentAccount = acc;
    state.token = acc.token;
    state.messages = [];
    elements.messagesListContainer.classList.remove('hidden');
    elements.emailDetail.classList.add('hidden');
    saveState();
    updateUI();
    startPolling();
}

function saveState() {
    localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));
    localStorage.setItem('temp_mail_account', JSON.stringify(state.currentAccount));
    localStorage.setItem('temp_mail_token', state.token);
    localStorage.setItem('mail_lang', state.lang);
    localStorage.setItem('mail_theme', state.theme);
    localStorage.setItem('mail_accent', state.accent);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
}

function applyLanguage() {
    const dict = translations[state.lang];
    for (let key in dict) {
        const el = document.getElementById(key);
        if (el) {
            if (el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P') {
                el.textContent = dict[key];
            } else if (el.tagName === 'BUTTON') {
                // Keep icons
                const icon = el.querySelector('i');
                const span = el.querySelector('span');
                if (span) span.textContent = dict[key];
                else el.textContent = dict[key];
                if (icon) el.prepend(icon);
            }
        }
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(link.getAttribute('data-section'));
        });
    });

    elements.createMailBtn.onclick = createAccount;
    elements.addAccountBtn.onclick = createAccount;

    elements.themeCheckbox.onchange = (e) => {
        state.theme = e.target.checked ? 'dark' : 'light';
        applyTheme();
        saveState();
    };

    elements.langToggle.onclick = () => {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        applyLanguage();
        populateHelp();
        document.documentElement.lang = state.lang;
        saveState();
        updateUI();
    };

    elements.accentPicker.onclick = (e) => {
        if (e.target.classList.contains('accent-dot')) {
            state.accent = e.target.getAttribute('data-accent');
            applyAccent();
            document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
            e.target.classList.add('active');
            saveState();
        }
    };

    elements.copyEmailBtn.onclick = () => {
        if (state.currentAccount) {
            navigator.clipboard.writeText(state.currentAccount.address);
            showToast('Address copied to clipboard', 'success');
        }
    };

    elements.qrBtn.onclick = () => {
        if (!state.currentAccount) return;
        elements.qrEmailDisplay.textContent = state.currentAccount.address;
        elements.qrCodeImg.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${state.currentAccount.address}" alt="QR">`;
        elements.qrModal.classList.remove('hidden');
    };

    elements.refreshNowBtn.onclick = () => {
        state.refreshTimer = 1;
        showToast('Refreshing...', 'info');
    };

    elements.backToList.onclick = () => {
        elements.emailDetail.classList.add('hidden');
        elements.messagesListContainer.classList.remove('hidden');
    };

    elements.deleteMailboxBtn.onclick = () => {
        if (!state.currentAccount) return;
        state.accounts = state.accounts.filter(a => a.id !== state.currentAccount.id);
        state.currentAccount = state.accounts[0] || null;
        state.token = state.currentAccount?.token || null;
        saveState();
        updateUI();
        if (!state.currentAccount) {
            clearInterval(state.pollingInterval);
            state.pollingInterval = null;
        }
    };

    elements.backupBtn.onclick = () => {
        const data = JSON.stringify(state.accounts);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `temp_mail_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    elements.restoreBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (re) => {
                try {
                    const accounts = JSON.parse(re.target.result);
                    state.accounts = accounts;
                    state.currentAccount = accounts[0];
                    state.token = accounts[0].token;
                    saveState();
                    updateUI();
                    showToast('Accounts restored!', 'success');
                } catch (err) {
                    showToast('Invalid backup file', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = () => {
            elements.qrModal.classList.add('hidden');
            elements.helpModal.classList.add('hidden');
        };
    });

    elements.helpBtn.onclick = () => {
        populateHelp();
        elements.helpModal.classList.remove('hidden');
    };

    elements.menuToggle.onclick = () => elements.sidebar.classList.add('active');
    elements.menuClose.onclick = () => elements.sidebar.classList.remove('active');
}

function applyTheme() {
    document.body.className = state.theme === 'dark' ? 'dark-theme' : '';
    elements.themeCheckbox.checked = state.theme === 'dark';
}

function applyAccent() {
    document.documentElement.setAttribute('data-theme-accent', state.accent);
}

function startPolling() {
    if (state.pollingInterval) clearInterval(state.pollingInterval);
    state.refreshTimer = 7;
    fetchMessages();

    state.pollingInterval = setInterval(() => {
        state.refreshTimer--;
        if (state.refreshTimer <= 0) {
            state.refreshTimer = 7;
            fetchMessages();
        }
        updateProgressBar();
    }, 1000);
}

function updateProgressBar() {
    const percent = ((7 - state.refreshTimer) / 7) * 100;
    elements.refreshProgress.style.setProperty('--progress-width', `${percent}%`);
    elements.refreshText.textContent = translations[state.lang]['refresh-status'].replace('7s', `${state.refreshTimer}s`);
}

// Global App Object
window.App = { init, navigate, createAccount, switchAccount };

// Start the app
document.addEventListener('DOMContentLoaded', init);
