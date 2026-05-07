const MailTM = {
    API_URL: 'https://api.mail.tm',

    async getDomains() {
        try {
            const response = await fetch(`${this.API_URL}/domains`);
            const data = await response.json();
            return data['hydra:member'];
        } catch (error) {
            console.error('Error fetching domains:', error);
            return [{ domain: 'tempmail.com' }]; // Fallback
        }
    },

    async createAccount(address, password) {
        const response = await fetch(`${this.API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        return response.json();
    },

    async getToken(address, password) {
        const response = await fetch(`${this.API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        return response.json();
    },

    async getMessages(token, page = 1) {
        const response = await fetch(`${this.API_URL}/messages?page=${page}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data['hydra:member'];
    },

    async getMessage(token, id) {
        const response = await fetch(`${this.API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    async deleteMessage(token, id) {
        await fetch(`${this.API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};

const Utils = {
    randomString(length) {
        return Math.random().toString(36).substring(2, 2 + length);
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

const Translations = {
    en: {
        your_email: "Your Temporary Email Address",
        inbox: "Inbox",
        empty_inbox: "Waiting for incoming emails...",
        refresh_status: "Autorefresh in 7s",
        multi_mailbox: "My Mailboxes",
        delete_mailbox: "Delete",
        about_title: "About TempMail Pro",
        contact_title: "Contact Us",
        privacy_title: "Privacy Policy",
        copy_success: "Email copied to clipboard!",
        new_mail_creating: "Creating new mailbox...",
        qr_title: "Scan QR Code",
        manage_mailboxes: "Manage Mailboxes",
        add_new: "Add New Mailbox"
    },
    hi: {
        your_email: "आपका अस्थायी ईमेल पता",
        inbox: "इनबॉक्स",
        empty_inbox: "आने वाले ईमेल की प्रतीक्षा कर रहे हैं...",
        refresh_status: "7s में ऑटो-रिफ्रेश",
        multi_mailbox: "मेरे मेलबॉक्स",
        delete_mailbox: "हटाएं",
        about_title: "TempMail Pro के बारे में",
        contact_title: "संपर्क करें",
        privacy_title: "गोपनीयता नीति",
        copy_success: "ईमेल कॉपी हो गया!",
        new_mail_creating: "नया मेलबॉक्स बना रहे हैं...",
        qr_title: "QR कोड स्कैन करें",
        manage_mailboxes: "मेलबॉक्स प्रबंधित करें",
        add_new: "नया मेलबॉक्स जोड़ें"
    }
};

const App = {
    currentLang: 'en',
    currentTheme: 'dark',
    currentSection: 'home',
    accentColor: '#6c5ce7',

    currentAccount: null,
    accounts: [],
    messages: [],
    refreshInterval: null,
    countdown: 7,

    async init() {
        this.loadSettings();
        this.bindEvents();
        this.applyLanguage();
        this.applyTheme();
        this.applyAccent();
        this.updateStaticContent();

        await this.loadAccounts();
        if (this.accounts.length === 0) {
            await this.createNewMailbox();
        } else {
            this.switchAccount(this.accounts[0].address);
        }
    },

    loadSettings() {
        this.currentLang = localStorage.getItem('mail_lang') || 'en';
        this.currentTheme = localStorage.getItem('mail_theme') || 'dark';
        this.accentColor = localStorage.getItem('mail_accent') || '#6c5ce7';
        this.accounts = JSON.parse(localStorage.getItem('temp_mail_accounts')) || [];
    },

    bindEvents() {
        // Mailbox Actions
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('new-mail-btn').addEventListener('click', () => this.createNewMailbox());
        document.getElementById('refresh-now-btn').addEventListener('click', () => this.refreshInbox());
        document.getElementById('delete-mailbox-btn').addEventListener('click', () => this.deleteCurrentMailbox());
        document.getElementById('qr-btn').addEventListener('click', () => this.showQRCode());
        document.getElementById('multi-mailbox-btn').addEventListener('click', () => this.showMailboxModal());
        document.getElementById('add-mailbox-btn').addEventListener('click', () => this.createNewMailbox());

        // Section Switching
        document.querySelectorAll('[data-section]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(el.dataset.section);
                this.closeDrawer();
            });
        });

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Language Toggle
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());

        // Accent Picker
        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.addEventListener('click', () => this.setAccent(dot.dataset.color));
        });

        // Mobile Menu
        document.getElementById('menu-toggle').addEventListener('click', () => this.openDrawer());
        document.getElementById('close-drawer').addEventListener('click', () => this.closeDrawer());

        // Modal Closers
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };
    },

    switchSection(sectionId) {
        this.currentSection = sectionId;
        document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`${sectionId}-section`).classList.add('active');

        document.querySelectorAll('.nav-item, .drawer-item').forEach(el => {
            el.classList.toggle('active', el.dataset.section === sectionId);
        });
    },

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        localStorage.setItem('mail_theme', this.currentTheme);
    },

    applyTheme() {
        document.body.className = `${this.currentTheme}-theme`;
        const icon = document.querySelector('#theme-toggle i');
        icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'hi' : 'en';
        this.applyLanguage();
        localStorage.setItem('mail_lang', this.currentLang);
    },

    applyLanguage() {
        const trans = Translations[this.currentLang];
        document.getElementById('lang-toggle').querySelector('.btn-text').textContent = this.currentLang === 'en' ? 'HI' : 'EN';

        // Update UI Text
        document.getElementById('label-your-email').textContent = trans.your_email;
        document.getElementById('label-inbox').textContent = trans.inbox;
        document.getElementById('label-empty-inbox').textContent = trans.empty_inbox;
        document.getElementById('label-multi-mailbox').textContent = trans.multi_mailbox;
        document.getElementById('label-delete-mailbox').textContent = trans.delete_mailbox;
        document.getElementById('about-title').textContent = trans.about_title;
        document.getElementById('contact-title').textContent = trans.contact_title;
        document.getElementById('privacy-title').textContent = trans.privacy_title;
        document.getElementById('label-qr-title').textContent = trans.qr_title;
        document.getElementById('label-manage-mailboxes').textContent = trans.manage_mailboxes;
        document.getElementById('label-add-new').textContent = trans.add_new;

        this.updateStaticContent();
    },

    setAccent(color) {
        this.accentColor = color;
        this.applyAccent();
        localStorage.setItem('mail_accent', color);
    },

    applyAccent() {
        document.documentElement.style.setProperty('--primary', this.accentColor);
        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.color === this.accentColor);
        });
    },

    openDrawer() { document.getElementById('mobile-drawer').classList.add('active'); },
    closeDrawer() { document.getElementById('mobile-drawer').classList.remove('active'); },

    registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.error('Service Worker failed', err));
        }
    },

    updateStaticContent() {
        const isHi = this.currentLang === 'hi';
        document.getElementById('about-content').innerHTML = isHi ?
            `<p>TempMail Pro एक सुरक्षित और मुफ्त अस्थायी ईमेल सेवा है।</p>` :
            `<p>TempMail Pro is a secure and free temporary email service.</p>`;

        document.getElementById('contact-content').innerHTML = isHi ?
            `<p>हमें support@tempmail.pro पर संपर्क करें।</p>` :
            `<p>Contact us at support@tempmail.pro.</p>`;

        document.getElementById('privacy-content').innerHTML = isHi ?
            `<p>हम आपका डेटा संग्रहीत नहीं करते हैं।</p>` :
            `<p>We do not store your data.</p>`;
    },

    async createNewMailbox() {
        Utils.showToast(Translations[this.currentLang].new_mail_creating);
        const domains = await MailTM.getDomains();
        const domain = domains[0].domain;
        const username = Utils.randomString(10);
        const password = Utils.randomString(12);
        const address = `${username}@${domain}`;

        try {
            await MailTM.createAccount(address, password);
            const tokenData = await MailTM.getToken(address, password);

            const newAccount = { address, password, token: tokenData.token };
            this.accounts.push(newAccount);
            this.saveAccounts();
            this.switchAccount(address);

            document.getElementById('mailbox-modal').style.display = 'none';
        } catch (error) {
            Utils.showToast("Error creating mailbox", "error");
        }
    },

    saveAccounts() {
        localStorage.setItem('temp_mail_accounts', JSON.stringify(this.accounts));
    },

    async loadAccounts() {
        this.accounts = JSON.parse(localStorage.getItem('temp_mail_accounts')) || [];
    },

    switchAccount(address) {
        this.currentAccount = this.accounts.find(a => a.address === address);
        document.getElementById('email-address').value = this.currentAccount.address;
        this.refreshInbox();
        this.startPolling();
    },

    async refreshInbox() {
        if (!this.currentAccount) return;

        try {
            const msgs = await MailTM.getMessages(this.currentAccount.token);
            this.messages = msgs;
            this.renderInbox();
            this.resetCountdown();
        } catch (error) {
            console.error("Refresh error:", error);
        }
    },

    renderInbox() {
        const list = document.getElementById('email-list');
        const count = document.getElementById('inbox-count');
        count.textContent = this.messages.length;

        if (this.messages.length === 0) {
            list.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-envelope-open"></i>
                    <p>${Translations[this.currentLang].empty_inbox}</p>
                </div>`;
            return;
        }

        list.innerHTML = this.messages.map(msg => `
            <div class="email-item" onclick="App.viewEmail('${msg.id}')">
                <div class="email-item-info">
                    <strong>${msg.from.address}</strong>
                    <p>${msg.subject || '(No Subject)'}</p>
                </div>
            </div>
        `).join('');
    },

    async viewEmail(id) {
        const msg = await MailTM.getMessage(this.currentAccount.token, id);
        document.getElementById('view-subject').textContent = msg.subject || '(No Subject)';
        document.getElementById('view-from').textContent = `From: ${msg.from.address}`;

        const frame = document.getElementById('email-body-frame');
        const content = msg.html || msg.text;
        frame.srcdoc = Array.isArray(content) ? content.join('') : content;

        document.getElementById('email-view-modal').style.display = 'flex';
    },

    startPolling() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.resetCountdown();

        this.refreshInterval = setInterval(() => {
            this.countdown--;
            this.updateRefreshUI();

            if (this.countdown <= 0) {
                this.refreshInbox();
            }
        }, 1000);
    },

    resetCountdown() {
        this.countdown = 7;
        this.updateRefreshUI();
    },

    updateRefreshUI() {
        const text = Translations[this.currentLang].refresh_status.replace('7s', `${this.countdown}s`);
        document.getElementById('refresh-text').textContent = text;
        const progress = ( (7 - this.countdown) / 7) * 100;
        document.getElementById('refresh-progress').style.width = `${progress}%`;
    },

    copyToClipboard() {
        const addr = document.getElementById('email-address').value;
        navigator.clipboard.writeText(addr).then(() => {
            Utils.showToast(Translations[this.currentLang].copy_success, "success");
        });
    },

    showQRCode() {
        const addr = document.getElementById('email-address').value;
        const qrContainer = document.getElementById('qr-code-img');
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${addr}" alt="QR">`;
        document.getElementById('qr-email-display').textContent = addr;
        document.getElementById('qr-modal').style.display = 'flex';
    },

    showMailboxModal() {
        const container = document.getElementById('mailbox-list-container');
        container.innerHTML = this.accounts.map(acc => `
            <div class="email-item ${acc.address === this.currentAccount.address ? 'active' : ''}" onclick="App.switchAccount('${acc.address}'); document.getElementById('mailbox-modal').style.display='none';">
                <span>${acc.address}</span>
            </div>
        `).join('');
        document.getElementById('mailbox-modal').style.display = 'flex';
    },

    deleteCurrentMailbox() {
        if (confirm("Are you sure you want to delete this mailbox?")) {
            this.accounts = this.accounts.filter(a => a.address !== this.currentAccount.address);
            this.saveAccounts();
            if (this.accounts.length > 0) {
                this.switchAccount(this.accounts[0].address);
            } else {
                this.createNewMailbox();
            }
        }
    }
};

window.onload = () => {
    App.init();
    App.registerSW();
};
