/**
 * TempMail Pro - Core Logic
 */

const API_BASE = 'https://api.mail.tm';

const state = {
    account: null,
    accounts: [],
    domains: [],
    messages: [],
    selectedMessage: null,
    lang: 'en',
    theme: 'dark',
    accent: '#3498db',
    refreshTimer: null,
    refreshSeconds: 7,
    stats: {
        totalReceived: 0,
        timeSaved: 0
    },
    prefs: {
        sounds: true,
        confetti: true
    }
};

const translations = {
    en: {
        'hero-title': 'Protect Your Privacy with TempMail Pro',
        'hero-subtitle': 'Fast, secure, and disposable temporary email for all your needs.',
        'gen-btn-text': 'Generate New Mail',
        'go-inbox-btn': 'View My Inbox',
        'stat-emails-label': 'Emails Received',
        'stat-time-label': 'Time Saved',
        'stat-privacy-label': 'Privacy Protected',
        'what-is-title': 'What is Temp Mail?',
        'what-is-desc': 'Disposable email address is a service that allows a registered user to receive email at a temporary address that expires after a certain time period.',
        'f1-title': 'Instant Setup',
        'f1-desc': 'Generate an email address in seconds without any registration.',
        'f2-title': 'Anonymity',
        'f2-desc': 'Your personal data is never required, keeping you anonymous.',
        'f3-title': 'Auto-Purge',
        'f3-desc': 'Emails are automatically deleted after they reach their expiry.',
        'reviews-title': 'User Reviews & Feedback',
        'inbox-title': 'Your Inbox',
        'refresh_status': 'Checking in 7s',
        'select-mail-msg': 'Select an email to read its content',
        'about-title': 'About Us',
        'role-aman': 'Lead Developer',
        'role-amit': 'UI/UX Designer',
        'privacy-title': 'Privacy Policy',
        'privacy-intro': 'Your privacy is our priority. We do not store any logs or personal information.',
        'glos-title': 'Privacy Glossary',
        'glos-temp-t': 'Disposable:',
        'glos-temp-d': 'Designed to be used once or for a short time and then thrown away.',
        'glos-aes-t': 'Encryption:',
        'glos-aes-d': 'The process of converting information or data into a code.',
        'faq-title': 'Frequently Asked Questions',
        'help-title': 'Help & Support',
        'help-guide-text': 'Learn how to make the most of TempMail Pro.',
        'backup-desc': 'Export your mailboxes to a file or restore them later.',
        'pref-sounds': 'Notification Sounds',
        'pref-confetti': 'Confetti Effects',
        'pref-accent': 'Accent Color',
        'modal-guide-title': 'How to use TempMail Pro',
        's1': 'Click \'Generate New Mail\' to create a unique address.',
        's2': 'Use the address to sign up on any website.',
        's3': 'Watch your inbox for incoming emails instantly.',
        'skill1': 'Frontend',
        'skill2': 'API Design',
        'skill3': 'PWA'
    },
    hi: {
        'hero-title': 'TempMail Pro के साथ अपनी गोपनीयता की रक्षा करें',
        'hero-subtitle': 'आपकी सभी आवश्यकताओं के लिए तेज़, सुरक्षित और डिस्पोजेबल अस्थायी ईमेल।',
        'gen-btn-text': 'नया मेल जेनरेट करें',
        'go-inbox-btn': 'मेरा इनबॉक्स देखें',
        'stat-emails-label': 'प्राप्त ईमेल',
        'stat-time-label': 'समय बचाया',
        'stat-privacy-label': 'गोपनीयता सुरक्षित',
        'what-is-title': 'टेम्प मेल क्या है?',
        'what-is-desc': 'डिस्पोजेबल ईमेल पता एक ऐसी सेवा है जो एक पंजीकृत उपयोगकर्ता को एक अस्थायी पते पर ईमेल प्राप्त करने की अनुमति देती है जो एक निश्चित समय के बाद समाप्त हो जाती है।',
        'f1-title': 'त्वरित सेटअप',
        'f1-desc': 'बिना किसी पंजीकरण के सेकंडों में ईमेल पता जेनरेट करें।',
        'f2-title': 'अनामिकता',
        'f2-desc': 'आपके व्यक्तिगत डेटा की कभी आवश्यकता नहीं होती, जिससे आप गुमनाम रहते हैं।',
        'f3-title': 'ऑटो-पर्ज',
        'f3-desc': 'ईमेल अपनी समाप्ति अवधि तक पहुंचने के बाद स्वचालित रूप से हटा दिए जाते हैं।',
        'reviews-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
        'inbox-title': 'आपका इनबॉक्स',
        'refresh_status': '7s में जाँच कर रहे हैं',
        'select-mail-msg': 'सामग्री पढ़ने के लिए एक ईमेल चुनें',
        'about-title': 'हमारे बारे में',
        'role-aman': 'लीड डेवलपर',
        'role-amit': 'UI/UX डिज़ाइनर',
        'privacy-title': 'गोपनीयता नीति',
        'privacy-intro': 'आपकी गोपनीयता हमारी प्राथमिकता है। हम कोई लॉग या व्यक्तिगत जानकारी संग्रहीत नहीं करते हैं।',
        'glos-title': 'गोपनीयता शब्दावली',
        'glos-temp-t': 'डिस्पोजेबल:',
        'glos-temp-d': 'एक बार या थोड़े समय के लिए उपयोग किए जाने और फिर फेंक दिए जाने के लिए डिज़ाइन किया गया।',
        'glos-aes-t': 'एन्क्रिप्शन:',
        'glos-aes-d': 'जानकारी या डेटा को कोड में बदलने की प्रक्रिया।',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'help-title': 'सहायता और समर्थन',
        'help-guide-text': 'जानें कि TempMail Pro का अधिकतम लाभ कैसे उठाया जाए।',
        'backup-desc': 'अपने मेलबॉक्स को फ़ाइल में निर्यात करें या बाद में उन्हें पुनर्स्थापित करें।',
        'pref-sounds': 'सूचना ध्वनियाँ',
        'pref-confetti': 'कन्फ़ेट्टी प्रभाव',
        'pref-accent': 'एक्सेंट रंग',
        'modal-guide-title': 'TempMail Pro का उपयोग कैसे करें',
        's1': 'एक अद्वितीय पता बनाने के लिए \'नया मेल जेनरेट करें\' पर क्लिक करें।',
        's2': 'किसी भी वेबसाइट पर साइन अप करने के लिए पते का उपयोग करें।',
        's3': 'आने वाले ईमेल के लिए तुरंत अपना इनबॉक्स देखें।',
        'skill1': 'फ़्रंटएंड',
        'skill2': 'API डिज़ाइन',
        'skill3': 'PWA'
    }
};

const faqs = [
    { q: "Is this service free?", a: "Yes, TempMail Pro is completely free to use." },
    { q: "How long do emails last?", a: "Emails are kept for as long as the session is active, but are typically purged after 24 hours." },
    { q: "Can I choose my own username?", a: "Currently, usernames are randomly generated to ensure uniqueness and privacy." },
    { q: "Is it safe to use for sensitive accounts?", a: "No, we recommend using temporary mail only for trial signups and non-critical services." }
];

// --- API Helpers ---

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (state.account?.token) headers['Authorization'] = `Bearer ${state.account.token}`;
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 204) return null;
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || data.message || 'API Error');
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

async function fetchDomains() {
    try {
        const data = await apiRequest('/domains');
        state.domains = data['hydra:member'];
        return state.domains;
    } catch (err) {
        state.domains = [{ domain: 'tempmail.com' }];
        return state.domains;
    }
}

async function createAccount() {
    if (state.domains.length === 0) await fetchDomains();
    const domain = state.domains[0].domain;
    const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
    const password = Math.random().toString(36).substring(2, 15);
    try {
        showToast(state.lang === 'en' ? 'Creating account...' : 'अकाउंट बना रहे हैं...', 'info');
        const accData = await apiRequest('/accounts', { method: 'POST', body: JSON.stringify({ address, password }) });
        const tokenData = await apiRequest('/token', { method: 'POST', body: JSON.stringify({ address, password }) });
        const newAccount = { id: accData.id, address, password, token: tokenData.token, note: '', createdAt: new Date().toISOString() };
        state.account = newAccount;
        state.accounts.push(newAccount);
        saveState();
        updateUI();
        showToast(state.lang === 'en' ? 'New mail generated!' : 'नया मेल तैयार है!', 'success');
        fetchMessages();
    } catch (err) {}
}

async function fetchMessages() {
    if (!state.account) return;
    try {
        const data = await apiRequest('/messages');
        const newMessages = data['hydra:member'];
        if (newMessages.length > state.messages.length) {
            const diff = newMessages.length - state.messages.length;
            state.stats.totalReceived += diff;
            state.stats.timeSaved += diff * 5;
            if (state.prefs.sounds) new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
            showToast(state.lang === 'en' ? `New message!` : `नया संदेश!`, 'success');
        }
        state.messages = newMessages;
        renderEmailList();
        saveState();
    } catch (err) {}
}

// --- UI Logic ---

function applyLanguage() {
    const dict = translations[state.lang];
    Object.keys(dict).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.tagName === 'INPUT' && el.type === 'button') el.value = dict[key];
            else if (el.querySelector('.btn-text')) el.querySelector('.btn-text').textContent = dict[key];
            else el.textContent = dict[key];
        }
    });
    document.getElementById('lang-toggle').querySelector('.btn-text').textContent = state.lang.toUpperCase();
    renderFaqs();
    renderEmailList();
}

function renderFaqs() {
    const container = document.getElementById('faq-list');
    container.innerHTML = '';
    faqs.forEach(faq => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.innerHTML = `
            <div class="faq-question">${faq.q} <i class="fas fa-chevron-down"></i></div>
            <div class="faq-answer">${faq.a}</div>
        `;
        item.onclick = () => item.classList.toggle('active');
        container.appendChild(item);
    });
}

function updateUI() {
    document.getElementById('stat-total-received').textContent = state.stats.totalReceived;
    document.getElementById('stat-time-saved').textContent = `${state.stats.timeSaved}m`;
    const emailEl = document.getElementById('current-email');
    emailEl.textContent = state.account ? state.account.address : (state.lang === 'en' ? 'no account' : 'कोई अकाउंट नहीं');
    const selector = document.getElementById('mailbox-selector');
    selector.innerHTML = '';
    state.accounts.forEach((acc, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = acc.address + (acc.note ? ` (${acc.note})` : '');
        if (state.account && acc.id === state.account.id) opt.selected = true;
        selector.appendChild(opt);
    });
    document.getElementById('mailbox-note').value = state.account?.note || '';
    document.body.className = state.theme + '-theme';
    document.documentElement.style.setProperty('--primary', state.accent);
}

function renderEmailList() {
    const list = document.getElementById('email-list');
    if (state.messages.length === 0) {
        list.innerHTML = `<li class="empty-inbox">${state.lang === 'en' ? 'Waiting for emails...' : 'ईमेल की प्रतीक्षा कर रहे हैं...'}</li>`;
        return;
    }
    list.innerHTML = '';
    state.messages.forEach(msg => {
        const li = document.createElement('li');
        li.className = `email-item ${state.selectedMessage?.id === msg.id ? 'active' : ''} ${!msg.seen ? 'unread' : ''}`;
        li.innerHTML = `
            <div class="email-item-header"><span>${msg.from.name || msg.from.address.split('@')[0]}</span><span>${new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div>
            <div class="email-item-subject">${msg.subject || '(No Subject)'}</div>
        `;
        li.onclick = () => selectMessage(msg);
        list.appendChild(li);
    });
}

async function selectMessage(msg) {
    state.selectedMessage = msg;
    renderEmailList();
    document.getElementById('detail-placeholder').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    if (window.innerWidth <= 992) document.getElementById('email-detail-view').classList.add('open');

    try {
        const fullMsg = await apiRequest(`/messages/${msg.id}`);
        document.getElementById('detail-subject').textContent = fullMsg.subject || '(No Subject)';
        document.getElementById('detail-from-name').textContent = fullMsg.from.name || 'Unknown';
        document.getElementById('detail-from-addr').textContent = fullMsg.from.address;
        document.getElementById('detail-date').textContent = new Date(fullMsg.createdAt).toLocaleString();
        const avatar = document.getElementById('sender-avatar');
        avatar.textContent = (fullMsg.from.name || fullMsg.from.address)[0].toUpperCase();
        avatar.style.background = stringToColor(fullMsg.from.address);
        const frame = document.getElementById('email-body-frame');
        let content = fullMsg.html || fullMsg.text || 'No content';
        if (Array.isArray(content)) content = content.join('');
        frame.srcdoc = `<html><body style="font-family:sans-serif;line-height:1.6;color:#333;padding:20px;">${content}</body></html>`;
        if (!msg.seen) {
            await apiRequest(`/messages/${msg.id}`, { method: 'PATCH', body: JSON.stringify({ seen: true }) });
            msg.seen = true;
            renderEmailList();
        }
    } catch (err) {}
}

// --- Event Listeners ---

function initEventListeners() {
    document.getElementById('nav-links').onclick = (e) => {
        if (e.target.dataset.section) {
            document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${e.target.dataset.section}-section`).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
        }
    };

    document.getElementById('gen-email-btn').onclick = () => createAccount();
    document.getElementById('go-inbox-btn').onclick = () => {
        document.querySelector('[data-section="inbox"]').click();
    };

    document.getElementById('lang-toggle').onclick = () => {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        saveState();
        applyLanguage();
        updateUI();
    };

    document.getElementById('theme-toggle').onclick = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        const icon = document.getElementById('theme-toggle').querySelector('i');
        icon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        saveState();
        updateUI();
    };

    document.getElementById('mailbox-selector').onchange = (e) => switchAccount(e.target.value);
    document.getElementById('delete-mailbox-btn').onclick = () => deleteCurrentAccount();
    document.getElementById('refresh-now-btn').onclick = () => {
        fetchMessages();
        state.refreshSeconds = 7;
    };

    document.getElementById('copy-email-btn').onclick = () => {
        if (state.account) {
            navigator.clipboard.writeText(state.account.address);
            showToast('Address copied!', 'success');
        }
    };

    document.getElementById('share-email-btn').onclick = () => {
        if (state.account && navigator.share) {
            navigator.share({ text: state.account.address });
        }
    };

    document.getElementById('mailbox-note').onblur = (e) => updateAccountNote(e.target.value);

    document.getElementById('close-detail-btn').onclick = () => {
        document.getElementById('email-detail-view').classList.remove('open');
    };

    document.getElementById('menu-toggle').onclick = () => {
        document.getElementById('mobile-drawer').classList.add('open');
    };

    document.getElementById('close-drawer').onclick = () => {
        document.getElementById('mobile-drawer').classList.remove('open');
    };

    document.querySelectorAll('.drawer-item').forEach(item => {
        item.onclick = () => {
            document.querySelector(`[data-section="${item.dataset.section}"]`).click();
            document.getElementById('mobile-drawer').classList.remove('open');
        };
    });

    document.getElementById('open-guide-btn').onclick = () => {
        document.getElementById('guide-modal').style.display = 'block';
    };

    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('guide-modal').style.display = 'none';
    };

    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.onclick = () => {
            state.accent = dot.dataset.color;
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            saveState();
            updateUI();
        };
    });

    document.getElementById('export-btn').onclick = () => {
        const data = JSON.stringify({ accounts: state.accounts, stats: state.stats });
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tempmail_backup.json';
        a.click();
    };

    document.getElementById('import-file').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                const data = JSON.parse(re.target.result);
                state.accounts = data.accounts || [];
                state.stats = data.stats || state.stats;
                if (state.accounts.length > 0) state.account = state.accounts[0];
                saveState();
                updateUI();
                showToast('Imported successfully!', 'success');
            };
            reader.readAsText(file);
        }
    };
}

// --- Helper Functions ---

function switchAccount(index) {
    state.account = state.accounts[index];
    state.messages = [];
    state.selectedMessage = null;
    saveState();
    updateUI();
    fetchMessages();
}

function deleteCurrentAccount() {
    if (!state.account) return;
    const index = state.accounts.findIndex(acc => acc.id === state.account.id);
    state.accounts.splice(index, 1);
    state.account = state.accounts.length > 0 ? state.accounts[0] : null;
    saveState();
    updateUI();
    if (state.account) fetchMessages();
}

function updateAccountNote(note) {
    if (state.account) {
        state.account.note = note;
        saveState();
        updateUI();
    }
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas fa-info-circle"></i> <span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return '#' + (hash & 0x00FFFFFF).toString(16).toUpperCase().padStart(6, '0');
}

function saveState() {
    localStorage.setItem('tm_account', JSON.stringify(state.account));
    localStorage.setItem('tm_accounts', JSON.stringify(state.accounts));
    localStorage.setItem('tm_stats', JSON.stringify(state.stats));
    localStorage.setItem('tm_lang', state.lang);
    localStorage.setItem('tm_theme', state.theme);
    localStorage.setItem('tm_accent', state.accent);
}

function loadState() {
    state.account = JSON.parse(localStorage.getItem('tm_account'));
    state.accounts = JSON.parse(localStorage.getItem('tm_accounts')) || [];
    state.stats = JSON.parse(localStorage.getItem('tm_stats')) || state.stats;
    state.lang = localStorage.getItem('tm_lang') || 'en';
    state.theme = localStorage.getItem('tm_theme') || 'dark';
    state.accent = localStorage.getItem('tm_accent') || '#3498db';
}

function startPolling() {
    setInterval(() => {
        state.refreshSeconds--;
        if (state.refreshSeconds <= 0) {
            state.refreshSeconds = 7;
            fetchMessages();
        }
        const statusEl = document.getElementById('refresh-status');
        if (statusEl) {
            const trans = translations[state.lang].refresh_status;
            statusEl.textContent = trans.replace('7s', `${state.refreshSeconds}s`);
        }
        const bar = document.querySelector('.progress-bar');
        if (bar) bar.style.setProperty('--progress-width', `${((7 - state.refreshSeconds) / 7) * 100}%`);
    }, 1000);
}

window.onload = () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
    }

    loadState();
    initEventListeners();
    applyLanguage();
    updateUI();
    if (state.account) fetchMessages();
    startPolling();
};
