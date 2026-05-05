/**
 * TempMail Pro - Core Application Logic
 */

const App = {
    // Configuration
    API_URL: 'https://api.mail.tm',
    REFRESH_INTERVAL: 7000,

    // State
    account: null,
    token: null,
    accounts: [], // Multi-mailbox support
    domains: [],
    messages: [],
    currentSection: 'home',
    language: 'en',
    theme: 'dark',
    pollingActive: true,
    refreshTimer: null,
    progressInterval: null,

    /**
     * Initialize the application
     */
    async init() {
        this.loadState();
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        this.renderMailboxSidebar();

        if (this.account && this.token) {
            this.startPolling();
        } else {
            await this.createNewAccount();
        }
    },

    /**
     * Load state from localStorage
     */
    loadState() {
        const savedAccount = localStorage.getItem('temp_mail_account');
        const savedToken = localStorage.getItem('temp_mail_token');
        const savedAccounts = localStorage.getItem('temp_mail_accounts');
        const savedLang = localStorage.getItem('mail_lang');
        const savedTheme = localStorage.getItem('mail_theme');

        if (savedAccount) this.account = JSON.parse(savedAccount);
        if (savedToken) this.token = savedToken;
        if (savedAccounts) this.accounts = JSON.parse(savedAccounts);
        if (savedLang) this.language = savedLang;
        if (savedTheme) this.theme = savedTheme;
    },

    /**
     * Save state to localStorage
     */
    saveState() {
        if (this.account) localStorage.setItem('temp_mail_account', JSON.stringify(this.account));
        if (this.token) localStorage.setItem('temp_mail_token', this.token);
        localStorage.setItem('temp_mail_accounts', JSON.stringify(this.accounts));
        localStorage.setItem('mail_lang', this.language);
        localStorage.setItem('mail_theme', this.theme);
    },

    /**
     * API: Fetch available domains
     */
    async fetchDomains() {
        try {
            const response = await fetch(`${this.API_URL}/domains`);
            const data = await response.json();
            this.domains = data['hydra:member'];
            return this.domains;
        } catch (error) {
            console.error('Error fetching domains:', error);
            this.showToast('Error connecting to mail server', 'error');
            return [];
        }
    },

    /**
     * API: Create a new account
     */
    async createNewAccount(customAddress = null) {
        try {
            this.showToast('Creating new account...', 'info');

            if (this.domains.length === 0) {
                await this.fetchDomains();
            }

            const domain = this.domains[0].domain;
            const address = customAddress || `${Math.random().toString(36).substring(2, 12)}@${domain}`;
            const password = Math.random().toString(36).substring(2, 15);

            const response = await fetch(`${this.API_URL}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });

            if (!response.ok) throw new Error('Account creation failed');

            const accountData = await response.json();

            // Get Token
            const tokenResponse = await fetch(`${this.API_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });

            const tokenData = await tokenResponse.json();

            this.account = { ...accountData, password };
            this.token = tokenData.token;

            // Add to multi-mailbox list
            if (!this.accounts.find(a => a.address === this.account.address)) {
                this.accounts.push({
                    address: this.account.address,
                    password: this.account.password,
                    token: this.token,
                    createdAt: new Date()
                });
            }

            this.saveState();
            this.updateUI();
            this.renderMailboxSidebar();
            this.startPolling();
            this.showToast('New email address ready!', 'success');
        } catch (error) {
            console.error('Account error:', error);
            this.showToast('Failed to create account', 'error');
        }
    },

    /**
     * UI: Update main elements
     */
    updateUI() {
        const emailInput = document.getElementById('email-address');
        if (emailInput && this.account) {
            emailInput.value = this.account.address;
        }
    },

    /**
     * Event Listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Actions
        document.getElementById('copy-btn')?.addEventListener('click', () => this.copyToClipboard());
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('lang-toggle')?.addEventListener('click', () => this.toggleLanguage());
        document.getElementById('new-mail-btn')?.addEventListener('click', () => this.createNewAccount());
        document.getElementById('back-to-inbox')?.addEventListener('click', () => this.closeMessage());
        document.getElementById('qr-btn')?.addEventListener('click', () => this.showQRCode());
        document.getElementById('mailbox-manager-btn')?.addEventListener('click', () => this.toggleSidebar(true));
        document.getElementById('close-sidebar')?.addEventListener('click', () => this.toggleSidebar(false));
        document.getElementById('backup-btn')?.addEventListener('click', () => this.backupData());
        document.getElementById('restore-btn')?.addEventListener('click', () => this.restoreData());
        document.getElementById('close-modal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') this.closeModal();
        });
    },

    /**
     * Section Switching
     */
    switchSection(sectionId) {
        document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        const target = document.getElementById(`${sectionId}-section`);
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);

        if (target) target.classList.add('active');
        if (navItem) navItem.classList.add('active');

        this.currentSection = sectionId;
    },

    /**
     * Theme Management
     */
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveState();
    },

    applyTheme() {
        document.body.className = `${this.theme}-theme`;
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    /**
     * Polling Logic
     */
    startPolling() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        if (this.progressInterval) clearInterval(this.progressInterval);

        this.fetchMessages();

        let timeLeft = this.REFRESH_INTERVAL;
        const progressBar = document.getElementById('refresh-progress');
        const statusText = document.getElementById('refresh-status');

        this.progressInterval = setInterval(() => {
            timeLeft -= 100;
            const progress = ((this.REFRESH_INTERVAL - timeLeft) / this.REFRESH_INTERVAL) * 100;
            if (progressBar) progressBar.style.width = `${progress}%`;

            if (timeLeft <= 0) {
                timeLeft = this.REFRESH_INTERVAL;
                this.fetchMessages();
            }

            if (statusText) {
                const seconds = Math.ceil(timeLeft / 1000);
                const trans = this.translations[this.language];
                statusText.textContent = trans.refresh_status.replace('7s', `${seconds}s`);
            }
        }, 100);
    },

    async fetchMessages() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.API_URL}/messages`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.status === 401) {
                // Token expired, recreate
                await this.createNewAccount();
                return;
            }

            const data = await response.json();
            const newMessages = data['hydra:member'];

            if (newMessages.length > this.messages.length) {
                this.showToast('New message received!', 'success');
                this.playNotificationSound();
            }

            this.messages = newMessages;
            this.renderInbox();
        } catch (error) {
            console.error('Fetch messages error:', error);
        }
    },

    renderInbox() {
        const list = document.getElementById('inbox-list');
        const totalSpan = document.getElementById('total-emails');
        if (!list) return;

        if (totalSpan) totalSpan.textContent = this.messages.length;

        if (this.messages.length === 0) {
            list.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-inbox"></i>
                    <p data-i18n="waiting_mail">Waiting for incoming emails...</p>
                </div>
            `;
            return;
        }

        list.innerHTML = this.messages.map(msg => `
            <div class="email-item ${msg.seen ? '' : 'unread'}" onclick="App.viewMessage('${msg.id}')">
                <div class="email-sender">${msg.from.address}</div>
                <div class="email-subject">${msg.subject || '(No Subject)'}</div>
                <div class="email-time">${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `).join('');
    },

    async viewMessage(msgId) {
        try {
            this.showToast('Loading message...', 'info');
            const response = await fetch(`${this.API_URL}/messages/${msgId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const msg = await response.json();

            // UI Update
            document.querySelector('.inbox-container').classList.add('hidden');
            document.getElementById('email-view').classList.remove('hidden');

            document.getElementById('msg-subject').textContent = msg.subject || '(No Subject)';
            document.getElementById('msg-sender').textContent = `From: ${msg.from.address}`;
            document.getElementById('msg-date').textContent = `Date: ${new Date(msg.createdAt).toLocaleString()}`;

            const frame = document.getElementById('email-frame');
            const content = msg.html ? (Array.isArray(msg.html) ? msg.html.join('') : msg.html) : (msg.text || '');

            frame.srcdoc = `
                <html>
                <head>
                    <style>
                        body { font-family: sans-serif; line-height: 1.5; color: #333; padding: 20px; }
                        img { max-width: 100%; height: auto; }
                    </style>
                </head>
                <body>${content}</body>
                </html>
            `;

            // Mark as seen locally
            const localMsg = this.messages.find(m => m.id === msgId);
            if (localMsg) localMsg.seen = true;
            this.renderInbox();

        } catch (error) {
            console.error('View message error:', error);
            this.showToast('Error loading message', 'error');
        }
    },

    closeMessage() {
        document.getElementById('email-view').classList.add('hidden');
        document.querySelector('.inbox-container').classList.remove('hidden');
    },

    playNotificationSound() {
        // Simple beep using Web Audio API
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        } catch (e) {}
    },
    /**
     * Translation Logic
     */
    translations: {
        en: {
            nav_home: 'Home',
            nav_about: 'About Us',
            nav_contact: 'Contact Us',
            nav_privacy: 'Privacy Policy',
            hero_title: 'Your Temporary Email Address',
            hero_subtitle: 'Protect your inbox from spam and stay anonymous online.',
            copy: 'Copy',
            refresh_status: 'Refreshing in 7s...',
            new_email: 'New Email',
            custom_name: 'Custom Name',
            my_mailboxes: 'My Mailboxes',
            inbox_title: 'Your Inbox',
            emails_received: 'emails received',
            waiting_mail: 'Waiting for incoming emails...',
            what_is_tempmail: 'What is Temp Mail?',
            how_it_works: 'How It Works',
            key_benefits: 'Key Benefits',
            about_title: 'About TempMail Pro',
            contact_title: 'Contact Us',
            privacy_title: 'Privacy Policy'
        },
        hi: {
            nav_home: 'होम',
            nav_about: 'हमारे बारे में',
            nav_contact: 'संपर्क करें',
            nav_privacy: 'प्राइवेसी पॉलिसी',
            hero_title: 'आपका अस्थायी ईमेल पता',
            hero_subtitle: 'स्पैम से अपने इनबॉक्स को सुरक्षित रखें और ऑनलाइन गुमनाम रहें।',
            copy: 'कॉपी करें',
            refresh_status: '7s में रिफ्रेश होगा...',
            new_email: 'नया ईमेल',
            custom_name: 'कस्टम नाम',
            my_mailboxes: 'मेरे मेलबॉक्स',
            inbox_title: 'आपका इनबॉक्स',
            emails_received: 'ईमेल प्राप्त हुए',
            waiting_mail: 'आने वाले ईमेल की प्रतीक्षा है...',
            what_is_tempmail: 'टेम्प मेल क्या है?',
            how_it_works: 'यह कैसे काम करता है',
            key_benefits: 'मुख्य लाभ',
            about_title: 'TempMail Pro के बारे में',
            contact_title: 'संपर्क करें',
            privacy_title: 'प्राइवेसी पॉलिसी'
        }
    },

    toggleLanguage() {
        this.language = this.language === 'en' ? 'hi' : 'en';
        this.applyLanguage();
        this.saveState();
        this.showToast(this.language === 'en' ? 'Language: English' : 'भाषा: हिंदी', 'info');
    },

    applyLanguage() {
        const trans = this.translations[this.language];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (trans[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = trans[key];
                } else if (el.classList.contains('btn-text') || el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P') {
                    el.textContent = trans[key];
                } else {
                    // For buttons with icons, we might need a more careful approach
                    const icon = el.querySelector('i');
                    if (icon) {
                        el.innerHTML = '';
                        el.appendChild(icon);
                        const text = document.createElement('span');
                        text.textContent = ' ' + trans[key];
                        el.appendChild(text);
                    } else {
                        el.textContent = trans[key];
                    }
                }
            }
        });

        // Specific fixes for buttons that have complex structures
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            const icon = copyBtn.querySelector('i');
            copyBtn.innerHTML = '';
            copyBtn.appendChild(icon);
            const span = document.createElement('span');
            span.setAttribute('data-i18n', 'copy');
            span.textContent = ' ' + trans.copy;
            copyBtn.appendChild(span);
        }
    },
    copyToClipboard() {
        const email = document.getElementById('email-address').value;
        if (!email || email === 'Generating...') return;
        navigator.clipboard.writeText(email);
        this.showToast('Copied to clipboard!', 'success');
    },

    showQRCode() {
        const email = this.account?.address;
        if (!email) return;

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}`;
        this.showModal('Scan QR Code', `
            <div style="text-align: center; padding: 1rem;">
                <img src="${qrUrl}" alt="QR Code" style="max-width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                <p style="font-weight: 600; font-size: 1.1rem;">${email}</p>
            </div>
        `);
    },

    showModal(title, body) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = body;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    /**
     * Mailbox Manager Logic
     */
    toggleSidebar(show) {
        document.getElementById('mailbox-sidebar').classList.toggle('active', show);
    },

    renderMailboxSidebar() {
        const list = document.getElementById('mailbox-list');
        if (!list) return;

        list.innerHTML = this.accounts.map(acc => `
            <div class="mailbox-item ${this.account?.address === acc.address ? 'active' : ''}">
                <div class="mailbox-info" onclick="App.switchAccount('${acc.address}')">
                    <div class="mailbox-addr">${acc.address}</div>
                    <div class="mailbox-date">${new Date(acc.createdAt).toLocaleDateString()}</div>
                </div>
                <button class="btn-icon danger sm" onclick="App.deleteAccount('${acc.address}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },

    async switchAccount(address) {
        const acc = this.accounts.find(a => a.address === address);
        if (!acc) return;

        this.account = { id: '', address: acc.address, password: acc.password };
        this.token = acc.token;
        this.messages = [];
        this.updateUI();
        this.saveState();
        this.renderInbox();
        this.renderMailboxSidebar();
        this.startPolling();
        this.toggleSidebar(false);
        this.showToast(`Switched to ${address}`, 'info');
    },

    deleteAccount(address) {
        if (!confirm('Are you sure you want to delete this mailbox?')) return;

        this.accounts = this.accounts.filter(a => a.address !== address);
        if (this.account?.address === address) {
            if (this.accounts.length > 0) {
                this.switchAccount(this.accounts[0].address);
            } else {
                this.createNewAccount();
            }
        }
        this.saveState();
        this.renderMailboxSidebar();
        this.showToast('Mailbox deleted', 'info');
    },

    backupData() {
        const data = {
            accounts: this.accounts,
            version: '1.0',
            exportedAt: new Date()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tempmail-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        this.showToast('Backup downloaded', 'success');
    },

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.accounts && Array.isArray(data.accounts)) {
                        this.accounts = data.accounts;
                        this.saveState();
                        this.renderMailboxSidebar();
                        this.showToast('Data restored successfully', 'success');
                    }
                } catch (err) {
                    this.showToast('Invalid backup file', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
    });
}

// Start App
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App; // Expose to global for verification
