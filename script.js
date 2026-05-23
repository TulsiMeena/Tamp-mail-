const API_URL = 'https://api.mail.tm';

const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    accent: localStorage.getItem('mail_accent') || '#4a90e2',
    accounts: JSON.parse(localStorage.getItem('mail_accounts') || '[]'),
    activeAccountIndex: 0,
    domains: [],
    pollingInterval: null,
    timeLeft: 10
};

const translations = {
    en: {
        'hero-title': 'Your Temporary Email Address',
        'hero-subtitle': 'Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.',
        'stat-privacy-title': 'Privacy',
        'stat-privacy-desc': 'No registration required.',
        'stat-speed-title': 'Speed',
        'stat-speed-desc': 'Instant address generation.',
        'stat-disposable-title': 'Disposable',
        'stat-disposable-desc': 'Auto-delete messages.',
        'inbox-title': 'Your Inbox',
        'refresh-text': 'Refreshing in',
        'btn-refresh-text': 'Refresh Now',
        'btn-add-mail': 'Add Mailbox',
        'empty-msg': 'Your inbox is empty',
        'about-title': 'About Us',
        'faq-title': 'Frequently Asked Questions',
        'glos-title': 'Privacy Glossary',
        'help-title': 'User Guide',
        'loading': 'Loading...',
        'creating': 'Creating...',
        'copied': 'Copied to clipboard!',
        'error-api': 'API Error. Please try again.',
        'refresh-status': 'Refreshing in 10s'
    },
    hi: {
        'hero-title': 'आपका अस्थायी ईमेल पता',
        'hero-subtitle': 'स्पैम, विज्ञापन मेलिंग, हैकिंग और हमला करने वाले रोबोट के बारे में भूल जाएं। अपने वास्तविक मेलबॉक्स को साफ और सुरक्षित रखें।',
        'stat-privacy-title': 'गोपनीयता',
        'stat-privacy-desc': 'कोई पंजीकरण आवश्यक नहीं है।',
        'stat-speed-title': 'गति',
        'stat-speed-desc': 'तत्काल पता जनरेशन।',
        'stat-disposable-title': 'डिस्पोजेबल',
        'stat-disposable-desc': 'संदेश स्वतः हटाएं।',
        'inbox-title': 'आपका इनबॉक्स',
        'refresh-text': 'ताज़ा हो रहा है',
        'btn-refresh-text': 'अभी ताज़ा करें',
        'btn-add-mail': 'मेलबॉक्स जोड़ें',
        'empty-msg': 'आपका इनबॉक्स खाली है',
        'about-title': 'हमारे बारे में',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'glos-title': 'गोपनीयता शब्दावली',
        'help-title': 'उपयोगकर्ता मार्गदर्शिका',
        'loading': 'लोड हो रहा है...',
        'creating': 'बना रहा है...',
        'copied': 'क्लिपबोर्ड पर कॉपी किया गया!',
        'error-api': 'API त्रुटि। कृपया पुनः प्रयास करें।',
        'refresh-status': '10s में ताज़ा हो रहा है'
    }
};

// --- Account & Domain Logic ---
async function fetchDomains() {
    try {
        const data = await request('/domains');
        state.domains = data['hydra:member'] || [];
        if (state.domains.length === 0) {
            // Fallback
            state.domains = [{ domain: 'tempmail.com' }];
        }
        return state.domains;
    } catch (err) {
        console.error('Failed to fetch domains', err);
        state.domains = [{ domain: 'tempmail.com' }];
        return state.domains;
    }
}

async function createAccount() {
    if (state.domains.length === 0) await fetchDomains();

    const domain = state.domains[0].domain;
    const username = Math.random().toString(36).substring(2, 12);
    const password = Math.random().toString(36).substring(2, 12);
    const address = `${username}@${domain}`;

    try {
        const account = await request('/accounts', {
            method: 'POST',
            body: JSON.stringify({ address, password })
        });

        const tokenData = await request('/token', {
            method: 'POST',
            body: JSON.stringify({ address, password })
        });

        const newAccount = {
            id: account.id,
            address: address,
            password: password,
            token: tokenData.token,
            createdAt: new Date().toISOString()
        };

        state.accounts.push(newAccount);
        state.activeAccountIndex = state.accounts.length - 1;
        saveAccounts();
        updateUI();
        return newAccount;
    } catch (err) {
        showToast(translations[state.lang]['error-api'], 'error');
    }
}

function saveAccounts() {
    localStorage.setItem('mail_accounts', JSON.stringify(state.accounts));
}

function updateUI() {
    const emailInput = document.getElementById('temp-email');
    if (state.accounts.length > 0) {
        emailInput.value = state.accounts[state.activeAccountIndex].address;
    } else {
        emailInput.value = '';
        emailInput.placeholder = translations[state.lang]['loading'];
    }
    renderTabs();
}

// --- Polling Logic ---
function startPolling() {
    if (state.pollingInterval) clearInterval(state.pollingInterval);
    state.timeLeft = 10;
    updateTimerUI();

    state.pollingInterval = setInterval(() => {
        state.timeLeft--;
        if (state.timeLeft <= 0) {
            fetchMessages();
            state.timeLeft = 10;
        }
        updateTimerUI();
    }, 1000);
}

function updateTimerUI() {
    const timerEl = document.getElementById('timer');
    const progressEl = document.getElementById('poll-progress');
    const refreshTextEl = document.getElementById('refresh-text');

    if (timerEl) timerEl.textContent = `${state.timeLeft}s`;

    const progress = ((10 - state.timeLeft) / 10) * 100;
    document.documentElement.style.setProperty('--progress-width', `${progress}%`);

    // update status if needed
}

async function fetchMessages() {
    if (state.accounts.length === 0) return;
    try {
        const data = await request('/messages');
        renderMessages(data['hydra:member'] || []);
    } catch (err) {
        console.error('Failed to fetch messages', err);
    }
}

function renderMessages(messages) {
    const listEl = document.getElementById('message-list');
    if (messages.length === 0) {
        listEl.innerHTML = `
            <div class="empty-inbox">
                <i class="fas fa-inbox"></i>
                <p id="empty-msg">${translations[state.lang]['empty-msg']}</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = messages.map(msg => `
        <div class="message-item ${msg.seen ? '' : 'unread'}" onclick="viewMessage('${msg.id}')">
            <div class="msg-from"><strong>${msg.from.name || ''}</strong> &lt;${msg.from.address}&gt;</div>
            <div class="msg-subject">${msg.subject}</div>
            <div class="msg-date">${new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
    `).join('');
}

async function viewMessage(id) {
    try {
        const msg = await request(`/messages/${id}`);

        document.getElementById('email-detail-subject').textContent = msg.subject;
        document.getElementById('email-detail-from').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
        document.getElementById('email-detail-date').textContent = new Date(msg.createdAt).toLocaleString();

        const iframe = document.getElementById('email-body-frame');
        const content = msg.html || msg.text || '';
        iframe.srcdoc = Array.isArray(content) ? content.join('') : content;

        // Mark as seen
        if (!msg.seen) {
            await request(`/messages/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ seen: true })
            });
            fetchMessages();
        }

        document.getElementById('email-modal').classList.remove('hidden');
    } catch (err) {
        showToast('Could not load email', 'error');
    }
}

function renderTabs() {
    const tabsEl = document.getElementById('mailbox-tabs');
    if (!tabsEl) return;

    tabsEl.innerHTML = state.accounts.map((acc, index) => `
        <div class="mailbox-tab ${index === state.activeAccountIndex ? 'active' : ''}" onclick="switchAccount(${index})">
            <span>${acc.address}</span>
            <i class="fas fa-times" onclick="deleteAccount(event, ${index})"></i>
        </div>
    `).join('');
}

function switchAccount(index) {
    state.activeAccountIndex = index;
    updateUI();
    fetchMessages();
    startPolling();
}

function deleteAccount(event, index) {
    event.stopPropagation();
    state.accounts.splice(index, 1);
    if (state.activeAccountIndex >= state.accounts.length) {
        state.activeAccountIndex = Math.max(0, state.accounts.length - 1);
    }
    saveAccounts();
    updateUI();
    if (state.accounts.length === 0) {
        createAccount();
    } else {
        fetchMessages();
    }
}

// --- API Helpers ---
async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (state.accounts[state.activeAccountIndex]?.token) {
        headers['Authorization'] = `Bearer ${state.accounts[state.activeAccountIndex].token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API Request Failed');
        }
        if (response.status === 204) return null;
        return await response.json();
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// --- UI Helpers ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function applyLanguage() {
    const lang = state.lang;
    document.documentElement.lang = lang;
    for (const [id, text] of Object.entries(translations[lang])) {
        const el = document.getElementById(id);
        if (el) {
            // Special handling for buttons with icons
            if (el.querySelector('i')) {
                const icon = el.querySelector('i').outerHTML;
                el.innerHTML = `${icon} ${text}`;
            } else {
                el.textContent = text;
            }
        }
    }
    updateStaticContent();
}

function updateStaticContent() {
    const lang = state.lang;

    // About Section
    const aboutGrid = document.getElementById('about-content');
    if (aboutGrid) {
        const devName = lang === 'hi' ? 'अमन मीणा (प्रो)' : 'Aman Meena (Pro)';
        const devDesc = lang === 'hi' ? 'फुल-स्टैक डेवलपर और सुरक्षा उत्साही।' : 'Full-stack developer and security enthusiast.';

        aboutGrid.innerHTML = `
            <div class="stat-card">
                <img src="https://github.com/aman-meena.png" alt="Aman" style="width: 100px; border-radius: 50%; margin-bottom: 15px;">
                <h3>${devName}</h3>
                <p>${devDesc}</p>
                <div style="margin-top: 15px;">
                    <a href="https://github.com/aman-meena" target="_blank" style="color: var(--primary);"><i class="fab fa-github"></i></a>
                </div>
            </div>
            <div class="stat-card">
                <img src="https://github.com/amit-meena.png" alt="Amit" style="width: 100px; border-radius: 50%; margin-bottom: 15px;">
                <h3>Amit Meena</h3>
                <p>${lang === 'hi' ? 'सह-संस्थापक और यूआई डिजाइनर।' : 'Co-founder and UI Designer.'}</p>
            </div>
        `;
    }

    // FAQ Section
    const faqList = document.getElementById('faq-list');
    if (faqList) {
        const faqs = lang === 'en' ? [
            { q: 'What is Temp Mail?', a: 'Temp Mail is a free service that provides you with a temporary email address. It helps protect your real email from spam.' },
            { q: 'Is it free?', a: 'Yes, it is completely free to use.' },
            { q: 'How long do emails stay?', a: 'Emails are kept for a limited time and then automatically deleted.' }
        ] : [
            { q: 'अस्थायी मेल क्या है?', a: 'अस्थायी मेल एक मुफ्त सेवा है जो आपको एक अस्थायी ईमेल पता प्रदान करती है। यह आपके वास्तविक ईमेल को स्पैम से बचाने में मदद करता है।' },
            { q: 'क्या यह मुफ़्त है?', a: 'हाँ, यह उपयोग करने के लिए पूरी तरह से मुफ़्त है।' },
            { q: 'ईमेल कितने समय तक रहते हैं?', a: 'ईमेल एक सीमित समय के लिए रखे जाते हैं और फिर स्वचालित रूप से हटा दिए जाते हैं।' }
        ];

        faqList.innerHTML = faqs.map(f => `
            <div class="faq-item" style="margin-bottom: 20px; background: var(--glass-bg); padding: 20px; border-radius: 10px;">
                <h4>${f.q}</h4>
                <p style="color: var(--text-dim); margin-top: 10px;">${f.a}</p>
            </div>
        `).join('');
    }

    // Glossary
    const glossaryGrid = document.getElementById('glossary-content');
    if (glossaryGrid) {
        const terms = lang === 'en' ? [
            { t: 'Disposable Email', d: 'An email address used for a short period of time.' },
            { t: 'Encryption', d: 'Protecting information by converting it into code.' }
        ] : [
            { t: 'डिस्पोजेबल ईमेल', d: 'एक ईमेल पता जो थोड़े समय के लिए उपयोग किया जाता है।' },
            { t: 'एन्क्रिप्शन', d: 'सूचना को कोड में बदलकर सुरक्षित करना।' }
        ];

        glossaryGrid.innerHTML = terms.map(t => `
            <div style="background: var(--glass-bg); padding: 15px; border-radius: 10px;">
                <strong>${t.t}</strong>
                <p style="font-size: 0.9rem; color: var(--text-dim);">${t.d}</p>
            </div>
        `).join('');
    }

    // Help Modal
    const helpContent = document.getElementById('help-content');
    if (helpContent) {
        helpContent.innerHTML = lang === 'en' ? `
            <p>1. Copy your temp email from the home screen.</p>
            <p>2. Use it for registration on websites.</p>
            <p>3. Check the "Inbox" section for incoming emails.</p>
        ` : `
            <p>1. होम स्क्रीन से अपना अस्थायी ईमेल कॉपी करें।</p>
            <p>2. वेबसाइटों पर पंजीकरण के लिए इसका उपयोग करें।</p>
            <p>3. आने वाले ईमेल के लिए "इनबॉक्स" अनुभाग देखें।</p>
        `;
    }
}

function initTheme() {
    document.body.setAttribute('data-theme', state.theme);
    document.documentElement.style.setProperty('--primary', state.accent);
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// --- Navigation ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.spa-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => {
                if (s.id === `${targetSection}-section`) {
                    s.classList.remove('hidden');
                } else {
                    s.classList.add('hidden');
                }
            });

            // Close mobile menu
            document.getElementById('nav-links').classList.remove('active');
        });
    });

    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('active');
    });
}

// --- Modal Handlers ---
function setupModals() {
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.modal').classList.add('hidden');
        };
    });

    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.add('hidden');
        }
    };
}

// --- Initialization ---
window.onload = async () => {
    // Register SW
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW failed', err));
    }

    initTheme();
    applyLanguage();
    setupNavigation();
    setupModals();

    if (state.accounts.length === 0) {
        await createAccount();
    } else {
        updateUI();
    }

    startPolling();

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('mail_theme', state.theme);
        initTheme();
    });

    // Lang toggle
    document.getElementById('lang-toggle').addEventListener('click', () => {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', state.lang);
        applyLanguage();
    });

    document.getElementById('help-link').onclick = (e) => {
        e.preventDefault();
        document.getElementById('help-modal').classList.remove('hidden');
    };

    // Action Buttons
    document.getElementById('copy-email-btn').onclick = () => {
        const email = document.getElementById('temp-email').value;
        navigator.clipboard.writeText(email);
        showToast(translations[state.lang]['copied'], 'success');
    };

    document.getElementById('refresh-email-btn').onclick = () => createAccount();
    document.getElementById('add-mailbox-btn').onclick = () => createAccount();
    document.getElementById('refresh-now-btn').onclick = () => fetchMessages();

    document.getElementById('qr-email-btn').onclick = () => {
        const email = document.getElementById('temp-email').value;
        const qrImg = document.getElementById('qr-code-img');
        const qrText = document.getElementById('qr-email-text');

        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}`;
        qrText.textContent = email;
        document.getElementById('qr-modal').classList.remove('hidden');
    };

    console.log('App initialized');
};
