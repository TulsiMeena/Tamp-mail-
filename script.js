/**
 * TempMail Pro - Core Logic
 */

const API_BASE = 'https://api.mail.tm';

const state = {
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
    currentAccount: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
    messages: [],
    readMessages: JSON.parse(localStorage.getItem('read_messages')) || [],
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'light',
    accent: localStorage.getItem('mail_accent') || '#6366f1',
    refreshTimer: 7,
    isOffline: !navigator.onLine
};

const translations = {
    en: {
        'hero-title': 'Your Secure Disposable Email',
        'hero-desc': 'Protect your privacy and keep your primary inbox clean from spam.',
        'btn-generate': 'Generate New Mail',
        'btn-inbox': 'Go to Inbox',
        'f1-title': 'Multi-Mailbox',
        'f1-desc': 'Manage multiple temporary email accounts simultaneously.',
        'f2-title': 'Secure & Private',
        'f2-desc': "We don't store your data. Emails are deleted automatically.",
        'f3-title': 'Real-time Fetch',
        'f3-desc': 'Get your emails instantly with our high-speed polling.',
        'inbox-title': 'Manage Your Mailboxes',
        'btn-copy': 'Copy',
        'btn-share': 'Share',
        'refresh-status': 'Refreshing in 7s',
        'btn-refresh-now': 'Refresh Now',
        'btn-delete': 'Delete Mailbox',
        'btn-prefs': 'Preferences',
        'messages-label': 'Your Messages',
        'no-messages': 'Your inbox is empty. Waiting for new emails...',
        'offline-text': 'Offline',
        'about-title': 'About TempMail Pro',
        'privacy-title': 'Privacy Policy & Terms',
        'skill1': 'Full Stack Developer',
        'skill2': 'UI/UX Designer',
        'skill3': 'Project Goals',
        'qr-modal-title': 'Scan QR Code',
        'prefs-title': 'Preferences',
        'label-accent': 'Accent Color',
        'label-sounds': 'Notification Sounds',
        'label-confetti': 'Confetti Effect',
        'btn-export': 'Backup Data',
        'btn-import': 'Restore Data'
    },
    hi: {
        'hero-title': 'आपका सुरक्षित डिस्पोजेबल ईमेल',
        'hero-desc': 'अपनी गोपनीयता की रक्षा करें और अपने प्राथमिक इनबॉक्स को स्पैम से मुक्त रखें।',
        'btn-generate': 'नया मेल जेनरेट करें',
        'btn-inbox': 'इनबॉक्स में जाएं',
        'f1-title': 'मल्टी-मेलबॉक्स',
        'f1-desc': 'एक साथ कई अस्थायी ईमेल खातों को प्रबंधित करें।',
        'f2-title': 'सुरक्षित और निजी',
        'f2-desc': 'हम आपका डेटा स्टोर नहीं करते हैं। ईमेल अपने आप डिलीट हो जाते हैं।',
        'f3-title': 'रियल-टाइम फेच',
        'f3-desc': 'हमारी हाई-स्पीड पोलिंग के साथ तुरंत ईमेल प्राप्त करें।',
        'inbox-title': 'अपने मेलबॉक्स प्रबंधित करें',
        'btn-copy': 'कॉपी',
        'btn-share': 'शेयर',
        'refresh-status': '7s में रिफ्रेश हो रहा है',
        'btn-refresh-now': 'अभी रिफ्रेश करें',
        'btn-delete': 'मेलबॉक्स हटाएं',
        'btn-prefs': 'प्राथमिकताएं',
        'messages-label': 'आपके संदेश',
        'no-messages': 'आपका इनबॉक्स खाली है। नए ईमेल की प्रतीक्षा है...',
        'offline-text': 'ऑफलाइन',
        'about-title': 'TempMail Pro के बारे में',
        'privacy-title': 'गोपनीयता नीति और शर्तें',
        'skill1': 'फुल स्टैक डेवलपर',
        'skill2': 'UI/UX डिज़ाइनर',
        'skill3': 'परियोजना के लक्ष्य',
        'qr-modal-title': 'QR कोड स्कैन करें',
        'prefs-title': 'प्राथमिकताएं',
        'label-accent': 'एक्सेंट रंग',
        'label-sounds': 'नोटिफिकेशन ध्वनि',
        'label-confetti': 'कॉन्फेटी प्रभाव',
        'btn-export': 'डेटा बैकअप',
        'btn-import': 'डेटा रिस्टोर'
    }
};

// Utilities
const showToast = (msg, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

const saveState = () => {
    localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));
    localStorage.setItem('temp_mail_account', JSON.stringify(state.currentAccount));
    localStorage.setItem('read_messages', JSON.stringify(state.readMessages));
    localStorage.setItem('mail_lang', state.lang);
    localStorage.setItem('mail_theme', state.theme);
    localStorage.setItem('mail_accent', state.accent);
};

const applyLanguage = () => {
    const trans = translations[state.lang];
    Object.keys(trans).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            const btnText = el.querySelector('.btn-text');
            if (btnText) btnText.textContent = trans[key];
            else if (el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'DIV') {
                el.textContent = trans[key];
            }
        }
    });
    // Special handling for buttons with icons
    document.querySelectorAll('[id^="btn-"]').forEach(el => {
        const key = el.id;
        if (trans[key]) el.textContent = trans[key];
    });
};

const applyTheme = () => {
    document.body.className = state.theme === 'dark' ? 'dark-theme' : 'light-theme';
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) themeIcon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    document.documentElement.style.setProperty('--primary', state.accent);
};

// API Methods
async function getDomains() {
    try {
        const resp = await fetch(`${API_BASE}/domains`);
        const data = await resp.json();
        return data['hydra:member'] || [];
    } catch (err) {
        console.error('Failed to fetch domains', err);
        return [{ domain: 'tempmail.com' }]; // Fallback
    }
}

async function createAccount() {
    const domains = await getDomains();
    if (!domains.length) return null;
    const domain = domains[0].domain;
    const username = Math.random().toString(36).substring(2, 12);
    const address = `${username}@${domain}`;
    const password = Math.random().toString(36).substring(2, 15);

    try {
        const resp = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const data = await resp.json();

        // Get Token
        const tokenResp = await fetch(`${API_BASE}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const tokenData = await tokenResp.json();

        const account = { address, password, token: tokenData.token, id: data.id };
        state.accounts.push(account);
        state.currentAccount = account;
        saveState();
        return account;
    } catch (err) {
        showToast('Failed to create account', 'error');
        return null;
    }
}

async function fetchMessages() {
    if (!state.currentAccount) return;
    try {
        const resp = await fetch(`${API_BASE}/messages`, {
            headers: { 'Authorization': `Bearer ${state.currentAccount.token}` }
        });
        const data = await resp.json();
        state.messages = data['hydra:member'] || [];
        renderMessages();
    } catch (err) {
        console.error('Failed to fetch messages', err);
    }
}

// UI Rendering
function renderMessages() {
    const list = document.getElementById('messages-list');
    if (state.messages.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <i class="fas fa-envelope-open"></i>
            <p id="no-messages">${translations[state.lang]['no-messages']}</p>
        </div>`;
        return;
    }

    list.innerHTML = state.messages.map(msg => `
        <div class="message-item ${state.readMessages.includes(msg.id) ? '' : 'unread'}" onclick="openMessage('${msg.id}')">
            <div class="msg-sender">${msg.from.address}</div>
            <div class="msg-sub">${msg.subject}</div>
            <div class="msg-date">${new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
    `).join('');
}

async function openMessage(id) {
    try {
        const resp = await fetch(`${API_BASE}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${state.currentAccount.token}` }
        });
        const msg = await resp.json();

        if (!state.readMessages.includes(id)) {
            state.readMessages.push(id);
            saveState();
        }

        document.getElementById('msg-subject').textContent = msg.subject;
        document.getElementById('msg-from').textContent = `From: ${msg.from.address}`;

        const frame = document.getElementById('message-frame');
        const content = msg.html ? (Array.isArray(msg.html) ? msg.html.join('') : msg.html) : msg.text;
        frame.srcdoc = content;

        document.getElementById('message-modal').classList.add('active');
        renderMessages();
    } catch (err) {
        showToast('Failed to load message', 'error');
    }
}

function updateInboxUI() {
    if (state.currentAccount) {
        document.getElementById('current-email-addr').textContent = state.currentAccount.address;
        const select = document.getElementById('account-select');
        select.innerHTML = state.accounts.map(acc => `
            <option value="${acc.address}" ${acc.address === state.currentAccount.address ? 'selected' : ''}>${acc.address}</option>
        `).join('');
    }
}

// Timer Logic
let timerInterval;
function startTimer() {
    clearInterval(timerInterval);
    state.refreshTimer = 7;
    const progress = document.getElementById('refresh-progress');
    const status = document.getElementById('refresh-status');

    timerInterval = setInterval(() => {
        state.refreshTimer--;
        const percent = ((7 - state.refreshTimer) / 7) * 100;
        document.documentElement.style.setProperty('--progress-width', `${percent}%`);

        status.textContent = translations[state.lang]['refresh-status'].replace('7s', `${state.refreshTimer}s`);

        if (state.refreshTimer <= 0) {
            state.refreshTimer = 7;
            fetchMessages();
        }
    }, 1000);
}

// Navigation
function switchSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    if (sectionId === 'inbox') {
        if (!state.currentAccount) {
            createAccount().then(() => {
                updateInboxUI();
                startTimer();
            });
        } else {
            updateInboxUI();
            startTimer();
            fetchMessages();
        }
    } else {
        clearInterval(timerInterval);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    applyTheme();

    document.getElementById('generate-email-btn').addEventListener('click', () => switchSection('inbox'));
    document.getElementById('go-to-inbox-btn').addEventListener('click', () => switchSection('inbox'));

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme();
        saveState();
    });

    document.getElementById('lang-toggle').addEventListener('click', () => {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        applyLanguage();
        saveState();
    });

    document.getElementById('copy-email-btn').addEventListener('click', () => {
        if (state.currentAccount) {
            navigator.clipboard.writeText(state.currentAccount.address);
            showToast('Address copied to clipboard', 'success');
        }
    });

    document.getElementById('account-select').addEventListener('change', (e) => {
        const acc = state.accounts.find(a => a.address === e.target.value);
        if (acc) {
            state.currentAccount = acc;
            saveState();
            updateInboxUI();
            fetchMessages();
            startTimer();
        }
    });

    document.getElementById('add-account-btn').addEventListener('click', async () => {
        showToast('Creating new account...', 'info');
        await createAccount();
        updateInboxUI();
        fetchMessages();
        startTimer();
    });

    document.getElementById('delete-mailbox-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this mailbox?')) {
            state.accounts = state.accounts.filter(a => a.address !== state.currentAccount.address);
            state.currentAccount = state.accounts[0] || null;
            saveState();
            if (!state.currentAccount) {
                switchSection('home');
            } else {
                updateInboxUI();
                fetchMessages();
            }
        }
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    document.getElementById('refresh-now-btn').addEventListener('click', () => {
        fetchMessages();
        startTimer();
        showToast('Refreshing...', 'info');
    });

    document.getElementById('open-settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('active');
    });

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            state.accent = swatch.dataset.color;
            applyTheme();
            saveState();
        });
    });

    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('nav-links').classList.remove('active');
        });
    });

    document.getElementById('qr-email-btn').addEventListener('click', () => {
        const qrContainer = document.getElementById('qr-code-container');
        const email = state.currentAccount.address;
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}" alt="QR Code">`;
        document.getElementById('qr-modal').classList.add('active');
    });

    document.getElementById('share-email-btn').addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    text: state.currentAccount.address
                });
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            showToast('Web Share not supported', 'info');
        }
    });

    // Handle offline/online
    window.addEventListener('online', () => {
        state.isOffline = false;
        document.getElementById('offline-indicator').classList.add('hidden');
        showToast('Back online', 'success');
    });
    window.addEventListener('offline', () => {
        state.isOffline = true;
        document.getElementById('offline-indicator').classList.remove('hidden');
        showToast('Connection lost', 'error');
    });
});

const loadExtraContent = () => {
    // FAQ
    const faqContainer = document.getElementById('faq-list');
    const faqs = [
        { q: 'What is a temporary email?', a: 'A temporary email is a short-lived address that automatically expires, used to avoid spam.' },
        { q: 'Is this service free?', a: 'Yes, TempMail Pro is 100% free for everyone.' },
        { q: 'Can I send emails?', a: 'Currently, we only support receiving emails for security reasons.' }
    ];
    faqContainer.innerHTML = faqs.map(f => `
        <div class="faq-item">
            <div class="faq-question">${f.q}</div>
            <div class="faq-answer">${f.a}</div>
        </div>
    `).join('');

    // Testimonials
    const reviewsContainer = document.getElementById('reviews-container');
    const reviews = [
        { name: 'John Doe', text: 'Best temp mail service I have ever used!', stars: 5 },
        { name: 'Sarah Smith', text: 'Clean UI and very fast.', stars: 5 }
    ];
    reviewsContainer.innerHTML = reviews.map(r => `
        <div class="review-card glass-card">
            <div class="stars">${'★'.repeat(r.stars)}</div>
            <p>"${r.text}"</p>
            <h4>- ${r.name}</h4>
        </div>
    `).join('');
};

// Backup/Restore
document.getElementById('export-data-btn').addEventListener('click', () => {
    const data = JSON.stringify({
        accounts: state.accounts,
        readMessages: state.readMessages,
        settings: { lang: state.lang, theme: state.theme, accent: state.accent }
    });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempmail_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showToast('Backup downloaded', 'success');
});

document.getElementById('import-data-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            state.accounts = data.accounts || [];
            state.readMessages = data.readMessages || [];
            if (data.settings) {
                state.lang = data.settings.lang || 'en';
                state.theme = data.settings.theme || 'light';
                state.accent = data.settings.accent || '#6366f1';
            }
            saveState();
            location.reload();
        } catch (err) {
            showToast('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
});

// Initialization
loadExtraContent();
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW Registered', reg);
        }).catch(err => {
            console.log('SW Registration Failed', err);
        });
    });
}
