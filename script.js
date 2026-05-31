const CONFIG = {
    API_BASE: 'https://api.mail.tm',
    POLL_INTERVAL: 10000,
    DOMAINS_FALLBACK: ['tempmail.com']
};

const state = {
    mailboxes: JSON.parse(localStorage.getItem('mail_boxes') || '[]'),
    currentMailboxId: null,
    domains: [],
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || 'blue',
    timer: 10,
    pollActive: false
};

const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About Us',
        'nav-faq': 'FAQ',
        'nav-privacy': 'Privacy',
        'hero-title': 'Your Secure Disposable Email Service',
        'hero-subtitle': 'Generate multiple temporary email addresses instantly. Keep your real inbox clean and safe from spam.',
        'get-started-text': 'Get Started Now',
        'f1-title': 'Instant Setup',
        'f1-desc': 'No registration required. Get a random email address the moment you visit our site.',
        'f2-title': 'Privacy First',
        'f2-desc': "We don't track you. Your temporary mailboxes are private and secure.",
        'f3-title': 'Multi-Mailbox',
        'f3-desc': 'Manage multiple email addresses at once. Perfect for complex testing and signups.',
        'hiw-title': 'How It Works',
        's1': 'Click "Get Started" to enter your inbox.',
        's2': 'Copy your temporary email address.',
        's3': 'Receive emails instantly in real-time.',
        'reviews-title': 'User Reviews & Feedback',
        'inbox-title': 'Manage Your Mailboxes',
        'add-mail-text': 'New Mailbox',
        'refresh-text': 'Refreshing in ',
        'refresh-now-btn': 'Refresh Now',
        'current-mail-label': 'Select a mailbox to view emails',
        'empty-msg': 'No messages yet. Waiting for incoming mail...',
        'about-title': 'About Tamp Mail',
        'about-p1': 'Tamp Mail is a cutting-edge disposable email service designed for privacy-conscious users and developers.',
        'role-admin': 'Lead Developer',
        'role-support': 'Community Manager',
        'dev-skills-title': 'Developer Skills',
        'skill1': 'High-performance API integration',
        'skill2': 'Modern SPA Architecture',
        'skill3': 'Secure Data Handling',
        'faq-title': 'Frequently Asked Questions',
        'q1': 'Is this service free?',
        'a1': 'Yes, Tamp Mail is completely free to use for everyone.',
        'glos-title': 'Privacy Glossary',
        'term1': 'Disposable Email',
        'def1': 'A temporary address that expires after a set period.',
        'term2': 'Encryption',
        'def2': 'Securing data so only authorized parties can read it.',
        'term3': 'Anti-Spam',
        'def3': 'Techniques used to prevent unsolicited bulk messages.',
        'btn-print-text': 'Print',
        'qr-title': 'Scan QR Code',
        'help-title': 'How to use Tamp Mail'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-faq': 'सवाल-जवाब',
        'nav-privacy': 'प्राइवेसी',
        'hero-title': 'आपकी सुरक्षित डिस्पोजेबल ईमेल सेवा',
        'hero-subtitle': 'तुरंत कई अस्थायी ईमेल पते बनाएं। अपने असली इनबॉक्स को स्पैम से सुरक्षित रखें।',
        'get-started-text': 'अभी शुरू करें',
        'f1-title': 'तुरंत सेटअप',
        'f1-desc': 'कोई पंजीकरण आवश्यक नहीं है। हमारी साइट पर आते ही एक रैंडम ईमेल पता प्राप्त करें।',
        'f2-title': 'प्राइवेसी पहले',
        'f2-desc': 'हम आपको ट्रैक नहीं करते हैं। आपके अस्थायी मेलबॉक्स निजी और सुरक्षित हैं।',
        'f3-title': 'मल्टी-मेलबॉक्स',
        'f3-desc': 'एक साथ कई ईमेल पते प्रबंधित करें। जटिल परीक्षण और साइनअप के लिए बिल्कुल सही।',
        'hiw-title': 'यह कैसे काम करता है',
        's1': 'अपने इनबॉक्स में प्रवेश करने के लिए "अभी शुरू करें" पर क्लिक करें।',
        's2': 'अपना अस्थायी ईमेल पता कॉपी करें।',
        's3': 'वास्तविक समय में तुरंत ईमेल प्राप्त करें।',
        'reviews-title': 'उपयोगकर्ता समीक्षाएं',
        'inbox-title': 'अपने मेलबॉक्स प्रबंधित करें',
        'add-mail-text': 'नया मेलबॉक्स',
        'refresh-text': 'रिफ्रेश हो रहा है ',
        'refresh-now-btn': 'अभी रिफ्रेश करें',
        'current-mail-label': 'ईमेल देखने के लिए एक मेलबॉक्स चुनें',
        'empty-msg': 'अभी तक कोई संदेश नहीं। आने वाली मेल की प्रतीक्षा है...',
        'about-title': 'Tamp Mail के बारे में',
        'about-p1': 'Tamp Mail एक आधुनिक डिस्पोजेबल ईमेल सेवा है जिसे प्राइवेसी के प्रति जागरूक उपयोगकर्ताओं और डेवलपर्स के लिए डिज़ाइन किया गया है।',
        'role-admin': 'लीड डेवलपर',
        'role-support': 'कम्युनिटी मैनेजर',
        'dev-skills-title': 'डेवलपर कौशल',
        'skill1': 'उच्च प्रदर्शन एपीआई एकीकरण',
        'skill2': 'आधुनिक SPA आर्किटेक्चर',
        'skill3': 'सुरक्षित डेटा हैंडलिंग',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'q1': 'क्या यह सेवा मुफ्त है?',
        'a1': 'हाँ, Tamp Mail सभी के लिए उपयोग करने के लिए पूरी तरह से मुफ्त है।',
        'q2': 'ईमेल कब तक चलते हैं?',
        'a2': 'ईमेल सीमित समय के लिए Mail.tm सर्वर पर संग्रहीत किए जाते हैं, आमतौर पर तब तक जब तक डोमेन समाप्त नहीं हो जाता या सेवा पुराने डेटा को हटा नहीं देती।',
        'q3': 'क्या मैं ईमेल भेज सकता हूँ?',
        'a3': 'नहीं, दुरुपयोग और स्पैम से बचाने के लिए यह केवल प्राप्त करने वाली सेवा है।',
        'glos-title': 'प्राइवेसी शब्दावली',
        'term1': 'डिस्पोजेबल ईमेल',
        'def1': 'एक अस्थायी पता जो एक निर्धारित अवधि के बाद समाप्त हो जाता है।',
        'term2': 'एन्क्रिप्शन',
        'def2': 'डेटा को सुरक्षित करना ताकि केवल अधिकृत पक्ष ही इसे पढ़ सकें।',
        'term3': 'एंटी-स्पैम',
        'def3': 'अवांछित थोक संदेशों को रोकने के लिए उपयोग की जाने वाली तकनीकें।',
        'btn-print-text': 'प्रिंट',
        'qr-title': 'QR कोड स्कैन करें',
        'help-title': 'Tamp Mail का उपयोग कैसे करें'
    }
};

const App = {
    async init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        await this.fetchDomains();

        if (state.mailboxes.length === 0) {
            await this.createNewMailbox();
        } else {
            this.renderMailboxList();
            this.selectMailbox(state.mailboxes[0].id);
        }

        this.startPolling();
    },

    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE}${endpoint}`;
        const defaultHeaders = { 'Content-Type': 'application/json' };

        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...defaultHeaders, ...options.headers }
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'API Error' }));
                throw new Error(err.message || 'Request failed');
            }

            return response.status === 204 ? null : await response.json();
        } catch (error) {
            this.showToast(error.message, 'error');
            throw error;
        }
    },

    async fetchDomains() {
        try {
            const data = await this.request('/domains');
            state.domains = data['hydra:member'].map(d => d.domain);
        } catch (error) {
            state.domains = CONFIG.DOMAINS_FALLBACK;
        }
    },

    async createNewMailbox() {
        this.showToast(state.lang === 'hi' ? 'नया मेलबॉक्स बनाया जा रहा है...' : 'Creating new mailbox...', 'info');

        const domain = state.domains[0];
        const username = Math.random().toString(36).substring(2, 12);
        const address = `${username}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        try {
            const account = await this.request('/accounts', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const tokenData = await this.request('/token', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const newMailbox = {
                id: account.id,
                address: account.address,
                token: tokenData.token,
                createdAt: new Date().toISOString()
            };

            state.mailboxes.push(newMailbox);
            this.saveState();
            this.renderMailboxList();
            this.selectMailbox(newMailbox.id);
            this.showToast(state.lang === 'hi' ? 'मेलबॉक्स तैयार है!' : 'Mailbox ready!', 'success');
        } catch (error) {
            console.error(error);
        }
    },

    saveState() {
        localStorage.setItem('mail_boxes', JSON.stringify(state.mailboxes));
        localStorage.setItem('mail_lang', state.lang);
        localStorage.setItem('mail_accent', state.accent);
    },

    renderMailboxList() {
        const list = document.getElementById('mailbox-list');
        if (!list) return;

        list.innerHTML = state.mailboxes.map(box => `
            <div class="mailbox-card ${box.id === state.currentMailboxId ? 'active' : ''}" onclick="App.selectMailbox('${box.id}')">
                <span class="email-addr">${box.address}</span>
                <div class="mailbox-actions">
                    <button class="btn-icon btn-sm" onclick="App.copyToClipboard('${box.address}', event)" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon btn-sm" onclick="App.showQR('${box.address}', event)" title="QR Code">
                        <i class="fas fa-qrcode"></i>
                    </button>
                    <button class="btn-icon btn-sm" onclick="App.deleteMailbox('${box.id}', event)" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    selectMailbox(id) {
        state.currentMailboxId = id;
        this.renderMailboxList();

        const mailbox = state.mailboxes.find(b => b.id === id);
        if (mailbox) {
            document.getElementById('current-mail-label').textContent = mailbox.address;
            this.fetchEmails(mailbox);
        }
    },

    deleteMailbox(id, event) {
        if (event) event.stopPropagation();

        state.mailboxes = state.mailboxes.filter(b => b.id !== id);
        this.saveState();

        if (state.currentMailboxId === id) {
            if (state.mailboxes.length > 0) {
                this.selectMailbox(state.mailboxes[0].id);
            } else {
                this.createNewMailbox();
            }
        } else {
            this.renderMailboxList();
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

    applyTheme() {
        document.body.setAttribute('data-accent', state.accent);
        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.color === state.accent);
        });
    },

    applyLanguage() {
        const langData = translations[state.lang];
        Object.keys(langData).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'STRONG') {
                    el.textContent = langData[key];
                } else if (el.classList.contains('nav-link')) {
                    el.textContent = langData[key];
                }
            }
        });

        document.getElementById('lang-text').textContent = state.lang === 'en' ? 'HI' : 'EN';
        document.documentElement.lang = state.lang;
        this.updateHelpContent();
    },

    updateHelpContent() {
        const helpBody = document.getElementById('help-content');
        if (!helpBody) return;

        if (state.lang === 'en') {
            helpBody.innerHTML = `
                <ul class="help-list">
                    <li><strong>Add Mailbox:</strong> Use the "New Mailbox" button to create multiple addresses.</li>
                    <li><strong>Switch:</strong> Click on any mailbox card to see its messages.</li>
                    <li><strong>Copy:</strong> Use the copy icon to quickly grab your address.</li>
                    <li><strong>Auto-Refresh:</strong> The inbox checks for new mail every 10 seconds automatically.</li>
                </ul>
            `;
        } else {
            helpBody.innerHTML = `
                <ul class="help-list">
                    <li><strong>मेलबॉक्स जोड़ें:</strong> कई पते बनाने के लिए "नया मेलबॉक्स" बटन का उपयोग करें।</li>
                    <li><strong>बदलें:</strong> इसके संदेश देखने के लिए किसी भी मेलबॉक्स कार्ड पर क्लिक करें।</li>
                    <li><strong>कॉपी:</strong> अपना पता जल्दी से कॉपी करने के लिए कॉपी आइकन का उपयोग करें।</li>
                    <li><strong>ऑटो-रिफ्रेश:</strong> इनबॉक्स हर 10 सेकंड में स्वचालित रूप से नई मेल की जांच करता है।</li>
                </ul>
            `;
        }
    },

    navigate(sectionId) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(sectionId).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === sectionId);
        });

        const navLinks = document.getElementById('nav-links');
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }

        window.scrollTo(0, 0);
    },

    setupEventListeners() {
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(link.dataset.section);
            });
        });

        document.getElementById('lang-toggle').addEventListener('click', () => {
            state.lang = state.lang === 'en' ? 'hi' : 'en';
            this.saveState();
            this.applyLanguage();
        });

        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                state.accent = dot.dataset.color;
                this.saveState();
                this.applyTheme();
            });
        });

        document.getElementById('btn-add-mail').addEventListener('click', () => this.createNewMailbox());

        document.getElementById('help-btn').addEventListener('click', () => {
            document.getElementById('help-modal').classList.remove('hidden');
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            state.timer = 0;
        });
    },

    startPolling() {
        if (state.pollActive) return;
        state.pollActive = true;

        setInterval(() => {
            if (state.timer > 0) {
                state.timer--;
            } else {
                state.timer = 10;
                const mailbox = state.mailboxes.find(b => b.id === state.currentMailboxId);
                if (mailbox) this.fetchEmails(mailbox);
            }
            this.updateProgressBar();
        }, 1000);
    },

    updateProgressBar() {
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = state.timer;

        const progress = ((10 - state.timer) / 10) * 100;
        document.documentElement.style.setProperty('--progress-width', `${progress}%`);
    },

    async fetchEmails(mailbox) {
        try {
            const data = await this.request('/messages', {
                headers: { 'Authorization': `Bearer ${mailbox.token}` }
            });
            this.renderEmailList(data['hydra:member']);
        } catch (error) {
            console.error('Failed to fetch emails', error);
        }
    },

    renderEmailList(emails) {
        const list = document.getElementById('email-list');
        if (!list) return;

        if (emails.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p id="empty-msg">${translations[state.lang]['empty-msg']}</p>
                </div>
            `;
            return;
        }

        list.innerHTML = emails.map(email => `
            <div class="email-item" onclick="App.viewEmail('${email.id}')">
                <div class="from">${email.from.name || email.from.address}</div>
                <div class="subj">${email.subject}</div>
                <div class="date">${new Date(email.createdAt).toLocaleTimeString()}</div>
            </div>
        `).join('');
    },

    async viewEmail(msgId) {
        const mailbox = state.mailboxes.find(b => b.id === state.currentMailboxId);
        try {
            const msg = await this.request(`/messages/${msgId}`, {
                headers: { 'Authorization': `Bearer ${mailbox.token}` }
            });

            document.getElementById('email-subject').textContent = msg.subject;
            document.getElementById('email-from').textContent = `${msg.from.name} <${msg.from.address}>`;
            document.getElementById('email-date').textContent = new Date(msg.createdAt).toLocaleString();

            const frame = document.getElementById('email-frame');
            let content = '';
            if (msg.html) {
                content = Array.isArray(msg.html) ? msg.html.join('') : msg.html;
            } else {
                content = `<pre style="white-space: pre-wrap; font-family: sans-serif;">${msg.text}</pre>`;
            }
            frame.srcdoc = content;

            this.renderAttachments(msg, mailbox);
            document.getElementById('email-modal').classList.remove('hidden');
        } catch (error) {
            this.showToast('Failed to load email', 'error');
        }
    },

    renderAttachments(msg, mailbox) {
        const section = document.getElementById('attachments-section');
        const list = document.getElementById('attachments-list');

        if (msg.attachments && msg.attachments.length > 0) {
            section.classList.remove('hidden');
            list.innerHTML = msg.attachments.map(att => `
                <div class="attachment-item">
                    <i class="fas fa-file"></i>
                    <span>${att.filename} (${(att.size / 1024).toFixed(1)} KB)</span>
                    <button class="btn-text" onclick="App.downloadAttachment('${msg.id}', '${att.id}', '${att.filename}')">Download</button>
                </div>
            `).join('');
        } else {
            section.classList.add('hidden');
        }
    },

    async downloadAttachment(msgId, attId, filename) {
        const mailbox = state.mailboxes.find(b => b.id === state.currentMailboxId);
        try {
            const response = await fetch(`${CONFIG.API_BASE}/messages/${msgId}/attachments/${attId}`, {
                headers: { 'Authorization': `Bearer ${mailbox.token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        } catch (error) {
            this.showToast('Download failed', 'error');
        }
    },

    copyToClipboard(text, event) {
        if (event) event.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(state.lang === 'hi' ? 'कॉपी किया गया!' : 'Copied to clipboard!', 'success');
        });
    },

    showQR(email, event) {
        if (event) event.stopPropagation();
        const qrImg = document.getElementById('qr-code-img');
        const qrEmail = document.getElementById('qr-email-text');

        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}`;
        qrEmail.textContent = email;

        document.getElementById('qr-modal').classList.remove('hidden');
    }
};

// Add print functionality
document.getElementById('btn-print').addEventListener('click', () => {
    const frame = document.getElementById('email-frame');
    frame.contentWindow.focus();
    frame.contentWindow.print();
});

window.App = App;
window.onload = () => {
    App.init();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
};
