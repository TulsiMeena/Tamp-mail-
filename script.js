// --- Constants & Configuration ---
const API_BASE = 'https://api.mail.tm';
const POLL_INTERVAL = 10000;

// --- Application State ---
const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    mailboxes: JSON.parse(localStorage.getItem('mail_boxes')) || [],
    activeMailboxId: null,
    domains: [],
    polling: false,
    pollTimer: null
};

// --- Translation Dictionary ---
const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About Us',
        'nav-help': 'Help',
        'hero-title': 'Your Secure Temporary Email Service',
        'hero-subtitle': 'Protect your privacy and keep your inbox clean with Tamp Mail\'s disposable email addresses.',
        'get-started-btn': 'Get Started',
        'inbox-title': 'Your Mailboxes',
        'btn-add-mail-text': 'New Mailbox',
        'refresh-text': 'Refresh Now',
        'empty-inbox-text': 'Waiting for incoming emails...',
        'status-creating': 'Creating...',
        'about-title': 'About Tamp Mail',
        'help-title': 'Help & Tutorials',
        'stat-users-text': 'Users Worldwide',
        'stat-mails-text': 'Emails Processed',
        'stat-spam-text': 'Spam Blocked',
        'f1-title': 'Instant Setup',
        'f1-desc': 'Generate a mailbox in seconds with no registration required.',
        'f2-title': 'Anonymity',
        'f2-desc': 'Your personal data is never stored or tracked.',
        'f3-title': 'Auto-Refresh',
        'f3-desc': 'Real-time polling ensures you never miss an incoming message.'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-help': 'सहायता',
        'hero-title': 'आपकी सुरक्षित अस्थायी ईमेल सेवा',
        'hero-subtitle': 'Tamp Mail के डिस्पोजेबल ईमेल पते के साथ अपनी गोपनीयता की रक्षा करें और अपने इनबॉक्स को साफ रखें।',
        'get-started-btn': 'शुरू करें',
        'inbox-title': 'आपके मेलबॉक्स',
        'btn-add-mail-text': 'नया मेलबॉक्स',
        'refresh-text': 'अभी रिफ्रेश करें',
        'empty-inbox-text': 'आने वाले ईमेल की प्रतीक्षा है...',
        'status-creating': 'बनाया जा रहा है...',
        'about-title': 'Tamp Mail के बारे में',
        'help-title': 'सहायता और ट्यूटोरियल',
        'stat-users-text': 'दुनिया भर में उपयोगकर्ता',
        'stat-mails-text': 'प्रोसेस्ड ईमेल',
        'stat-spam-text': 'स्पैम ब्लॉक किया गया',
        'f1-title': 'त्वरित सेटअप',
        'f1-desc': 'बिना पंजीकरण के सेकंड में मेलबॉक्स बनाएं।',
        'f2-title': 'गुमनामी',
        'f2-desc': 'आपका व्यक्तिगत डेटा कभी संग्रहीत या ट्रैक नहीं किया जाता है।',
        'f3-title': 'ऑटो-रिफ्रेश',
        'f3-desc': 'रीयल-टाइम पोलिंग सुनिश्चित करती है कि आप कोई संदेश न चूकें।'
    }
};

// --- UI Core Functions ---

function applyLanguage() {
    const dict = translations[state.lang];
    Object.keys(dict).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'INPUT') el.placeholder = dict[id];
            else el.textContent = dict[id];
        }
    });
    document.getElementById('lang-text').textContent = state.lang === 'en' ? 'HI' : 'EN';
    document.documentElement.lang = state.lang;
}

function applyTheme() {
    document.body.setAttribute('data-theme', state.theme);
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function navigate(sectionId) {
    document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    if (window.innerWidth <= 768) {
        document.getElementById('nav-links').classList.remove('active');
    }
}

// --- Mailbox UI Rendering ---

function renderMailboxList() {
    const list = document.getElementById('mailbox-list');
    list.innerHTML = '';

    state.mailboxes.forEach(box => {
        const item = document.createElement('div');
        item.className = `mailbox-item ${state.activeMailboxId === box.id ? 'active' : ''}`;
        item.innerHTML = `
            <div class="mail-address">${box.address}</div>
            <div class="mail-meta-info">Created: ${new Date(box.createdAt).toLocaleTimeString()}</div>
        `;
        item.onclick = () => setActiveMailbox(box.id);
        list.appendChild(item);
    });
}

function setActiveMailbox(id) {
    state.activeMailboxId = id;
    document.getElementById('active-inbox-container').classList.remove('hidden');
    const box = state.mailboxes.find(b => b.id === id);
    if (box) {
        document.getElementById('current-mail-display').textContent = box.address;
        renderMessages();
    }
    renderMailboxList();
}

function renderMessages() {
    const container = document.getElementById('message-list');
    const box = state.mailboxes.find(b => b.id === state.activeMailboxId);

    if (!box || box.messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p id="empty-inbox-text">${translations[state.lang]['empty-inbox-text']}</p>
            </div>`;
        return;
    }

    container.innerHTML = '';
    box.messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'message-item';
        item.innerHTML = `
            <div class="msg-from"><strong>${msg.from.name || msg.from.address}</strong></div>
            <div class="msg-subject">${msg.subject}</div>
            <div class="msg-date">${new Date(msg.createdAt).toLocaleTimeString()}</div>
        `;
        item.onclick = () => openMessage(msg);
        container.appendChild(item);
    });
}

async function openMessage(msg) {
    const modal = document.getElementById('mail-modal');
    const box = state.mailboxes.find(b => b.id === state.activeMailboxId);

    try {
        const fullMsg = await request(`/messages/${msg.id}`, {
            headers: { 'Authorization': `Bearer ${box.token}` }
        });

        document.getElementById('modal-subject').textContent = fullMsg.subject;
        document.getElementById('modal-from').textContent = `${fullMsg.from.name} <${fullMsg.from.address}>`;
        document.getElementById('modal-date').textContent = new Date(fullMsg.createdAt).toLocaleString();

        const iframe = document.getElementById('mail-iframe');
        iframe.srcdoc = fullMsg.html || `<div style="font-family:sans-serif">${fullMsg.intro || fullMsg.text}</div>`;

        modal.classList.remove('hidden');
    } catch (err) {
        showToast('Failed to load message', 'error');
    }
}

// --- API Implementation (Simplified for script.js completeness) ---

async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) throw new Error('API Error');
    return response.json();
}

async function fetchDomains() {
    try {
        const data = await request('/domains');
        state.domains = data['hydra:member'] || [{domain: 'tempmail.com'}];
    } catch(e) { state.domains = [{domain: 'tempmail.com'}]; }
}

async function createMailbox() {
    if (state.domains.length === 0) await fetchDomains();
    const domain = state.domains[0].domain;
    const address = `${Math.random().toString(36).substring(2, 12)}@${domain}`;
    const password = 'pass' + Math.random().toString(36).substring(2, 8);

    try {
        showToast(translations[state.lang]['status-creating'], 'info');
        await request('/accounts', { method: 'POST', body: JSON.stringify({ address, password }) });
        const tokenData = await request('/token', { method: 'POST', body: JSON.stringify({ address, password }) });

        const newBox = { id: tokenData.id, address, password, token: tokenData.token, messages: [], createdAt: new Date().toISOString() };
        state.mailboxes.push(newBox);
        saveState();
        renderMailboxList();
        setActiveMailbox(newBox.id);
        showToast('New mailbox ready!', 'success');
    } catch (err) { showToast('Creation failed', 'error'); }
}

async function pollInboxes() {
    const bar = document.getElementById('refresh-progress');
    const timerText = document.getElementById('refresh-timer-text');
    let timeLeft = 10;

    const interval = setInterval(async () => {
        timeLeft--;
        if (bar) bar.style.width = `${(10 - timeLeft) * 10}%`;
        if (timerText) timerText.textContent = `Checking in ${timeLeft}s...`;

        if (timeLeft <= 0) {
            timeLeft = 10;
            for (const box of state.mailboxes) {
                try {
                    const data = await request('/messages', { headers: { 'Authorization': `Bearer ${box.token}` } });
                    box.messages = data['hydra:member'];
                } catch(e) {}
            }
            saveState();
            if (state.activeMailboxId) renderMessages();
        }
    }, 1000);
}

function saveState() {
    localStorage.setItem('mail_boxes', JSON.stringify(state.mailboxes));
    localStorage.setItem('mail_lang', state.lang);
    localStorage.setItem('mail_theme', state.theme);
}

// --- Initialization ---

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    applyTheme();
    renderMailboxList();
    pollInboxes();

    // Event Listeners
    document.getElementById('theme-toggle').onclick = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveState();
    };

    document.getElementById('lang-toggle').onclick = () => {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        applyLanguage();
        saveState();
        renderMessages();
        document.getElementById('help-content-dynamic').innerHTML = helpContent[state.lang];
    };

    document.getElementById('menu-toggle').onclick = () => {
        document.getElementById('nav-links').classList.toggle('active');
    };

    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            navigate(link.getAttribute('data-section'));
        };
    });

    document.getElementById('get-started-btn').onclick = () => {
        navigate('inbox');
        if (state.mailboxes.length === 0) createMailbox();
    };

    document.getElementById('btn-add-mail').onclick = createMailbox;

    document.getElementById('refresh-now-btn').onclick = async () => {
        showToast('Refreshing...', 'info');
        for (const box of state.mailboxes) {
            try {
                const data = await request('/messages', { headers: { 'Authorization': `Bearer ${box.token}` } });
                box.messages = data['hydra:member'];
            } catch(e) {}
        }
        saveState();
        if (state.activeMailboxId) renderMessages();
    };

    document.getElementById('qr-btn').onclick = () => {
        const box = state.mailboxes.find(b => b.id === state.activeMailboxId);
        if (box) {
            const qrImg = document.getElementById('qr-code-img');
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(box.address)}`;
            document.getElementById('qr-mail-text').textContent = box.address;
            document.getElementById('qr-modal').classList.remove('hidden');
        }
    };

    document.getElementById('share-btn').onclick = () => {
        const box = state.mailboxes.find(b => b.id === state.activeMailboxId);
        if (box && navigator.share) {
            navigator.share({ title: 'My Temp Email', text: box.address }).catch(() => {});
        } else {
            showToast('Sharing not supported on this browser', 'info');
        }
    };

    document.getElementById('print-btn').onclick = () => {
        const iframe = document.getElementById('mail-iframe');
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    };

    const helpContent = {
        en: `<h3>How to use Tamp Mail</h3><p>1. Click "Get Started" to create your first mailbox.</p><p>2. Share your temporary address with services you don't trust.</p><p>3. Check this page for incoming verification codes or newsletters.</p>`,
        hi: `<h3>Tamp Mail का उपयोग कैसे करें</h3><p>1. अपना पहला मेलबॉक्स बनाने के लिए "शुरू करें" पर क्लिक करें।</p><p>2. उन सेवाओं के साथ अपना अस्थायी पता साझा करें जिन पर आप भरोसा नहीं करते हैं।</p><p>3. आने वाले वेरिफिकेशन कोड या न्यूज़लेटर्स के लिए इस पेज को चेक करें।</p>`
    };
    document.getElementById('help-content-dynamic').innerHTML = helpContent[state.lang];

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        };
    });

    document.getElementById('copy-mail-btn').onclick = () => {
        const box = state.mailboxes.find(b => b.id === state.activeMailboxId);
        if (box) {
            navigator.clipboard.writeText(box.address);
            showToast('Address copied!', 'success');
        }
    };

    document.getElementById('delete-mailbox-btn').onclick = () => {
        state.mailboxes = state.mailboxes.filter(b => b.id !== state.activeMailboxId);
        state.activeMailboxId = null;
        document.getElementById('active-inbox-container').classList.add('hidden');
        saveState();
        renderMailboxList();
        showToast('Mailbox deleted', 'info');
    };
});
