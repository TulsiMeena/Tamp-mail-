const App = {
    state: {
        mailboxes: JSON.parse(localStorage.getItem('mailboxes')) || [],
        lang: localStorage.getItem('lang') || 'en',
        theme: localStorage.getItem('theme') || 'dark',
        accent: localStorage.getItem('mail_accent') || '#6c5ce7',
        refreshTimer: 10,
        timerInterval: null,
        domains: [],
        activeSection: 'home'
    },

    translations: {
        en: {
            'nav-home': 'Home', 'nav-inbox': 'Inbox', 'nav-glossary': 'Glossary', 'nav-about': 'About',
            'hero-title': 'Secure. Anonymous. Disposable.',
            'hero-subtitle': 'Get a temporary email address in seconds and keep your real inbox clean from spam.',
            'btn-start': 'Get Started',
            'what-is-title': 'What is Temp Mail?',
            'what-is-text': 'Temporary email is a service that provides you with a short-lived email address for receiving messages.',
            'f1-title': 'Instant Setup', 'f1-text': 'No registration required. Just one click to generate your address.',
            'f2-title': 'Privacy First', 'f2-text': 'Your identity is protected. We don\'t log any personal information.',
            'f3-title': 'Spam Protection', 'f3-text': 'Say goodbye to unwanted marketing emails and newsletters.',
            'how-it-works-title': 'How It Works',
            's1': 'Generate a random email address.', 's2': 'Use it for any online service.', 's3': 'Read incoming emails right here.',
            'use-cases-title': 'Use Cases',
            'uc1': 'Testing software and apps.', 'uc2': 'Signing up for free trials.', 'uc3': 'Downloading gated content.',
            'reviews-title': 'User Reviews & Feedback',
            'inbox-title': 'Your Mailboxes', 'btn-add-text': 'Add Mailbox', 'btn-refresh-text': 'Refresh Now',
            'refresh-status': 'Auto-refreshing in {s}s...',
            'glos-title': 'Privacy Glossary', 'faq-title': 'Frequently Asked Questions',
            'about-title': 'About Tamp Mail', 'about-text': 'Tamp Mail was created to solve the growing problem of inbox clutter.',
            'skills-title': 'Developer Skills',
            'skill1': 'Frontend Architecture', 'skill2': 'API Integration', 'skill3': 'PWA Development',
            'help-title': 'User Guide',
            'btn-print-text': 'Print', 'btn-share-text': 'Share Address',
            'copied': 'Copied to clipboard!',
            'mailbox-created': 'Mailbox created successfully!',
            'error-fetch': 'Error fetching domains or creating account.'
        },
        hi: {
            'nav-home': 'होम', 'nav-inbox': 'इनबॉक्स', 'nav-glossary': 'शब्दावली', 'nav-about': 'हमारे बारे में',
            'hero-title': 'सुरक्षित। गुमनाम। डिस्पोजेबल।',
            'hero-subtitle': 'सेकंडों में एक अस्थायी ईमेल पता प्राप्त करें और अपने वास्तविक इनबॉक्स को स्पैम से मुक्त रखें।',
            'btn-start': 'शुरू करें',
            'what-is-title': 'अस्थायी मेल क्या है?',
            'what-is-text': 'अस्थायी ईमेल एक सेवा है जो आपको संदेश प्राप्त करने के लिए अल्पकालिक ईमेल पता प्रदान करती है।',
            'f1-title': 'त्वरित सेटअप', 'f1-text': 'किसी पंजीकरण की आवश्यकता नहीं है। अपना पता जनरेट करने के लिए बस एक क्लिक करें।',
            'f2-title': 'गोपनीयता पहले', 'f2-text': 'आपकी पहचान सुरक्षित है। हम कोई व्यक्तिगत जानकारी लॉग नहीं करते हैं।',
            'f3-title': 'स्पैम सुरक्षा', 'f3-text': 'अवांछित मार्केटिंग ईमेल और न्यूज़लेटर्स को अलविदा कहें।',
            'how-it-works-title': 'यह कैसे काम करता है',
            's1': 'एक यादृच्छिक ईमेल पता जनरेट करें।', 's2': 'किसी भी ऑनलाइन सेवा के लिए इसका उपयोग करें।', 's3': 'आने वाले ईमेल यहीं पढ़ें।',
            'use-cases-title': 'उपयोग के मामले',
            'uc1': 'सॉफ्टवेयर और ऐप्स का परीक्षण।', 'uc2': 'नि: शुल्क परीक्षणों के लिए साइन अप करना।', 'uc3': 'गेटेड सामग्री डाउनलोड करना।',
            'reviews-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
            'inbox-title': 'आपके मेलबॉक्स', 'btn-add-text': 'मेलबॉक्स जोड़ें', 'btn-refresh-text': 'अभी रिफ्रेश करें',
            'refresh-status': '{s}s में स्वतः रिफ्रेश हो रहा है...',
            'glos-title': 'गोपनीयता शब्दावली', 'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
            'about-title': 'टेम्प मेल के बारे में', 'about-text': 'टेम्प मेल इनबॉक्स की अव्यवस्था की बढ़ती समस्या को हल करने के लिए बनाया गया था।',
            'skills-title': 'डेवलपर कौशल',
            'skill1': 'फ्रंटेंड आर्किटेक्चर', 'skill2': 'API एकीकरण', 'skill3': 'PWA विकास',
            'help-title': 'उपयोगकर्ता मार्गदर्शिका',
            'btn-print-text': 'प्रिंट', 'btn-share-text': 'पता साझा करें',
            'copied': 'क्लिपबोर्ड पर कॉपी किया गया!',
            'mailbox-created': 'मेलबॉक्स सफलतापूर्वक बनाया गया!',
            'error-fetch': 'डोमेन लाने या खाता बनाने में त्रुटि।'
        }
    },

    async init() {
        this.applyTheme();
        this.applyAccent();
        this.applyLanguage();
        this.setupEventListeners();
        this.updateProgressBar();
        this.startTimer();
        this.renderMailboxes();
        this.renderReviews();
        this.renderGlossary();
        this.renderFAQ();
        this.registerServiceWorker();

        try {
            await this.fetchDomains();
        } catch (e) {
            this.showToast('error-fetch', 'error');
        }

        window.App = this;
    },

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.dataset.section);
            });
        });

        document.getElementById('btn-start').addEventListener('click', () => this.switchSection('inbox'));

        // Controls
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        document.querySelectorAll('.accent-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setAccent(btn.dataset.color));
        });

        // Inbox Actions
        document.getElementById('btn-add-mail').addEventListener('click', () => this.createMailbox());
        document.getElementById('refresh-now-btn').addEventListener('click', () => this.refreshAllInboxes());

        // Modals
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden'));
        });

        document.getElementById('btn-print').addEventListener('click', () => {
            const iframe = document.getElementById('email-body-iframe');
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        });

        document.getElementById('btn-share').addEventListener('click', () => this.shareEmailAddress());

        // Global Error Handling
        window.onerror = (msg, url, line) => {
            console.error(`Error: ${msg} at ${url}:${line}`);
            this.showToast('An unexpected error occurred.', 'error');
        };
    },

    async request(path, options = {}) {
        const baseUrl = 'https://api.mail.tm';
        const response = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API Request Failed');
        }
        return response.status === 204 ? null : response.json();
    },

    async fetchDomains() {
        const data = await this.request('/domains');
        this.state.domains = data['hydra:member'].map(d => d.domain);
        if (this.state.domains.length === 0) this.state.domains = ['tempmail.com'];
    },

    async createMailbox() {
        if (this.state.domains.length === 0) await this.fetchDomains();

        const domain = this.state.domains[Math.floor(Math.random() * this.state.domains.length)];
        const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        try {
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
                messages: [],
                note: ''
            };

            this.state.mailboxes.push(newMailbox);
            this.saveMailboxes();
            this.renderMailboxes();
            this.showToast('mailbox-created', 'success');
        } catch (e) {
            this.showToast(e.message, 'error');
        }
    },

    async fetchMessages(mailbox) {
        try {
            const data = await this.request('/messages', {
                headers: { 'Authorization': `Bearer ${mailbox.token}` }
            });
            mailbox.messages = data['hydra:member'];
            this.saveMailboxes();
            this.renderMailboxes();
        } catch (e) {
            console.error('Fetch error for', mailbox.address, e);
        }
    },

    async viewMessage(msgId, mailboxIndex) {
        const mailbox = this.state.mailboxes[mailboxIndex];
        try {
            const msg = await this.request(`/messages/${msgId}`, {
                headers: { 'Authorization': `Bearer ${mailbox.token}` }
            });

            const modal = document.getElementById('email-detail-modal');
            document.getElementById('email-subject-modal').textContent = msg.subject;
            document.getElementById('email-from-modal').textContent = msg.from.address;
            document.getElementById('email-date-modal').textContent = new Date(msg.createdAt).toLocaleString();

            const iframe = document.getElementById('email-body-iframe');
            const htmlContent = Array.isArray(msg.html) ? msg.html.join('') : (msg.html || msg.text || '');
            iframe.srcdoc = htmlContent;

            // Attachments
            const attContainer = document.getElementById('attachments-container');
            attContainer.innerHTML = '';
            if (msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(att => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-secondary';
                    btn.innerHTML = `<i class="fas fa-paperclip"></i> ${att.filename}`;
                    btn.onclick = () => this.downloadAttachment(msgId, att, mailbox.token);
                    attContainer.appendChild(btn);
                });
            }

            modal.classList.remove('hidden');
        } catch (e) {
            this.showToast(e.message, 'error');
        }
    },

    async downloadAttachment(msgId, att, token) {
        try {
            const response = await fetch(`https://api.mail.tm/messages/${msgId}/attachments/${att.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = att.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            this.showToast('Download failed', 'error');
        }
    },

    deleteMailbox(index) {
        this.state.mailboxes.splice(index, 1);
        this.saveMailboxes();
        this.renderMailboxes();
    },

    updateNote(index, note) {
        this.state.mailboxes[index].note = note;
        this.saveMailboxes();
    },

    refreshAllInboxes() {
        this.state.mailboxes.forEach(m => this.fetchMessages(m));
        this.state.refreshTimer = 10;
        this.updateProgressBar();
    },

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.state.refreshTimer--;
            if (this.state.refreshTimer <= 0) {
                this.refreshAllInboxes();
            }
            this.updateProgressBar();
        }, 1000);
    },

    updateProgressBar() {
        const progress = ((10 - this.state.refreshTimer) / 10) * 100;
        document.documentElement.style.setProperty('--progress-width', `${progress}%`);
        const statusText = this.translations[this.state.lang]['refresh-status'].replace('{s}', this.state.refreshTimer);
        document.getElementById('refresh-status').textContent = statusText;
    },

    renderMailboxes() {
        const container = document.getElementById('mailbox-list');
        container.innerHTML = '';

        this.state.mailboxes.forEach((m, idx) => {
            const card = document.createElement('div');
            card.className = 'mailbox-card';
            card.innerHTML = `
                <div class="mailbox-addr">
                    <span class="email-txt" title="${m.address}">${m.address}</span>
                    <div class="mailbox-actions">
                        <button class="btn-icon" onclick="App.copyToClipboard('${m.address}')"><i class="fas fa-copy"></i></button>
                        <button class="btn-icon" onclick="App.showQR('${m.address}')"><i class="fas fa-qrcode"></i></button>
                        <button class="btn-icon" onclick="App.deleteMailbox(${idx})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <input type="text" class="mailbox-note" placeholder="Add a note..." value="${m.note || ''}" onchange="App.updateNote(${idx}, this.value)">
                <div class="email-list">
                    ${m.messages.length === 0 ? '<p style="text-align:center; padding:1rem; opacity:0.5;">No messages yet.</p>' : ''}
                    ${m.messages.map(msg => `
                        <div class="email-item" onclick="App.viewMessage('${msg.id}', ${idx})">
                            <div class="subject">${msg.subject || '(No Subject)'}</div>
                            <div class="from">${msg.from.address}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(card);
        });
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('copied', 'success');
        });
    },

    showQR(text) {
        const modal = document.getElementById('qr-modal');
        const img = document.getElementById('qr-code-img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        document.getElementById('qr-email-text').textContent = text;
        modal.classList.remove('hidden');
    },

    shareEmailAddress() {
        const email = document.getElementById('qr-email-text').textContent || (this.state.mailboxes[0]?.address);
        if (navigator.share) {
            navigator.share({ title: 'My Temp Mail', text: email });
        } else {
            this.copyToClipboard(email);
        }
    },

    switchSection(sectionId) {
        this.state.activeSection = sectionId;
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`${sectionId}-section`).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.getElementById(`nav-${sectionId}`).classList.add('active');

        document.getElementById('nav-links').classList.remove('active');
        window.scrollTo(0, 0);
    },

    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.state.theme);
        this.applyTheme();
    },

    applyTheme() {
        document.body.setAttribute('data-theme', this.state.theme);
    },

    toggleLanguage() {
        this.state.lang = this.state.lang === 'en' ? 'hi' : 'en';
        localStorage.setItem('lang', this.state.lang);
        this.applyLanguage();
        this.renderReviews();
        this.renderGlossary();
        this.renderFAQ();
        this.updateProgressBar();
    },

    applyLanguage() {
        document.documentElement.lang = this.state.lang;
        const dict = this.translations[this.state.lang];
        for (const [id, text] of Object.entries(dict)) {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SPAN' || el.classList.contains('nav-link') || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'LI') {
                    el.textContent = text;
                } else if (el.tagName === 'BUTTON' && el.querySelector('span')) {
                    el.querySelector('span').textContent = text;
                } else if (el.tagName === 'BUTTON') {
                    el.textContent = text;
                }
            }
        }
    },

    setAccent(color) {
        this.state.accent = color;
        localStorage.setItem('mail_accent', color);
        this.applyAccent();
    },

    applyAccent() {
        document.documentElement.style.setProperty('--primary', this.state.accent);
    },

    showToast(key, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = this.translations[this.state.lang][key] || key;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    saveMailboxes() {
        localStorage.setItem('mailboxes', JSON.stringify(this.state.mailboxes));
    },

    renderReviews() {
        const container = document.getElementById('reviews-container');
        const reviews = [
            { name: 'Rahul S.', text: this.state.lang === 'en' ? 'Best temp mail service I\'ve used!' : 'सबसे अच्छी अस्थायी मेल सेवा!' },
            { name: 'Priya K.', text: this.state.lang === 'en' ? 'Very fast and clean interface.' : 'बहुत तेज़ और साफ़ इंटरफ़ेस।' },
            { name: 'John D.', text: this.state.lang === 'en' ? 'Helped me avoid so much spam.' : 'मुझे बहुत सारे स्पैम से बचने में मदद मिली।' }
        ];
        container.innerHTML = reviews.map(r => `
            <div class="review-card">
                <p>"${r.text}"</p>
                <div class="review-user">
                    <img src="https://ui-avatars.com/api/?name=${r.name}&background=random" alt="${r.name}">
                    <span>${r.name}</span>
                </div>
            </div>
        `).join('');
    },

    renderGlossary() {
        const container = document.getElementById('glossary-container');
        const items = [
            { t: 'Disposable Email', d: 'An email address that is valid for a short period.' },
            { t: 'Encryption', d: 'The process of encoding information to keep it secure.' },
            { t: 'Spam', d: 'Unsolicited bulk messages sent via email.' }
        ];
        container.innerHTML = items.map(i => `
            <div class="glossary-item">
                <h4>${i.t}</h4>
                <p>${i.d}</p>
            </div>
        `).join('');
    },

    renderFAQ() {
        const container = document.getElementById('faq-container');
        const faqs = [
            { q: 'Is it free?', a: 'Yes, Tamp Mail is 100% free to use.' },
            { q: 'Do emails expire?', a: 'Emails are stored for a limited time on Mail.tm servers.' }
        ];
        container.innerHTML = faqs.map(f => `
            <div class="faq-item">
                <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
                    ${f.q} <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">${f.a}</div>
            </div>
        `).join('');
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').then(reg => {
                    console.log('SW registered');
                }).catch(err => {
                    console.log('SW registration failed', err);
                });
            });
        }
    }
};

window.onload = () => App.init();
