const App = {
    state: {
        accounts: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
        activeAccountId: localStorage.getItem('mail_active_id') || null,
        lang: localStorage.getItem('mail_lang') || 'en',
        accent: localStorage.getItem('mail_accent') || '#4a90e2',
        messages: {},
        refreshTimer: 10,
        refreshInterval: null
    },

    translations: {
        en: {
            'nav-home': 'Home', 'nav-app': 'Inbox', 'nav-privacy': 'Privacy', 'nav-about': 'About',
            'hero-title': 'Protect Your Privacy with Tamp Mail',
            'hero-subtitle': 'Get a temporary email address instantly and keep your real inbox clean from spam.',
            'btn-start-now': 'Start Using Tamp Mail',
            'feat-fast-title': 'Instant Setup', 'feat-fast-desc': 'No registration required. Get your email address in seconds.',
            'feat-secure-title': 'Secure & Private', 'feat-secure-desc': "Emails are automatically deleted and we don't track you.",
            'feat-multi-title': 'Multi-Mailbox', 'feat-multi-desc': 'Manage multiple temporary addresses simultaneously.',
            'reviews-title': 'User Reviews & Feedback', 'app-title': 'Your Mailboxes',
            'btn-add-mail-text': 'Add Mailbox', 'inbox-title': 'Inbox',
            'refresh-status': 'Refreshing in {s}s', 'empty-msg': 'Your inbox is empty. Waiting for incoming emails...',
            'glos-title': 'Privacy Glossary & FAQ',
            'glos-disposable-title': 'Disposable Email', 'glos-disposable-desc': 'A temporary address that expires after a set period.',
            'glos-encryption-title': 'Encryption', 'glos-encryption-desc': 'Securing data so only authorized parties can read it.',
            'about-title': 'About Tamp Mail', 'about-desc': 'Tamp Mail was built to provide a seamless and secure experience for users who want to avoid spam and protect their identity online.',
            'btn-print-text': 'Print', 'btn-share-text': 'Share'
        },
        hi: {
            'nav-home': 'होम', 'nav-app': 'इनबॉक्स', 'nav-privacy': 'प्राइवेसी', 'nav-about': 'हमारे बारे में',
            'hero-title': 'Tamp Mail के साथ अपनी प्राइवेसी की रक्षा करें',
            'hero-subtitle': 'तुरंत एक अस्थायी ईमेल पता प्राप्त करें और अपने वास्तविक इनबॉक्स को स्पैम से मुक्त रखें।',
            'btn-start-now': 'Tamp Mail का उपयोग शुरू करें',
            'feat-fast-title': 'त्वरित सेटअप', 'feat-fast-desc': 'किसी पंजीकरण की आवश्यकता नहीं है। सेकंडों में अपना ईमेल पता प्राप्त करें।',
            'feat-secure-title': 'सुरक्षित और निजी', 'feat-secure-desc': 'ईमेल स्वचालित रूप से हटा दिए जाते हैं और हम आपको ट्रैक नहीं करते हैं।',
            'feat-multi-title': 'मल्टी-मेलबॉक्स', 'feat-multi-desc': 'एक साथ कई अस्थायी पतों का प्रबंधन करें।',
            'reviews-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया', 'app-title': 'आपके मेलबॉक्स',
            'btn-add-mail-text': 'मेलबॉक्स जोड़ें', 'inbox-title': 'इनबॉक्स',
            'refresh-status': '{s}s में रिफ्रेश हो रहा है', 'empty-msg': 'आपका इनबॉक्स खाली है। आने वाले ईमेल की प्रतीक्षा है...',
            'glos-title': 'प्राइवेसी शब्दावली और सामान्य प्रश्न',
            'glos-disposable-title': 'डिस्पोजेबल ईमेल', 'glos-disposable-desc': 'एक अस्थायी पता जो एक निर्धारित अवधि के बाद समाप्त हो जाता है।',
            'glos-encryption-title': 'एन्क्रिप्शन', 'glos-encryption-desc': 'डेटा को सुरक्षित करना ताकि केवल अधिकृत पक्ष ही इसे पढ़ सकें।',
            'about-title': 'Tamp Mail के बारे में', 'about-desc': 'Tamp Mail उन उपयोगकर्ताओं के लिए एक सहज और सुरक्षित अनुभव प्रदान करने के लिए बनाया गया था जो स्पैम से बचना चाहते हैं और ऑनलाइन अपनी पहचान की रक्षा करना चाहते हैं।',
            'btn-print-text': 'प्रिंट', 'btn-share-text': 'शेयर'
        }
    },

    async init() {
        this.applyLanguage();
        this.applyAccent();
        this.bindEvents();
        this.renderMailboxes();
        this.renderHelp();

        if (!localStorage.getItem('mail_seen_help')) {
            document.getElementById('help-modal').classList.remove('hidden');
            localStorage.setItem('mail_seen_help', 'true');
        }

        if (this.state.activeAccountId) {
            this.startAutoRefresh();
            this.updateProgressBar();
            this.fetchMessages();
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js');
        }
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.dataset.section);
            });
        });

        document.getElementById('btn-start-now').addEventListener('click', () => {
            this.switchSection('app');
            if (this.state.accounts.length === 0) this.createAccount();
        });

        document.getElementById('btn-add-mailbox').addEventListener('click', () => this.createAccount());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleAccent());
        document.getElementById('help-btn').addEventListener('click', () => {
            document.getElementById('help-modal').classList.remove('hidden');
        });
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            this.state.refreshTimer = 10;
            this.fetchMessages();
        });

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        document.getElementById('btn-print').addEventListener('click', () => {
            window.frames["email-body-frame"].contentWindow.print();
        });

        document.getElementById('btn-share').addEventListener('click', () => {
            const subject = document.getElementById('email-detail-subject').textContent;
            if (navigator.share) {
                navigator.share({ title: subject, url: window.location.href });
            } else {
                this.showToast('Sharing not supported on this browser');
            }
        });
    },

    switchSection(sectionId) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(sectionId === 'app' ? 'app-section' : sectionId).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === sectionId);
        });

        document.getElementById('nav-links').classList.remove('active');
    },

    async createAccount() {
        try {
            this.showToast('Creating new mailbox...');
            const domainRes = await this.request('https://api.mail.tm/domains');
            const domain = domainRes['hydra:member'][0].domain;
            const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
            const password = Math.random().toString(36).substring(2, 15);

            const account = await this.request('https://api.mail.tm/accounts', 'POST', { address, password });
            const tokenRes = await this.request('https://api.mail.tm/token', 'POST', { address, password });

            const newAcc = { ...account, token: tokenRes.token, password };
            this.state.accounts.push(newAcc);
            this.state.activeAccountId = newAcc.id;
            this.saveState();
            this.renderMailboxes();
            this.fetchMessages();
            this.startAutoRefresh();
            this.showToast('Mailbox created successfully!');
        } catch (err) {
            console.error(err);
            this.showToast('Error creating mailbox');
        }
    },

    async fetchMessages() {
        if (!this.state.activeAccountId) return;
        const account = this.state.accounts.find(a => a.id === this.state.activeAccountId);
        if (!account) return;

        try {
            const res = await this.request('https://api.mail.tm/messages', 'GET', null, account.token);
            this.state.messages[account.id] = res['hydra:member'];
            this.renderMessages();
        } catch (err) {
            console.error(err);
        }
    },

    renderMailboxes() {
        const list = document.getElementById('mailbox-list');
        list.innerHTML = '';
        this.state.accounts.forEach(acc => {
            const el = document.createElement('div');
            el.className = `mailbox-item ${acc.id === this.state.activeAccountId ? 'active' : ''}`;
            el.innerHTML = `
                <div class="mailbox-info">
                    <div class="mailbox-address">${acc.address}</div>
                </div>
                <div class="mailbox-controls">
                    <button class="btn-icon qr-btn"><i class="fas fa-qrcode"></i></button>
                    <button class="btn-icon delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            el.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn')) {
                    this.deleteAccount(acc.id);
                } else if (e.target.closest('.qr-btn')) {
                    this.showQR(acc.address);
                } else {
                    this.state.activeAccountId = acc.id;
                    this.saveState();
                    this.renderMailboxes();
                    this.fetchMessages();
                }
            });
            list.appendChild(el);
        });
    },

    renderMessages() {
        const list = document.getElementById('email-list');
        const msgs = this.state.messages[this.state.activeAccountId] || [];

        if (msgs.length === 0) {
            list.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-inbox"></i>
                    <p id="empty-msg">${this.translations[this.state.lang]['empty-msg']}</p>
                </div>
            `;
            return;
        }

        list.innerHTML = '';
        msgs.forEach(msg => {
            const el = document.createElement('div');
            el.className = `email-item ${msg.seen ? '' : 'unread'}`;
            el.innerHTML = `
                <div class="email-sender">${msg.from.name || msg.from.address}</div>
                <div class="email-subject">${msg.subject}</div>
                <div class="email-date">${new Date(msg.createdAt).toLocaleTimeString()}</div>
            `;
            el.addEventListener('click', () => this.openMessage(msg.id));
            list.appendChild(el);
        });
    },

    async openMessage(msgId) {
        const account = this.state.accounts.find(a => a.id === this.state.activeAccountId);
        try {
            const msg = await this.request(`https://api.mail.tm/messages/${msgId}`, 'GET', null, account.token);
            document.getElementById('email-detail-subject').textContent = msg.subject;
            document.getElementById('email-detail-from').textContent = `${msg.from.name} <${msg.from.address}>`;
            document.getElementById('email-detail-date').textContent = new Date(msg.createdAt).toLocaleString();

            const frame = document.getElementById('email-body-frame');
            frame.srcdoc = msg.html || msg.text;

            document.getElementById('email-modal').classList.remove('hidden');
            this.fetchMessages(); // Refresh to update seen status
        } catch (err) {
            this.showToast('Error loading message');
        }
    },

    deleteAccount(id) {
        this.state.accounts = this.state.accounts.filter(a => a.id !== id);
        if (this.state.activeAccountId === id) {
            this.state.activeAccountId = this.state.accounts.length > 0 ? this.state.accounts[0].id : null;
        }
        this.saveState();
        this.renderMailboxes();
        this.renderMessages();
        this.showToast('Mailbox deleted');
    },

    showQR(address) {
        const modal = document.getElementById('qr-modal');
        const img = document.getElementById('qr-code-img');
        const addrText = document.getElementById('qr-address');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
        addrText.textContent = address;
        modal.classList.remove('hidden');
    },

    startAutoRefresh() {
        if (this.state.refreshInterval) clearInterval(this.state.refreshInterval);
        this.state.refreshInterval = setInterval(() => {
            this.state.refreshTimer--;
            if (this.state.refreshTimer <= 0) {
                this.state.refreshTimer = 10;
                this.fetchMessages();
            }
            this.updateProgressBar();
        }, 1000);
    },

    updateProgressBar() {
        const progress = document.getElementById('auto-refresh-progress');
        const status = document.getElementById('refresh-status');
        const percent = ((10 - this.state.refreshTimer) / 10) * 100;
        document.documentElement.style.setProperty('--progress-width', `${percent}%`);
        status.textContent = this.translations[this.state.lang]['refresh-status'].replace('{s}', this.state.refreshTimer);
    },

    toggleLanguage() {
        this.state.lang = this.state.lang === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', this.state.lang);
        this.applyLanguage();
        this.renderMessages();
        this.renderHelp();
        this.showToast(this.state.lang === 'en' ? 'Language: English' : 'भाषा: हिंदी');
    },

    renderHelp() {
        const body = document.getElementById('help-body');
        const isHi = this.state.lang === 'hi';
        body.innerHTML = isHi ? `
            <div class="help-content">
                <p>Tamp Mail में आपका स्वागत है! यहाँ कुछ निर्देश दिए गए हैं:</p>
                <ul style="margin-top: 1rem; padding-left: 1.5rem;">
                    <li><strong>मेलबॉक्स जोड़ें:</strong> नया ईमेल पता प्राप्त करने के लिए 'मेलबॉक्स जोड़ें' बटन पर क्लिक करें।</li>
                    <li><strong>मल्टी-मेलबॉक्स:</strong> आप एक साथ कई ईमेल पते रख सकते हैं और उनके बीच स्विच कर सकते हैं।</li>
                    <li><strong>ऑटो-रिफ्रेश:</strong> आपका इनबॉक्स हर 10 सेकंड में अपने आप रिफ्रेश होता है।</li>
                    <li><strong>प्राइवेसी:</strong> हम आपके डेटा को ट्रैक नहीं करते हैं और ईमेल अस्थायी होते हैं।</li>
                </ul>
            </div>
        ` : `
            <div class="help-content">
                <p>Welcome to Tamp Mail! Here are some quick tips:</p>
                <ul style="margin-top: 1rem; padding-left: 1.5rem;">
                    <li><strong>Add Mailbox:</strong> Click the 'Add Mailbox' button to generate a new email address.</li>
                    <li><strong>Multi-Mailbox:</strong> You can manage multiple email addresses and switch between them easily.</li>
                    <li><strong>Auto-Refresh:</strong> Your inbox automatically refreshes every 10 seconds.</li>
                    <li><strong>Privacy:</strong> We don't track your data, and emails are temporary.</li>
                </ul>
            </div>
        `;
        document.getElementById('help-title').textContent = isHi ? 'Tamp Mail गाइड' : 'Welcome to Tamp Mail';
    },

    applyLanguage() {
        const t = this.translations[this.state.lang];
        document.documentElement.lang = this.state.lang;
        Object.keys(t).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Check if it's a button with an icon
                const textSpan = el.querySelector('span');
                if (textSpan) textSpan.textContent = t[id];
                else el.textContent = t[id];
            }
        });

        // Special case for nav links (they don't have spans)
        document.querySelectorAll('.nav-link').forEach(link => {
            const key = `nav-${link.dataset.section}`;
            if (t[key]) link.textContent = t[key];
        });
    },

    toggleAccent() {
        const colors = ['#4a90e2', '#2ecc71', '#e74c3c', '#e91e63'];
        let idx = colors.indexOf(this.state.accent);
        this.state.accent = colors[(idx + 1) % colors.length];
        localStorage.setItem('mail_accent', this.state.accent);
        this.applyAccent();
    },

    applyAccent() {
        document.documentElement.style.setProperty('--primary', this.state.accent);
    },

    saveState() {
        localStorage.setItem('mail_accounts', JSON.stringify(this.state.accounts));
        localStorage.setItem('mail_active_id', this.state.activeAccountId);
    },

    async request(url, method = 'GET', body = null, token = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        if (!res.ok) {
            const err = await res.json();
            throw err;
        }
        return res.status === 204 ? null : res.json();
    },

    showToast(msg) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

window.onload = () => App.init();
window.App = App; // Expose for debugging/playwright
