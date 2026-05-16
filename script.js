const API_BASE = 'https://api.mail.tm';

const MailAPI = {
    async getDomains() {
        try {
            const response = await fetch(`${API_BASE}/domains`);
            const data = await response.json();
            return data['hydra:member'];
        } catch (error) {
            console.error('Error fetching domains:', error);
            return [{ domain: 'tempmail.com' }]; // Fallback
        }
    },

    async createAccount(address, password) {
        const response = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        return await response.json();
    },

    async getToken(address, password) {
        const response = await fetch(`${API_BASE}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        return await response.json();
    },

    async getMessages(token, page = 1) {
        const response = await fetch(`${API_BASE}/messages?page=${page}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data['hydra:member'];
    },

    async getMessage(id, token) {
        const response = await fetch(`${API_BASE}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    }
};

// State Management
const translations = {
    en: {
        'hero-title': 'Your Secure Temporary Email',
        'hero-subtitle': 'Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.',
        'btn-copy': 'Copy',
        'btn-new': 'New',
        'stat-received-label': 'Emails Received',
        'stat-time-label': 'Time Saved',
        'f1-title': 'Fast & Instant',
        'f1-desc': 'Generate temporary email addresses instantly with a single click.',
        'f2-title': 'Privacy First',
        'f2-desc': 'No personal information required. Your identity remains anonymous.',
        'f3-title': 'Auto-Delete',
        'f3-desc': 'Emails are automatically deleted after a certain period.',
        'hiw-title': 'How It Works',
        's1': 'Copy your temporary email address.',
        's2': 'Use it for any online service registration.',
        's3': 'Receive and view emails in your inbox.',
        'inbox-title': 'Your Inbox',
        'refresh-status': 'Refreshing in 7s',
        'empty-msg': 'Your inbox is empty',
        'btn-back': 'Back',
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About',
        'nav-privacy': 'Privacy'
    },
    hi: {
        'hero-title': 'आपका सुरक्षित अस्थायी ईमेल',
        'hero-subtitle': 'स्पैम, विज्ञापन मेलिंग, हैकिंग और हमलावर रोबोट के बारे में भूल जाएं। अपने वास्तविक मेलबॉक्स को साफ और सुरक्षित रखें।',
        'btn-copy': 'कॉपी',
        'btn-new': 'नया',
        'stat-received-label': 'प्राप्त ईमेल',
        'stat-time-label': 'समय बचाया',
        'f1-title': 'तेज और त्वरित',
        'f1-desc': 'एक क्लिक के साथ तुरंत अस्थायी ईमेल पते उत्पन्न करें।',
        'f2-title': 'गोपनीयता पहले',
        'f2-desc': 'किसी व्यक्तिगत जानकारी की आवश्यकता नहीं है। आपकी पहचान गुमनाम रहती है।',
        'f3-title': 'ऑटो-डिलीट',
        'f3-desc': 'ईमेल एक निश्चित अवधि के बाद स्वचालित रूप से हटा दिए जाते हैं।',
        'hiw-title': 'यह कैसे काम करता है',
        's1': 'अपना अस्थायी ईमेल पता कॉपी करें।',
        's2': 'किसी भी ऑनलाइन सेवा पंजीकरण के लिए इसका उपयोग करें।',
        's3': 'अपने इनबॉक्स में ईमेल प्राप्त करें और देखें।',
        'inbox-title': 'आपका इनबॉक्स',
        'refresh-status': '7s में रीफ्रेश हो रहा है',
        'empty-msg': 'आपका इनबॉक्स खाली है',
        'btn-back': 'वापस',
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-privacy': 'गोपनीयता'
    }
};

const state = {
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
    currentAccount: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
    token: localStorage.getItem('temp_mail_token') || null,
    messages: [],
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    accent: localStorage.getItem('mail_accent') || '#3498db',
    refreshTimer: 7,
    isRefreshing: false
};

const MailApp = {
    async init() {
        if (!state.currentAccount) {
            await this.generateNewAccount();
        } else {
            this.updateEmailDisplay();
            this.refreshInbox();
        }
        this.renderMailboxTabs();
    },

    async generateNewAccount() {
        showToast('Creating new account...', 'info');
        const domains = await MailAPI.getDomains();
        const domain = domains[0].domain;
        const username = Math.random().toString(36).substring(2, 10);
        const password = Math.random().toString(36).substring(2, 12);
        const address = `${username}@${domain}`;

        try {
            const account = await MailAPI.createAccount(address, password);
            if (account.address) {
                const tokenData = await MailAPI.getToken(address, password);
                const newAccount = { ...account, password, token: tokenData.token, createdAt: new Date().toISOString() };

                state.accounts.push(newAccount);
                state.currentAccount = newAccount;
                state.token = tokenData.token;

                this.saveState();
                this.updateEmailDisplay();
                this.renderMailboxTabs();
                this.refreshInbox();
                showToast('New email generated!', 'success');
            }
        } catch (error) {
            showToast('Failed to create account', 'error');
            console.error(error);
        }
    },

    saveState() {
        localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));
        localStorage.setItem('temp_mail_account', JSON.stringify(state.currentAccount));
        localStorage.setItem('temp_mail_token', state.token);
    },

    updateEmailDisplay() {
        const el = document.getElementById('current-email');
        if (el && state.currentAccount) {
            el.value = state.currentAccount.address;
        }
    },

    async refreshInbox() {
        if (!state.token) return;
        state.isRefreshing = true;
        try {
            const messages = await MailAPI.getMessages(state.token);
            state.messages = messages;
            this.renderEmailList();
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            state.isRefreshing = false;
        }
    },

    renderMailboxTabs() {
        const container = document.getElementById('mailbox-list');
        if (!container) return;
        container.innerHTML = '';
        state.accounts.forEach((acc, index) => {
            const tab = document.createElement('div');
            tab.className = `mailbox-tab ${state.currentAccount && state.currentAccount.address === acc.address ? 'active' : ''}`;
            tab.textContent = acc.address.split('@')[0];
            tab.onclick = () => this.switchMailbox(index);
            container.appendChild(tab);
        });
    },

    switchMailbox(index) {
        state.currentAccount = state.accounts[index];
        state.token = state.currentAccount.token;
        this.saveState();
        this.updateEmailDisplay();
        this.renderMailboxTabs();
        this.refreshInbox();
        showToast('Switched mailbox', 'info');
    },

    renderEmailList() {
        const container = document.getElementById('email-list-container');
        if (!container) return;

        if (state.messages.length === 0) {
            container.innerHTML = `<div class="empty-inbox"><i class="fas fa-envelope-open"></i><p id="empty-msg">Your inbox is empty</p></div>`;
            return;
        }

        container.innerHTML = state.messages.map(msg => `
            <div class="email-item glass" onclick="MailApp.viewEmail('${msg.id}')">
                <div class="email-avatar" style="background-color: ${this.getAvatarColor(msg.from.address)}">
                    ${msg.from.name ? msg.from.name[0] : msg.from.address[0]}
                </div>
                <div class="email-info">
                    <h4>${msg.subject || 'No Subject'}</h4>
                    <p>${msg.from.address}</p>
                </div>
                <div class="email-date">
                    ${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        `).join('');
    },

    async viewEmail(id) {
        const detailView = document.getElementById('email-detail-view');
        const listView = document.getElementById('email-list-container');

        try {
            const msg = await MailAPI.getMessage(id, state.token);
            document.getElementById('detail-subject').textContent = msg.subject || 'No Subject';
            document.getElementById('detail-from').textContent = `From: ${msg.from.name} <${msg.from.address}>`;
            document.getElementById('detail-date').textContent = new Date(msg.createdAt).toLocaleString();

            const frame = document.getElementById('email-body-frame');
            const body = Array.isArray(msg.html) ? msg.html.join('') : (msg.html || msg.text || '');
            frame.srcdoc = body;

            listView.classList.add('hidden');
            detailView.classList.remove('hidden');
        } catch (error) {
            showToast('Failed to load email', 'error');
        }
    },

    getAvatarColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 50%)`;
    }
};

const Theme = {
    init() {
        this.applyTheme(state.theme);
        this.applyAccent(state.accent);
    },
    applyTheme(theme) {
        state.theme = theme;
        localStorage.setItem('mail_theme', theme);
        document.body.className = `${theme}-theme`;
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },
    toggleTheme() {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme);
        showToast(`Switched to ${nextTheme} theme`, 'info');
    },
    applyAccent(color) {
        state.accent = color;
        localStorage.setItem('mail_accent', color);
        document.documentElement.style.setProperty('--primary', color);
    }
};

const Polling = {
    start() {
        setInterval(() => {
            state.refreshTimer--;
            if (state.refreshTimer <= 0) {
                state.refreshTimer = 7;
                MailApp.refreshInbox();
            }
            this.updateUI();
        }, 1000);
    },
    updateUI() {
        const textEl = document.getElementById('refresh-status');
        if (textEl) {
            const template = translations[state.lang]['refresh-status'];
            textEl.textContent = template.replace('7s', `${state.refreshTimer}s`);
        }
        const progress = ((7 - state.refreshTimer) / 7) * 100;
        document.documentElement.style.setProperty('--progress-width', `${progress}%`);
    }
};

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

const Utils = {
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy', 'error');
        });
    },
    generateQR(text) {
        const modal = document.getElementById('qr-modal');
        const display = document.getElementById('qr-code-display');
        const emailText = document.getElementById('qr-email-text');
        if (modal && display) {
            display.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}" alt="QR Code">`;
            emailText.textContent = text;
            modal.style.display = 'flex';
        }
    }
};

const Localization = {
    init() {
        this.apply(state.lang);
    },
    apply(lang) {
        state.lang = lang;
        localStorage.setItem('mail_lang', lang);
        const trans = translations[lang];

        Object.keys(trans).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                const textEl = el.querySelector('.btn-text') || el.querySelector('span:not(.fas)') || el;
                if (textEl === el) {
                    el.textContent = trans[key];
                } else {
                    textEl.textContent = trans[key];
                }
            }
        });

        const langToggleBtn = document.getElementById('lang-toggle');
        if (langToggleBtn) {
            const textEl = langToggleBtn.querySelector('.btn-text');
            if (textEl) textEl.textContent = lang === 'en' ? 'HI' : 'EN';
        }
    },
    toggle() {
        const nextLang = state.lang === 'en' ? 'hi' : 'en';
        this.apply(nextLang);
        showToast(nextLang === 'en' ? 'Switched to English' : 'हिंदी में बदल दिया गया', 'info');
    }
};

// Navigation
function switchSection(sectionId) {
    document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const section = document.getElementById(`${sectionId}-section`);
    if (section) section.classList.add('active');

    document.querySelectorAll(`.nav-link[data-section="${sectionId}"]`).forEach(l => l.classList.add('active'));

    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('open');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    MailApp.init();
    Theme.init();
    Localization.init();
    Polling.start();

    // Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });

    // Mobile Menu
    const menuToggle = document.getElementById('menu-toggle');
    const closeDrawer = document.getElementById('close-drawer');
    const drawer = document.getElementById('mobile-drawer');

    if (menuToggle) menuToggle.onclick = () => drawer.classList.add('open');
    if (closeDrawer) closeDrawer.onclick = () => drawer.classList.remove('open');

    // Email Actions
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) copyBtn.onclick = () => Utils.copyToClipboard(state.currentAccount.address);

    const qrBtn = document.getElementById('qr-email-btn');
    if (qrBtn) qrBtn.onclick = () => Utils.generateQR(state.currentAccount.address);

    const newBtn = document.getElementById('new-mail-btn');
    if (newBtn) newBtn.onclick = () => MailApp.generateNewAccount();

    const refreshBtn = document.getElementById('refresh-now-btn');
    if (refreshBtn) refreshBtn.onclick = () => {
        state.refreshTimer = 7;
        MailApp.refreshInbox();
        showToast('Refreshing...', 'info');
    };

    const addMailboxBtn = document.getElementById('add-mailbox-btn');
    if (addMailboxBtn) addMailboxBtn.onclick = () => MailApp.generateNewAccount();

    const backBtn = document.getElementById('back-to-inbox');
    if (backBtn) backBtn.onclick = () => {
        document.getElementById('email-detail-view').classList.add('hidden');
        document.getElementById('email-list-container').classList.remove('hidden');
    };

    // Toggles
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.onclick = () => Localization.toggle();

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.onclick = () => Theme.toggleTheme();

    // Modals
    const qrModal = document.getElementById('qr-modal');
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) closeModal.onclick = () => qrModal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === qrModal) qrModal.style.display = 'none';
    };
});

window.App = MailApp; // Expose globally
