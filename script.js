const CONFIG = {
    API_URL: 'https://api.mail.tm',
    POLL_INTERVAL: 10,
    DOMAINS_FALLBACK: ['tempmail.com']
};

const translations = {
    en: {
        'brand-name': 'Tamp Mail',
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-glossary': 'Glossary',
        'nav-about': 'About',
        'nav-help': 'Help',
        'hero-title': 'Protect Your Privacy with Tamp Mail',
        'hero-subtitle': 'Generate instant disposable email addresses and keep your real inbox clean from spam.',
        'btn-get-started': 'Get Started',
        'btn-learn-more': 'Learn More',
        'f1-title': 'Instant Setup',
        'f1-desc': 'No registration required. Get a new email address in seconds.',
        'f2-title': 'Stay Secure',
        'f2-desc': 'Hide your identity and avoid tracking by using temporary aliases.',
        'f3-title': 'Auto Delete',
        'f3-desc': 'Messages are automatically deleted after a period of time.',
        'inbox-title': 'Your Mailboxes',
        'btn-add-text': 'Add Mailbox',
        'empty-inbox-msg': 'No mailboxes created yet. Click "Add Mailbox" to begin.',
        'loading-text': 'Checking for new messages...',
        'glos-title': 'Privacy Glossary',
        'g1-term': 'Disposable Email',
        'g1-def': 'A service that provides a temporary email address that expires after a certain period of time.',
        'g2-term': 'Encryption',
        'g2-def': 'The process of encoding information so that only authorized parties can access it.',
        'g3-term': 'Spam',
        'g3-def': 'Unsolicited commercial email messages sent in bulk.',
        'about-title': 'About Tamp Mail',
        'about-p1': 'Tamp Mail was created to help users regain control over their digital privacy. In an age of constant data harvesting, we believe everyone deserves a way to interact with the web without sacrificing their personal information.',
        'help-title': 'Frequently Asked Questions',
        'btn-print-text': 'Print',
        'footer-tag': 'Your privacy, our priority.',
        'toast-copy': 'Email copied to clipboard!',
        'toast-error': 'Something went wrong. Please try again.',
        'toast-mail-created': 'New mailbox created!',
        'q1': 'What is Tamp Mail?',
        'a1': 'Tamp Mail is a free service that provides temporary email addresses. You can use these addresses to sign up for websites and services without giving out your real email address.',
        'q2': 'How long do the emails last?',
        'a2': 'Emails are stored for a limited time. We recommend checking your inbox frequently if you are expecting an important message.',
        'q3': 'Is it free?',
        'a3': 'Yes, Tamp Mail is completely free to use.'
    },
    hi: {
        'brand-name': 'टैम्प मेल',
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-glossary': 'शब्दावली',
        'nav-about': 'हमारे बारे में',
        'nav-help': 'सहायता',
        'hero-title': 'टैम्प मेल के साथ अपनी गोपनीयता की रक्षा करें',
        'hero-subtitle': 'तुरंत डिस्पोजेबल ईमेल पते उत्पन्न करें और अपने असली इनबॉक्स को स्पैम से मुक्त रखें।',
        'btn-get-started': 'शुरू करें',
        'btn-learn-more': 'और जानें',
        'f1-title': 'त्वरित सेटअप',
        'f1-desc': 'किसी पंजीकरण की आवश्यकता नहीं है। सेकंड में एक नया ईमेल पता प्राप्त करें।',
        'f2-title': 'सुरक्षित रहें',
        'f2-desc': 'अस्थायी उपनामों का उपयोग करके अपनी पहचान छुपाएं और ट्रैकिंग से बचें।',
        'f3-title': 'ऑटो डिलीट',
        'f3-desc': 'संदेश एक निश्चित समय के बाद स्वचालित रूप से हटा दिए जाते हैं।',
        'inbox-title': 'आपके मेलबॉक्स',
        'btn-add-text': 'मेलबॉक्स जोड़ें',
        'empty-inbox-msg': 'अभी तक कोई मेलबॉक्स नहीं बनाया गया है। शुरू करने के लिए "मेलबॉक्स जोड़ें" पर क्लिक करें।',
        'loading-text': 'नए संदेशों की जाँच हो रही है...',
        'glos-title': 'गोपनीयता शब्दावली',
        'g1-term': 'डिस्पोजेबल ईमेल',
        'g1-def': 'एक सेवा जो एक अस्थायी ईमेल पता प्रदान करती है जो एक निश्चित अवधि के बाद समाप्त हो जाती है।',
        'g2-term': 'एन्क्रिप्शन',
        'g2-def': 'जानकारी को एन्कोड करने की प्रक्रिया ताकि केवल अधिकृत पक्ष ही उस तक पहुंच सकें।',
        'g3-term': 'स्पैम',
        'g3-def': 'थोक में भेजे गए अवांछित व्यावसायिक ईमेल संदेश।',
        'about-title': 'टैम्प मेल के बारे में',
        'about-p1': 'टैम्प मेल उपयोगकर्ताओं को उनकी डिजिटल गोपनीयता पर फिर से नियंत्रण पाने में मदद करने के लिए बनाया गया था। डेटा संचयन के युग में, हमारा मानना है कि हर कोई अपनी व्यक्तिगत जानकारी का त्याग किए बिना वेब के साथ बातचीत करने का हकदार है।',
        'help-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'btn-print-text': 'प्रिंट',
        'footer-tag': 'आपकी गोपनीयता, हमारी प्राथमिकता।',
        'toast-copy': 'ईमेल क्लिपबोर्ड पर कॉपी किया गया!',
        'toast-error': 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।',
        'toast-mail-created': 'नया मेलबॉक्स बनाया गया!',
        'q1': 'टैम्प मेल क्या है?',
        'a1': 'टैम्प मेल एक मुफ्त सेवा है जो अस्थायी ईमेल पते प्रदान करती है। आप अपना असली ईमेल पता दिए बिना वेबसाइटों और सेवाओं के लिए साइन अप करने के लिए इन पतों का उपयोग कर सकते हैं।',
        'q2': 'ईमेल कितने समय तक चलते हैं?',
        'a2': 'ईमेल एक सीमित समय के लिए संग्रहीत किए जाते हैं। यदि आप किसी महत्वपूर्ण संदेश की प्रतीक्षा कर रहे हैं तो हम आपके इनबॉक्स को बार-बार जाँचने की सलाह देते हैं।',
        'q3': 'क्या यह मुफ़्त है?',
        'a3': 'हाँ, टैम्प मेल उपयोग करने के लिए पूरी तरह से मुफ़्त है।'
    }
};

const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || 'blue',
    mailboxes: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeMailbox: null,
    messages: [],
    timer: CONFIG.POLL_INTERVAL,
    timerId: null
};

const App = {
    async init() {
        this.applyLanguage();
        this.applyAccent(state.accent);
        this.bindEvents();
        this.renderMailboxes();
        this.renderFAQ();

        if (state.mailboxes.length > 0) {
            this.switchMailbox(state.mailboxes[0].address);
        }

        if ('serviceWorker' in navigator) {
            window.onload = () => navigator.serviceWorker.register('./sw.js');
        }

        window.App = this; // Expose to global for testing
    },

    bindEvents() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            };
        });

        document.getElementById('btn-get-started').onclick = () => this.showSection('inbox');
        document.getElementById('btn-learn-more').onclick = () => this.showSection('about');
        document.getElementById('btn-add-mail').onclick = () => this.createMailbox();
        document.getElementById('lang-toggle').onclick = () => this.toggleLanguage();
        document.getElementById('menu-toggle').onclick = () => document.getElementById('nav-links').classList.toggle('active');

        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.onclick = () => this.applyAccent(dot.dataset.color);
        });

        document.getElementById('copy-mail').onclick = () => this.copyToClipboard(state.activeMailbox.address);
        document.getElementById('qr-mail').onclick = () => this.showQR();
        document.getElementById('share-mail').onclick = () => this.shareEmail();
        document.getElementById('refresh-now-btn').onclick = () => this.refreshInbox();

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.onclick = () => btn.closest('.modal').classList.add('hidden');
        });

        document.getElementById('btn-print').onclick = () => {
            const frame = document.getElementById('email-body-frame');
            frame.contentWindow.focus();
            frame.contentWindow.print();
        };

        // Close mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('nav-links').classList.remove('active');
            });
        });
    },

    showSection(id) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === id);
        });
    },

    async request(path, options = {}) {
        try {
            const res = await fetch(`${CONFIG.API_URL}${path}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'API Error');
            return data;
        } catch (err) {
            this.toast(err.message, 'error');
            throw err;
        }
    },

    async createMailbox() {
        try {
            this.toast(state.lang === 'en' ? 'Creating...' : 'बनाया जा रहा है...', 'info');
            const domains = await this.request('/domains');
            const domain = domains['hydra:member'][0].domain;
            const user = Math.random().toString(36).substring(2, 10);
            const pass = Math.random().toString(36).substring(2, 12);
            const address = `${user}@${domain}`;

            const account = await this.request('/accounts', {
                method: 'POST',
                body: JSON.stringify({ address, password: pass })
            });

            const tokenData = await this.request('/token', {
                method: 'POST',
                body: JSON.stringify({ address, password: pass })
            });

            const newMailbox = { address, token: tokenData.token, id: account.id };
            state.mailboxes.push(newMailbox);
            localStorage.setItem('mail_accounts', JSON.stringify(state.mailboxes));

            this.renderMailboxes();
            this.switchMailbox(address);
            this.toast(translations[state.lang]['toast-mail-created'], 'success');
        } catch (err) {
            console.error(err);
        }
    },

    renderMailboxes() {
        const list = document.getElementById('mailbox-list');
        const emptyMsg = document.getElementById('empty-inbox-msg');

        if (state.mailboxes.length === 0) {
            emptyMsg.classList.remove('hidden');
            list.querySelectorAll('.mailbox-card').forEach(c => c.remove());
            return;
        }

        emptyMsg.classList.add('hidden');
        list.innerHTML = '';
        state.mailboxes.forEach(m => {
            const card = document.createElement('div');
            card.className = `mailbox-card ${state.activeMailbox?.address === m.address ? 'active' : ''}`;
            card.innerHTML = `
                <span class="mail-addr">${m.address}</span>
                <button class="del-mail btn-icon" data-addr="${m.address}"><i class="fas fa-trash"></i></button>
            `;
            card.onclick = (e) => {
                if (e.target.closest('.del-mail')) {
                    this.deleteMailbox(m.address);
                } else {
                    this.switchMailbox(m.address);
                }
            };
            list.appendChild(card);
        });
    },

    switchMailbox(address) {
        state.activeMailbox = state.mailboxes.find(m => m.address === address);
        document.getElementById('display-email').textContent = address;
        document.getElementById('active-inbox').classList.remove('hidden');
        this.renderMailboxes();
        this.refreshInbox();
        this.startTimer();
    },

    deleteMailbox(address) {
        state.mailboxes = state.mailboxes.filter(m => m.address !== address);
        localStorage.setItem('mail_accounts', JSON.stringify(state.mailboxes));
        if (state.activeMailbox?.address === address) {
            state.activeMailbox = state.mailboxes[0] || null;
            if (!state.activeMailbox) {
                document.getElementById('active-inbox').classList.add('hidden');
                clearInterval(state.timerId);
            } else {
                this.switchMailbox(state.activeMailbox.address);
            }
        }
        this.renderMailboxes();
    },

    async refreshInbox() {
        if (!state.activeMailbox) return;
        try {
            const data = await this.request('/messages', {
                headers: { 'Authorization': `Bearer ${state.activeMailbox.token}` }
            });
            state.messages = data['hydra:member'];
            this.renderMessages();
            this.resetTimer();
        } catch (err) {
            console.error(err);
        }
    },

    renderMessages() {
        const container = document.getElementById('messages-list');
        if (state.messages.length === 0) {
            container.innerHTML = `<div class="loading-messages"><p>${translations[state.lang]['loading-text']}</p></div>`;
            return;
        }

        container.innerHTML = '';
        state.messages.forEach(msg => {
            const item = document.createElement('div');
            item.className = 'msg-item';
            item.innerHTML = `
                <div class="msg-from">${msg.from.name || msg.from.address}</div>
                <div class="msg-subject">${msg.subject}</div>
                <div class="msg-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
            `;
            item.onclick = () => this.showEmailDetail(msg.id);
            container.appendChild(item);
        });
    },

    async showEmailDetail(msgId) {
        try {
            const msg = await this.request(`/messages/${msgId}`, {
                headers: { 'Authorization': `Bearer ${state.activeMailbox.token}` }
            });

            document.getElementById('msg-subject').textContent = msg.subject;
            document.getElementById('msg-from').textContent = `From: ${msg.from.name || msg.from.address}`;
            document.getElementById('msg-date').textContent = new Date(msg.createdAt).toLocaleString();

            const frame = document.getElementById('email-body-frame');
            const content = Array.isArray(msg.html) ? msg.html.join('') : (msg.html || msg.text || '');
            frame.srcdoc = content;

            const attachmentsArea = document.getElementById('attachments-area');
            attachmentsArea.innerHTML = '';
            if (msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(att => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-secondary';
                    btn.style.margin = '0.5rem 0.5rem 0 0';
                    btn.innerHTML = `<i class="fas fa-paperclip"></i> ${att.filename}`;
                    btn.onclick = () => this.downloadAttachment(msgId, att);
                    attachmentsArea.appendChild(btn);
                });
            }

            document.getElementById('email-detail-modal').classList.remove('hidden');
        } catch (err) {
            console.error(err);
        }
    },

    async downloadAttachment(msgId, att) {
        try {
            const res = await fetch(`${CONFIG.API_URL}/messages/${msgId}/attachments/${att.id}`, {
                headers: { 'Authorization': `Bearer ${state.activeMailbox.token}` }
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = att.filename;
            a.click();
        } catch (err) {
            this.toast('Download failed', 'error');
        }
    },

    startTimer() {
        if (state.timerId) clearInterval(state.timerId);
        state.timer = CONFIG.POLL_INTERVAL;
        this.updateProgressBar();
        state.timerId = setInterval(() => {
            state.timer--;
            if (state.timer <= 0) {
                this.refreshInbox();
            }
            this.updateProgressBar();
        }, 1000);
    },

    resetTimer() {
        state.timer = CONFIG.POLL_INTERVAL;
        this.updateProgressBar();
    },

    updateProgressBar() {
        const percent = ((CONFIG.POLL_INTERVAL - state.timer) / CONFIG.POLL_INTERVAL) * 100;
        document.documentElement.style.setProperty('--progress-width', `${percent}%`);
        document.getElementById('refresh-timer').textContent = `${state.timer}s`;
    },

    toggleLanguage() {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', state.lang);
        this.applyLanguage();
        this.renderFAQ();
        this.renderMessages(); // Re-render for loading text
    },

    applyLanguage() {
        const dict = translations[state.lang];
        document.getElementById('lang-toggle').textContent = state.lang === 'en' ? 'HI' : 'EN';
        document.documentElement.lang = state.lang;

        for (let key in dict) {
            const el = document.getElementById(key);
            if (el) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = dict[key];
                } else if (el.id === 'btn-add-text' || el.id === 'btn-print-text') {
                   // Keep icon, only update text
                   el.textContent = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        }
    },

    applyAccent(color) {
        state.accent = color;
        localStorage.setItem('mail_accent', color);
        const colors = {
            blue: '#3498db',
            green: '#2ecc71',
            red: '#e74c3c',
            pink: '#e91e63'
        };
        document.documentElement.style.setProperty('--primary', colors[color]);
        document.documentElement.style.setProperty('--primary-hover', this.shadeColor(colors[color], -20));

        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.color === color);
        });
    },

    shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);
        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);
        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;
        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));
        return "#" + RR + GG + BB;
    },

    renderFAQ() {
        const container = document.getElementById('faq-container');
        const dict = translations[state.lang];
        const faqs = [
            { q: dict['q1'], a: dict['a1'] },
            { q: dict['q2'], a: dict['a2'] },
            { q: dict['q3'], a: dict['a3'] }
        ];

        container.innerHTML = '';
        faqs.forEach((faq, i) => {
            const item = document.createElement('div');
            item.className = 'faq-item';
            item.style.marginBottom = '1.5rem';
            item.innerHTML = `
                <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${faq.q}</h4>
                <p style="color: var(--text-muted);">${faq.a}</p>
            `;
            container.appendChild(item);
        });
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.toast(translations[state.lang]['toast-copy'], 'success');
        });
    },

    showQR() {
        const email = state.activeMailbox.address;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}`;
        document.getElementById('qr-code-img').src = qrUrl;
        document.getElementById('qr-email-text').textContent = email;
        document.getElementById('qr-modal').classList.remove('hidden');
    },

    shareEmail() {
        const email = state.activeMailbox.address;
        if (navigator.share) {
            navigator.share({ text: email });
        } else {
            this.copyToClipboard(email);
        }
    },

    toast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

App.init();
