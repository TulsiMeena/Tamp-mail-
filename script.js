/**
 * Tamp Mail - Application Logic
 */

const API_URL = 'https://api.mail.tm';

const state = {
    accounts: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeAccountId: localStorage.getItem('mail_active_id') || null,
    messages: [],
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || 'blue',
    timer: 10,
    isPolling: false
};

const translations = {
    en: {
        'nav-home': 'Home', 'nav-inbox': 'Inbox', 'nav-about': 'About', 'nav-help': 'Help',
        'lang-text': 'Hindi', 'hero-title': 'Your Private Inbox, Instantly',
        'hero-subtitle': 'Protect your primary email from spam and trackers with Tamp Mail.',
        'btn-add-mail': 'Get Random Email', 'f1-title': 'Anonymous',
        'f1-desc': 'No registration required. Use it instantly without giving away personal info.',
        'f2-title': 'Fast Polling', 'f2-desc': '10-second auto-refresh keeps your inbox updated in real-time.',
        'f3-title': 'Self-Destruct', 'f3-desc': 'Accounts are temporary and messages expire automatically.',
        'rev-title': 'User Reviews & Feedback', 'rev1-text': "Best temp mail service I've used. The multiple mailbox feature is a lifesaver!",
        'rev2-text': "Bahut hi badhiya service hai. Hindi support dekh kar khushi hui.",
        'inbox-title': 'Active Mailboxes', 'btn-refresh-text': 'Refresh Now',
        'refresh-status-text': 'Refreshing in {s}s...', 'empty-inbox-text': 'Select a mailbox to view messages',
        'about-title': 'About Tamp Mail', 'about-desc1': 'Tamp Mail provides free, temporary email addresses to help you stay safe online.',
        'glos-title': 'Privacy Glossary', 'term1': 'Disposable Email', 'def1': 'A temporary address that expires after a set period.',
        'term2': 'End-to-End', 'def2': 'Privacy where only the sender and recipient can read content.',
        'faq-title': 'Frequently Asked Questions', 'q1': 'Is it free?', 'a1': 'Yes, Tamp Mail is 100% free for everyone.',
        'q2': 'How long do emails last?', 'a2': 'Emails stay active as long as you keep the browser session or saved accounts.',
        'btn-print-text': 'Print', 'btn-share-text': 'Share', 'help-modal-title': 'How to use Tamp Mail'
    },
    hi: {
        'nav-home': 'होम', 'nav-inbox': 'इनबॉक्स', 'nav-about': 'हमारे बारे में', 'nav-help': 'सहायता',
        'lang-text': 'English', 'hero-title': 'आपका निजी इनबॉक्स, तुरंत',
        'hero-subtitle': 'Tamp Mail के साथ अपने प्राथमिक ईमेल को स्पैम और ट्रैकर्स से सुरक्षित रखें।',
        'btn-add-mail': 'रैंडम ईमेल प्राप्त करें', 'f1-title': 'अनाम',
        'f1-desc': 'किसी पंजीकरण की आवश्यकता नहीं है। व्यक्तिगत जानकारी दिए बिना तुरंत इसका उपयोग करें।',
        'f2-title': 'तेज़ पोलिंग', 'f2-desc': '10-सेकंड ऑटो-रिफ्रेश आपके इनबॉक्स को रीयल-टाइम में अपडेट रखता है।',
        'f3-title': 'स्व-विनाश', 'f3-desc': 'खाते अस्थायी होते हैं और संदेश अपने आप समाप्त हो जाते हैं।',
        'rev-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया', 'rev1-text': "सबसे अच्छी अस्थायी ईमेल सेवा जो मैंने उपयोग की है। मल्टीपल मेलबॉक्स फीचर जीवन रक्षक है!",
        'rev2-text': "बहुत ही बढ़िया सर्विस है। हिंदी सपोर्ट देख कर खुशी हुई।",
        'inbox-title': 'सक्रिय मेलबॉक्स', 'btn-refresh-text': 'अभी रिफ्रेश करें',
        'refresh-status-text': '{s}s में रिफ्रेश हो रहा है...', 'empty-inbox-text': 'संदेश देखने के लिए एक मेलबॉक्स चुनें',
        'about-title': 'Tamp Mail के बारे में', 'about-desc1': 'Tamp Mail आपको ऑनलाइन सुरक्षित रहने में मदद करने के लिए मुफ्त, अस्थायी ईमेल पते प्रदान करता है।',
        'glos-title': 'गोपनीयता शब्दावली', 'term1': 'डिस्पोजेबल ईमेल', 'def1': 'एक अस्थायी पता जो एक निर्धारित अवधि के बाद समाप्त हो जाता है।',
        'term2': 'एंड-टू-एंड', 'def2': 'गोपनीयता जहां केवल प्रेषक और प्राप्तकर्ता ही सामग्री पढ़ सकते हैं।',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न', 'q1': 'क्या यह मुफ़्त है?', 'a1': 'हाँ, Tamp Mail सभी के लिए 100% मुफ़्त है।',
        'q2': 'ईमेल कितने समय तक चलते हैं?', 'a2': 'जब तक आप ब्राउज़र सत्र या सहेजे गए खाते रखते हैं, ईमेल सक्रिय रहते हैं।',
        'btn-print-text': 'प्रिंट', 'btn-share-text': 'शेयर', 'help-modal-title': 'Tamp Mail का उपयोग कैसे करें'
    }
};

const App = {
    async init() {
        this.bindEvents();
        this.applyLanguage();
        this.applyTheme(state.accent);
        this.renderMailboxes();
        this.startPolling();

        if (state.activeAccountId) {
            this.fetchMessages();
        }

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.onload = () => navigator.serviceWorker.register('./sw.js');
        }
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) this.showSection(section);
                if (link.id === 'nav-help') this.toggleModal('help-modal', true);

                // Close mobile menu
                document.getElementById('nav-links').classList.remove('active');
            });
        });

        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        // Actions
        document.getElementById('btn-create-mail').addEventListener('click', () => this.createAccount());
        document.getElementById('add-another-btn').addEventListener('click', () => this.createAccount());
        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            state.timer = 0;
            this.updateProgressBar();
        });

        // Toggles
        document.getElementById('lang-toggle').addEventListener('click', () => {
            state.lang = state.lang === 'en' ? 'hi' : 'en';
            localStorage.setItem('mail_lang', state.lang);
            this.applyLanguage();
        });

        document.querySelectorAll('.theme-picker .dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const color = dot.getAttribute('data-color');
                this.applyTheme(color);
            });
        });

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.toggleModal(modal.id, false);
            });
        });

        // Email Detail Actions
        document.getElementById('btn-print').addEventListener('click', () => {
            const iframe = document.querySelector('#email-body-container iframe');
            if (iframe) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }
        });

        document.getElementById('btn-share').addEventListener('click', () => {
            const account = state.accounts.find(a => a.id === state.activeAccountId);
            if (account && navigator.share) {
                navigator.share({ title: 'Tamp Mail', text: account.address });
            }
        });
    },

    async request(path, options = {}) {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'API Error');
        }
        return response.json();
    },

    async createAccount() {
        try {
            this.showToast('Generating mailbox...');
            const domains = await this.request('/domains');
            const domain = domains['hydra:member'][0].domain;
            const address = `${Math.random().toString(36).substring(2, 10)}@${domain}`;
            const password = Math.random().toString(36);

            const account = await this.request('/accounts', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const tokenData = await this.request('/token', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const newAccount = { ...account, token: tokenData.token, password };
            state.accounts.push(newAccount);
            state.activeAccountId = newAccount.id;

            this.saveState();
            this.renderMailboxes();
            this.showSection('inbox');
            this.fetchMessages();
            this.showToast('New mailbox created!');
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    },

    async fetchMessages() {
        if (!state.activeAccountId) return;
        const account = state.accounts.find(a => a.id === state.activeAccountId);
        if (!account) return;

        try {
            const data = await this.request('/messages', {
                headers: { 'Authorization': `Bearer ${account.token}` }
            });
            state.messages = data['hydra:member'];
            this.renderMessages();
        } catch (err) {
            console.error('Fetch messages failed', err);
        }
    },

    renderMailboxes() {
        const list = document.getElementById('mailbox-list');
        list.innerHTML = state.accounts.map(acc => `
            <div class="mailbox-card ${acc.id === state.activeAccountId ? 'active' : ''}" onclick="App.setActiveAccount('${acc.id}')">
                <h4>${acc.address}</h4>
                <div class="controls">
                    <button class="btn-icon" onclick="event.stopPropagation(); App.copyToClipboard('${acc.address}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); App.showQR('${acc.address}')">
                        <i class="fas fa-qrcode"></i>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); App.deleteAccount('${acc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderMessages() {
        const container = document.getElementById('messages-container');
        if (state.messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p id="empty-inbox-text">${translations[state.lang]['empty-inbox-text']}</p>
                </div>`;
            return;
        }

        container.innerHTML = state.messages.map(msg => `
            <div class="message-item" onclick="App.viewEmail('${msg.id}')">
                <div class="message-info">
                    <h4>${msg.from.name || msg.from.address}</h4>
                    <p>${msg.subject}</p>
                </div>
                <div class="message-meta">
                    <span>${new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
            </div>
        `).join('');
    },

    async viewEmail(id) {
        const account = state.accounts.find(a => a.id === state.activeAccountId);
        try {
            const msg = await this.request(`/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${account.token}` }
            });

            document.getElementById('email-subject-display').textContent = msg.subject;
            document.getElementById('email-from').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
            document.getElementById('email-date').textContent = new Date(msg.createdAt).toLocaleString();

            const bodyContainer = document.getElementById('email-body-container');
            bodyContainer.innerHTML = '<iframe sandbox="allow-popups allow-forms"></iframe>';
            const iframe = bodyContainer.querySelector('iframe');

            const content = Array.isArray(msg.html) ? msg.html.join('') : (msg.html || msg.text || '');
            iframe.srcdoc = `
                <html>
                    <head><style>body { font-family: sans-serif; line-height: 1.5; color: #333; }</style></head>
                    <body>${content}</body>
                </html>`;

            this.toggleModal('email-modal', true);
        } catch (err) {
            this.showToast('Could not load email content', 'error');
        }
    },

    setActiveAccount(id) {
        state.activeAccountId = id;
        this.saveState();
        this.renderMailboxes();
        this.fetchMessages();
    },

    deleteAccount(id) {
        state.accounts = state.accounts.filter(a => a.id !== id);
        if (state.activeAccountId === id) {
            state.activeAccountId = state.accounts.length > 0 ? state.accounts[0].id : null;
        }
        this.saveState();
        this.renderMailboxes();
        this.renderMessages();
    },

    startPolling() {
        if (state.isPolling) return;
        state.isPolling = true;

        setInterval(() => {
            state.timer--;
            if (state.timer <= 0) {
                state.timer = 10;
                this.fetchMessages();
            }
            this.updateProgressBar();
        }, 1000);
    },

    updateProgressBar() {
        const percent = ((10 - state.timer) / 10) * 100;
        document.documentElement.style.setProperty('--progress-width', `${percent}%`);
        const text = translations[state.lang]['refresh-status-text'].replace('{s}', state.timer);
        document.getElementById('refresh-status-text').textContent = text;
    },

    showSection(id) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`${id}-section`).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${id}"]`);
        if (activeLink) activeLink.classList.add('active');
    },

    toggleModal(id, show) {
        const modal = document.getElementById(id);
        if (show) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    },

    applyLanguage() {
        const dict = translations[state.lang];
        for (const [id, text] of Object.entries(dict)) {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SPAN' || el.classList.contains('nav-link') || el.tagName === 'P' || el.tagName.startsWith('H')) {
                    el.textContent = text;
                }
            }
        }
        document.documentElement.lang = state.lang;
        this.updateProgressBar();
        this.renderHelpContent();
    },

    renderHelpContent() {
        const content = document.getElementById('help-content');
        const steps = state.lang === 'en' ?
            ['Click "Get Random Email"', 'Switch to Inbox', 'Share your address', 'Wait for auto-refresh'] :
            ['"रैंडम ईमेल प्राप्त करें" पर क्लिक करें', 'इनबॉक्स पर जाएं', 'अपना पता साझा करें', 'ऑटो-रिफ्रेश की प्रतीक्षा करें'];

        content.innerHTML = `<ul style="padding-left: 1.5rem; line-height: 2;">
            ${steps.map(s => `<li>${s}</li>`).join('')}
        </ul>`;
    },

    applyTheme(color) {
        state.accent = color;
        localStorage.setItem('mail_accent', color);

        const colors = {
            blue: '#4a90e2',
            green: '#2ecc71',
            red: '#e74c3c',
            pink: '#e91e63'
        };

        document.documentElement.style.setProperty('--primary', colors[color]);
        document.documentElement.style.setProperty('--primary-hover', colors[color] + 'dd');

        document.querySelectorAll('.theme-picker .dot').forEach(dot => {
            dot.classList.toggle('active', dot.getAttribute('data-color') === color);
        });
    },

    showQR(address) {
        const qrImg = document.getElementById('qr-image');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
        document.getElementById('qr-email-text').textContent = address;
        this.toggleModal('qr-modal', true);
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!');
        });
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    saveState() {
        localStorage.setItem('mail_accounts', JSON.stringify(state.accounts));
        localStorage.setItem('mail_active_id', state.activeAccountId);
    }
};

window.App = App;
App.init();
