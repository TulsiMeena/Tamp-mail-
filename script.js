/**
 * Temp Mail Pro - Core Script
 * Integrates with Mail.tm API
 */

const API_URL = 'https://api.mail.tm';

const App = {
    state: {
        account: null, // { id, address, password, token }
        accounts: [],  // Array of accounts
        messages: [],
        domains: [],
        currentTab: 'home',
        language: 'en',
        theme: 'light',
        accent: 'blue',
        refreshInterval: 7000,
        timeLeft: 7,
        timer: null
    },

    async init() {
        this.loadLocalStorage();
        this.applyTheme();
        this.applyAccent();
        this.applyLanguage();
        this.initEventListeners();
        this.registerServiceWorker();
        this.renderAccounts();

        if (this.state.account) {
            this.startPolling();
            this.updateMailDisplay();
            this.fetchMessages();
        } else {
            await this.createNewAccount();
        }

        console.log('App initialized');
    },

    loadLocalStorage() {
        const savedAccount = localStorage.getItem('temp_mail_account');
        if (savedAccount) this.state.account = JSON.parse(savedAccount);

        const savedAccounts = localStorage.getItem('temp_mail_accounts');
        if (savedAccounts) this.state.accounts = JSON.parse(savedAccounts);

        const savedTheme = localStorage.getItem('mail_theme');
        if (savedTheme) this.state.theme = savedTheme;

        const savedAccent = localStorage.getItem('mail_accent');
        if (savedAccent) this.state.accent = savedAccent;

        const savedLang = localStorage.getItem('mail_lang');
        if (savedLang) this.state.language = savedLang;
    },

    saveLocalStorage() {
        localStorage.setItem('temp_mail_account', JSON.stringify(this.state.account));
        localStorage.setItem('temp_mail_accounts', JSON.stringify(this.state.accounts));
        localStorage.setItem('mail_theme', this.state.theme);
        localStorage.setItem('mail_accent', this.state.accent);
        localStorage.setItem('mail_lang', this.state.language);
    },

    // --- API Methods ---

    async fetchDomains() {
        try {
            const res = await fetch(`${API_URL}/domains`);
            const data = await res.json();
            this.state.domains = data['hydra:member'];
            return this.state.domains;
        } catch (err) {
            console.error('Error fetching domains:', err);
            this.showToast('Error connecting to Mail service', 'error');
            return [];
        }
    },

    async createNewAccount(customName = null) {
        this.showToast('Generating new email address...', 'info');

        if (this.state.domains.length === 0) {
            await this.fetchDomains();
        }

        const domain = this.state.domains[0]?.domain || 'mail.tm';
        const name = customName || Math.random().toString(36).substring(2, 12);
        const address = `${name}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        try {
            const res = await fetch(`${API_URL}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });

            if (!res.ok) throw new Error('Failed to create account');
            const accountData = await res.json();

            // Get Token
            const tokenRes = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });
            const tokenData = await tokenRes.json();

            const newAccount = {
                id: accountData.id,
                address: address,
                password: password,
                token: tokenData.token
            };

            this.state.account = newAccount;

            // Add to accounts list if not already there
            if (!this.state.accounts.some(acc => acc.address === address)) {
                this.state.accounts.push(newAccount);
            }

            this.saveLocalStorage();
            this.updateMailDisplay();
            this.renderAccounts();
            this.startPolling();
            this.showToast('New email address created!', 'success');

            return newAccount;
        } catch (err) {
            console.error('Error creating account:', err);
            this.showToast('Failed to create account. Try again.', 'error');
        }
    },

    async fetchMessages() {
        if (!this.state.account) return;

        try {
            const res = await fetch(`${API_URL}/messages`, {
                headers: { 'Authorization': `Bearer ${this.state.account.token}` }
            });
            const data = await res.json();
            const newMessages = data['hydra:member'];

            if (newMessages.length > this.state.messages.length) {
                this.showToast('New message received!', 'success');
                // Play sound or show notification here
            }

            this.state.messages = newMessages;
            this.renderMessages();
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    },

    async deleteMessage(id) {
        try {
            await fetch(`${API_URL}/messages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.state.account.token}` }
            });
            this.state.messages = this.state.messages.filter(m => m.id !== id);
            this.renderMessages();
            this.showToast('Message deleted', 'info');
            this.closeModals();
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    },

    async getMessageDetails(id) {
        try {
            const res = await fetch(`${API_URL}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${this.state.account.token}` }
            });
            return await res.json();
        } catch (err) {
            console.error('Error getting message details:', err);
        }
    },

    // --- UI Methods ---

    updateMailDisplay() {
        const mailInput = document.getElementById('mail-address');
        if (mailInput) {
            mailInput.value = this.state.account?.address || '';
        }
    },

    renderMessages() {
        const list = document.getElementById('mail-list');
        if (!list) return;

        if (this.state.messages.length === 0) {
            list.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-inbox"></i>
                    <p id="empty-msg">Your inbox is empty. Waiting for incoming emails...</p>
                </div>`;
            return;
        }

        list.innerHTML = this.state.messages.map(msg => `
            <div class="mail-item ${msg.seen ? '' : 'unread'}" onclick="App.openMessage('${msg.id}')">
                <div class="sender-avatar">${msg.from.address[0].toUpperCase()}</div>
                <div class="mail-info">
                    <div class="mail-sender">${msg.from.address}</div>
                    <div class="mail-subject">${msg.subject}</div>
                </div>
                <div class="mail-time">${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `).join('');
    },

    async openMessage(id) {
        const msg = await this.getMessageDetails(id);
        if (!msg) return;

        document.getElementById('mail-detail-subject').textContent = msg.subject;
        document.getElementById('mail-detail-from').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
        document.getElementById('mail-detail-date').textContent = new Date(msg.createdAt).toLocaleString();

        const frame = document.getElementById('mail-body-frame');
        const content = msg.html || msg.text || 'No content';
        frame.srcdoc = content;

        document.getElementById('delete-mail-btn').onclick = () => this.deleteMessage(id);
        document.getElementById('download-mail-btn').onclick = () => this.downloadEmail(msg);
        document.getElementById('print-mail-btn').onclick = () => frame.contentWindow.print();

        this.openModal('mail-modal');

        // Mark as read
        if (!msg.seen) {
            this.markAsRead(id);
        }
    },

    async markAsRead(id) {
        try {
            await fetch(`${API_URL}/messages/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.state.account.token}`,
                    'Content-Type': 'application/merge-patch+json'
                },
                body: JSON.stringify({ seen: true })
            });
            const msg = this.state.messages.find(m => m.id === id);
            if (msg) msg.seen = true;
            this.renderMessages();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    },

    // --- Helper Methods ---

    startPolling() {
        if (this.state.timer) clearInterval(this.state.timer);

        this.state.timeLeft = 7;
        this.updateProgressBar();

        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            if (this.state.timeLeft <= 0) {
                this.state.timeLeft = 7;
                this.fetchMessages();
            }
            this.updateProgressBar();
        }, 1000);
    },

    updateProgressBar() {
        const bar = document.getElementById('refresh-progress');
        const text = document.getElementById('refresh-timer-text');
        if (bar) {
            const percentage = ((7 - this.state.timeLeft) / 7) * 100;
            bar.style.width = `${percentage}%`;
        }
        if (text) {
            const trans = this.translations[this.state.language];
            text.textContent = trans['refresh-status'].replace('7s', `${this.state.timeLeft}s`);
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    applyTheme() {
        document.body.className = `${this.state.theme}-theme`;
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = this.state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    },

    applyAccent() {
        document.body.setAttribute('data-accent', this.state.accent);
    },

    translations: {
        en: {
            'hero-title': "Your Temporary Email Address",
            'hero-subtitle': "Forget about spam, advertising mailings, hacking and attacking robots.",
            'copy-btn': "Copy",
            'refresh-now-btn': "Refresh",
            'new-mail-btn': "New",
            'refresh-status': "Autorefresh in 7s",
            'btn-manage': "Manage Mailboxes",
            'btn-qr': "QR Code",
            'inbox-title': "Inbox",
            'search_placeholder': "Search messages...",
            'empty-msg': "Your inbox is empty. Waiting for incoming emails...",
            'info1-title': "What is Temp Mail?",
            'info1-desc': "Temp Mail is a free service that allows receiving email at a temporary address that self-destructed after a certain time elapses.",
            'info2-title': "How It Works",
            'info2-desc': "Just open the app and you'll get a temporary email address instantly. Use it for any website registration.",
            'info3-title': "Stay Anonymous",
            'info3-desc': "Protect your personal email from spam, bots, and phishing by using a temporary disposable email.",
            'about-title': "About Us",
            'role-aman': "Lead Developer",
            'role-amit': "UI/UX Designer",
            'skills-title': "Our Expertise",
            'skill1': "Modern SPA Architecture",
            'skill2': "Real-time API Integration",
            'skill3': "Secure Data Handling",
            'contact-title': "Contact Us",
            'label-name': "Name",
            'label-email': "Email",
            'label-message': "Message",
            'btn-send': "Send Message",
            'privacy-title': "Privacy Policy",
            'glos-title': "Privacy Glossary",
            'privacy-p1': "We value your privacy. This temporary email service does not store any personal data. All emails are automatically deleted after 24 hours.",
            'privacy-p2:': "Your temporary mailbox is unique and generated on the fly. We do not use cookies for tracking purposes.",
            'modal-acc-title': "Manage Mailboxes",
            'btn-add-acc': "Add New Mailbox",
            'btn-dl': "Download",
            'btn-print': "Print",
            'btn-del': "Delete"
        },
        hi: {
            'hero-title': "आपका अस्थायी ईमेल पता",
            'hero-subtitle': "स्पैम, विज्ञापन मेलिंग, हैकिंग और हमला करने वाले रोबोटों के बारे में भूल जाएं।",
            'copy-btn': "कॉपी",
            'refresh-now-btn': "रिफ्रेश",
            'new-mail-btn': "नया",
            'refresh-status': "7s में ऑटो-रिफ्रेश",
            'btn-manage': "मेलबॉक्स प्रबंधित करें",
            'btn-qr': "QR कोड",
            'inbox-title': "इनबॉक्स",
            'search_placeholder': "संदेश खोजें...",
            'empty-msg': "आपका इनबॉक्स खाली है। आने वाले ईमेल की प्रतीक्षा है...",
            'info1-title': "टेम्प मेल क्या है?",
            'info1-desc': "टेम्प मेल एक निःशुल्क सेवा है जो एक अस्थायी पते पर ईमेल प्राप्त करने की अनुमति देती है जो एक निश्चित समय बीत जाने के बाद स्वतः नष्ट हो जाता है।",
            'info2-title': "यह कैसे काम करता है",
            'info2-desc': "बस ऐप खोलें और आपको तुरंत एक अस्थायी ईमेल पता मिल जाएगा। इसे किसी भी वेबसाइट पंजीकरण के लिए उपयोग करें।",
            'info3-title': "अनाम रहें",
            'info3-desc': "अस्थायी डिस्पोजेबल ईमेल का उपयोग करके अपने व्यक्तिगत ईमेल को स्पैम, बॉट्स और फिशिंग से बचाएं।",
            'about-title': "हमारे बारे में",
            'role-aman': "लीड डेवलपर",
            'role-amit': "UI/UX डिज़ाइनर",
            'skills-title': "हमारी विशेषज्ञता",
            'skill1': "आधुनिक SPA आर्किटेक्चर",
            'skill2': "रीयल-टाइम API एकीकरण",
            'skill3': "सुरक्षित डेटा हैंडलिंग",
            'contact-title': "संपर्क करें",
            'label-name': "नाम",
            'label-email': "ईमेल",
            'label-message': "संदेश",
            'btn-send': "संदेश भेजें",
            'privacy-title': "गोपनीयता नीति",
            'glos-title': "गोपनीयता शब्दावली",
            'privacy-p1': "हम आपकी गोपनीयता को महत्व देते हैं। यह अस्थायी ईमेल सेवा किसी भी व्यक्तिगत डेटा को संग्रहीत नहीं करती है। सभी ईमेल 24 घंटों के बाद स्वचालित रूप से हटा दिए जाते हैं।",
            'privacy-p2': "आपका अस्थायी मेलबॉक्स अद्वितीय है और तुरंत उत्पन्न होता है। हम ट्रैकिंग उद्देश्यों के लिए कुकीज़ का उपयोग नहीं करते हैं।",
            'modal-acc-title': "मेलबॉक्स प्रबंधित करें",
            'btn-add-acc': "नया मेलबॉक्स जोड़ें",
            'btn-dl': "डाउनलोड",
            'btn-print': "प्रिंट",
            'btn-del': "हटाएं"
        }
    },

    applyLanguage() {
        const trans = this.translations[this.state.language];
        Object.keys(trans).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.tagName === 'INPUT' && el.placeholder) {
                    el.placeholder = trans[key];
                } else {
                    const icon = el.querySelector('i');
                    const textSpan = el.querySelector('.btn-text');

                    if (textSpan) {
                        textSpan.textContent = trans[key];
                    } else if (icon) {
                        // Element has an icon but no .btn-text wrapper
                        // Keep the icon and replace text nodes
                        Array.from(el.childNodes).forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE) {
                                node.textContent = ' ' + trans[key];
                            }
                        });
                    } else {
                        el.textContent = trans[key];
                    }
                }
            }
        });

        // Update specific placeholders that don't match IDs
        const searchInput = document.getElementById('inbox-search-input');
        if (searchInput) searchInput.placeholder = trans.search_placeholder;

        const timerText = document.getElementById('refresh-timer-text');
        if (timerText) timerText.textContent = trans['refresh-status'].replace('7s', `${this.state.timeLeft}s`);
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('SW registered'))
                    .catch(err => console.log('SW reg error', err));
            });
        }
    },

    initEventListeners() {
        // Language Toggle
        document.getElementById('lang-toggle').onclick = () => {
            this.state.language = this.state.language === 'en' ? 'hi' : 'en';
            this.applyLanguage();
            this.saveLocalStorage();
            this.showToast(this.state.language === 'en' ? 'Switched to English' : 'हिंदी में बदल दिया गया', 'info');
        };

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.switchPage(page);
            };
        });

        document.getElementById('logo-home').onclick = () => this.switchPage('home');

        // Actions
        document.getElementById('copy-btn').onclick = () => {
            if (this.state.account) {
                navigator.clipboard.writeText(this.state.account.address);
                this.showToast('Email address copied!', 'success');
            }
        };

        document.getElementById('refresh-now-btn').onclick = () => {
            this.fetchMessages();
            this.state.timeLeft = 7;
            this.updateProgressBar();
            this.showToast('Refreshing...', 'info');
        };

        document.getElementById('new-mail-btn').onclick = () => this.createNewAccount();

        document.getElementById('theme-toggle').onclick = () => {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            this.saveLocalStorage();
        };

        document.getElementById('settings-toggle').onclick = () => {
            document.querySelector('.settings-panel').classList.toggle('active');
        };

        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.onclick = () => {
                this.state.accent = dot.getAttribute('data-accent');
                this.applyAccent();
                this.saveLocalStorage();
            };
        });

        document.getElementById('menu-toggle').onclick = () => {
            document.getElementById('nav-links').classList.toggle('mobile-active');
        };

        // Modals
        document.querySelectorAll('.close-modal, .modal-overlay').forEach(el => {
            el.onclick = (e) => {
                if (e.target === el || el.classList.contains('close-modal')) {
                    this.closeModals();
                }
            };
        });

        document.getElementById('manage-accounts-btn').onclick = () => this.openModal('account-modal');
        document.getElementById('add-account-btn').onclick = () => {
            this.createNewAccount();
            this.closeModals();
        };

        document.getElementById('qr-btn').onclick = () => {
            if (this.state.account) {
                this.generateQR(this.state.account.address);
                this.openModal('qr-modal');
            }
        };

        // Search
        document.getElementById('inbox-search-input').oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = this.state.messages.filter(m =>
                m.subject.toLowerCase().includes(query) ||
                m.from.address.toLowerCase().includes(query)
            );
            this.renderFilteredMessages(filtered);
        };
    },

    switchPage(pageId) {
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

        document.getElementById(`${pageId}-section`).classList.add('active');
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        document.getElementById('nav-links').classList.remove('mobile-active');
        window.scrollTo(0, 0);
    },

    openModal(id) {
        document.getElementById('modal-overlay').classList.add('active');
        document.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none');
        document.getElementById(id).style.display = 'block';
    },

    closeModals() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    renderAccounts() {
        const list = document.getElementById('accounts-list');
        if (!list) return;

        list.innerHTML = this.state.accounts.map(acc => `
            <div class="acc-item ${this.state.account?.address === acc.address ? 'active' : ''}">
                <div class="acc-info" onclick="App.switchAccount('${acc.address}')">
                    <div class="acc-addr">${acc.address}</div>
                </div>
                <button class="icon-btn delete-acc" onclick="App.removeAccount('${acc.address}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },

    switchAccount(address) {
        const acc = this.state.accounts.find(a => a.address === address);
        if (acc) {
            this.state.account = acc;
            this.state.messages = [];
            this.saveLocalStorage();
            this.updateMailDisplay();
            this.fetchMessages();
            this.closeModals();
            this.renderAccounts();
            this.showToast(`Switched to ${address}`, 'info');
        }
    },

    removeAccount(address) {
        this.state.accounts = this.state.accounts.filter(a => a.address !== address);
        if (this.state.account?.address === address) {
            this.state.account = this.state.accounts[0] || null;
            if (!this.state.account) {
                this.createNewAccount();
            }
        }
        this.saveLocalStorage();
        this.renderAccounts();
        this.updateMailDisplay();
        this.showToast('Account removed', 'info');
    },

    generateQR(text) {
        const container = document.getElementById('qr-container');
        const emailText = document.getElementById('qr-email-text');
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        container.innerHTML = `<img src="${url}" alt="QR Code">`;
        emailText.textContent = text;
    },

    downloadEmail(msg) {
        const content = `From: ${msg.from.address}\nSubject: ${msg.subject}\nDate: ${new Date(msg.createdAt).toLocaleString()}\n\n${msg.text || ''}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-${msg.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    renderFilteredMessages(filtered) {
        const list = document.getElementById('mail-list');
        if (!list) return;

        if (filtered.length === 0) {
            list.innerHTML = `<div class="empty-inbox"><p>No messages found matching your search.</p></div>`;
            return;
        }

        list.innerHTML = filtered.map(msg => `
            <div class="mail-item ${msg.seen ? '' : 'unread'}" onclick="App.openMessage('${msg.id}')">
                <div class="sender-avatar">${msg.from.address[0].toUpperCase()}</div>
                <div class="mail-info">
                    <div class="mail-sender">${msg.from.address}</div>
                    <div class="mail-subject">${msg.subject}</div>
                </div>
                <div class="mail-time">${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `).join('');
    }
};

window.onload = () => App.init();
// Expose App globally for debugging and verification
window.App = App;
