const API_URL = 'https://api.mail.tm';

const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About',
        'nav-glossary': 'Glossary',
        'nav-faq': 'FAQ',
        'hero-title': 'Disposable Email Service',
        'hero-subtitle': 'Get a temporary email address to keep your real mailbox clean and secure.',
        'btn-add-mail': 'Create New Mailbox',
        'f1-title': 'Instant Setup',
        'f1-desc': 'No registration required. Get your email address in seconds.',
        'f2-title': 'Privacy Focused',
        'f2-desc': 'We don\'t track you. Your emails are deleted automatically.',
        'f3-title': 'Auto Refresh',
        'f3-desc': 'Stay updated with automatic inbox polling every 10 seconds.',
        'reviews-title': 'User Reviews & Feedback',
        'rev1-text': 'Best temp mail service I\'ve used. Very fast!',
        'inbox-title': 'Your Mailboxes',
        'btn-refresh-text': 'Refresh Now',
        'btn-add-another': 'Add Another',
        'back-text': 'Back',
        'about-title': 'About Tamp Mail',
        'about-desc': 'Tamp Mail provides free, secure, and disposable email addresses to protect your privacy and reduce spam in your primary inbox.',
        'skills-title': 'Our Expertise',
        'skill1': 'Secure API Integration',
        'skill2': 'Responsive UI/UX',
        'skill3': 'Real-time Data Fetching',
        'team-title': 'The Team',
        'glos-title': 'Privacy Glossary',
        'glos1-term': 'Disposable Email',
        'glos1-desc': 'A temporary email address that expires after a period of time.',
        'glos2-term': 'Encryption',
        'glos2-desc': 'Securing data by converting it into a code to prevent unauthorized access.',
        'faq-title': 'Frequently Asked Questions',
        'faq1-q': 'How long do emails stay?',
        'faq1-a': 'Emails are kept for a limited time depending on the provider, typically up to 24 hours.',
        'faq2-q': 'Can I send emails?',
        'faq2-a': 'Currently, Tamp Mail is only for receiving incoming emails.',
        'footer-rights': 'All rights reserved.',
        'accent-label': 'Accent:',
        'btn-print-text': 'Print',
        'btn-share-text': 'Share',
        'qr-title': 'Email QR Code',
        'help-title': 'User Guide'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-glossary': 'शब्दावली',
        'nav-faq': 'सवाल-जवाब',
        'hero-title': 'डिस्पोजेबल ईमेल सेवा',
        'hero-subtitle': 'अपने असली मेलबॉक्स को साफ और सुरक्षित रखने के लिए एक अस्थायी ईमेल पता प्राप्त करें।',
        'btn-add-mail': 'नया मेलबॉक्स बनाएं',
        'f1-title': 'त्वरित सेटअप',
        'f1-desc': 'कोई पंजीकरण आवश्यक नहीं है। सेकंडों में अपना ईमेल पता प्राप्त करें।',
        'f2-title': 'गोपनीयता केंद्रित',
        'f2-desc': 'हम आपको ट्रैक नहीं करते हैं। आपके ईमेल स्वचालित रूप से हटा दिए जाते हैं।',
        'f3-title': 'ऑटो रिफ्रेश',
        'f3-desc': 'हर 10 सेकंड में स्वचालित इनबॉक्स पोलिंग के साथ अपडेट रहें।',
        'reviews-title': 'उपयोगकर्ता समीक्षाएं',
        'rev1-text': 'सबसे अच्छी टेम्प मेल सेवा जो मैंने इस्तेमाल की है। बहुत तेज़!',
        'inbox-title': 'आपके मेलबॉक्स',
        'btn-refresh-text': 'अभी रिफ्रेश करें',
        'btn-add-another': 'एक और जोड़ें',
        'back-text': 'पीछे',
        'about-title': 'Tamp Mail के बारे में',
        'about-desc': 'Tamp Mail आपकी गोपनीयता की रक्षा करने और आपके प्राथमिक इनबॉक्स में स्पैम को कम करने के लिए मुफ्त, सुरक्षित और डिस्पोजेबल ईमेल पता प्रदान करता है।',
        'skills-title': 'हमारी विशेषज्ञता',
        'skill1': 'सुरक्षित API एकीकरण',
        'skill2': 'उत्तरदायी UI/UX',
        'skill3': 'रीयल-टाइम डेटा फेचिंग',
        'team-title': 'टीम',
        'glos-title': 'गोपनीयता शब्दावली',
        'glos1-term': 'डिस्पोजेबल ईमेल',
        'glos1-desc': 'एक अस्थायी ईमेल पता जो कुछ समय बाद समाप्त हो जाता है।',
        'glos2-term': 'एन्क्रिप्शन',
        'glos2-desc': 'अनधिकृत पहुंच को रोकने के लिए डेटा को कोड में बदलकर सुरक्षित करना।',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'faq1-q': 'ईमेल कितने समय तक रहते हैं?',
        'faq1-a': 'प्रदाता के आधार पर ईमेल सीमित समय के लिए रखे जाते हैं, आमतौर पर 24 घंटे तक।',
        'faq2-q': 'क्या मैं ईमेल भेज सकता हूँ?',
        'faq2-a': 'वर्तमान में, Tamp Mail केवल आने वाले ईमेल प्राप्त करने के लिए है।',
        'footer-rights': 'सर्वाधिकार सुरक्षित।',
        'accent-label': 'रंग:',
        'btn-print-text': 'प्रिंट',
        'btn-share-text': 'शेयर',
        'qr-title': 'ईमेल QR कोड',
        'help-title': 'उपयोगकर्ता गाइड'
    }
};

const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || 'blue',
    mailboxes: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeSection: 'home',
    currentMailbox: null,
    pollingInterval: null,
    pollingTimer: 10,
};

const App = {
    async request(path, options = {}) {
        const url = `${API_URL}${path}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {})
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API Request Failed');
            }
            return response.status === 204 ? null : await response.json();
        } catch (err) {
            this.showToast(err.message, 'error');
            throw err;
        }
    },

    async createAccount() {
        try {
            const domains = await this.request('/domains');
            if (!domains['hydra:member'] || domains['hydra:member'].length === 0) {
                throw new Error('No domains available');
            }
            const domain = domains['hydra:member'][0].domain;
            const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
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
                address,
                password,
                token: tokenData.token,
                id: tokenData.id,
                createdAt: new Date().toISOString(),
                note: ''
            };

            state.mailboxes.push(newMailbox);
            this.saveMailboxes();
            this.showToast('New mailbox created!', 'success');
            this.navigateTo('inbox');
            this.renderMailboxes();
        } catch (err) {
            console.error('Account creation failed', err);
        }
    },

    saveMailboxes() {
        localStorage.setItem('mail_accounts', JSON.stringify(state.mailboxes));
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    navigateTo(sectionId) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(sectionId).classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === sectionId);
        });
        state.activeSection = sectionId;

        // Mobile nav auto-close
        document.getElementById('nav-links').classList.remove('active');

        if (sectionId === 'inbox') {
            this.renderMailboxes();
            this.startPolling();
        } else {
            this.stopPolling();
        }
    },

    init() {
        // Event Listeners
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(e.target.dataset.section);
            });
        });

        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        document.getElementById('btn-create-mail').addEventListener('click', () => this.createAccount());
        document.getElementById('add-more-btn').addEventListener('click', () => this.createAccount());
        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            state.pollingTimer = 10;
            this.fetchMessages();
            this.updateProgressBar();
        });

        document.getElementById('back-to-mailboxes').addEventListener('click', () => {
            document.getElementById('messages-container').classList.add('hidden');
            document.getElementById('mailboxes-container').classList.remove('hidden');
            state.currentMailbox = null;
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            });
        });

        // Initial setup
        this.applyAccent(state.accent);
        this.applyLanguage(state.lang);
        this.navigateTo('home');

        document.getElementById('lang-toggle-btn').addEventListener('click', () => {
            const nextLang = state.lang === 'en' ? 'hi' : 'en';
            this.applyLanguage(nextLang);
        });

        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.addEventListener('click', () => this.applyAccent(dot.dataset.color));
        });

        document.getElementById('btn-print').addEventListener('click', () => {
            const frame = document.getElementById('email-body-frame');
            frame.contentWindow.focus();
            frame.contentWindow.print();
        });

        document.getElementById('btn-share').addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Temporary Email Address',
                    text: state.currentMailbox.address
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(state.currentMailbox.address);
                this.showToast('Address copied to clipboard', 'success');
            }
        });
    },

    applyLanguage(lang) {
        state.lang = lang;
        localStorage.setItem('mail_lang', lang);
        document.documentElement.lang = lang;
        document.getElementById('current-lang').textContent = lang === 'en' ? 'English' : 'हिन्दी';
        this.updateStaticContent();
        this.generateHelpContent();
    },

    updateStaticContent() {
        const dict = translations[state.lang];
        Object.keys(dict).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'STRONG' || el.tagName === 'A') {
                    el.textContent = dict[key];
                }
            }
        });
    },

    generateHelpContent() {
        const container = document.getElementById('help-content-body');
        const content = state.lang === 'en' ? `
            <div class="help-step">
                <h4>1. Create Mailbox</h4>
                <p>Click "Create New Mailbox" to get a unique temporary address.</p>
            </div>
            <div class="help-step">
                <h4>2. Receive Emails</h4>
                <p>Use your address anywhere. Emails will appear in your Inbox automatically.</p>
            </div>
            <div class="help-step">
                <h4>3. Manage Multiple</h4>
                <p>You can create multiple mailboxes and switch between them easily.</p>
            </div>
        ` : `
            <div class="help-step">
                <h4>1. मेलबॉक्स बनाएं</h4>
                <p>एक अद्वितीय अस्थायी पता प्राप्त करने के लिए "नया मेलबॉक्स बनाएं" पर क्लिक करें।</p>
            </div>
            <div class="help-step">
                <h4>2. ईमेल प्राप्त करें</h4>
                <p>कहीं भी अपना पता उपयोग करें। ईमेल आपके इनबॉक्स में अपने आप आ जाएंगे।</p>
            </div>
            <div class="help-step">
                <h4>3. एकाधिक प्रबंधित करें</h4>
                <p>आप कई मेलबॉक्स बना सकते हैं और आसानी से उनके बीच स्विच कर सकते हैं।</p>
            </div>
        `;
        container.innerHTML = content;
    },

    applyAccent(color) {
        const colors = {
            blue: '#3498db',
            green: '#2ecc71',
            red: '#e74c3c',
            pink: '#e91e63'
        };
        document.documentElement.style.setProperty('--primary', colors[color]);
        state.accent = color;
        localStorage.setItem('mail_accent', color);
        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.color === color);
        });
    },

    renderMailboxes() {
        const container = document.getElementById('mailboxes-container');
        container.innerHTML = '';

        if (state.mailboxes.length === 0) {
            container.innerHTML = '<p class="empty-msg">No mailboxes yet. Create one to get started!</p>';
            return;
        }

        state.mailboxes.forEach(mb => {
            const card = document.createElement('div');
            card.className = 'mailbox-card';
            card.innerHTML = `
                <div class="mb-info">
                    <strong>${mb.address}</strong>
                    <p class="mb-note">${mb.note || 'No notes'}</p>
                </div>
                <div class="mb-actions">
                    <button class="btn-icon qr-btn" title="QR Code"><i class="fas fa-qrcode"></i></button>
                    <button class="btn-icon del-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `;
            card.onclick = (e) => {
                if (e.target.closest('.btn-icon')) return;
                this.openInbox(mb);
            };

            card.querySelector('.qr-btn').onclick = (e) => {
                e.stopPropagation();
                this.showQR(mb.address);
            };

            card.querySelector('.del-btn').onclick = (e) => {
                e.stopPropagation();
                this.deleteMailbox(mb.id);
            };

            container.appendChild(card);
        });
    },

    deleteMailbox(id) {
        if (!confirm('Are you sure you want to delete this mailbox?')) return;
        state.mailboxes = state.mailboxes.filter(m => m.id !== id);
        this.saveMailboxes();
        this.renderMailboxes();
        this.showToast('Mailbox removed', 'info');
    },

    async openInbox(mailbox) {
        state.currentMailbox = mailbox;
        document.getElementById('mailboxes-container').classList.add('hidden');
        document.getElementById('messages-container').classList.remove('hidden');
        document.getElementById('current-mailbox-addr').textContent = mailbox.address;
        this.fetchMessages();
    },

    async fetchMessages() {
        if (!state.currentMailbox) return;
        try {
            const data = await this.request('/messages', { token: state.currentMailbox.token });
            this.renderMessages(data['hydra:member']);
        } catch (err) {
            console.error('Fetch messages failed', err);
        }
    },

    renderMessages(messages) {
        const container = document.getElementById('emails-list');
        container.innerHTML = '';
        if (messages.length === 0) {
            container.innerHTML = '<p class="empty-msg">Inbox is empty</p>';
            return;
        }

        messages.forEach(msg => {
            const item = document.createElement('div');
            item.className = 'email-item';
            item.innerHTML = `
                <div class="email-info">
                    <strong>${msg.from.name || msg.from.address}</strong>
                    <p>${msg.subject || '(No Subject)'}</p>
                </div>
                <small>${new Date(msg.createdAt).toLocaleTimeString()}</small>
            `;
            item.onclick = () => this.openEmail(msg.id);
            container.appendChild(item);
        });
    },

    async openEmail(msgId) {
        try {
            const msg = await this.request(`/messages/${msgId}`, { token: state.currentMailbox.token });
            document.getElementById('email-subject-display').textContent = msg.subject || '(No Subject)';
            document.getElementById('email-from').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
            document.getElementById('email-date').textContent = new Date(msg.createdAt).toLocaleString();

            const frame = document.getElementById('email-body-frame');
            let content = msg.html || msg.text || '';
            if (Array.isArray(content)) content = content.join('');
            frame.srcdoc = content;

            this.renderAttachments(msg);
            document.getElementById('email-modal').classList.remove('hidden');
        } catch (err) {
            console.error('Open email failed', err);
        }
    },

    renderAttachments(msg) {
        const container = document.getElementById('attachments-container');
        container.innerHTML = '';
        if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments.forEach(att => {
                const btn = document.createElement('button');
                btn.className = 'btn-secondary att-btn';
                btn.innerHTML = `<i class="fas fa-paperclip"></i> ${att.filename}`;
                btn.onclick = () => this.downloadAttachment(msg.id, att);
                container.appendChild(btn);
            });
        }
    },

    async downloadAttachment(msgId, att) {
        try {
            const response = await fetch(`${API_URL}/messages/${msgId}/attachments/${att.id}`, {
                headers: { 'Authorization': `Bearer ${state.currentMailbox.token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = att.filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            this.showToast('Download failed', 'error');
        }
    },

    showQR(address) {
        const qrImg = document.getElementById('qr-image');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
        document.getElementById('qr-addr-text').textContent = address;
        document.getElementById('qr-modal').classList.remove('hidden');
    },

    startPolling() {
        if (state.pollingInterval) return;
        this.updateProgressBar();
        state.pollingInterval = setInterval(() => {
            state.pollingTimer--;
            if (state.pollingTimer <= 0) {
                state.pollingTimer = 10;
                this.fetchMessages();
            }
            this.updateProgressBar();
        }, 1000);
    },

    stopPolling() {
        clearInterval(state.pollingInterval);
        state.pollingInterval = null;
        state.pollingTimer = 10;
    },

    updateProgressBar() {
        const percent = ((10 - state.pollingTimer) / 10) * 100;
        document.documentElement.style.setProperty('--progress-width', `${percent}%`);
        document.getElementById('refresh-timer-text').textContent = `Refreshing in ${state.pollingTimer}s...`;
    }
};

window.App = App;
window.onload = () => {
    App.init();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(console.error);
    }
};
