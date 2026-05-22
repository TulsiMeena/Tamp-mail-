const API_URL = 'https://api.mail.tm';

const state = {
    accounts: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeAccountId: localStorage.getItem('mail_active_id') || null,
    messages: [],
    domains: [],
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || '#3498db',
    pollingInterval: null,
    countdown: 10
};

const App = {
    async init() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js');
        }
        this.applyTheme();
        this.applyLanguage();
        this.bindEvents();
        await this.fetchDomains();
        this.renderAccounts();

        const path = window.location.hash.replace('#', '') || 'home';
        this.navigateTo(path);

        if (state.activeAccountId) {
            this.startPolling();
        }
    },

    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(state.activeAccountId ? { 'Authorization': `Bearer ${this.getActiveAccount().token}` } : {})
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API Request failed');
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
            state.domains = data['hydra:member'];
        } catch (error) {
            state.domains = [{ domain: 'tempmail.com' }];
        }
    },

    async createAccount() {
        this.showToast(translations[state.lang]['status-creating'] || 'Creating...', 'info');
        const domain = state.domains[0]?.domain || 'tempmail.com';
        const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
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

            const newAccount = {
                id: account.id,
                address: account.address,
                token: tokenData.token,
                createdAt: new Date().toISOString()
            };

            state.accounts.push(newAccount);
            state.activeAccountId = newAccount.id;
            this.saveState();
            this.renderAccounts();
            this.startPolling();
            this.showToast(translations[state.lang]['status-success'] || 'Account created!');
        } catch (error) {
            console.error(error);
        }
    },

    getActiveAccount() {
        return state.accounts.find(a => a.id === state.activeAccountId);
    },

    saveState() {
        localStorage.setItem('mail_accounts', JSON.stringify(state.accounts));
        localStorage.setItem('mail_active_id', state.activeAccountId);
    },

    renderAccounts() {
        const container = document.getElementById('active-mailboxes');
        if (!container) return;

        container.innerHTML = state.accounts.map(acc => `
            <div class="mailbox-item ${acc.id === state.activeAccountId ? 'active' : ''}" onclick="App.switchAccount('${acc.id}')">
                <i class="fas fa-at"></i>
                <span onclick="event.stopPropagation(); App.copyToClipboard('${acc.address}')" title="Click to copy">${acc.address}</span>
                <div class="mailbox-actions">
                    <button onclick="event.stopPropagation(); App.showQR('${acc.address}')" class="icon-btn"><i class="fas fa-qrcode"></i></button>
                    <button onclick="event.stopPropagation(); App.deleteAccount('${acc.id}')" class="delete-btn">&times;</button>
                </div>
            </div>
        `).join('');
    },

    showQR(address) {
        const qrContainer = document.getElementById('qr-container');
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}" alt="QR Code">`;
        document.getElementById('qr-modal').classList.remove('hidden');
    },

    switchAccount(id) {
        state.activeAccountId = id;
        this.saveState();
        this.renderAccounts();
        this.fetchMessages();
        this.resetPolling();
    },

    deleteAccount(id) {
        state.accounts = state.accounts.filter(a => a.id !== id);
        if (state.activeAccountId === id) {
            state.activeAccountId = state.accounts[0]?.id || null;
        }
        this.saveState();
        this.renderAccounts();
        if (!state.activeAccountId) {
            this.stopPolling();
            document.getElementById('messages-list').innerHTML = `<div class="empty-inbox"><p>No active mailbox.</p></div>`;
        } else {
            this.fetchMessages();
        }
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    navigateTo(sectionId) {
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
        const target = document.getElementById(`${sectionId}-section`);
        if (target) target.classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === sectionId);
        });

        window.location.hash = sectionId;
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    },

    applyTheme() {
        document.documentElement.style.setProperty('--primary', state.accent);
    },

    applyLanguage() {
        const trans = translations[state.lang];
        document.documentElement.lang = state.lang;
        document.getElementById('lang-toggle').textContent = state.lang.toUpperCase();

        Object.keys(trans).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'P') {
                    el.textContent = trans[key];
                }
            }
        });
    },

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return;
            const cards = document.querySelectorAll('.stat-card, .dev-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
                    const rotateX = (y - rect.height / 2) / 10;
                    const rotateY = (rect.width / 2 - x) / 10;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                } else {
                    card.style.transform = 'none';
                }
            });
        });

        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.section);
            });
        });

        document.getElementById('add-mailbox-btn').addEventListener('click', () => this.createAccount());

        document.getElementById('lang-toggle').addEventListener('click', () => {
            state.lang = state.lang === 'en' ? 'hi' : 'en';
            localStorage.setItem('mail_lang', state.lang);
            this.applyLanguage();
            this.updateStaticContent();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.getElementById('theme-modal').classList.remove('hidden');
        });

        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.accent = btn.dataset.color;
                localStorage.setItem('mail_accent', state.accent);
                this.applyTheme();
                document.getElementById('theme-modal').classList.add('hidden');
            });
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            this.fetchMessages();
            this.resetPolling();
        });
    },

    updateStaticContent() {
        // Handle tutorial and other dynamic localized content
    },

    async fetchMessages() {
        if (!state.activeAccountId) return;
        try {
            const data = await this.request('/messages');
            const newMessages = data['hydra:member'];

            if (newMessages.length > state.messages.length) {
                this.showToast(translations[state.lang]['new-mail'] || 'New email received!');
            }

            state.messages = newMessages;
            this.renderMessages();
        } catch (error) {
            console.error('Fetch messages failed', error);
        }
    },

    renderMessages() {
        const container = document.getElementById('messages-list');
        if (!container) return;

        if (state.messages.length === 0) {
            container.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-envelope-open"></i>
                    <p id="empty-msg">${translations[state.lang]['empty-msg']}</p>
                </div>`;
            return;
        }

        container.innerHTML = state.messages.map(msg => `
            <div class="message-item ${msg.seen ? '' : 'unread'}" onclick="App.viewMessage('${msg.id}')">
                <div class="msg-from">${msg.from.address}</div>
                <div class="msg-subject">${msg.subject || '(No Subject)'}</div>
                <div class="msg-date">${new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
        `).join('');
    },

    async viewMessage(id) {
        try {
            const msg = await this.request(`/messages/${id}`);
            document.getElementById('modal-subject').textContent = msg.subject || '(No Subject)';
            document.getElementById('modal-from').textContent = msg.from.address;
            document.getElementById('modal-date').textContent = new Date(msg.createdAt).toLocaleString();

            const frame = document.getElementById('email-frame');
            const content = Array.isArray(msg.html) ? msg.html.join('') : (msg.html || msg.text || '');
            frame.srcdoc = content;

            const attachmentsDiv = document.getElementById('attachments');
            attachmentsDiv.innerHTML = (msg.attachments || []).map(att => `
                <button class="btn-secondary" onclick="App.downloadAttachment('${id}', '${att.id}', '${att.filename}')">
                    <i class="fas fa-paperclip"></i> ${att.filename}
                </button>
            `).join('');

            document.getElementById('email-modal').classList.remove('hidden');

            document.getElementById('print-btn').onclick = () => {
                const win = window.open('', '_blank');
                win.document.write(`<html><head><title>Print Email</title></head><body>
                    <h2>${msg.subject || '(No Subject)'}</h2>
                    <p><strong>From:</strong> ${msg.from.address}</p>
                    <p><strong>Date:</strong> ${new Date(msg.createdAt).toLocaleString()}</p>
                    <hr>
                    ${content}
                </body></html>`);
                win.document.close();
                win.print();
            };

            if (!msg.seen) {
                await this.request(`/messages/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ seen: true })
                });
                this.fetchMessages();
            }
        } catch (error) {
            console.error('View message failed', error);
        }
    },

    startPolling() {
        this.stopPolling();
        this.fetchMessages();
        state.pollingInterval = setInterval(() => {
            state.countdown--;
            this.updateProgressBar();
            if (state.countdown <= 0) {
                this.fetchMessages();
                state.countdown = 10;
            }
        }, 1000);
    },

    stopPolling() {
        if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
            state.pollingInterval = null;
        }
    },

    resetPolling() {
        state.countdown = 10;
        this.updateProgressBar();
    },

    updateProgressBar() {
        const bar = document.getElementById('refresh-progress');
        const status = document.getElementById('refresh-status');
        if (bar) bar.style.width = `${(10 - state.countdown) * 10}%`;
        if (status) {
            const text = translations[state.lang]['refresh-status'];
            status.textContent = text.replace('10s', `${state.countdown}s`);
        }
    },

    async downloadAttachment(msgId, attId, filename) {
        try {
            const response = await fetch(`${API_URL}/messages/${msgId}/attachments/${attId}`, {
                headers: { 'Authorization': `Bearer ${this.getActiveAccount().token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            this.showToast('Download failed', 'error');
        }
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(translations[state.lang]['copied'] || 'Copied to clipboard!');
        });
    }
};

const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About Us',
        'nav-privacy': 'Privacy',
        'nav-help': 'Help',
        'hero-title': 'Secure Your Privacy with Tamp Mail',
        'hero-subtitle': 'Get a disposable temporary email address instantly.',
        'btn-get-started': 'Get Started',
        'inbox-title': 'Your Mailboxes',
        'btn-add-mail': 'Add New',
        'refresh-status': 'Auto-refreshing in 10s',
        'empty-msg': 'Your inbox is empty. Waiting for incoming emails...',
        'status-creating': 'Creating...',
        'status-success': 'Account created!',
        'about-title': 'About the Developers',
        'copied': 'Copied to clipboard!',
        'new-mail': 'New email received!'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-privacy': 'गोपनीयता',
        'nav-help': 'सहायता',
        'hero-title': 'टैम्प मेल के साथ अपनी गोपनीयता सुरक्षित करें',
        'hero-subtitle': 'तुरंत एक डिस्पोजेबल अस्थायी ईमेल पता प्राप्त करें।',
        'btn-get-started': 'शुरू करें',
        'inbox-title': 'आपके मेलबॉक्स',
        'btn-add-mail': 'नया जोड़ें',
        'refresh-status': '10 सेकंड में ऑटो-रिफ्रेश',
        'empty-msg': 'आपका इनबॉक्स खाली है। आने वाले ईमेल की प्रतीक्षा कर रहे हैं...',
        'status-creating': 'बना रहा है...',
        'status-success': 'खाता बन गया!',
        'about-title': 'डेवलपर्स के बारे में',
        'copied': 'क्लिपबोर्ड पर कॉपी किया गया!',
        'new-mail': 'नया ईमेल प्राप्त हुआ!'
    }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
