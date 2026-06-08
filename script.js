const API_URL = 'https://api.mail.tm';

const state = {
    accounts: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeAccountId: localStorage.getItem('mail_active_id') || null,
    messages: [],
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    accent: localStorage.getItem('mail_accent') || 'blue',
    refreshTimer: 10,
    interval: null
};

const translations = {
    en: {
        'brand-name': 'Tamp Mail',
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About Us',
        'nav-glossary': 'Privacy Glossary',
        'hero-title': 'Your Secure Temporary Inbox',
        'hero-subtitle': 'Generate disposable email addresses to keep your real inbox clean and safe from spam.',
        'btn-get-started': 'Get Started',
        'btn-learn-more': 'Learn More',
        'feat-fast': 'Fast & Instant',
        'feat-fast-desc': 'Get a temporary email address in seconds.',
        'feat-secure': 'Secure',
        'feat-secure-desc': 'End-to-end encryption for your messages.',
        'feat-private': 'Private',
        'feat-private-desc': 'No personal information required.',
        'reviews-title': 'User Reviews & Feedback',
        'inbox-title': 'My Mailboxes',
        'btn-add-mail-text': 'Add Mailbox',
        'refresh-text': 'Refreshing in {s}s',
        'refresh-now-text': 'Refresh Now',
        'empty-msg': 'Your inbox is empty',
        'about-title': 'About Tamp Mail',
        'about-desc': 'Tamp Mail is a free service that provides temporary email addresses to help you protect your privacy and stay away from unwanted emails.',
        'role-admin': 'Lead Developer',
        'role-support': 'Customer Care',
        'glos-title': 'Privacy Glossary',
        'faq-title': 'Frequently Asked Questions',
        'modal-subject': 'Subject',
        'att-title': 'Attachments',
        'btn-print-text': 'Print',
        'btn-share-mail-text': 'Share',
        'qr-modal-title': 'Email QR Code',
        'help-title': 'How to Use',
        'btn-close-help': 'Got it!',
        'toast-copied': 'Copied to clipboard!',
        'toast-error': 'Something went wrong',
        'toast-limit': 'Too many requests. Please wait.',
        'toast-deleted': 'Account deleted',
        'help-content': '<h3>Tutorial</h3><p>1. Click "Add Mailbox" to generate a new temporary email.<br>2. You can manage multiple mailboxes at once.<br>3. Emails are refreshed automatically every 10 seconds.<br>4. Click an email to read its content in a secure sandbox.</p>'
    },
    hi: {
        'brand-name': 'टैम्प मेल',
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-glossary': 'गोपनीयता शब्दावली',
        'hero-title': 'आपका सुरक्षित अस्थायी इनबॉक्स',
        'hero-subtitle': 'अपने असली इनबॉक्स को साफ और स्पैम से सुरक्षित रखने के लिए डिस्पोजेबल ईमेल पते जेनरेट करें।',
        'btn-get-started': 'शुरू करें',
        'btn-learn-more': 'और जानें',
        'feat-fast': 'तेज़ और तत्काल',
        'feat-fast-desc': 'सेकंड में एक अस्थायी ईमेल पता प्राप्त करें।',
        'feat-secure': 'सुरक्षित',
        'feat-secure-desc': 'आपके संदेशों के लिए शुरू से अंत तक एन्क्रिप्शन।',
        'feat-private': 'निजी',
        'feat-private-desc': 'किसी व्यक्तिगत जानकारी की आवश्यकता नहीं है।',
        'reviews-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
        'inbox-title': 'मेरे मेलबॉक्स',
        'btn-add-mail-text': 'मेलबॉक्स जोड़ें',
        'refresh-text': '{s}s में रिफ्रेश हो रहा है',
        'refresh-now-text': 'अभी रिफ्रेश करें',
        'empty-msg': 'आपका इनबॉक्स खाली है',
        'about-title': 'टैम्प मेल के बारे में',
        'about-desc': 'टैम्प मेल एक मुफ्त सेवा है जो आपकी गोपनीयता की रक्षा करने और अवांछित ईमेल से दूर रहने में आपकी सहायता के लिए अस्थायी ईमेल पते प्रदान करती है।',
        'role-admin': 'मुख्य डेवलपर',
        'role-support': 'ग्राहक सेवा',
        'glos-title': 'गोपनीयता शब्दावली',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'modal-subject': 'विषय',
        'att-title': 'संलग्नक',
        'btn-print-text': 'प्रिंट करें',
        'btn-share-mail-text': 'शेयर करें',
        'qr-modal-title': 'ईमेल क्यूआर कोड',
        'help-title': 'कैसे उपयोग करें',
        'btn-close-help': 'समझ गया!',
        'toast-copied': 'क्लिपबोर्ड पर कॉपी किया गया!',
        'toast-error': 'कुछ गलत हो गया',
        'toast-limit': 'बहुत सारे अनुरोध। कृपया प्रतीक्षा करें।',
        'toast-deleted': 'खाता हटा दिया गया',
        'help-content': '<h3>ट्यूटोरियल</h3><p>1. नया अस्थायी ईमेल जेनरेट करने के लिए "मेलबॉक्स जोड़ें" पर क्लिक करें।<br>2. आप एक साथ कई मेलबॉक्स प्रबंधित कर सकते हैं।<br>3. ईमेल हर 10 सेकंड में स्वचालित रूप से रिफ्रेश होते हैं।<br>4. सुरक्षित सैंडबॉक्स में उसकी सामग्री पढ़ने के लिए किसी ईमेल पर क्लिक करें।</p>'
    }
};

const glossaryData = [
    { en: 'Disposable Email', hi: 'डिस्पोजेबल ईमेल', descEn: 'A temporary, self-destructing email address.', descHi: 'एक अस्थायी, स्वतः नष्ट होने वाला ईमेल पता।' },
    { en: 'Encryption', hi: 'एन्क्रिप्शन', descEn: 'Protecting data by converting it into a code.', descHi: 'डेटा को कोड में बदलकर सुरक्षित करना।' },
    { en: 'Spam', hi: 'स्पैम', descEn: 'Unsolicited junk emails sent in bulk.', descHi: 'थोक में भेजे गए अनचाहे जंक ईमेल।' },
    { en: 'Privacy', hi: 'गोपनीयता', descEn: 'The state of being free from public attention.', descHi: 'सार्वजनिक ध्यान से मुक्त होने की अवस्था।' }
];

const faqData = [
    { qEn: 'How long do emails last?', qHi: 'ईमेल कितने समय तक चलते हैं?', aEn: 'Emails are stored for 24 hours.', aHi: 'ईमेल 24 घंटों के लिए संग्रहीत किए जाते हैं।' },
    { qEn: 'Is it free?', qHi: 'क्या यह मुफ्त है?', aEn: 'Yes, Tamp Mail is 100% free.', aHi: 'हाँ, टैम्प मेल 100% मुफ्त है।' }
];

// Utility: Centralized request
async function request(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(state.activeAccountId ? { 'Authorization': `Bearer ${state.accounts.find(a => a.id === state.activeAccountId)?.token}` } : {}),
            ...options.headers
        }
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        if (res.status === 429) showToast(translations[state.lang]['toast-limit']);
        throw error;
    }
    return res.json();
}

const App = {
    async init() {
        this.bindEvents();
        this.applyLanguage();
        this.applyTheme();
        this.applyAccent();
        this.renderGlossary();

        if (state.accounts.length === 0) {
            // No accounts, but don't auto-create until "Get Started"
        } else {
            this.renderTabs();
            this.startPolling();
            this.fetchMessages();
        }
        window.App = this;
    },

    bindEvents() {
        // Nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Controls
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLang());
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        // Actions
        document.getElementById('btn-get-started').addEventListener('click', () => {
            this.switchSection('inbox');
            if (state.accounts.length === 0) this.createAccount();
        });
        document.getElementById('btn-add-mail').addEventListener('click', () => this.createAccount());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyEmail());
        document.getElementById('qr-btn').addEventListener('click', () => this.showQR());
        document.getElementById('share-btn').addEventListener('click', () => this.shareEmail());
        document.getElementById('refresh-now-btn').addEventListener('click', () => this.manualRefresh());

        // Modals
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        // Accent Color
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                state.accent = dot.dataset.color;
                this.applyAccent();
                localStorage.setItem('mail_accent', state.accent);
            });
        });

        // Email Detail Actions
        document.getElementById('btn-print').addEventListener('click', () => {
            const iframe = document.getElementById('email-iframe');
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        });
        document.getElementById('btn-share-mail').addEventListener('click', () => this.shareEmailContent());
        document.getElementById('btn-close-help').addEventListener('click', () => {
            document.getElementById('help-modal').classList.add('hidden');
        });
    },

    async createAccount() {
        try {
            const domains = await request('/domains');
            const domain = domains['hydra:member'][0].domain;
            const username = `u${Math.random().toString(36).substring(7)}`;
            const password = Math.random().toString(36);
            const address = `${username}@${domain}`;

            await request('/accounts', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const { token } = await request('/token', {
                method: 'POST',
                body: JSON.stringify({ address, password })
            });

            const account = { id: address, address, password, token, createdAt: new Date().toISOString() };
            state.accounts.push(account);
            state.activeAccountId = address;
            this.saveState();

            this.renderTabs();
            this.fetchMessages();
            this.startPolling();
            showToast('Mailbox created!');
        } catch (err) {
            console.error(err);
            showToast(translations[state.lang]['toast-error']);
        }
    },

    async fetchMessages() {
        if (!state.activeAccountId) return;
        try {
            const data = await request('/messages');
            state.messages = data['hydra:member'];
            this.renderMessages();
        } catch (err) {
            console.error(err);
        }
    },

    renderMessages() {
        const list = document.getElementById('email-list');
        const currentEmail = state.accounts.find(a => a.id === state.activeAccountId)?.address || 'Generating...';
        document.getElementById('current-email-display').textContent = currentEmail;

        if (state.messages.length === 0) {
            list.innerHTML = `<div class="empty-inbox"><i class="fas fa-inbox"></i><p id="empty-msg">${translations[state.lang]['empty-msg']}</p></div>`;
            return;
        }

        list.innerHTML = state.messages.map(msg => `
            <div class="email-item" onclick="App.openEmail('${msg.id}')">
                <div class="email-main">
                    <span class="email-from">${this.escape(msg.from.name || msg.from.address)}</span>
                    <span class="email-subject">${this.escape(msg.subject)}</span>
                </div>
                <span class="email-time">${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `).join('');
    },

    async openEmail(id) {
        try {
            const msg = await request(`/messages/${id}`);
            document.getElementById('modal-subject').textContent = msg.subject;
            document.getElementById('modal-from').textContent = `${msg.from.name} <${msg.from.address}>`;
            document.getElementById('modal-date').textContent = new Date(msg.createdAt).toLocaleString();
            document.getElementById('email-modal').dataset.id = id;

            const iframe = document.getElementById('email-iframe');
            const content = msg.html ? (Array.isArray(msg.html) ? msg.html.join('') : msg.html) : msg.text;
            iframe.srcdoc = content;

            // Attachments
            const attArea = document.getElementById('attachments-area');
            const attList = document.getElementById('attachments-list');
            if (msg.attachments && msg.attachments.length > 0) {
                attArea.classList.remove('hidden');
                attList.innerHTML = msg.attachments.map(att => `
                    <li><a href="#" onclick="event.preventDefault(); App.downloadAttachment('${msg.id}', '${att.id}', '${att.filename}')"><i class="fas fa-paperclip"></i> ${att.filename} (${(att.size / 1024).toFixed(1)} KB)</a></li>
                `).join('');
            } else {
                attArea.classList.add('hidden');
            }

            document.getElementById('email-modal').classList.remove('hidden');
        } catch (err) {
            console.error(err);
        }
    },

    switchSection(sectionId) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`${sectionId}-section`).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        if (window.innerWidth <= 768) {
            document.getElementById('nav-links').classList.remove('active');
        }
    },

    renderTabs() {
        const tabs = document.getElementById('mailbox-tabs');
        tabs.innerHTML = state.accounts.map(acc => `
            <div class="tab ${acc.id === state.activeAccountId ? 'active' : ''}" onclick="App.setActiveAccount('${acc.id}')">
                <span>${acc.address.split('@')[0]}</span>
                <i class="fas fa-times" onclick="event.stopPropagation(); App.deleteAccount('${acc.id}')"></i>
            </div>
        `).join('');
    },

    setActiveAccount(id) {
        state.activeAccountId = id;
        localStorage.setItem('mail_active_id', id);
        this.renderTabs();
        this.fetchMessages();
        this.manualRefresh();
    },

    deleteAccount(id) {
        state.accounts = state.accounts.filter(a => a.id !== id);
        if (state.activeAccountId === id) {
            state.activeAccountId = state.accounts[0]?.id || null;
            localStorage.setItem('mail_active_id', state.activeAccountId || '');
        }
        this.saveState();
        this.renderTabs();
        this.fetchMessages();
        showToast(translations[state.lang]['toast-deleted']);
    },

    saveState() {
        localStorage.setItem('mail_accounts', JSON.stringify(state.accounts));
        localStorage.setItem('mail_active_id', state.activeAccountId);
    },

    escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    applyLanguage() {
        document.documentElement.lang = state.lang;
        document.getElementById('lang-toggle').textContent = state.lang === 'en' ? 'Hindi' : 'English';

        Object.keys(translations[state.lang]).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                // If it's a button with an icon, target the span inside
                const span = el.querySelector('span[id$="-text"]');
                if (span) {
                    span.textContent = translations[state.lang][key];
                } else {
                    el.textContent = translations[state.lang][key];
                }
            }
        });

        // Special cases for placeholders and dynamic content
        this.updateStaticContent();
        this.renderGlossary();
        this.renderMessages();
        this.updateHelpModal();
    },

    updateStaticContent() {
        const refreshText = document.getElementById('refresh-text');
        if (refreshText) {
            refreshText.textContent = translations[state.lang]['refresh-text'].replace('{s}', state.refreshTimer);
        }
    },

    updateHelpModal() {
        document.getElementById('help-content').innerHTML = translations[state.lang]['help-content'];
    },

    applyTheme() {
        document.body.setAttribute('data-theme', state.theme);
        const icon = document.querySelector('#theme-toggle i');
        icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    applyAccent() {
        const colors = {
            blue: '#4a90e2',
            green: '#2ecc71',
            red: '#e74c3c',
            pink: '#e91e63'
        };
        document.documentElement.style.setProperty('--primary', colors[state.accent]);
        document.documentElement.style.setProperty('--primary-hover', colors[state.accent]); // Simplified

        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.color === state.accent);
        });
    },

    renderGlossary() {
        const grid = document.getElementById('glossary-grid');
        grid.innerHTML = glossaryData.map(item => `
            <div class="glos-item">
                <h4>${state.lang === 'en' ? item.en : item.hi}</h4>
                <p>${state.lang === 'en' ? item.descEn : item.descHi}</p>
            </div>
        `).join('');

        const faqList = document.getElementById('faq-list');
        faqList.innerHTML = faqData.map(item => `
            <div class="faq-item">
                <h4>${state.lang === 'en' ? item.qEn : item.qHi}</h4>
                <p>${state.lang === 'en' ? item.aEn : item.aHi}</p>
            </div>
        `).join('');
    },

    toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('mail_theme', state.theme);
        this.applyTheme();
    },

    toggleLang() {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', state.lang);
        this.applyLanguage();
    },
    startPolling() {
        if (state.interval) clearInterval(state.interval);
        state.refreshTimer = 10;
        this.updateProgressBar();

        state.interval = setInterval(() => {
            state.refreshTimer--;
            if (state.refreshTimer <= 0) {
                state.refreshTimer = 10;
                this.fetchMessages();
            }
            this.updateProgressBar();
            this.updateStaticContent();
        }, 1000);
    },

    updateProgressBar() {
        const bar = document.getElementById('refresh-progress');
        if (bar) {
            const width = (state.refreshTimer / 10) * 100;
            bar.style.width = `${width}%`;
        }
    },

    manualRefresh() {
        this.fetchMessages();
        state.refreshTimer = 10;
        this.updateProgressBar();
        this.updateStaticContent();
        showToast('Refreshed!');
    },

    async copyEmail() {
        const email = state.accounts.find(a => a.id === state.activeAccountId)?.address;
        if (!email) return;
        try {
            await navigator.clipboard.writeText(email);
            showToast(translations[state.lang]['toast-copied']);
        } catch (err) {
            console.error(err);
        }
    },

    showQR() {
        const email = state.accounts.find(a => a.id === state.activeAccountId)?.address;
        if (!email) return;
        const qrImg = document.getElementById('qr-image');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${email}`;
        document.getElementById('qr-email-text').textContent = email;
        document.getElementById('qr-modal').classList.remove('hidden');
    },

    async shareEmail() {
        const email = state.accounts.find(a => a.id === state.activeAccountId)?.address;
        if (!email) return;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'My Temporary Email', text: email });
            } catch (err) {
                console.error(err);
            }
        } else {
            this.copyEmail();
        }
    },

    async shareEmailContent() {
        const msgId = document.getElementById('email-modal').dataset.id; // Assume we store it
        const subject = document.getElementById('modal-subject').textContent;
        if (navigator.share) {
            try {
                await navigator.share({ title: subject, text: `Check out this email: ${subject}` });
            } catch (err) {
                console.error(err);
            }
        } else {
            showToast('Share not supported on this browser');
        }
    },

    async downloadAttachment(msgId, attId, filename) {
        try {
            const token = state.accounts.find(a => a.id === state.activeAccountId)?.token;
            const res = await fetch(`${API_URL}/messages/${msgId}/attachments/${attId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            console.error(err);
            showToast(translations[state.lang]['toast-error']);
        }
    }
};

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

document.addEventListener('DOMContentLoaded', () => App.init());
