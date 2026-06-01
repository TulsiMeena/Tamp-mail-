const translations = {
    'en': {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About',
        'nav-faq': 'FAQ',
        'nav-privacy': 'Privacy',
        'hero-title': 'Your Secure Temporary Email',
        'hero-subtitle': 'Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.',
        'btn-add-mail-text': 'Create New Mailbox',
        'f1-title': 'Privacy Protection',
        'f1-desc': 'Stay anonymous and protect your identity from trackers.',
        'f2-title': 'Instant Setup',
        'f2-desc': 'No registration required. Get your email in seconds.',
        'f3-title': 'Auto Refresh',
        'f3-desc': 'New emails appear instantly with our polling system.',
        'reviews-title': 'User Reviews & Feedback',
        'btn-refresh-text': 'Refresh',
        'empty-msg': 'Your inbox is empty. Waiting for incoming emails...',
        'about-title': 'About Tamp Mail',
        'faq-title': 'Frequently Asked Questions',
        'privacy-title': 'Privacy Policy',
        'glos-title': 'Privacy Glossary',
        'btn-print-text': 'Print',
        'refresh-status': 'Checking in {s}s',
        'loading': 'Loading...',
        'creating': 'Creating...',
        'offline': 'Offline',
        'copied': 'Copied to clipboard!',
        'mail-created': 'New mailbox created!',
        'error-api': 'API Error. Please try again.',
        'skill1': 'Advanced Encryption',
        'skill2': 'High-Speed API Integration',
        'skill3': 'User-Centric Design'
    },
    'hi': {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-faq': 'सवाल-जवाब',
        'nav-privacy': 'गोपनीयता',
        'hero-title': 'आपका सुरक्षित अस्थायी ईमेल',
        'hero-subtitle': 'स्पैम, विज्ञापन मेलिंग, हैकिंग और अटैकिंग रोबोट के बारे में भूल जाएं। अपने असली मेलबॉक्स को साफ और सुरक्षित रखें।',
        'btn-add-mail-text': 'नया मेलबॉक्स बनाएं',
        'f1-title': 'गोपनीयता सुरक्षा',
        'f1-desc': 'अनाम रहें और ट्रैकर्स से अपनी पहचान सुरक्षित रखें।',
        'f2-title': 'त्वरित सेटअप',
        'f2-desc': 'पंजीकरण की आवश्यकता नहीं है। सेकंड में अपना ईमेल प्राप्त करें।',
        'f3-title': 'ऑटो रिफ्रेश',
        'f3-desc': 'हमारे पोलिंग सिस्टम के साथ नए ईमेल तुरंत दिखाई देते हैं।',
        'reviews-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
        'btn-refresh-text': 'रिफ्रेश करें',
        'empty-msg': 'आपका इनबॉक्स खाली है। आने वाले ईमेल की प्रतीक्षा कर रहा है...',
        'about-title': 'Tamp Mail के बारे में',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'privacy-title': 'गोपनीयता नीति',
        'glos-title': 'गोपनीयता शब्दावली',
        'btn-print-text': 'प्रिंट करें',
        'refresh-status': '{s}s में जाँच हो रही है',
        'loading': 'लोड हो रहा है...',
        'creating': 'बनाया जा रहा है...',
        'offline': 'ऑफलाइन',
        'copied': 'क्लिपबोर्ड पर कॉपी किया गया!',
        'mail-created': 'नया मेलबॉक्स बनाया गया!',
        'error-api': 'API त्रुटि। कृपया पुन: प्रयास करें।',
        'skill1': 'उन्नत एन्क्रिप्शन',
        'skill2': 'हाई-स्पीड API एकीकरण',
        'skill3': 'उपयोगकर्ता-केंद्रित डिज़ाइन'
    }
};

const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || 'blue',
    accounts: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeAccountId: null,
    timer: 10,
    pollingInterval: null,
    domains: []
};

const App = {
    async init() {
        this.applyLanguage();
        this.applyAccent(state.accent);
        this.setupEventListeners();
        this.restoreSession();
        this.updateStaticContent();

        // PWA Service Worker
        if ('serviceWorker' in navigator) {
            window.onload = () => navigator.serviceWorker.register('./sw.js');
        }
    },

    // API Utilities
    async request(endpoint, options = {}) {
        const baseUrl = 'https://api.mail.tm';
        const defaultOptions = {
            headers: { 'Content-Type': 'application/json' }
        };
        if (options.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${options.token}`;
            delete options.token;
        }

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, { ...defaultOptions, ...options });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'API Error');
            }
            return response.status === 204 ? null : await response.json();
        } catch (e) {
            this.showToast(e.message, 'error');
            throw e;
        }
    },

    async fetchDomains() {
        try {
            const data = await this.request('/domains');
            state.domains = data['hydra:member'];
        } catch (e) {
            state.domains = [{ domain: 'tempmail.com' }]; // Fallback
        }
    },

    async createAccount() {
        this.showToast(translations[state.lang]['creating'], 'info');
        if (state.domains.length === 0) await this.fetchDomains();

        const domain = state.domains[0].domain;
        const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
        const password = Math.random().toString(36);

        try {
            const account = await this.request('/accounts', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const tokenData = await this.request('/token', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const newAcc = {
                id: account.id,
                address,
                token: tokenData.token,
                note: '',
                emails: []
            };

            state.accounts.push(newAcc);
            this.saveAccounts();
            this.switchAccount(newAcc.id);
            this.showToast(translations[state.lang]['mail-created'], 'success');
            this.navigateTo('inbox');
        } catch (e) {
            console.error(e);
        }
    },

    // UI Logic
    navigateTo(sectionId) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`${sectionId}-section`).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.getElementById(`nav-${sectionId}`);
        if (activeLink) activeLink.classList.add('active');

        if (sectionId === 'inbox') {
            this.renderMailboxTabs();
            this.startPolling();
        } else {
            this.stopPolling();
        }

        // Close mobile menu
        document.getElementById('nav-links').classList.remove('active');
    },

    renderMailboxTabs() {
        const container = document.getElementById('mailbox-tabs');
        container.innerHTML = '';

        state.accounts.forEach(acc => {
            const div = document.createElement('div');
            div.className = `mailbox-tab ${acc.id === state.activeAccountId ? 'active' : ''}`;
            div.innerHTML = `
                <div class="tab-addr">${acc.address.split('@')[0]}</div>
                <div class="tab-domain">@${acc.address.split('@')[1]}</div>
            `;
            div.onclick = () => this.switchAccount(acc.id);
            container.appendChild(div);
        });
    },

    switchAccount(id) {
        state.activeAccountId = id;
        const acc = state.accounts.find(a => a.id === id);
        document.getElementById('current-mail-address').textContent = acc.address;
        document.getElementById('mailbox-note').value = acc.note || '';
        this.renderEmails(acc.emails);
        this.renderMailboxTabs();
        this.fetchEmails(); // Immediate fetch
        this.resetTimer();
    },

    async fetchEmails() {
        const acc = state.accounts.find(a => a.id === state.activeAccountId);
        if (!acc) return;

        try {
            const data = await this.request('/messages', { token: acc.token });
            acc.emails = data['hydra:member'];
            this.saveAccounts();
            if (state.activeAccountId === acc.id) {
                this.renderEmails(acc.emails);
            }
        } catch (e) {
            console.error(e);
        }
    },

    renderEmails(emails) {
        const list = document.getElementById('email-list');
        if (!emails || emails.length === 0) {
            list.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-inbox"></i>
                    <p id="empty-msg">${translations[state.lang]['empty-msg']}</p>
                </div>
            `;
            return;
        }

        list.innerHTML = '';
        emails.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'email-item';
            div.innerHTML = `
                <div class="email-from">${msg.from.name || msg.from.address}</div>
                <div class="email-subj">${msg.subject}</div>
                <div class="email-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
            `;
            div.onclick = () => this.openEmail(msg.id);
            list.appendChild(div);
        });
    },

    async openEmail(msgId) {
        const acc = state.accounts.find(a => a.id === state.activeAccountId);
        try {
            const msg = await this.request(`/messages/${msgId}`, { token: acc.token });
            document.getElementById('email-subject').textContent = msg.subject;
            document.getElementById('email-from').textContent = `${msg.from.name} <${msg.from.address}>`;
            document.getElementById('email-date').textContent = new Date(msg.createdAt).toLocaleString();

            const frame = document.getElementById('email-body-frame');
            const content = msg.html || msg.text || '';
            frame.srcdoc = Array.isArray(content) ? content.join('') : content;

            // Attachments
            const attContainer = document.getElementById('attachments-container');
            attContainer.innerHTML = '';
            if (msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(att => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-secondary';
                    btn.innerHTML = `<i class="fas fa-paperclip"></i> ${att.filename}`;
                    btn.onclick = () => window.open(`https://api.mail.tm/messages/${msgId}/attachments/${att.id}`, '_blank');
                    attContainer.appendChild(btn);
                });
            }

            document.getElementById('email-modal').style.display = 'flex';
        } catch (e) {
            console.error(e);
        }
    },

    // Timer & Polling
    startPolling() {
        if (state.pollingInterval) return;
        this.resetTimer();
        state.pollingInterval = setInterval(() => {
            state.timer--;
            this.updateProgressBar();
            if (state.timer <= 0) {
                this.fetchEmails();
                this.resetTimer();
            }
        }, 1000);
    },

    stopPolling() {
        clearInterval(state.pollingInterval);
        state.pollingInterval = null;
    },

    resetTimer() {
        state.timer = 10;
        this.updateProgressBar();
    },

    updateProgressBar() {
        const bar = document.getElementById('refresh-progress');
        const status = document.getElementById('refresh-status');
        const width = (state.timer / 10) * 100;
        bar.style.width = `${width}%`;
        status.textContent = translations[state.lang]['refresh-status'].replace('{s}', state.timer);
    },

    // Utilities
    saveAccounts() {
        localStorage.setItem('mail_accounts', JSON.stringify(state.accounts));
    },

    restoreSession() {
        if (state.accounts.length > 0) {
            state.activeAccountId = state.accounts[state.accounts.length - 1].id;
            this.navigateTo('inbox');
        } else {
            this.navigateTo('home');
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    applyLanguage() {
        state.lang = localStorage.getItem('mail_lang') || 'en';
        document.documentElement.lang = state.lang;
        this.updateStaticContent();
    },

    updateStaticContent() {
        const dict = translations[state.lang];
        Object.keys(dict).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                // Specialized handling for buttons with icons
                const textSpan = el.querySelector('span');
                if (textSpan) {
                    textSpan.textContent = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });

        // Update Help Content
        const helpContent = document.getElementById('help-content');
        if (helpContent) {
            helpContent.innerHTML = state.lang === 'en' ? `
                <p>1. Click "Create New Mailbox" to get a temporary address.</p>
                <p>2. Use the address for any online service.</p>
                <p>3. Wait for the inbox to refresh automatically every 10 seconds.</p>
                <p>4. Read emails and download attachments safely.</p>
            ` : `
                <p>1. अस्थायी पता प्राप्त करने के लिए "नया मेलबॉक्स बनाएं" पर क्लिक करें।</p>
                <p>2. किसी भी ऑनलाइन सेवा के लिए पते का उपयोग करें।</p>
                <p>3. इनबॉक्स के हर 10 सेकंड में स्वचालित रूप से रिफ्रेश होने की प्रतीक्षा करें।</p>
                <p>4. ईमेल पढ़ें और अटैचमेंट को सुरक्षित रूप से डाउनलोड करें।</p>
            `;
        }
    },

    applyAccent(color) {
        state.accent = color;
        localStorage.setItem('mail_accent', color);
        document.body.setAttribute('data-theme-color', color);
        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.color === color);
        });
    },

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                this.navigateTo(link.getAttribute('href').substring(1));
            };
        });

        document.getElementById('nav-home-logo').onclick = (e) => {
            e.preventDefault();
            this.navigateTo('home');
        };

        // Mobile Menu
        document.getElementById('menu-toggle').onclick = () => {
            document.getElementById('nav-links').classList.toggle('active');
        };

        // Actions
        document.getElementById('btn-add-mail').onclick = () => this.createAccount();
        document.getElementById('refresh-now-btn').onclick = () => {
            this.fetchEmails();
            this.resetTimer();
        };

        document.getElementById('copy-mail-btn').onclick = () => {
            const addr = document.getElementById('current-mail-address').textContent;
            navigator.clipboard.writeText(addr);
            this.showToast(translations[state.lang]['copied'], 'success');
        };

        document.getElementById('qr-btn').onclick = () => {
            const addr = document.getElementById('current-mail-address').textContent;
            const qrImg = document.getElementById('qr-code-img');
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(addr)}`;
            document.getElementById('qr-addr').textContent = addr;
            document.getElementById('qr-modal').style.display = 'flex';
        };

        document.getElementById('share-btn').onclick = () => {
            const addr = document.getElementById('current-mail-address').textContent;
            if (navigator.share) {
                navigator.share({ text: addr });
            } else {
                navigator.clipboard.writeText(addr);
                this.showToast(translations[state.lang]['copied'], 'success');
            }
        };

        document.getElementById('lang-toggle').onclick = () => {
            state.lang = state.lang === 'en' ? 'hi' : 'en';
            localStorage.setItem('mail_lang', state.lang);
            this.applyLanguage();
            this.renderEmails(state.accounts.find(a => a.id === state.activeAccountId)?.emails);
        };

        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.onclick = () => this.applyAccent(dot.dataset.color);
        });

        document.getElementById('mailbox-note').oninput = (e) => {
            const acc = state.accounts.find(a => a.id === state.activeAccountId);
            if (acc) {
                acc.note = e.target.value;
                this.saveAccounts();
            }
        };

        document.getElementById('btn-print').onclick = () => {
            const frame = document.getElementById('email-body-frame');
            frame.contentWindow.print();
        };

        // Modals Close
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.onclick = () => {
                btn.closest('.modal').style.display = 'none';
            };
        });

        window.onclick = (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        };

        window.onerror = (msg) => this.showToast(msg, 'error');
    }
};

window.App = App;
App.init();
