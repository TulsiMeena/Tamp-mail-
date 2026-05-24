const App = {
    API_URL: 'https://api.mail.tm',
    state: {
        currentSection: 'home',
        lang: localStorage.getItem('mail_lang') || 'en',
        accent: localStorage.getItem('mail_accent') || 'blue',
        accounts: JSON.parse(localStorage.getItem('mail_accounts')) || [],
        activeAccount: null,
        domains: [],
        messages: [],
        refreshTimer: null,
        countdown: 10
    },

    translations: {
        en: {
            'nav-home': 'Home', 'nav-inbox': 'Inbox', 'nav-about': 'About', 'nav-help': 'Help',
            'hero-title': 'Temporary Disposable Email',
            'hero-subtitle': 'Protect your privacy and keep your inbox clean.',
            'btn-get-started': 'Get Started',
            'f1-title': 'Stay Private', 'f1-desc': 'Avoid spam and tracking by using a temporary address.',
            'f2-title': 'Fast & Easy', 'f2-desc': 'One click to generate a new mailbox. No registration.',
            'f3-title': 'Real-time Polling', 'f3-desc': 'Messages appear instantly with auto-refresh.',
            'inbox-title': 'Your Mailboxes', 'add-mail-text': 'New Mail', 'empty-msg': 'Your inbox is empty.',
            'about-title': 'About Tamp Mail', 'about-p1': 'Tamp Mail is a free, secure service that provides temporary email addresses. We help you stay safe from spam and unwanted marketing emails.',
            'help-title': 'Help & Support'
        },
        hi: {
            'nav-home': 'होम', 'nav-inbox': 'इनबॉक्स', 'nav-about': 'हमारे बारे में', 'nav-help': 'सहायता',
            'hero-title': 'अस्थायी डिस्पोजेबल ईमेल',
            'hero-subtitle': 'अपनी गोपनीयता की रक्षा करें और अपने इनबॉक्स को साफ़ रखें।',
            'btn-get-started': 'शुरू करें',
            'f1-title': 'निजी रहें', 'f1-desc': 'अस्थायी पते का उपयोग करके स्पैम और ट्रैकिंग से बचें।',
            'f2-title': 'तेज़ और आसान', 'f2-desc': 'नया मेलबॉक्स बनाने के लिए एक क्लिक। कोई पंजीकरण नहीं।',
            'f3-title': 'रीयल-टाइम पोलिंग', 'f3-desc': 'ऑटो-रिफ्रेश के साथ संदेश तुरंत दिखाई देते हैं।',
            'inbox-title': 'आपके मेलबॉक्स', 'add-mail-text': 'नया मेल', 'empty-msg': 'आपका इनबॉक्स खाली है।',
            'about-title': 'Tamp Mail के बारे में', 'about-p1': 'Tamp Mail एक निःशुल्क, सुरक्षित सेवा है जो अस्थायी ईमेल पते प्रदान करती है। हम आपको स्पैम और अवांछित मार्केटिंग ईमेल से सुरक्षित रहने में मदद करते हैं।',
            'help-title': 'सहायता और समर्थन'
        }
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initSPA();
        this.loadAccounts();
        this.fetchDomains();
        this.startPolling();
        this.applyLanguage();
        this.initServiceWorker();
        this.renderAboutContent();
        this.renderHelpContent();
        this.showToast('Welcome to Tamp Mail!', 'info');
    },

    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker Registered'));
        }
    },

    renderAboutContent() {
        const teamGrid = document.querySelector('.team-grid');
        if (!teamGrid) return;
        teamGrid.innerHTML = `
            <div class="team-member glass">
                <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin">
                <h3>Admin <span class="badge">Pro</span></h3>
                <p>Lead Developer</p>
            </div>
            <div class="team-member glass">
                <img src="https://ui-avatars.com/api/?name=Support&background=random" alt="Support">
                <h3>Support</h3>
                <p>Support & Design</p>
            </div>
        `;
    },

    renderHelpContent() {
        const helpContent = document.getElementById('help-content');
        if (!helpContent) return;
        helpContent.innerHTML = `
            <div class="faq-item">
                <h4>What is Temp Mail?</h4>
                <p>Temp mail is a temporary email address that expires after a certain period of time. It's used to avoid spam and protect your privacy.</p>
            </div>
            <div class="faq-item">
                <h4>How it works?</h4>
                <p>Simply click "Get Started", generate a new mail, and start receiving emails instantly.</p>
            </div>
        `;
    },

    cacheDOM() {
        this.sections = document.querySelectorAll('.spa-section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.menuToggle = document.getElementById('menu-toggle');
        this.navLinksContainer = document.getElementById('nav-links');
        this.toastContainer = document.getElementById('toast-container');
        this.btnGetStarted = document.getElementById('btn-get-started');
        this.btnAddMail = document.getElementById('btn-add-mail');
        this.mailboxList = document.getElementById('mailbox-list');
        this.emailList = document.getElementById('email-list');
        this.emptyInbox = document.getElementById('empty-inbox');
        this.progressBar = document.getElementById('refresh-progress');
        this.refreshBtn = document.getElementById('refresh-now-btn');
        this.emailModal = document.getElementById('email-modal');
        this.emailDetail = document.getElementById('email-detail');
        this.langToggle = document.getElementById('lang-toggle');
        this.qrModal = document.getElementById('qr-modal');
        this.qrImg = document.getElementById('qr-code-img');
    },

    bindEvents() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateTo(section);
                if (window.innerWidth <= 768) {
                    this.navLinksContainer.classList.remove('active');
                }
            });
        });

        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.navLinksContainer.classList.toggle('active');
            });
        }

        if (this.btnGetStarted) {
            this.btnGetStarted.addEventListener('click', () => {
                this.navigateTo('inbox');
            });
        }

        if (this.btnAddMail) {
            this.btnAddMail.addEventListener('click', () => this.createNewAccount());
        }

        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.syncInbox());
        }

        if (this.langToggle) {
            this.langToggle.addEventListener('click', () => this.toggleLanguage());
        }

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });
    },

    toggleLanguage() {
        this.state.lang = this.state.lang === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', this.state.lang);
        this.applyLanguage();
        this.showToast(this.state.lang === 'en' ? 'Language: English' : 'भाषा: हिंदी', 'info');
    },

    applyLanguage() {
        const trans = this.translations[this.state.lang];
        for (const key in trans) {
            const el = document.getElementById(key);
            if (el) el.textContent = trans[key];
        }
        document.documentElement.lang = this.state.lang;
    },

    async request(endpoint, options = {}) {
        const url = `${this.API_URL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (this.state.activeAccount && this.state.activeAccount.token) {
            headers['Authorization'] = `Bearer ${this.state.activeAccount.token}`;
        }
        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API Error');
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (err) {
            this.showToast(err.message, 'error');
            throw err;
        }
    },

    async fetchDomains() {
        try {
            const data = await this.request('/domains');
            this.state.domains = data['hydra:member'] || [];
        } catch (err) { console.error('Failed to fetch domains', err); }
    },

    async createNewAccount() {
        if (this.state.domains.length === 0) await this.fetchDomains();
        if (this.state.domains.length === 0) {
            this.showToast('No domains available', 'error');
            return;
        }
        const domain = this.state.domains[0].domain;
        const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);
        try {
            this.showToast(this.state.lang === 'en' ? 'Creating account...' : 'खाता बनाया जा रहा है...', 'info');
            const account = await this.request('/accounts', { method: 'POST', body: JSON.stringify({ address, password }) });
            const tokenData = await this.request('/token', { method: 'POST', body: JSON.stringify({ address, password }) });
            const newAccount = { id: account.id, address: account.address, token: tokenData.token, createdAt: new Date().toISOString() };
            this.state.accounts.push(newAccount);
            this.saveAccounts();
            this.setActiveAccount(newAccount);
            this.renderMailboxList();
            this.showToast(this.state.lang === 'en' ? 'Account created!' : 'खाता बन गया!', 'success');
        } catch (err) { console.error('Account creation failed', err); }
    },

    setActiveAccount(account) {
        this.state.activeAccount = account;
        this.renderMailboxList();
        this.state.messages = [];
        this.renderEmailList();
        this.syncInbox();
    },

    loadAccounts() {
        if (this.state.accounts.length > 0) {
            this.setActiveAccount(this.state.accounts[0]);
        }
    },

    saveAccounts() { localStorage.setItem('mail_accounts', JSON.stringify(this.state.accounts)); },

    renderMailboxList() {
        this.mailboxList.innerHTML = '';
        this.state.accounts.forEach(acc => {
            const div = document.createElement('div');
            div.className = `mailbox-item ${this.state.activeAccount && this.state.activeAccount.id === acc.id ? 'active' : ''}`;
            div.innerHTML = `
                <span class="acc-addr">${acc.address}</span>
                <div class="acc-actions">
                    <i class="fas fa-copy" onclick="App.copyToClipboard('${acc.address}')"></i>
                    <i class="fas fa-qrcode" onclick="App.showQR('${acc.address}')"></i>
                    <i class="fas fa-share-alt" onclick="App.shareAddress('${acc.address}')"></i>
                    <i class="fas fa-times delete-acc" data-id="${acc.id}"></i>
                </div>
            `;
            div.onclick = (e) => {
                if (e.target.classList.contains('delete-acc')) {
                    this.deleteAccount(acc.id);
                } else if (!e.target.classList.contains('fas')) {
                    this.setActiveAccount(acc);
                }
            };
            this.mailboxList.appendChild(div);
        });
    },

    deleteAccount(id) {
        this.state.accounts = this.state.accounts.filter(a => a.id !== id);
        this.saveAccounts();
        if (this.state.activeAccount && this.state.activeAccount.id === id) {
            this.state.activeAccount = this.state.accounts[0] || null;
            if (this.state.activeAccount) this.setActiveAccount(this.state.activeAccount);
        }
        this.renderMailboxList();
        this.renderEmailList();
    },

    async syncInbox() {
        if (!this.state.activeAccount) return;
        try {
            const data = await this.request('/messages');
            this.state.messages = data['hydra:member'] || [];
            this.renderEmailList();
            this.state.countdown = 10;
        } catch (err) { console.error('Sync failed', err); }
    },

    startPolling() {
        setInterval(() => {
            if (this.state.currentSection === 'inbox') {
                this.state.countdown--;
                if (this.state.countdown <= 0) {
                    this.syncInbox();
                }
                this.updateProgressBar();
            }
        }, 1000);
    },

    updateProgressBar() {
        if (this.progressBar) {
            const width = (10 - this.state.countdown) * 10;
            this.progressBar.style.setProperty('--progress-width', `${width}%`);
        }
    },

    renderEmailList() {
        this.emailList.innerHTML = '';
        if (this.state.messages.length === 0) {
            this.emptyInbox.classList.remove('hidden');
        } else {
            this.emptyInbox.classList.add('hidden');
            this.state.messages.forEach(msg => {
                const li = document.createElement('li');
                li.className = 'email-item glass';
                li.innerHTML = `
                    <div class="email-info">
                        <span class="email-sender">${msg.from.address}</span>
                        <span class="email-subject">${msg.subject}</span>
                    </div>
                    <span class="email-time">${new Date(msg.createdAt).toLocaleTimeString()}</span>
                `;
                li.onclick = () => this.showEmailDetail(msg.id);
                this.emailList.appendChild(li);
            });
        }
    },

    async showEmailDetail(id) {
        try {
            this.showToast(this.state.lang === 'en' ? 'Loading message...' : 'संदेश लोड हो रहा है...', 'info');
            const msg = await this.request(`/messages/${id}`);
            this.emailDetail.innerHTML = `
                <div class="email-detail-header">
                    <h2>${msg.subject}</h2>
                    <p><strong>From:</strong> ${msg.from.name || ''} &lt;${msg.from.address}&gt;</p>
                    <p><strong>Date:</strong> ${new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <hr>
                <div class="email-body">
                    <iframe sandbox="allow-popups allow-popups-to-escape-sandbox allow-forms" srcdoc="${this.sanitizeHTML(msg.html || msg.intro)}" frameborder="0" width="100%" height="400px"></iframe>
                </div>
                <div class="email-actions">
                     <button onclick="window.print()" class="btn-secondary"><i class="fas fa-print"></i> Print</button>
                </div>
                ${msg.attachments.length > 0 ? `
                    <div class="attachments">
                        <h3>Attachments</h3>
                        <ul>
                            ${msg.attachments.map(a => `<li><a href="#" onclick="App.downloadAttachment('${msg.id}', '${a.id}', '${a.filename}')">${a.filename} (${(a.size/1024).toFixed(1)} KB)</a></li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            `;
            this.emailModal.classList.remove('hidden');
        } catch (err) { console.error('Failed to load email detail', err); }
    },

    async downloadAttachment(msgId, attId, filename) {
        try {
            const response = await fetch(`${this.API_URL}/messages/${msgId}/attachments/${attId}`, {
                headers: { 'Authorization': `Bearer ${this.state.activeAccount.token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) { this.showToast('Download failed', 'error'); }
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(this.state.lang === 'en' ? 'Copied to clipboard!' : 'क्लिपबोर्ड पर कॉपी किया गया!', 'success');
        });
    },

    showQR(text) {
        this.qrImg.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}" alt="QR Code">`;
        this.qrModal.classList.remove('hidden');
    },

    async shareAddress(text) {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'My Temporary Email', text: text });
            } catch (err) { console.error('Share failed', err); }
        } else {
            this.copyToClipboard(text);
        }
    },

    sanitizeHTML(html) {
        if (Array.isArray(html)) html = html.join('');
        return html.replace(/"/g, '&quot;');
    },

    initSPA() {
        const hash = window.location.hash.replace('#', '') || 'home';
        this.navigateTo(hash);
    },

    navigateTo(sectionId) {
        if (!document.getElementById(sectionId)) return;
        this.state.currentSection = sectionId;
        window.location.hash = sectionId;
        this.sections.forEach(sec => sec.classList.toggle('hidden', sec.id !== sectionId));
        this.navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-section') === sectionId));
        window.scrollTo(0, 0);
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
};

window.App = App;
window.onload = () => App.init();
