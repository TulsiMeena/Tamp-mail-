console.log('script.js loading...');
// API Configuration
const API_URL = 'https://api.mail.tm';

const translations = {
    en: {
        'hero-title': 'Your Secure Temporary Email Solution',
        'hero-subtitle': 'Protect your privacy and stay spam-free with our professional disposable email service.',
        'copy': 'Copy',
        'refresh': 'Refresh',
        'new-mail': 'New Email',
        'hiw-title': 'How It Works',
        's1': 'Copy your temporary email address generated above.',
        's2': 'Use it to sign up for any service or website.',
        's3': 'Read the verification or incoming emails right here in your inbox.',
        'my-mailbox': 'My Mailbox',
        'syncing': 'Syncing...',
        'empty-msg': 'Your inbox is empty. Waiting for incoming messages...',
        'about-title': 'About TempMail Pro',
        'about-desc': 'TempMail Pro is a professional-grade disposable email service designed for developers, testers, and privacy-conscious users.',
        'skills-title': 'Technical Expertise',
        'skill1': 'Advanced JS Architecture',
        'skill2': 'Modern CSS & Glassmorphism',
        'skill3': 'API Integration & Security',
        'faq-title': 'Frequently Asked Questions'
    },
    hi: {
        'hero-title': 'आपका सुरक्षित अस्थायी ईमेल समाधान',
        'hero-subtitle': 'अपनी गोपनीयता की रक्षा करें और हमारी पेशेवर डिस्पोजेबल ईमेल सेवा के साथ स्पैम-मुक्त रहें।',
        'copy': 'कॉपी करें',
        'refresh': 'रिफ्रेश',
        'new-mail': 'नया ईमेल',
        'hiw-title': 'यह कैसे काम करता है',
        's1': 'ऊपर जेनरेट किए गए अपने अस्थायी ईमेल पते को कॉपी करें।',
        's2': 'किसी भी सेवा या वेबसाइट के लिए साइन अप करने के लिए इसका उपयोग करें।',
        's3': 'अपने इनबॉक्स में यहीं सत्यापन या आने वाले ईमेल पढ़ें।',
        'my-mailbox': 'मेरा मेलबॉक्स',
        'syncing': 'सिंक हो रहा है...',
        'empty-msg': 'आपका इनबॉक्स खाली है। आने वाले संदेशों की प्रतीक्षा की जा रही है...',
        'about-title': 'TempMail Pro के बारे में',
        'about-desc': 'TempMail Pro एक पेशेवर-ग्रेड डिस्पोजेबल ईमेल सेवा है जिसे डेवलपर्स, परीक्षकों और गोपनीयता के प्रति जागरूक उपयोगकर्ताओं के लिए डिज़ाइन किया गया है।',
        'skills-title': 'तकनीकी विशेषज्ञता',
        'skill1': 'उन्नत JS आर्किटेक्चर',
        'skill2': 'आधुनिक CSS और ग्लासमॉर्फिज्म',
        'skill3': 'API एकीकरण और सुरक्षा',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न'
    }
};

// App State Management
window.App = {
    state: {
        account: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
        token: localStorage.getItem('temp_mail_token') || null,
        accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
        domains: [],
        messages: [],
        currentSection: 'home',
        language: localStorage.getItem('mail_lang') || 'en',
        theme: localStorage.getItem('mail_theme') || 'light',
        accent: localStorage.getItem('mail_accent') || 'blue'
    },

    async init() {
        this.applyTheme();
        this.applyLanguage();
        this.setupEventListeners();
        await this.fetchDomains();

        if (!this.state.account) {
            await this.createAccount();
        } else {
            this.updateEmailUI();
            this.startPolling();
        }

        this.updateStats();
    },

    updateStats() {
        const received = localStorage.getItem('total_received') || 0;
        const saved = localStorage.getItem('time_saved') || 0;
        const countEl = document.getElementById('total-emails-count');
        const savedEl = document.getElementById('time-saved-count');
        if (countEl) countEl.textContent = received + '+';
        if (savedEl) savedEl.textContent = saved + 'h';
    },

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(() => {
            this.fetchMessages();
            this.resetProgressBar();
        }, 7000);
        this.resetProgressBar();
    },

    resetProgressBar() {
        const bar = document.getElementById('sync-progress');
        if (!bar) return;
        bar.style.transition = 'none';
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.transition = 'width 7s linear';
            bar.style.width = '100%';
        }, 50);
    },

    renderMessageList() {
        const list = document.getElementById('email-list');
        if (!list) return;

        if (this.state.messages.length === 0) {
            list.innerHTML = `<div class="empty-inbox"><i class="fas fa-inbox"></i><p>${translations[this.state.language]['empty-msg']}</p></div>`;
            return;
        }

        list.innerHTML = this.state.messages.map(msg => `
            <div class="email-item ${msg.seen ? '' : 'unread'}" onclick="App.viewMessage('${msg.id}')">
                <div class="email-info">
                    <div class="email-sender">${this.escapeHtml(msg.from.address)}</div>
                    <div class="email-subject">${this.escapeHtml(msg.subject)}</div>
                </div>
                <div class="email-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
        `).join('');
    },

    async viewMessage(id) {
        try {
            const res = await fetch(`${API_URL}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${this.state.token}` }
            });
            const msg = await res.json();

            document.getElementById('view-subject').textContent = msg.subject;
            document.getElementById('view-sender').textContent = `From: ${msg.from.name} <${msg.from.address}>`;

            const frame = document.getElementById('email-frame');
            const doc = frame.contentDocument || frame.contentWindow.document;
            doc.open();
            doc.write(msg.html || msg.text);
            doc.close();

            document.getElementById('email-viewer').classList.remove('hidden');

            // Mark as seen
            if (!msg.seen) {
                await fetch(`${API_URL}/messages/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.state.token}`,
                        'Content-Type': 'application/merge-patch+json'
                    },
                    body: JSON.stringify({ seen: true })
                });
                this.fetchMessages();
            }
        } catch (err) {
            this.showToast('Could not load message', 'error');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // API Methods
    async fetchDomains() {
        try {
            const res = await fetch(`${API_URL}/domains`).catch(() => null);
            if (!res) throw new Error('Offline');
            const data = await res.json();
            this.state.domains = data['hydra:member'] || [];
            this.populateDomainSelect();
        } catch (err) {
            console.warn('Error fetching domains:', err);
            this.showToast('Using fallback domain', 'info');
            this.state.domains = [{ domain: 'tempmail.com' }]; // Fallback
            this.populateDomainSelect();
        }
    },

    async createAccount(username = null, domain = null) {
        try {
            const selectedDomain = domain || (this.state.domains && this.state.domains[0]?.domain) || 'tempmail.com';

            const randomUser = username || Math.random().toString(36).substring(7);
            const password = Math.random().toString(36).substring(7);
            const address = `${randomUser}@${selectedDomain}`;

            const res = await fetch(`${API_URL}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });

            if (!res.ok) throw new Error('Failed to create account');
            const account = await res.json();

            // Get Token
            const tokenRes = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });
            const tokenData = await tokenRes.json();

            this.state.account = { ...account, password };
            this.state.token = tokenData.token;

            localStorage.setItem('temp_mail_account', JSON.stringify(this.state.account));
            localStorage.setItem('temp_mail_token', this.state.token);

            this.updateEmailUI();
            this.showToast('New email generated!', 'success');
            this.startPolling();
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    },

    async fetchMessages() {
        if (!this.state.token) return;
        try {
            const res = await fetch(`${API_URL}/messages`, {
                headers: { 'Authorization': `Bearer ${this.state.token}` }
            });
            const data = await res.json();
            this.state.messages = data['hydra:member'];
            this.renderMessageList();

            // Notification if new mail
            const total = this.state.messages.length;
            const prevTotal = parseInt(localStorage.getItem('total_received') || '0');
            if (total > 0 && total > this.state.messages.filter(m => m.seen).length) {
                // Potential notification logic here
            }
        } catch (err) {
            console.error('Fetch messages failed', err);
        }
    },

    // UI Updates
    updateEmailUI() {
        const display = document.getElementById('temp-email-display');
        const sidebar = document.getElementById('sidebar-email');
        if (display) display.value = this.state.account?.address || 'Loading...';
        if (sidebar) sidebar.textContent = this.state.account?.address || '...';
    },

    populateDomainSelect() {
        const select = document.getElementById('domain-select');
        if (!select) return;
        select.innerHTML = this.state.domains.map(d => `<option value="${d.domain}">${d.domain}</option>`).join('');
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // Routing
    navigateTo(sectionId) {
        console.log('Navigating to:', sectionId);
        this.state.currentSection = sectionId;
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.add('hidden');
        });
        const target = document.getElementById(`${sectionId}-section`);
        if (target) {
            target.classList.remove('hidden');
        }

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });

        // Specific section logic
        if (sectionId === 'inbox') {
            this.fetchMessages();
        }
    },

    // Theme & Language
    applyTheme() {
        document.body.className = `${this.state.theme}-theme`;
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = this.state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    },

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('mail_theme', this.state.theme);
        this.applyTheme();
    },

    applyLanguage() {
        const dict = translations[this.state.language];
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.dataset.key;
            if (dict[key]) {
                if (el.tagName === 'INPUT') el.placeholder = dict[key];
                else {
                    // Check if element has an icon
                    const icon = el.querySelector('i');
                    if (icon) {
                        const textSpan = el.querySelector('span') || el;
                        if (textSpan !== el) textSpan.textContent = dict[key];
                    } else {
                        el.textContent = dict[key];
                    }
                }
            }
        });
        document.getElementById('lang-toggle').textContent = this.state.language.toUpperCase();
    },

    toggleLanguage() {
        this.state.language = this.state.language === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', this.state.language);
        this.applyLanguage();
    },

    setupEventListeners() {
        console.log('Setting up event listeners...');
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Nav button clicked:', e.currentTarget.dataset.section);
                const section = e.currentTarget.dataset.section || 'home';
                this.navigateTo(section);
            });
        });

        const logoBtn = document.getElementById('logo-btn');
        if (logoBtn) {
            logoBtn.addEventListener('click', () => this.navigateTo('home'));
        }

        // Toggles
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());

        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                const navLinks = document.querySelector('.nav-links');
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
                if (navLinks.style.display === 'flex') {
                    navLinks.classList.add('mobile-nav-active');
                }
            });
        }

        // Email Actions
        document.getElementById('copy-email-btn').addEventListener('click', () => {
            const email = document.getElementById('temp-email-display').value;
            navigator.clipboard.writeText(email);
            this.showToast('Copied to clipboard!', 'success');
        });

        document.getElementById('new-email-btn').addEventListener('click', () => {
            this.createAccount();
        });

        document.getElementById('refresh-email-btn').addEventListener('click', () => {
            this.fetchMessages();
            this.showToast('Inbox refreshed', 'success');
        });

        document.getElementById('back-to-list').addEventListener('click', () => {
            document.getElementById('email-viewer').classList.add('hidden');
        });

        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            this.fetchMessages();
            this.resetProgressBar();
            this.showToast('Refreshing...', 'info');
        });

        const searchInput = document.getElementById('email-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.email-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(term) ? 'flex' : 'none';
                });
            });
        }

        document.getElementById('share-email-btn').addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'My Temp Email',
                    text: this.state.account.address
                }).catch(console.error);
            } else {
                this.showToast('Web Share not supported', 'error');
            }
        });

        document.getElementById('print-email').addEventListener('click', () => {
            const frame = document.getElementById('email-frame');
            frame.contentWindow.focus();
            frame.contentWindow.print();
        });

        document.getElementById('qr-email-btn').addEventListener('click', () => {
            const email = this.state.account.address;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}`;
            this.showModal(`<img src="${qrUrl}" alt="QR Code" style="display:block;margin:0 auto;">`);
        });
    },

    showModal(content) {
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    ${content}
                    <button class="btn primary-btn" style="margin-top:1rem;" onclick="document.getElementById('modal-container').classList.add('hidden')">Close</button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    }
};

// Start the app
console.log('Initializing App...');
window.App.init();
