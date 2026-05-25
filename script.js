const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About',
        'nav-faq': 'FAQ',
        'hero-title': 'Your Secure Temp Mail Solution',
        'hero-subtitle': 'Protect your privacy and keep your primary inbox clean from spam.',
        'btn-inbox-text': 'Go to Inbox',
        's-title': 'How It Works',
        's1-h': 'Generate',
        's1-p': 'Create multiple temporary email addresses instantly.',
        's2-h': 'Receive',
        's2-p': 'Use your temp mail to sign up for any service.',
        's3-h': 'Dispose',
        's3-p': 'Mails are automatically cleared after some time.',
        'rev-title': 'User Reviews & Feedback',
        'inbox-title': 'Manage Your Mailboxes',
        'btn-add-text': 'New Mailbox',
        'btn-refresh-text': 'Refresh',
        'refresh-status-text': 'Refreshing in ',
        'empty-msg': 'Your inbox is empty. Waiting for incoming emails...',
        'about-title': 'About Tamp Mail',
        'about-p1': 'Tamp Mail was created to solve the growing problem of email spam and privacy invasion.',
        'team-admin': 'Lead Developer',
        'team-support': 'Customer Success',
        'skills-title': 'Our Expertise',
        'skill1': 'Secure API Integration',
        'skill2': 'Responsive UI/UX Design',
        'skill3': 'Privacy-First Architecture',
        'faq-title': 'Frequently Asked Questions',
        'glos-title': 'Privacy Glossary',
        'btn-print-text': 'Print'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-faq': 'सवाल-जवाब',
        'hero-title': 'आपका सुरक्षित अस्थायी मेल समाधान',
        'hero-subtitle': 'अपनी गोपनीयता की रक्षा करें और अपने प्राथमिक इनबॉक्स को स्पैम से मुक्त रखें।',
        'btn-inbox-text': 'इनबॉक्स पर जाएं',
        's-title': 'यह कैसे काम करता है',
        's1-h': 'जेनरेट करें',
        's1-p': 'तुरंत कई अस्थायी ईमेल पते बनाएं।',
        's2-h': 'प्राप्त करें',
        's2-p': 'किसी भी सेवा के लिए साइन अप करने के लिए अपने अस्थायी मेल का उपयोग करें।',
        's3-h': 'हटाएं',
        's3-p': 'कुछ समय बाद मेल अपने आप हट जाते हैं।',
        'rev-title': 'उपयोगकर्ता समीक्षाएं',
        'inbox-title': 'अपने मेलबॉक्स प्रबंधित करें',
        'btn-add-text': 'नया मेलबॉक्स',
        'btn-refresh-text': 'रिफ्रेश करें',
        'refresh-status-text': 'रिफ्रेश हो रहा है ',
        'empty-msg': 'आपका इनबॉक्स खाली है। नए ईमेल का इंतज़ार है...',
        'about-title': 'Tamp Mail के बारे में',
        'about-p1': 'Tamp Mail को ईमेल स्पैम और गोपनीयता उल्लंघन की बढ़ती समस्या को हल करने के लिए बनाया गया था।',
        'team-admin': 'मुख्य डेवलपर',
        'team-support': 'ग्राहक सफलता',
        'skills-title': 'हमारी विशेषज्ञता',
        'skill1': 'सुरक्षित API एकीकरण',
        'skill2': 'रिस्पॉन्सिव UI/UX डिज़ाइन',
        'skill3': 'गोपनीयता-प्रथम आर्किटेक्चर',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'glos-title': 'गोपनीयता शब्दावली',
        'btn-print-text': 'प्रिंट करें'
    }
};

const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    accent: localStorage.getItem('mail_accent') || '#4f46e5',
    mailboxes: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeMailbox: null,
    messages: [],
    domains: [],
    refreshTimer: 10,
    timerInterval: null
};

const App = {
    init() {
        this.applyTheme();
        this.applyLanguage();
        this.setupEventListeners();
        this.initSPA();
        this.loadMailboxes();
        this.fetchDomains();
        this.renderExtras();
        console.log('Tamp Mail App Initialized');
    },

    applyTheme() {
        document.body.classList.toggle('light-theme', state.theme === 'light');
        document.documentElement.style.setProperty('--primary', state.accent);
    },

    applyLanguage() {
        document.documentElement.lang = state.lang;
        const dict = translations[state.lang];
        Object.keys(dict).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id.startsWith('btn-') && el.querySelector('span')) {
                    el.querySelector('span').textContent = dict[id];
                } else if (id === 'refresh-status-text') {
                    const timer = el.querySelector('#timer-count');
                    el.childNodes[0].textContent = dict[id];
                } else {
                    el.textContent = dict[id];
                }
            }
        });
        this.renderExtras();
    },

    setupEventListeners() {
        // Nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateTo(section);
            });
        });

        // Toggles
        document.getElementById('theme-toggle').addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mail_theme', state.theme);
            this.applyTheme();
        });

        document.getElementById('lang-toggle').addEventListener('click', () => {
            state.lang = state.lang === 'en' ? 'hi' : 'en';
            localStorage.setItem('mail_lang', state.lang);
            this.applyLanguage();
        });

        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        document.getElementById('btn-add-mail').addEventListener('click', () => {
            this.createAccount();
        });

        document.getElementById('btn-go-inbox').addEventListener('click', () => {
            this.navigateTo('inbox');
        });

        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            this.fetchMessages();
            this.resetTimer();
        });

        document.getElementById('close-email-modal').addEventListener('click', () => {
            document.getElementById('email-modal').classList.add('hidden');
        });

        document.getElementById('close-qr-modal').addEventListener('click', () => {
            document.getElementById('qr-modal').classList.add('hidden');
        });

        document.getElementById('btn-print-email').addEventListener('click', () => {
            const iframe = document.getElementById('email-iframe');
            iframe.contentWindow.print();
        });

        // Close drawer on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('nav-links').classList.remove('active');
            });
        });
    },

    initSPA() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'home';
            this.navigateTo(hash);
        });

        const initialHash = window.location.hash.replace('#', '') || 'home';
        this.navigateTo(initialHash);
    },

    navigateTo(sectionId) {
        document.querySelectorAll('.spa-section').forEach(sec => sec.classList.add('hidden'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
    },

    async fetchDomains() {
        try {
            const res = await fetch('https://api.mail.tm/domains');
            const data = await res.json();
            state.domains = data['hydra:member'].map(d => d.domain);
        } catch (err) {
            console.error('Failed to fetch domains', err);
            state.domains = ['tempmail.com']; // Fallback
        }
    },

    renderExtras() {
        const reviewsList = document.getElementById('reviews-list');
        if (reviewsList) {
            reviewsList.innerHTML = `
                <div class="card">
                    <p>"Bohot hi badhiya service hai, instantly email mil gaya!"</p>
                    <strong>- Amit Kumar</strong>
                </div>
                <div class="card">
                    <p>"I use this for all my test signups. Safe and secure."</p>
                    <strong>- Sarah J.</strong>
                </div>
            `;
        }

        const faqList = document.getElementById('faq-list');
        if (faqList) {
            faqList.innerHTML = `
                <div class="card">
                    <h4>Is this free?</h4>
                    <p>Yes, Tamp Mail is 100% free to use.</p>
                </div>
                <div class="card">
                    <h4>How long do emails last?</h4>
                    <p>Emails are kept until you delete the mailbox or session expires.</p>
                </div>
            `;
        }
    },

    async request(endpoint, options = {}) {
        const url = `https://api.mail.tm${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (state.activeMailbox && state.activeMailbox.token) {
            headers['Authorization'] = `Bearer ${state.activeMailbox.token}`;
        }

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'API Request failed');
        }
        return response.json();
    },

    async createAccount() {
        try {
            if (state.domains.length === 0) await this.fetchDomains();
            const domain = state.domains[0];
            const username = Math.random().toString(36).substring(2, 12);
            const address = `${username}@${domain}`;
            const password = Math.random().toString(36).substring(2, 15);

            await this.request('/accounts', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const tokenData = await this.request('/token', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const newMailbox = {
                id: tokenData.id,
                address,
                password,
                token: tokenData.token,
                createdAt: new Date().toISOString()
            };

            state.mailboxes.push(newMailbox);
            state.activeMailbox = newMailbox;
            this.saveMailboxes();
            this.renderMailboxes();
            this.showToast('New mailbox created!', 'success');
            this.startPolling();
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    },

    saveMailboxes() {
        localStorage.setItem('mail_accounts', JSON.stringify(state.mailboxes));
    },

    renderMailboxes() {
        const list = document.getElementById('mailbox-list');
        if (!list) return;
        list.innerHTML = '';
        state.mailboxes.forEach(mb => {
            const card = document.createElement('div');
            card.className = `mailbox-card ${state.activeMailbox?.address === mb.address ? 'active' : ''}`;
            card.innerHTML = `
                <div class="mb-info">
                    <strong>${mb.address}</strong>
                    <p class="text-muted small">${new Date(mb.createdAt).toLocaleString()}</p>
                </div>
                <div class="mb-actions">
                    <button onclick="App.copyToClipboard('${mb.address}')" class="btn-icon"><i class="fas fa-copy"></i></button>
                    <button onclick="App.showQR('${mb.address}')" class="btn-icon"><i class="fas fa-qrcode"></i></button>
                    <button onclick="App.deleteMailbox('${mb.address}')" class="btn-icon"><i class="fas fa-trash"></i></button>
                </div>
            `;
            card.onclick = (e) => {
                if (e.target.closest('button')) return;
                this.setActiveMailbox(mb);
            };
            list.appendChild(card);
        });
    },

    setActiveMailbox(mb) {
        state.activeMailbox = mb;
        this.renderMailboxes();
        this.fetchMessages();
        this.resetTimer();
    },

    async fetchMessages() {
        if (!state.activeMailbox) return;
        try {
            const data = await this.request('/messages');
            state.messages = data['hydra:member'];
            this.renderMessages();
        } catch (err) {
            console.error('Failed to fetch messages', err);
        }
    },

    async openMessage(id) {
        try {
            const msg = await this.request(`/messages/${id}`);
            document.getElementById('modal-subject').textContent = msg.subject;
            document.getElementById('modal-from').textContent = msg.from.address;
            document.getElementById('modal-date').textContent = new Date(msg.createdAt).toLocaleString();

            const iframe = document.getElementById('email-iframe');
            const content = Array.isArray(msg.html) ? msg.html.join('') : (msg.html || msg.text);
            iframe.srcdoc = content;

            const attachmentsContainer = document.getElementById('attachments-container');
            attachmentsContainer.innerHTML = '';
            if (msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(att => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-secondary small';
                    btn.innerHTML = `<i class="fas fa-paperclip"></i> ${att.filename}`;
                    btn.onclick = () => this.downloadAttachment(id, att);
                    attachmentsContainer.appendChild(btn);
                });
            }

            document.getElementById('email-modal').classList.remove('hidden');
        } catch (err) {
            this.showToast('Failed to load message', 'error');
        }
    },

    async downloadAttachment(msgId, att) {
        try {
            const response = await fetch(`https://api.mail.tm/messages/${msgId}/attachments/${att.id}`, {
                headers: { 'Authorization': `Bearer ${state.activeMailbox.token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = att.filename;
            a.click();
        } catch (err) {
            this.showToast('Failed to download attachment', 'error');
        }
    },

    renderMessages() {
        const list = document.getElementById('messages-list');
        const empty = document.getElementById('empty-inbox-msg');
        if (!list) return;

        list.innerHTML = '';
        if (state.messages.length === 0) {
            empty.classList.remove('hidden');
        } else {
            empty.classList.add('hidden');
            state.messages.forEach(msg => {
                const item = document.createElement('div');
                item.className = 'message-item card';
                item.style.padding = '1rem';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between">
                        <strong>${msg.from.address}</strong>
                        <span class="text-muted small">${new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div style="margin-top:0.5rem">${msg.subject}</div>
                `;
                item.onclick = () => this.openMessage(msg.id);
                list.appendChild(item);
            });
        }
    },

    startPolling() {
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.refreshTimer = 10;
        this.updateTimerUI();

        state.timerInterval = setInterval(() => {
            state.refreshTimer--;
            if (state.refreshTimer <= 0) {
                this.fetchMessages();
                state.refreshTimer = 10;
            }
            this.updateTimerUI();
        }, 1000);
    },

    resetTimer() {
        state.refreshTimer = 10;
        this.updateTimerUI();
    },

    updateTimerUI() {
        const timer = document.getElementById('timer-count');
        const bar = document.getElementById('refresh-progress');
        if (timer) timer.textContent = state.refreshTimer;
        if (bar) {
            const progress = ((10 - state.refreshTimer) / 10) * 100;
            document.documentElement.style.setProperty('--progress-width', `${progress}%`);
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!', 'success');
        });
    },

    deleteMailbox(address) {
        state.mailboxes = state.mailboxes.filter(m => m.address !== address);
        if (state.activeMailbox?.address === address) {
            state.activeMailbox = state.mailboxes[0] || null;
        }
        this.saveMailboxes();
        this.renderMailboxes();
        this.fetchMessages();
    },

    showQR(address) {
        const modal = document.getElementById('qr-modal');
        const img = document.getElementById('qr-image');
        const addr = document.getElementById('qr-address');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;
        addr.textContent = address;
        modal.classList.remove('hidden');
    },

    loadMailboxes() {
        if (state.mailboxes.length > 0) {
            state.activeMailbox = state.mailboxes[0];
            this.renderMailboxes();
            this.fetchMessages();
            this.startPolling();
        }
    }
};

window.App = App;
window.onload = () => {
    App.init();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker Registered'));
    }
};
