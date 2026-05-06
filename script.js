// Global App Object
const App = {
    config: {
        apiUrl: 'https://api.mail.tm',
        refreshInterval: 7, // seconds
        storageKey: 'temp_mail_account',
        tokenKey: 'temp_mail_token',
        accountsKey: 'temp_mail_accounts',
        themeKey: 'mail_theme',
        accentKey: 'mail_accent',
        langKey: 'mail_lang'
    },
    state: {
        account: null,
        token: null,
        messages: [],
        domains: [],
        currentSection: 'home',
        refreshTimer: null,
        secondsRemaining: 7,
        isRefreshing: false,
        currentLang: 'en',
        theme: 'dark'
    },

    translations: {
        en: {
            home: "Home",
            about: "About Us",
            contact: "Contact",
            privacy: "Privacy",
            hero_title: "Disposable Temporary Email",
            hero_desc: "Protect your privacy and keep your inbox clean.",
            copy: "Copy Email",
            refresh: "Refresh",
            new_email: "New Email",
            refresh_status: "Refreshing in 7s",
            inbox: "Your Inbox",
            empty_inbox: "Your inbox is empty",
            about_title: "About Us",
            contact_title: "Contact Us",
            privacy_title: "Privacy Policy",
            print: "Print",
            download: "Download"
        },
        hi: {
            home: "होम",
            about: "हमारे बारे में",
            contact: "संपर्क करें",
            privacy: "गोपनीयता",
            hero_title: "डिस्पोजेबल अस्थायी ईमेल",
            hero_desc: "अपनी गोपनीयता की रक्षा करें और अपने इनबॉक्स को साफ़ रखें।",
            copy: "ईमेल कॉपी करें",
            refresh: "रिफ्रेश",
            new_email: "नया ईमेल",
            refresh_status: "7s में रिफ्रेश हो रहा है",
            inbox: "आपका इनबॉक्स",
            empty_inbox: "आपका इनबॉक्स खाली है",
            about_title: "हमारे बारे में",
            contact_title: "संपर्क करें",
            privacy_title: "गोपनीयता नीति",
            print: "प्रिंट",
            download: "डाउनलोड"
        }
    },

    init: function() {
        this.cacheDOM();
        this.loadState();
        this.bindEvents();
        this.initRouting();
        this.applyTheme();
        this.applyLanguage();
        this.startApp();
    },

    cacheDOM: function() {
        this.dom = {
            navLinks: document.querySelectorAll('.nav-links a'),
            sections: document.querySelectorAll('.app-section'),
            emailAddress: document.getElementById('email-address'),
            emailList: document.getElementById('email-list'),
            refreshProgress: document.getElementById('refresh-progress'),
            refreshStatusText: document.getElementById('refresh-status-text'),
            copyBtn: document.getElementById('copy-email-btn'),
            refreshBtn: document.getElementById('refresh-now-btn'),
            newEmailBtn: document.getElementById('new-email-btn'),
            menuToggle: document.getElementById('menu-toggle'),
            navLinksContainer: document.getElementById('nav-links'),
            themeToggle: document.getElementById('theme-toggle'),
            langToggle: document.getElementById('lang-toggle'),
            inboxCount: document.getElementById('inbox-count'),
            emailModal: document.getElementById('email-modal'),
            modalSubject: document.getElementById('modal-subject'),
            modalSenderName: document.getElementById('modal-sender-name'),
            modalSenderEmail: document.getElementById('modal-sender-email'),
            modalDate: document.getElementById('modal-date'),
            modalBodyFrame: document.getElementById('email-body-frame'),
            closeModal: document.querySelector('.close-modal'),
            printBtn: document.getElementById('print-email-btn'),
            downloadBtn: document.getElementById('download-email-btn')
        };
    },

    bindEvents: function() {
        // Navigation
        this.dom.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateTo(section);
                if (window.innerWidth <= 768) {
                    this.dom.navLinksContainer.classList.remove('show');
                }
            });
        });

        // Menu Toggle
        this.dom.menuToggle.addEventListener('click', () => {
            this.dom.navLinksContainer.classList.toggle('show');
        });

        // Email Actions
        this.dom.copyBtn.addEventListener('click', () => this.copyEmail());
        this.dom.refreshBtn.addEventListener('click', () => this.manualRefresh());
        this.dom.newEmailBtn.addEventListener('click', () => this.createNewAccount());

        // UI Toggles
        this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.dom.langToggle.addEventListener('click', () => this.toggleLanguage());

        // Modal Actions
        this.dom.printBtn.addEventListener('click', () => this.printEmail());
        this.dom.downloadBtn.addEventListener('click', () => this.downloadEmail());

        // Modal Close
        this.dom.closeModal.addEventListener('click', () => this.closeEmailModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.dom.emailModal) this.closeEmailModal();
        });
    },

    loadState: function() {
        const savedAccount = localStorage.getItem(this.config.storageKey);
        const savedToken = localStorage.getItem(this.config.tokenKey);
        if (savedAccount && savedToken) {
            this.state.account = JSON.parse(savedAccount);
            this.state.token = savedToken;
        }

        this.state.theme = localStorage.getItem(this.config.themeKey) || 'dark';
        this.state.currentLang = localStorage.getItem(this.config.langKey) || 'en';
        const savedAccent = localStorage.getItem(this.config.accentKey);
        if (savedAccent) {
            document.documentElement.style.setProperty('--primary', savedAccent);
        }
    },

    initRouting: function() {
        window.addEventListener('popstate', (e) => {
            const section = e.state ? e.state.section : 'home';
            this.showSection(section);
        });
    },

    navigateTo: function(section) {
        this.state.currentSection = section;
        this.showSection(section);
        history.pushState({ section }, '', `#${section}`);
    },

    showSection: function(sectionId) {
        this.dom.sections.forEach(sec => {
            sec.classList.toggle('active', sec.id === `${sectionId}-section`);
        });
        this.dom.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
    },

    async startApp() {
        await this.fetchDomains();
        if (!this.state.account) {
            await this.createNewAccount();
        } else {
            this.updateUI();
            this.fetchMessages();
            this.startPolling();
        }
    },

    updateUI: function() {
        if (this.state.account) {
            this.dom.emailAddress.value = this.state.account.address;
        }
    },

    async fetchDomains() {
        try {
            const res = await fetch(`${this.config.apiUrl}/domains`);
            const data = await res.json();
            this.state.domains = data['hydra:member'] || [];
            if (this.state.domains.length === 0) {
                this.state.domains = [{ domain: 'tempmail.com' }];
            }
        } catch (err) {
            console.error('Fetch domains error:', err);
            this.state.domains = [{ domain: 'tempmail.com' }];
        }
    },

    async createNewAccount() {
        if (this.state.domains.length === 0) await this.fetchDomains();

        const domain = this.state.domains[0].domain;
        const username = Math.random().toString(36).substring(2, 12);
        const password = Math.random().toString(36).substring(2, 12);
        const address = `${username}@${domain}`;

        this.showToast(this.state.currentLang === 'en' ? 'Creating account...' : 'खाता बनाया जा रहा है...', 'info');

        try {
            const res = await fetch(`${this.config.apiUrl}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });

            if (!res.ok) throw new Error('Account creation failed');

            const accountData = await res.json();

            const tokenRes = await fetch(`${this.config.apiUrl}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });

            if (!tokenRes.ok) throw new Error('Token generation failed');

            const tokenData = await tokenRes.json();

            this.state.account = accountData;
            this.state.token = tokenData.token;

            localStorage.setItem(this.config.storageKey, JSON.stringify(this.state.account));
            localStorage.setItem(this.config.tokenKey, this.state.token);

            this.updateUI();
            this.fetchMessages();
            this.startPolling();
            this.showToast(this.state.currentLang === 'en' ? 'New email generated!' : 'नया ईमेल जनरेट हुआ!', 'success');

        } catch (err) {
            console.error('Create account error:', err);
            this.showToast(this.state.currentLang === 'en' ? 'Failed to create account.' : 'खाता बनाने में विफल।', 'error');
        }
    },

    async fetchMessages() {
        if (!this.state.token) return;
        this.state.isRefreshing = true;

        try {
            const res = await fetch(`${this.config.apiUrl}/messages`, {
                headers: { 'Authorization': `Bearer ${this.state.token}` }
            });

            if (res.status === 401) {
                this.createNewAccount();
                return;
            }

            const data = await res.json();
            this.state.messages = data['hydra:member'] || [];
            this.renderMessages();
            this.dom.inboxCount.textContent = this.state.messages.length;
        } catch (err) {
            console.error('Fetch messages error:', err);
        } finally {
            this.state.isRefreshing = false;
        }
    },

    renderMessages() {
        if (this.state.messages.length === 0) {
            this.dom.emailList.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-inbox"></i>
                    <p>${this.translations[this.state.currentLang].empty_inbox}</p>
                </div>`;
            return;
        }

        this.dom.emailList.innerHTML = this.state.messages.map(msg => `
            <div class="email-item ${msg.seen ? 'read' : 'unread'}" onclick="App.openMessage('${msg.id}')">
                <div class="email-item-avatar">${msg.from.name ? msg.from.name[0].toUpperCase() : '?' }</div>
                <div class="email-item-content">
                    <div class="email-item-header">
                        <span class="email-item-from">${msg.from.name || msg.from.address}</span>
                        <span class="email-item-time">${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div class="email-item-subject">${msg.subject}</div>
                    <div class="email-item-preview">${msg.intro || ''}</div>
                </div>
            </div>
        `).join('');
    },

    async openMessage(id) {
        this.showToast(this.state.currentLang === 'en' ? 'Loading message...' : 'संदेश लोड हो रहा है...', 'info');
        try {
            const res = await fetch(`${this.config.apiUrl}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${this.state.token}` }
            });
            const msg = await res.json();

            this.dom.modalSubject.textContent = msg.subject;
            this.dom.modalSenderName.textContent = msg.from.name || msg.from.address;
            this.dom.modalSenderEmail.textContent = msg.from.address;
            this.dom.modalDate.textContent = new Date(msg.createdAt).toLocaleString();

            const content = msg.html ? (Array.isArray(msg.html) ? msg.html.join('') : msg.html) : msg.text;
            this.dom.modalBodyFrame.srcdoc = content;

            this.dom.emailModal.style.display = 'block';

            if (!msg.seen) {
                fetch(`${this.config.apiUrl}/messages/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.state.token}`,
                        'Content-Type': 'application/merge-patch+json'
                    },
                    body: JSON.stringify({ seen: true })
                }).then(() => this.fetchMessages());
            }

        } catch (err) {
            console.error('Open message error:', err);
            this.showToast(this.state.currentLang === 'en' ? 'Failed to load message.' : 'संदेश लोड करने में विफल।', 'error');
        }
    },

    closeEmailModal() {
        this.dom.emailModal.style.display = 'none';
        this.dom.modalBodyFrame.srcdoc = '';
    },

    manualRefresh() {
        this.fetchMessages();
        this.state.secondsRemaining = this.config.refreshInterval;
        this.updateRefreshUI();
    },

    startPolling: function() {
        this.state.secondsRemaining = this.config.refreshInterval;
        this.updateRefreshUI();

        if (this.state.refreshTimer) clearInterval(this.state.refreshTimer);

        this.state.refreshTimer = setInterval(() => {
            this.state.secondsRemaining--;
            if (this.state.secondsRemaining <= 0) {
                this.fetchMessages();
                this.state.secondsRemaining = this.config.refreshInterval;
            }
            this.updateRefreshUI();
        }, 1000);
    },

    updateRefreshUI: function() {
        const progress = ((this.config.refreshInterval - this.state.secondsRemaining) / this.config.refreshInterval) * 100;
        if (this.dom.refreshProgress) {
            this.dom.refreshProgress.style.setProperty('--progress-width', `${progress}%`);
        }
        if (this.dom.refreshStatusText) {
            const status = this.translations[this.state.currentLang].refresh_status.replace('7s', `${this.state.secondsRemaining}s`);
            this.dom.refreshStatusText.textContent = status;
        }
    },

    copyEmail: function() {
        const email = this.dom.emailAddress.value;
        if (!email) return;
        navigator.clipboard.writeText(email).then(() => {
            this.showToast(this.state.currentLang === 'en' ? 'Email copied!' : 'ईमेल कॉपी हो गया!', 'success');
        });
    },

    printEmail() {
        this.dom.modalBodyFrame.contentWindow.print();
    },

    downloadEmail() {
        const content = this.dom.modalBodyFrame.srcdoc;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-${this.dom.modalSubject.textContent}.html`;
        a.click();
        URL.revokeObjectURL(url);
    },

    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    applyTheme: function() {
        document.body.className = this.state.theme === 'dark' ? 'dark-theme' : 'light-theme';
        this.dom.themeToggle.innerHTML = this.state.theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    },

    toggleTheme: function() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(this.config.themeKey, this.state.theme);
        this.applyTheme();
    },

    applyLanguage: function() {
        const trans = this.translations[this.state.currentLang];

        // Update Navbar
        document.querySelectorAll('.nav-text').forEach((el, index) => {
            const keys = ['home', 'about', 'contact', 'privacy'];
            if (trans[keys[index]]) el.textContent = trans[keys[index]];
        });

        // Update Hero
        const h1 = document.querySelector('.hero-container h1');
        if (h1) h1.textContent = trans.hero_title;
        const p = document.querySelector('.hero-container p');
        if (p) p.textContent = trans.hero_desc;

        // Update Buttons
        if (this.dom.copyBtn) this.dom.copyBtn.title = trans.copy;
        if (this.dom.refreshBtn) this.dom.refreshBtn.title = trans.refresh;
        if (this.dom.newEmailBtn) this.dom.newEmailBtn.title = trans.new_email;

        // Update Titles
        const inboxCount = document.getElementById('inbox-count');
        if (inboxCount && inboxCount.previousElementSibling) {
            inboxCount.previousElementSibling.textContent = trans.inbox;
        }

        const aboutTitle = document.getElementById('about-title');
        if (aboutTitle) aboutTitle.textContent = trans.about_title;

        const contactTitle = document.getElementById('contact-title');
        if (contactTitle) contactTitle.textContent = trans.contact_title;

        const privacyTitle = document.getElementById('privacy-title');
        if (privacyTitle) privacyTitle.textContent = trans.privacy_title;

        // Modal Buttons
        if (this.dom.printBtn) this.dom.printBtn.innerHTML = `<i class="fas fa-print"></i> ${trans.print}`;
        if (this.dom.downloadBtn) this.dom.downloadBtn.innerHTML = `<i class="fas fa-download"></i> ${trans.download}`;

        this.renderMessages();
        this.updateStaticContent();
    },

    updateStaticContent: function() {
        const trans = this.translations[this.state.currentLang];
        const inboxTitle = document.getElementById('inbox-title');
        const emptyInboxText = document.getElementById('empty-inbox-text');

        if (this.state.currentLang === 'hi') {
            if (inboxTitle) inboxTitle.textContent = "आपका इनबॉक्स";
            if (emptyInboxText) emptyInboxText.textContent = "आपका इनबॉक्स खाली है";
        } else {
            if (inboxTitle) inboxTitle.textContent = "Your Inbox";
            if (emptyInboxText) emptyInboxText.textContent = "Your inbox is empty";
        }
    },

    toggleLanguage: function() {
        this.state.currentLang = this.state.currentLang === 'en' ? 'hi' : 'en';
        localStorage.setItem(this.config.langKey, this.state.currentLang);
        this.applyLanguage();
        this.showToast(this.state.currentLang === 'en' ? 'Language switched to English' : 'भाषा हिंदी में बदल गई');
    }
};

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW registered');
        }).catch(err => {
            console.log('SW registration failed:', err);
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    window.App = App;
});
