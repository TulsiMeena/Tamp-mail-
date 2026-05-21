const App = {
    translations: {
        en: {
            'nav-home': 'Home',
            'nav-inbox': 'Inbox',
            'nav-about': 'About',
            'nav-privacy': 'Privacy',
            'hero-title': 'Temporary Email, Real Privacy',
            'hero-subtitle': 'Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.',
            'get-started-btn': 'Get Started',
            'stat-emails-text': 'Emails Received',
            'stat-time-text': 'Time Saved',
            'how-it-works-title': 'How It Works',
            's1-title': 'Generate',
            's1-desc': 'Instant temporary email address generation.',
            's2-title': 'Receive',
            's2-desc': 'Receive emails instantly with auto-refresh.',
            's3-title': 'Destroy',
            's3-desc': 'Data is automatically purged after 24 hours.',
            'reviews-title': 'User Reviews & Feedback',
            'inbox-title': 'Your Temporary Inbox',
            'btn-add-mail': 'New Mailbox',
            'refresh-status': 'Auto-refreshing in 10s',
            'no-emails-msg': 'No emails yet. Waiting for incoming messages...',
            'about-title': 'About Us',
            'dev-aman-bio': 'Passionate developer focused on privacy tools.',
            'dev-amit-bio': 'Building secure and user-friendly web apps.',
            'privacy-title': 'Privacy & Security',
            'glos-title': 'Privacy Glossary',
            'glos-temp-title': 'Disposable Email',
            'glos-temp-desc': 'Temporary address that expires after use or a set period.',
            'glos-enc-title': 'Encryption',
            'glos-enc-desc': 'Securing data so only authorized parties can read it.',
            'glos-spam-title': 'Anti-Spam',
            'glos-spam-desc': 'Tools designed to prevent unsolicited bulk messages.'
        },
        hi: {
            'nav-home': 'होम',
            'nav-inbox': 'इनबॉक्स',
            'nav-about': 'हमारे बारे में',
            'nav-privacy': 'गोपनीयता',
            'hero-title': 'अस्थायी ईमेल, वास्तविक गोपनीयता',
            'hero-subtitle': 'स्पैम, विज्ञापन मेलिंग, हैकिंग और हमलावर रोबोट के बारे में भूल जाएं। अपने असली मेलबॉक्स को साफ और सुरक्षित रखें।',
            'get-started-btn': 'शुरू करें',
            'stat-emails-text': 'प्राप्त ईमेल',
            'stat-time-text': 'बचाया गया समय',
            'how-it-works-title': 'यह कैसे काम करता है',
            's1-title': 'जेनरेट करें',
            's1-desc': 'तत्काल अस्थायी ईमेल पता जनरेशन।',
            's2-title': 'प्राप्त करें',
            's2-desc': 'ऑटो-रिफ्रेश के साथ तुरंत ईमेल प्राप्त करें।',
            's3-title': 'नष्ट करें',
            's3-desc': 'डेटा 24 घंटे के बाद स्वचालित रूप से हटा दिया जाता है।',
            'reviews-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
            'inbox-title': 'आपका अस्थायी इनबॉक्स',
            'btn-add-mail': 'नया मेलबॉक्स',
            'refresh-status': '10s में ऑटो-रिफ्रेश हो रहा है',
            'no-emails-msg': 'अभी तक कोई ईमेल नहीं। आने वाले संदेशों की प्रतीक्षा कर रहा है...',
            'about-title': 'हमारे बारे में',
            'dev-aman-bio': 'गोपनीयता टूल पर केंद्रित उत्साही डेवलपर।',
            'dev-amit-bio': 'सुरक्षित और उपयोगकर्ता के अनुकूल वेब ऐप बनाना।',
            'privacy-title': 'गोपनीयता और सुरक्षा',
            'glos-title': 'गोपनीयता शब्दावली',
            'glos-temp-title': 'डिस्पोजेबल ईमेल',
            'glos-temp-desc': 'अस्थायी पता जो उपयोग या एक निश्चित अवधि के बाद समाप्त हो जाता है।',
            'glos-enc-title': 'एन्क्रिप्शन',
            'glos-enc-desc': 'डेटा को सुरक्षित करना ताकि केवल अधिकृत पक्ष ही इसे पढ़ सकें।',
            'glos-spam-title': 'एंटी-स्पैम',
            'glos-spam-desc': 'अवांछित थोक संदेशों को रोकने के लिए डिज़ाइन किए गए टूल।'
        }
    },
    state: {
        lang: 'en',
        currentSection: 'home',
        mailboxes: [],
        currentMailbox: null,
        emails: [],
        stats: {
            emailsReceived: 0,
            timeSaved: 0
        },
        refreshSeconds: 10
    },

    api: {
        base: 'https://api.mail.tm',
        async request(endpoint, options = {}) {
            const res = await fetch(`${this.base}${endpoint}`, options);
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'API Error' }));
                throw new Error(err.message || res.statusText);
            }
            return res.json();
        },
        async getDomains() {
            const data = await this.request('/domains');
            return data['hydra:member'];
        },
        async createAccount(address, password) {
            return this.request('/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });
        },
        async getToken(address, password) {
            return this.request('/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, password })
            });
        },
        async getMessages(token) {
            const data = await this.request('/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return data['hydra:member'];
        },
        async getMessage(id, token) {
            return this.request(`/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    },

    init() {
        this.loadState();
        this.bindEvents();
        this.applyTheme();
        this.render();
        this.startPolling();
    },

    loadState() {
        const saved = localStorage.getItem('temp_mail_state');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
    },

    saveState() {
        localStorage.setItem('temp_mail_state', JSON.stringify(this.state));
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.switchSection(section);

                // Close mobile menu if open
                document.getElementById('nav-links').classList.remove('active');
            });
        });

        // Mobile Menu
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        // Get Started
        document.getElementById('get-started-btn').addEventListener('click', () => {
            this.switchSection('inbox');
            if (this.state.mailboxes.length === 0) {
                this.createNewMailbox();
            }
        });

        // Add Mailbox
        document.getElementById('add-mailbox-btn').addEventListener('click', () => {
            this.createNewMailbox();
        });

        // Refresh Now
        document.getElementById('refresh-now-btn').addEventListener('click', () => {
            this.state.refreshSeconds = 0;
            this.updatePolling();
        });

        // Theme switching
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.getAttribute('data-color');
                this.setTheme(color);

                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Language toggle
        document.getElementById('lang-toggle').addEventListener('click', () => {
            this.state.lang = this.state.lang === 'en' ? 'hi' : 'en';
            this.applyLanguage();
            this.saveState();
        });

        // Close Modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('email-modal').classList.add('hidden');
        });

        // Print Email
        document.getElementById('print-email-btn').addEventListener('click', () => {
            const frame = document.getElementById('email-frame');
            frame.contentWindow.print();
        });

        // Backup
        document.getElementById('backup-btn').addEventListener('click', () => {
            const data = JSON.stringify(this.state.mailboxes);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `temp_mail_backup_${new Date().getTime()}.json`;
            a.click();
            this.showToast('Backup downloaded!', 'success');
        });

        // Restore
        document.getElementById('restore-btn').addEventListener('click', () => {
            document.getElementById('restore-input').click();
        });

        document.getElementById('restore-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const mailboxes = JSON.parse(event.target.result);
                    if (Array.isArray(mailboxes)) {
                        this.state.mailboxes = mailboxes;
                        this.state.currentMailbox = mailboxes[0] || null;
                        this.saveState();
                        this.renderMailboxes();
                        this.showToast('Restored successfully!', 'success');
                    }
                } catch (err) {
                    this.showToast('Invalid backup file.', 'error');
                }
            };
            reader.readAsText(file);
        });
    },

    switchSection(sectionId) {
        this.state.currentSection = sectionId;

        document.querySelectorAll('.spa-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        this.saveState();
    },

    setTheme(color) {
        document.documentElement.style.setProperty('--primary', color);
        localStorage.setItem('mail_accent', color);
    },

    applyTheme() {
        const savedColor = localStorage.getItem('mail_accent');
        if (savedColor) {
            this.setTheme(savedColor);
            document.querySelectorAll('.theme-btn').forEach(btn => {
                if (btn.getAttribute('data-color') === savedColor) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    async createNewMailbox() {
        try {
            this.showToast('Generating new mailbox...', 'info');
            const domains = await this.api.getDomains();
            const domain = domains[0].domain;
            const user = Math.random().toString(36).substring(2, 10);
            const address = `${user}@${domain}`;
            const password = Math.random().toString(36).substring(2, 15);

            const account = await this.api.createAccount(address, password);
            const tokenData = await this.api.getToken(address, password);

            const newMailbox = {
                id: account.id,
                address: address,
                password: password,
                token: tokenData.token,
                createdAt: new Date().toISOString()
            };

            this.state.mailboxes.push(newMailbox);
            this.state.currentMailbox = newMailbox;
            this.saveState();
            this.renderMailboxes();
            this.showToast('New mailbox created!', 'success');
            this.fetchEmails();
        } catch (error) {
            console.error(error);
            this.showToast('Failed to create mailbox.', 'error');
        }
    },

    async fetchEmails() {
        if (!this.state.currentMailbox) return;

        try {
            const messages = await this.api.getMessages(this.state.currentMailbox.token);
            this.state.emails = messages;
            this.renderEmails();
        } catch (error) {
            console.error(error);
        }
    },

    startPolling() {
        setInterval(() => {
            if (this.state.currentSection === 'inbox') {
                this.updatePolling();
            }
        }, 1000);
    },

    updatePolling() {
        if (this.state.refreshSeconds > 0) {
            this.state.refreshSeconds--;
        } else {
            this.state.refreshSeconds = 10;
            this.fetchEmails();
        }
        this.renderPolling();
    },

    renderPolling() {
        const progress = (this.state.refreshSeconds / 10) * 100;
        document.querySelector('.progress-bar').style.setProperty('--progress-width', `${progress}%`);

        let text = this.translations[this.state.lang]['refresh-status'];
        text = text.replace('10s', `${this.state.refreshSeconds}s`);
        document.getElementById('refresh-status').textContent = text;
    },

    applyLanguage() {
        const trans = this.translations[this.state.lang];
        Object.keys(trans).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'A') {
                    el.textContent = trans[id];
                } else if (el.tagName === 'BUTTON') {
                    // Check if it has an icon
                    const icon = el.querySelector('i');
                    if (icon) {
                        const span = el.querySelector('span');
                        if (span) {
                            span.textContent = trans[id];
                        } else {
                            el.textContent = trans[id];
                            el.prepend(icon);
                        }
                    } else {
                        el.textContent = trans[id];
                    }
                } else {
                    el.textContent = trans[id];
                }
            }
        });
        document.getElementById('lang-toggle').textContent = this.state.lang === 'en' ? 'Hindi' : 'English';
        document.documentElement.lang = this.state.lang;
    },

    renderMailboxes() {
        const list = document.getElementById('mailbox-list');
        list.innerHTML = '';
        this.state.mailboxes.forEach(mb => {
            const card = document.createElement('div');
            card.className = `mailbox-card ${this.state.currentMailbox?.id === mb.id ? 'active' : ''}`;
            card.innerHTML = `
                <div class="mb-info">
                    <p class="mb-address">${mb.address}</p>
                </div>
                <div class="mb-actions">
                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${mb.address}')"><i class="fas fa-copy"></i></button>
                    <button class="delete-mb-btn" data-id="${mb.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                this.state.currentMailbox = mb;
                this.renderMailboxes();
                this.fetchEmails();
            });
            list.appendChild(card);
        });

        // Delete button listener
        document.querySelectorAll('.delete-mb-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                this.state.mailboxes = this.state.mailboxes.filter(m => m.id !== id);
                if (this.state.currentMailbox?.id === id) {
                    this.state.currentMailbox = this.state.mailboxes[0] || null;
                }
                this.saveState();
                this.renderMailboxes();
                this.fetchEmails();
            });
        });
    },

    renderEmails() {
        const container = document.getElementById('email-list');
        if (this.state.emails.length === 0) {
            container.innerHTML = `
                <div class="empty-inbox">
                    <i class="fas fa-envelope-open-text"></i>
                    <p id="no-emails-msg">No emails yet. Waiting for incoming messages...</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.state.emails.forEach(email => {
            const div = document.createElement('div');
            div.className = 'email-item';
            div.innerHTML = `
                <div class="email-sender">${email.from.address}</div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-date">${new Date(email.createdAt).toLocaleTimeString()}</div>
            `;
            div.addEventListener('click', () => this.openEmail(email.id));
            container.appendChild(div);
        });
    },

    async openEmail(id) {
        try {
            const email = await this.api.getMessage(id, this.state.currentMailbox.token);
            document.getElementById('modal-subject').textContent = email.subject;
            document.getElementById('modal-from').textContent = email.from.address;
            document.getElementById('modal-date').textContent = new Date(email.createdAt).toLocaleString();

            const frame = document.getElementById('email-frame');
            frame.srcdoc = email.html || email.text;

            document.getElementById('email-modal').classList.remove('hidden');
        } catch (error) {
            this.showToast('Failed to load email.', 'error');
        }
    },

    render() {
        document.getElementById('stat-emails').textContent = this.state.stats.emailsReceived;
        document.getElementById('stat-time').textContent = `${this.state.stats.timeSaved}h`;
        this.applyLanguage();
        this.renderMailboxes();
        this.renderPolling();
    }
};

window.App = App;
window.onload = () => {
    App.init();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Failed', err));
    }
};
