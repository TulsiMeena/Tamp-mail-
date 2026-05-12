const API_URL = 'https://api.mail.tm';

class MailService {
    constructor() {
        this.token = localStorage.getItem('temp_mail_token') || null;
        this.account = JSON.parse(localStorage.getItem('temp_mail_account')) || null;
    }

    async fetchDomains() {
        try {
            const response = await fetch(`${API_URL}/domains`);
            const data = await response.json();
            return data['hydra:member'];
        } catch (error) {
            console.error('Error fetching domains:', error);
            return [{ domain: 'tempmail.com' }]; // Fallback
        }
    }

    async createAccount(address, password) {
        try {
            const response = await fetch(`${API_URL}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    }

    async login(address, password) {
        try {
            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });
            const data = await response.json();
            if (data.token) {
                this.token = data.token;
                localStorage.setItem('temp_mail_token', data.token);
            }
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }

    async getMessages(page = 1) {
        if (!this.token) return [];
        try {
            const response = await fetch(`${API_URL}/messages?page=${page}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            return data['hydra:member'];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async getMessage(id) {
        if (!this.token) return null;
        try {
            const response = await fetch(`${API_URL}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching message:', error);
            return null;
        }
    }

    async deleteMessage(id) {
        if (!this.token) return false;
        try {
            await fetch(`${API_URL}/messages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }
}

const Mail = new MailService();

const translations = {
    en: {
        'hero-title': 'Your Disposable Email Address',
        'hero-subtitle': 'Protect your privacy and keep your inbox clean.',
        'btn-new-mail': 'New Email',
        'btn-manage': 'Manage',
        'inbox-title': 'Inbox',
        'empty-msg': 'Your inbox is empty. Waiting for incoming emails...',
        'nav-home': 'Home',
        'nav-about': 'About Us',
        'nav-contact': 'Contact Us',
        'nav-privacy': 'Privacy Policy',
        'refresh_status': 'Refreshing in 7s',
        'msg_toast_copied': 'Email copied to clipboard!',
        'msg_toast_new': 'New email generated!',
        'msg_toast_creating': 'Creating new account...',
        'h-how-it-works': 'How It Works',
        's1': 'Generate a random email address.',
        's2': 'Use it for websites that require registration.',
        's3': 'Read incoming emails directly in this inbox.',
        'h-faq': 'FAQ',
        'q1': 'Is it free?',
        'a1': 'Yes, TempMail Pro is completely free to use.',
        'q2': 'How long do emails last?',
        'a2': 'Emails are kept for as long as you keep the browser session active.',
        'about-title': 'About Us',
        'about-text': 'TempMail Pro was created by Aman Meena and Amit Meena to provide a secure and private way to handle temporary email needs. Our mission is to help users avoid spam and protect their digital identity.',
        'contact-title': 'Contact Us',
        'contact-text': 'Have questions or feedback? Reach out to us at:',
        'privacy-title': 'Privacy Policy',
        'privacy-text': 'We do not store your personal data. All temporary email addresses and messages are transient and are purged periodically.'
    },
    hi: {
        'hero-title': 'आपका डिस्पोजेबल ईमेल पता',
        'hero-subtitle': 'अपनी गोपनीयता सुरक्षित रखें और अपने इनबॉक्स को साफ रखें।',
        'btn-new-mail': 'नया ईमेल',
        'btn-manage': 'प्रबंधन',
        'inbox-title': 'इनबॉक्स',
        'empty-msg': 'आपका इनबॉक्स खाली है। आने वाले ईमेल की प्रतीक्षा है...',
        'nav-home': 'होम',
        'nav-about': 'हमारे बारे में',
        'nav-contact': 'संपर्क करें',
        'nav-privacy': 'गोपनीयता नीति',
        'refresh_status': '7s में रिफ्रेश हो रहा है',
        'msg_toast_copied': 'ईमेल क्लिपबोर्ड पर कॉपी हो गया!',
        'msg_toast_new': 'नया ईमेल जेनरेट हुआ!',
        'msg_toast_creating': 'नया अकाउंट बनाया जा रहा है...',
        'h-how-it-works': 'यह कैसे काम करता है',
        's1': 'एक यादृच्छिक ईमेल पता जेनरेट करें।',
        's2': 'उन वेबसाइटों के लिए इसका उपयोग करें जिनके लिए पंजीकरण की आवश्यकता होती है।',
        's3': 'आने वाले ईमेल सीधे इस इनबॉक्स में पढ़ें।',
        'h-faq': 'सामान्य प्रश्न',
        'q1': 'क्या यह मुफ़्त है?',
        'a1': 'हाँ, TempMail Pro उपयोग करने के लिए पूरी तरह से मुफ़्त है।',
        'q2': 'ईमेल कब तक चलते हैं?',
        'a2': 'ईमेल तब तक रखे जाते हैं जब तक आप ब्राउज़र सत्र सक्रिय रखते हैं।',
        'about-title': 'हमारे बारे में',
        'about-text': 'TempMail Pro अमन मीणा और अमित मीणा द्वारा अस्थायी ईमेल जरूरतों को संभालने के लिए एक सुरक्षित और निजी तरीका प्रदान करने के लिए बनाया गया था। हमारा मिशन उपयोगकर्ताओं को स्पैम से बचने और उनकी डिजिटल पहचान की रक्षा करने में मदद करना है।',
        'contact-title': 'संपर्क करें',
        'contact-text': 'कोई प्रश्न या प्रतिक्रिया है? हमसे संपर्क करें:',
        'privacy-title': 'गोपनीयता नीति',
        'privacy-text': 'हम आपका व्यक्तिगत डेटा संग्रहीत नहीं करते हैं। सभी अस्थायी ईमेल पते और संदेश क्षणिक होते हैं और समय-समय पर हटा दिए जाते हैं।'
    }
};

const App = {
    state: {
        lang: localStorage.getItem('mail_lang') || 'en',
        theme: localStorage.getItem('mail_theme') || 'dark',
        accent: localStorage.getItem('mail_accent') || '#3498db',
        refreshInterval: 7,
        timer: 7,
        messages: [],
        activeSection: 'home',
        accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || []
    },

    init() {
        this.applyTheme();
        this.applyAccent();
        this.applyLanguage();
        this.setupEventListeners();
        this.initRouting();
        this.loadAccount();
        this.startPolling();
        this.registerServiceWorker();
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('Service Worker registered', reg))
                    .catch(err => console.error('Service Worker registration failed', err));
            });
        }
    },

    setupEventListeners() {
        // Theme & Lang
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLang());

        // Mobile Menu
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSidebar(true));
        document.getElementById('close-sidebar').addEventListener('click', () => this.toggleSidebar(false));

        // Navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.navigateTo(section);
                this.toggleSidebar(false);
            });
        });

        // App Actions
        document.getElementById('copy-btn').addEventListener('click', () => this.copyEmail());
        document.getElementById('refresh-now-btn').addEventListener('click', () => this.refreshInbox());
        document.getElementById('new-mail-btn').addEventListener('click', () => this.createNewAccount());

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
    },

    initRouting() {
        const hash = window.location.hash.replace('#', '') || 'home';
        this.navigateTo(hash);
    },

    navigateTo(section) {
        this.state.activeSection = section;
        document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`${section}-section`);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('data-section') === section);
        });

        window.location.hash = section;
    },

    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('mail_theme', this.state.theme);
        this.applyTheme();
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        const icon = document.querySelector('#theme-toggle i');
        icon.className = this.state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    toggleLang() {
        this.state.lang = this.state.lang === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', this.state.lang);
        this.applyLanguage();
    },

    applyLanguage() {
        const trans = translations[this.state.lang];
        for (const key in trans) {
            const el = document.getElementById(key);
            if (el) {
                if (el.classList.contains('btn-outline') || el.classList.contains('btn-primary')) {
                    const icon = el.querySelector('i');
                    el.innerHTML = '';
                    if (icon) el.appendChild(icon);
                    const span = document.createElement('span');
                    span.id = key;
                    span.textContent = ' ' + trans[key];
                    el.appendChild(span);
                } else {
                    el.textContent = trans[key];
                }
            }
        }
        this.updateStaticContent();
    },

    updateStaticContent() {
        // Handled by applyLanguage for the most part
    },

    applyAccent() {
        document.documentElement.style.setProperty('--primary', this.state.accent);
    },

    toggleSidebar(show) {
        document.getElementById('sidebar').classList.toggle('open', show);
    },

    closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    },

    async loadAccount() {
        if (Mail.account) {
            this.updateEmailDisplay(Mail.account.address);
            this.refreshInbox();
        } else {
            await this.createNewAccount();
        }
    },

    async createNewAccount() {
        this.showToast(translations[this.state.lang]['msg_toast_creating']);
        const domains = await Mail.fetchDomains();
        const domain = domains[0].domain;
        const username = Math.random().toString(36).substring(2, 12);
        const password = Math.random().toString(36).substring(2, 12);
        const address = `${username}@${domain}`;

        try {
            await Mail.createAccount(address, password);
            await Mail.login(address, password);

            const newAcc = { address, password, token: Mail.token };
            Mail.account = newAcc;
            this.state.accounts.push(newAcc);

            localStorage.setItem('temp_mail_account', JSON.stringify(newAcc));
            localStorage.setItem('temp_mail_token', Mail.token);
            localStorage.setItem('temp_mail_accounts', JSON.stringify(this.state.accounts));

            this.updateEmailDisplay(address);
            this.refreshInbox();
            this.showToast(translations[this.state.lang]['msg_toast_new']);
        } catch (error) {
            this.showToast('Error creating account', 'error');
        }
    },

    updateEmailDisplay(address) {
        document.getElementById('temp-email').textContent = address;
    },

    async refreshInbox() {
        this.state.timer = this.state.refreshInterval;
        const messages = await Mail.getMessages();
        this.state.messages = messages;
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('messages-list');
        const countEl = document.getElementById('msg-count');

        if (this.state.messages.length === 0) {
            container.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-inbox"></i>
                    <p id="empty-msg">${translations[this.state.lang]['empty-msg']}</p>
                </div>`;
            countEl.textContent = `0 ${this.state.lang === 'hi' ? 'संदेश' : 'messages'}`;
            return;
        }

        countEl.textContent = `${this.state.messages.length} ${this.state.lang === 'hi' ? 'संदेश' : 'messages'}`;
        container.innerHTML = this.state.messages.map(msg => `
            <div class="message-item glass-card ${msg.seen ? '' : 'unread'}" onclick="App.viewMessage('${msg.id}')">
                <div class="msg-avatar" style="background: ${this.getIdenticonColor(msg.from.address)}">
                    ${msg.from.name ? msg.from.name.charAt(0) : msg.from.address.charAt(0)}
                </div>
                <div class="msg-info">
                    <span class="msg-sender">${msg.from.name || msg.from.address}</span>
                    <span class="msg-subject">${msg.subject}</span>
                </div>
                <div class="msg-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
        `).join('');
    },

    async viewMessage(id) {
        const msg = await Mail.getMessage(id);
        if (!msg) return;

        document.getElementById('mail-subject').textContent = msg.subject;
        document.getElementById('mail-sender').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
        document.getElementById('mail-date').textContent = new Date(msg.createdAt).toLocaleString();

        const frame = document.getElementById('mail-body-frame');
        frame.srcdoc = msg.html || msg.text;

        document.getElementById('mail-detail-modal').classList.add('active');
        this.refreshInbox(); // Mark as read
    },

    getIdenticonColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 50%)`;
    },

    copyEmail() {
        const email = document.getElementById('temp-email').textContent;
        navigator.clipboard.writeText(email);
        this.showToast(translations[this.state.lang]['msg_toast_copied']);
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    startPolling() {
        setInterval(() => {
            this.state.timer--;
            if (this.state.timer <= 0) {
                this.refreshInbox();
            }
            this.updateProgressBar();
        }, 1000);
    },

    updateProgressBar() {
        const progress = (this.state.timer / this.state.refreshInterval) * 100;
        document.documentElement.style.setProperty('--progress-width', `${progress}%`);
        const statusText = translations[this.state.lang]['refresh_status'].replace('7s', `${this.state.timer}s`);
        document.getElementById('refresh-timer-text').textContent = statusText;
    }
};

window.onload = () => App.init();
